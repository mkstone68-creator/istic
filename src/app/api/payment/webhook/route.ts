// src/app/api/payment/webhook/route.ts
// Webhook Fapshi simplifié : reçoit { transId }, re-vérifie le statut côté Fapshi
// puis crédite les votes de façon idempotente et atomique.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FAPSHI_BASE_URL =
  process.env.FAPSHI_BASE_URL ||
  (process.env.FAPSHI_MODE === "sandbox"
    ? "https://sandbox.fapshi.com"
    : "https://live.fapshi.com");

const FAPSHI_API_USER = process.env.FAPSHI_API_USER || "";
const FAPSHI_API_KEY = process.env.FAPSHI_API_KEY || "";

// GET — retourne { ok: true } pour les tests de connectivité Fapshi
export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { transId } = body || {};

    if (!transId) {
      return NextResponse.json({ error: "transId manquant" }, { status: 400 });
    }

    // Re-vérification du statut auprès de Fapshi
    const statusUrl = `${FAPSHI_BASE_URL.replace(/\/$/, "")}/payment-status/${transId}`;
    let fapshiData: Record<string, unknown> | null = null;

    try {
      const statusRes = await fetch(statusUrl, {
        headers: {
          apiuser: FAPSHI_API_USER,
          apikey: FAPSHI_API_KEY,
          Accept: "application/json",
        },
        cache: "no-store",
      });
      const rawText = await statusRes.text();
      try {
        fapshiData = rawText ? JSON.parse(rawText) : null;
      } catch {
        console.error("[webhook/payment] réponse Fapshi non-JSON:", rawText.slice(0, 200));
        return NextResponse.json({ error: "Réponse Fapshi invalide" }, { status: 502 });
      }
      if (!statusRes.ok) {
        console.error("[webhook/payment] Fapshi status non OK:", statusRes.status, fapshiData);
        return NextResponse.json({ error: "Erreur Fapshi" }, { status: 502 });
      }
    } catch (err) {
      console.error("[webhook/payment] Erreur réseau Fapshi:", err);
      return NextResponse.json({ error: "Service Fapshi injoignable" }, { status: 502 });
    }

    const fapshiStatus = fapshiData?.status as string | undefined;
    // externalId = notre transaction.id, envoyé lors de l'initiation
    const externalId = (fapshiData?.externalId ?? fapshiData?.userId) as string | undefined;

    if (!externalId) {
      console.error("[webhook/payment] Pas d'externalId dans la réponse Fapshi:", fapshiData);
      return NextResponse.json({ error: "externalId manquant dans la réponse Fapshi" }, { status: 400 });
    }

    // Cherche la transaction par ID (externalId = notre tx.id)
    const transaction = await prisma.transaction.findUnique({
      where: { id: externalId },
      select: { id: true, status: true, candidateId: true, voteCount: true },
    });

    if (!transaction) {
      console.error("[webhook/payment] Transaction introuvable:", externalId);
      // Répondre 200 pour que Fapshi ne réessaie pas indéfiniment
      return NextResponse.json({ ok: true });
    }

    // Idempotence : si déjà traité, on ignore
    if (transaction.status !== "PENDING") {
      return NextResponse.json({ ok: true });
    }

    if (fapshiStatus === "SUCCESSFUL") {
      await prisma.$transaction(async (tx) => {
        // Guard status:"PENDING" → un seul traitement même en cas de double appel concurrent
        const updated = await tx.transaction.updateMany({
          where: { id: transaction.id, status: "PENDING" },
          data: {
            status: "CONFIRMED",
            externalRef: transId,
            providerPayload: fapshiData as object,
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
    } else if (fapshiStatus === "FAILED" || fapshiStatus === "EXPIRED") {
      await prisma.transaction.updateMany({
        where: { id: transaction.id, status: "PENDING" },
        data: {
          status: fapshiStatus === "FAILED" ? "FAILED" : "EXPIRED",
          providerPayload: fapshiData as object,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[webhook/payment] Erreur serveur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
