// src/app/api/admin/transactions/[id]/confirm/route.ts
// Protection concurrence : updateMany avec garde status:"PENDING" — si 2 admins cliquent en même temps,
// un seul créditera les votes
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminApiRequest } from "@/lib/admin-auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminApiRequest(req)) {
    return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
  }
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      select: { id: true, status: true, candidateId: true, voteCount: true, isEuropeWire: true },
    });

    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction introuvable" }, { status: 404 });
    }
    if (transaction.status !== "PENDING") {
      return NextResponse.json({ success: false, error: "Transaction déjà traitée" }, { status: 409 });
    }

    let credited = false;
    await prisma.$transaction(async (tx) => {
      // Garde idempotent : updateMany ne créditera qu'une seule fois même si 2 requêtes simultanées
      const updated = await tx.transaction.updateMany({
        where: { id: params.id, status: "PENDING" },
        data: { status: "CONFIRMED" },
      });
      if (updated.count === 0) return; // déjà traité

      credited = true;
      // Incrémenter les votes selon le montant payé (voteCount calculé à l'initiation)
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

    return NextResponse.json({ success: true, credited });
  } catch (error) {
    console.error("[POST /api/admin/transactions/confirm]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
