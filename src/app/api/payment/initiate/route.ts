// src/app/api/payment/initiate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// URL Fapshi calculée uniquement depuis FAPSHI_MODE — ignore FAPSHI_BASE_URL
// pour éviter qu'une ancienne valeur (fapshi.com/api) provoque un 404.
function getFapshiBaseUrl(): string {
  const mode = (process.env.FAPSHI_MODE ?? "live").toLowerCase();
  if (mode === "sandbox") return "https://sandbox.fapshi.com";
  return "https://live.fapshi.com";
}

const FAPSHI_API_USER = process.env.FAPSHI_API_USER ?? "";
const FAPSHI_API_KEY  = process.env.FAPSHI_API_KEY  ?? "";
const VOTE_PRICE      = Number(process.env.VOTE_AMOUNT ?? 100);

function publicBaseUrl(req: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host  = req.headers.get("host") ?? "isticvote.online";
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const { candidateId, votes, amount: amountBody, phone, phoneNumber, email, name } = body;

    if (!candidateId) {
      return NextResponse.json({ success: false, error: "candidateId manquant" }, { status: 400 });
    }

    // votes OU amount (compat voter page qui envoie amount)
    let nVotes: number;
    let amount: number;
    if (votes !== undefined) {
      nVotes = Math.max(1, Math.min(1000, Number(votes) || 1));
      amount = nVotes * VOTE_PRICE;
    } else if (amountBody !== undefined) {
      amount = Math.max(VOTE_PRICE, Number(amountBody) || VOTE_PRICE);
      nVotes = Math.floor(amount / VOTE_PRICE);
    } else {
      nVotes = 1;
      amount = VOTE_PRICE;
    }

    const resolvedPhone = String(phone ?? phoneNumber ?? "").trim();

    // Guard : dates de vote
    try {
      const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
      if (settings) {
        const now = new Date();
        if (settings.votingStartDate && now < new Date(settings.votingStartDate)) {
          const d = new Date(settings.votingStartDate);
          return NextResponse.json({ success: false, error: `Le vote commence le ${d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}` }, { status: 403 });
        }
        if (settings.votingEndDate && now > new Date(settings.votingEndDate)) {
          const d = new Date(settings.votingEndDate);
          return NextResponse.json({ success: false, error: `Le vote s'est terminé le ${d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}` }, { status: 403 });
        }
      }
    } catch { /* DB indisponible → on laisse passer */ }

    const candidate = await prisma.candidate.findUnique({ where: { id: String(candidateId) } });
    if (!candidate) {
      return NextResponse.json({ success: false, error: "Candidat introuvable" }, { status: 404 });
    }

    if (!FAPSHI_API_USER || !FAPSHI_API_KEY) {
      console.error("[Fapshi] FAPSHI_API_USER ou FAPSHI_API_KEY manquant");
      return NextResponse.json(
        { success: false, error: "Configuration paiement manquante — contactez l'administrateur." },
        { status: 500 }
      );
    }

    const tx = await prisma.transaction.create({
      data: {
        candidateId: candidate.id,
        voteCount:   nVotes,
        amount,
        currency:    "XAF",
        status:      "PENDING",
        phoneNumber: resolvedPhone,
        paymentMethod: "MOBILE_MONEY",
        isEuropeWire: false,
        email: email ? String(email) : null,
        name:  name  ? String(name)  : null,
      },
    });

    const base       = publicBaseUrl(req);
    const fapshiBase = getFapshiBaseUrl();
    const fapshiUrl  = `${fapshiBase}/initiate-pay`;

    console.log(`[Fapshi] POST ${fapshiUrl} | amount=${amount} | tx=${tx.id}`);

    const payload: Record<string, unknown> = {
      amount,
      userId:      tx.id,
      externalId:  tx.id,
      message:     `Vote pour ${candidate.name} (${nVotes} vote${nVotes > 1 ? "s" : ""})`,
      redirectUrl: `${base}/voter?id=${candidate.id}&tx=${tx.id}&status=success`,
    };
    if (email)         payload.email = String(email);
    if (resolvedPhone) payload.phone = resolvedPhone;

    let fapshiRes: Response;
    try {
      fapshiRes = await fetch(fapshiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept:         "application/json",
          apiuser:        FAPSHI_API_USER,
          apikey:         FAPSHI_API_KEY,
        },
        body:  JSON.stringify(payload),
        cache: "no-store",
      });
    } catch (err) {
      console.error("[Fapshi] Erreur réseau:", err);
      await prisma.transaction.update({ where: { id: tx.id }, data: { status: "FAILED" } });
      return NextResponse.json({ success: false, error: "Service de paiement injoignable" }, { status: 502 });
    }

    const rawText = await fapshiRes.text();
    console.log(`[Fapshi] status=${fapshiRes.status} body=${rawText.slice(0, 200)}`);

    let data: Record<string, unknown> = {};
    try { data = rawText ? JSON.parse(rawText) : {}; } catch { data = { raw: rawText }; }

    if (!fapshiRes.ok) {
      await prisma.transaction.update({ where: { id: tx.id }, data: { status: "FAILED" } });
      return NextResponse.json(
        { success: false, error: (data.message ?? data.error ?? `Erreur Fapshi (${fapshiRes.status})`) as string },
        { status: 502 }
      );
    }

    const link    = data.link    as string | undefined;
    const transId = data.transId as string | undefined;

    if (!link) {
      console.error("[Fapshi] Pas de 'link' dans la réponse:", data);
      await prisma.transaction.update({ where: { id: tx.id }, data: { status: "FAILED" } });
      return NextResponse.json({ success: false, error: "Réponse Fapshi invalide (pas de lien)" }, { status: 502 });
    }

    await prisma.transaction.update({
      where: { id: tx.id },
      data:  { externalRef: transId ?? null },
    });

    return NextResponse.json({
      success:       true,
      paymentUrl:    link,
      transactionId: tx.id,
      providerRef:   transId ?? null,
      amount,
      votes:         nVotes,
      // compat voter page (lit data.data.*)
      data: { transactionId: tx.id, voteCount: nVotes, paymentLink: link },
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur serveur";
    console.error("[/api/payment/initiate]", err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
