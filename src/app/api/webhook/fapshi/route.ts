// src/app/api/webhook/fapshi/route.ts
// Webhook Fapshi signé HMAC — idempotent, atomique, anti double-crédit
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyFapshiWebhook } from "@/lib/payment";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-fapshi-signature") ?? "";
    if (!verifyFapshiWebhook(rawBody, signature)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as Record<string, unknown>;
    const { transId, status, externalId } = payload;
    const transactionId = ((externalId ?? transId) as string | undefined);
    if (!transactionId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      select: { id: true, status: true, candidateId: true, voteCount: true },
    });

    // Déjà traité ou introuvable — répondre 200 pour éviter les retries Fapshi
    if (!transaction || transaction.status !== "PENDING") {
      return NextResponse.json({ ok: true });
    }

    if (status === "SUCCESSFUL") {
      await prisma.$transaction(async (tx) => {
        // updateMany avec garde status:"PENDING" → anti double-crédit
        const updated = await tx.transaction.updateMany({
          where: { id: transactionId, status: "PENDING" },
          data: {
            status: "CONFIRMED",
            externalRef: transId as string,
            providerPayload: payload as object,
          },
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
    } else if (status === "FAILED" || status === "EXPIRED") {
      await prisma.transaction.updateMany({
        where: { id: transactionId, status: "PENDING" },
        data: {
          status: status === "FAILED" ? "FAILED" : "EXPIRED",
          providerPayload: payload as object,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[WEBHOOK /fapshi]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
