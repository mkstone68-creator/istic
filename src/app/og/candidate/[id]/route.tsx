// src/app/og/candidate/[id]/route.tsx
// Génère une image PNG 1200×630 pour l'Open Graph de chaque candidat.
// Utilise ImageResponse (Satori) — rendu HTML→PNG, compatible WhatsApp/Telegram/Twitter.
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const c = await prisma.candidate.findUnique({
      where: { id: params.id },
      select: { name: true, filiere: true, number: true, photoUrl: true, voteCount: true },
    });

    const name    = c?.name    ?? "Candidat";
    const filiere = c?.filiere ?? "";
    const num     = String(c?.number ?? 0).padStart(2, "0");
    const votes   = (c?.voteCount ?? 0).toLocaleString("fr-FR");
    const hasPhoto = !!(c?.photoUrl && !c.photoUrl.startsWith("/placeholder") && c.photoUrl.startsWith("http"));

    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            background: "linear-gradient(135deg, #1C0F0A 0%, #2D1A0E 100%)",
            fontFamily: "Georgia, serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Photo côté gauche */}
          {hasPhoto && (
            <div style={{ display: "flex", width: "480px", height: "630px", flexShrink: 0, overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c!.photoUrl!}
                alt={name}
                width={480}
                height={630}
                style={{ width: "480px", height: "630px", objectFit: "cover", objectPosition: "center top" }}
              />
              {/* Gradient de fondu vers la droite */}
              <div style={{ position: "absolute", left: "320px", top: 0, width: "160px", height: "630px", background: "linear-gradient(to right, transparent, #1C0F0A)" }} />
            </div>
          )}

          {/* Contenu texte */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: hasPhoto ? "60px 60px 60px 40px" : "60px 80px",
              flex: 1,
            }}
          >
            {/* Badge numéro */}
            <div
              style={{
                display: "flex",
                background: "linear-gradient(135deg, #F0C040, #C9950A)",
                borderRadius: "99px",
                padding: "6px 22px",
                width: "fit-content",
                marginBottom: "22px",
                color: "white",
                fontSize: "20px",
                fontWeight: "bold",
                letterSpacing: "2px",
              }}
            >
              #{num}
            </div>

            {/* Nom */}
            <div
              style={{
                color: "white",
                fontSize: hasPhoto ? "52px" : "64px",
                fontWeight: "bold",
                lineHeight: 1.1,
                marginBottom: "10px",
              }}
            >
              {name}
            </div>

            {/* Filière */}
            <div style={{ color: "#C9A882", fontSize: "24px", marginBottom: "28px", letterSpacing: "1px" }}>
              {filiere}
            </div>

            {/* Compteur votes */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "rgba(255,255,255,0.08)",
                borderRadius: "99px",
                padding: "10px 22px",
                width: "fit-content",
                marginBottom: "36px",
                border: "1px solid rgba(201,149,10,0.3)",
              }}
            >
              <div style={{ color: "#F0C040", fontSize: "20px" }}>★</div>
              <div style={{ color: "white", fontSize: "22px", fontWeight: "bold" }}>
                {votes} vote{(c?.voteCount ?? 0) > 1 ? "s" : ""}
              </div>
            </div>

            {/* CTA bouton */}
            <div
              style={{
                display: "flex",
                background: "linear-gradient(135deg, #F0C040, #C9950A)",
                borderRadius: "99px",
                padding: "14px 36px",
                width: "fit-content",
                color: "white",
                fontSize: "22px",
                fontWeight: "bold",
              }}
            >
              Voter pour {name.split(" ")[0]} →
            </div>
          </div>

          {/* Logo en bas à droite */}
          <div
            style={{
              position: "absolute",
              bottom: "24px",
              right: "32px",
              color: "rgba(201,168,130,0.35)",
              fontSize: "16px",
              letterSpacing: "2px",
              display: "flex",
            }}
          >
            MISS & MISTER ISTIC.YDE 2026
          </div>

          {/* Barre dorée à gauche */}
          <div style={{ position: "absolute", left: 0, top: 0, width: "6px", height: "630px", background: "linear-gradient(to bottom, #F0C040, #C9950A)", display: "flex" }} />
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (err) {
    console.error("[OG /candidate]", err);
    return new ImageResponse(
      (
        <div style={{ width: "1200px", height: "630px", background: "#1C0F0A", display: "flex", alignItems: "center", justifyContent: "center", color: "#C9A882", fontSize: "48px", fontFamily: "Georgia, serif" }}>
          ISTIC VOTE 2026
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
