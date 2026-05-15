// src/app/api/payment/initiate/route.ts
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
const VOTE_PRICE = Number(process.env.VOTE_AMOUNT || 100);

function publicBaseUrl(req: NextRequest) {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("host") || "isticvote.online";
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      candidateId,
      // Accept both `votes` and `amount` for backward compat with the voter page
      votes,
      amount: amountFromBody,
      phone,
      phoneNumber,
      email,
      name,
    } = body || {};

    if (!candidateId) {
      return NextResponse.json(
        { success: false, error: "candidateId manquant" },
        { status: 400 }
      );
    }

    // Derive vote count and XAF amount
    let nVotes: number;
    let amount: number;
    if (votes !== undefined) {
      nVotes = Math.max(1, Math.min(1000, Number(votes) || 1));
      amount = nVotes * VOTE_PRICE;
    } else if (amountFromBody !== undefined) {
      amount = Math.max(VOTE_PRICE, Number(amountFromBody) || VOTE_PRICE);
      nVotes = Math.floor(amount / VOTE_PRICE);
    } else {
      nVotes = 1;
      amount = VOTE_PRICE;
    }

    const resolvedPhone = String(phone || phoneNumber || "").trim();

    const candidate = await prisma.candidate.findUnique({
      where: { id: String(candidateId) },
    });
    if (!candidate) {
      return NextResponse.json(
        { success: false, error: "Candidat introuvable" },
        { status: 404 }
      );
    }

    if (!FAPSHI_API_USER || !FAPSHI_API_KEY) {
      console.error("[Fapshi] Clés API manquantes");
      return NextResponse.json(
        { success: false, error: "Configuration de paiement manquante. Contactez l'administrateur." },
        { status: 500 }
      );
    }

    const tx = await prisma.transaction.create({
      data: {
        candidateId: candidate.id,
        voteCount: nVotes,
        amount,
        currency: "XAF",
        status: "PENDING",
        phoneNumber: resolvedPhone || "",
        paymentMethod: "MOBILE_MONEY",
        isEuropeWire: false,
        email: email ? String(email) : null,
        name: name ? String(name) : null,
      },
    });

    const base = publicBaseUrl(req);

    const payload: Record<string, unknown> = {
      amount,
      email: email || undefined,
      userId: tx.id,
      externalId: tx.id,
      message: `Vote pour ${candidate.name} (${nVotes} vote${nVotes > 1 ? "s" : ""})`,
      redirectUrl: `${base}/voter?id=${candidate.id}&tx=${tx.id}&status=success`,
    };
    if (resolvedPhone) payload.phone = resolvedPhone;

    const fapshiUrl = `${FAPSHI_BASE_URL.replace(/\/$/, "")}/initiate-pay`;

    let fapshiRes: Response;
    try {
      fapshiRes = await fetch(fapshiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          apiuser: FAPSHI_API_USER,
          apikey: FAPSHI_API_KEY,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
    } catch (err) {
      console.error("[Fapshi] Erreur réseau:", err);
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json(
        { success: false, error: "Service de paiement injoignable" },
        { status: 502 }
      );
    }

    const rawText = await fapshiRes.text();
    let data: Record<string, unknown> | null = null;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = { raw: rawText };
    }

    if (!fapshiRes.ok) {
      console.error("[Fapshi] Réponse non OK:", fapshiRes.status, data);
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json(
        {
          success: false,
          error:
            (data && ((data.message as string) || (data.error as string))) ||
            `Erreur Fapshi (${fapshiRes.status})`,
        },
        { status: 502 }
      );
    }

    const link = data?.link as string | undefined;
    const transId = data?.transId as string | undefined;

    if (!link) {
      console.error("[Fapshi] Pas de 'link' dans la réponse:", data);
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json(
        { success: false, error: "Réponse de paiement invalide" },
        { status: 502 }
      );
    }

    await prisma.transaction.update({
      where: { id: tx.id },
      data: { externalRef: transId || null },
    });

    return NextResponse.json({
      success: true,
      paymentUrl: link,
      transactionId: tx.id,
      providerRef: transId || null,
      amount,
      votes: nVotes,
      // Compat with voter page which reads data.data.*
      data: {
        transactionId: tx.id,
        voteCount: nVotes,
        paymentLink: link,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    console.error("[/api/payment/initiate] erreur:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
