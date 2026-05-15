// src/app/api/payment/status/[transactionId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPaymentStatus } from "@/lib/payment";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { transactionId: string } }
) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.transactionId },
      include: { candidate: { select: { name: true, voteCount: true } } },
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: "Transaction introuvable" },
        { status: 404 }
      );
    }

    if (transaction.status === "CONFIRMED") {
      return NextResponse.json({
        success: true,
        data: {
          status: "CONFIRMED",
          voteCount: transaction.voteCount,
          candidateName: transaction.candidate.name,
        },
      });
    }

    if (transaction.status === "FAILED" || transaction.status === "EXPIRED") {
      return NextResponse.json({
        success: true,
        data: { status: transaction.status },
      });
    }

    if (!transaction.externalRef) {
      return NextResponse.json({ success: true, data: { status: "PENDING" } });
    }

    const providerStatus = await checkPaymentStatus(transaction.externalRef);

    if (providerStatus.status === "SUCCESSFUL") {
      await prisma.$transaction(async (tx) => {
        const updated = await tx.transaction.updateMany({
          where: { id: transaction.id, status: "PENDING" },
          data: { status: "CONFIRMED" },
        });
        if (updated.count === 0) return;

        await tx.candidate.update({
          where: { id: transaction.candidateId },
          data: { voteCount: { increment: transaction.voteCount } },
        });

        await tx.vote.create({
          data: {
            candidateId: transaction.candidateId,
            transactionId: transaction.id,
            count: transaction.voteCount,
          },
        });
      });

      return NextResponse.json({
        success: true,
        data: {
          status: "CONFIRMED",
          voteCount: transaction.voteCount,
          candidateName: transaction.candidate.name,
        },
      });
    }

    if (providerStatus.status === "FAILED") {
      await prisma.transaction.updateMany({
        where: { id: transaction.id, status: "PENDING" },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.json({
      success: true,
      data: { status: providerStatus.status },
    });
  } catch (error) {
    console.error("[GET /api/payment/status]", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
