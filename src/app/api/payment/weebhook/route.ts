// src/app/api/payment/weebhook/route.ts
// NOTE: ce fichier est un alias dupliqué (typo dans le nom du dossier).
// Le vrai webhook est dans /api/payment/webhook/route.ts
// Ce fichier est conservé pour ne pas casser d'éventuels liens existants.
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

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const transId = (body?.transId || body?.transactionId) as string | undefined;

    if (!transId) {
      return NextResponse.json({ success: false, error: "transId manquant" }, { status: 400 });
    }

    const statusUrl = `${FAPSHI_BASE_URL.replace(/\/$/, "")}/payment-status/${encodeURIComponent(transId)}`;
    const statusRes = await fetch(statusUrl, {
      method: "GET",
      headers: { Accept: "application/json", apiuser: FAPSHI_API_USER, apikey: FAPSHI_API_KEY },
      cache: "no-store",
    });

    let data: Record<string, unknown> = {};
    try { data = await statusRes.json(); } catch { /* ignore */ }

    if (!statusRes.ok) {
      return NextResponse.json({ success: false, error: "Vérification impossible" }, { status: 502 });
    }

    const fapshiStatus = String(data?.status || "").toUpperCase();
    const externalId = (data?.externalId || data?.userId) as string | undefined;

    if (!externalId) {
      return NextResponse.json({ success: false, error: "externalId manquant" }, { status: 400 });
    }

    const tx = await prisma.transaction.findUnique({
      where: { id: externalId },
      select: { id: true, status: true, candidateId: true, voteCount: true },
    });

    if (!tx) return NextResponse.json({ success: false, error: "Transaction inconnue" }, { status: 404 });

    // Idempotence
    if (tx.status === "CONFIRMED") {
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }

    if (fapshiStatus === "SUCCESSFUL") {
      await prisma.$transaction(async (prismaTx) => {
        const updated = await prismaTx.transaction.updateMany({
          where: { id: tx.id, status: "PENDING" },
          data: { status: "CONFIRMED", externalRef: transId },
        });
        if (updated.count === 0) return;
        await prismaTx.candidate.update({
          where: { id: tx.candidateId },
          data: { voteCount: { increment: tx.voteCount } },
        });
        await prismaTx.vote.create({
          data: { candidateId: tx.candidateId, transactionId: tx.id, count: tx.voteCount },
        });
      });
      return NextResponse.json({ success: true });
    }

    if (fapshiStatus === "FAILED" || fapshiStatus === "EXPIRED") {
      await prisma.transaction.updateMany({
        where: { id: tx.id, status: "PENDING" },
        data: { status: fapshiStatus === "FAILED" ? "FAILED" : "EXPIRED", externalRef: transId },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true, pending: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    console.error("[/api/payment/weebhook]", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
