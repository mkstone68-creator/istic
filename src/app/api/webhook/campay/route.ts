// src/app/api/webhook/campay/route.ts — placeholder (Campay non configuré)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { reference, status, external_reference } = payload;
    const transactionId = external_reference as string;
    if (!transactionId) {
      return NextResponse.json({ error: "Missing external_reference" }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      select: { id: true, status: true, candidateId: true, voteCount: true },
    });
    if (!transaction || transaction.status !== "PENDING") {
      return NextResponse.json({ ok: true });
    }

    if (status === "SUCCESSFUL") {
      await prisma.$transaction(async (tx) => {
        const updated = await tx.transaction.updateMany({
          where: { id: transactionId, status: "PENDING" },
          data: { status: "CONFIRMED", externalRef: reference, providerPayload: payload },
        });
        if (updated.count === 0) return;
        await tx.candidate.update({
          where: { id: transaction.candidateId },
          data: { voteCount: { increment: transaction.voteCount } },
        });
        await tx.vote.create({
          data: { candidateId: transaction.candidateId, transactionId: transaction.id, count: transaction.voteCount },
        });
      });
    } else if (status === "FAILED") {
      await prisma.transaction.updateMany({
        where: { id: transactionId, status: "PENDING" },
        data: { status: "FAILED", providerPayload: payload },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[WEBHOOK /campay]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
