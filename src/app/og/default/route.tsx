// src/app/og/default/route.tsx
// OG image par défaut du site — PNG 1200×630 via ImageResponse (Satori)
// Design : fond brun foncé signature, monogramme M en cercle, texte doré serif
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Palette
const BG      = "#1A0805";
const GOLD    = "#C9A882";
const GOLD2   = "#D4B896";
const WHITE   = "#FFFFFF";
const ACCENT  = "#C9950A";

export async function GET() {
  // Police Google Fonts chargée à la requête
  let fontData: ArrayBuffer | null = null;
  try {
    const res = await fetch(
      "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFiD-vYSZviVYUb_rj3ij__anPXBYf9lW4e7i1OyRmQHEmPnA.woff2",
      { cache: "force-cache" }
    );
    fontData = await res.arrayBuffer();
  } catch { /* fallback sans police */ }

  const options: ConstructorParameters<typeof ImageResponse>[1] = {
    width: 1200,
    height: 630,
    ...(fontData ? {
      fonts: [{ name: "Playfair", data: fontData, weight: 700, style: "normal" }],
    } : {}),
  };

  const serif = fontData ? "Playfair, Georgia, serif" : "Georgia, serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: BG,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Cercles décoratifs en arrière-plan */}
        <div style={{ position: "absolute", width: "560px", height: "560px", borderRadius: "50%", border: `1px solid ${GOLD}22`, top: "35px", right: "80px", display: "flex" }} />
        <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", border: `1px solid ${GOLD}15`, top: "115px", right: "160px", display: "flex" }} />
        <div style={{ position: "absolute", width: "240px", height: "240px", borderRadius: "50%", border: `1px solid ${GOLD}10`, top: "195px", right: "240px", display: "flex" }} />

        {/* Barre dorée gauche */}
        <div style={{ position: "absolute", left: 0, top: 0, width: "6px", height: "630px", background: `linear-gradient(to bottom, ${ACCENT}, #F0C040)`, display: "flex" }} />
        {/* Barre dorée bas */}
        <div style={{ position: "absolute", left: 0, bottom: 0, width: "1200px", height: "3px", background: `linear-gradient(to right, ${ACCENT}, #F0C040, ${ACCENT})`, display: "flex" }} />

        {/* Contenu central */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0px" }}>

          {/* Monogramme M avec cercle */}
          <div style={{ position: "relative", width: "200px", height: "200px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
            {/* Cercle */}
            <div style={{ position: "absolute", width: "180px", height: "180px", borderRadius: "50%", border: `1.5px solid ${WHITE}`, opacity: 0.85, display: "flex" }} />

            {/* Sparkle haut */}
            <div style={{ position: "absolute", top: "2px", left: "50%", width: "14px", height: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ display: "flex", position: "relative" }}>
                <div style={{ width: "2px", height: "14px", background: WHITE, position: "absolute", top: "-7px", left: "-1px", display: "flex" }} />
                <div style={{ width: "14px", height: "2px", background: WHITE, position: "absolute", top: "-1px", left: "-7px", display: "flex" }} />
              </div>
            </div>

            {/* Sparkle bas */}
            <div style={{ position: "absolute", bottom: "2px", left: "50%", width: "14px", height: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ display: "flex", position: "relative" }}>
                <div style={{ width: "2px", height: "14px", background: WHITE, position: "absolute", top: "-7px", left: "-1px", display: "flex" }} />
                <div style={{ width: "14px", height: "2px", background: WHITE, position: "absolute", top: "-1px", left: "-7px", display: "flex" }} />
              </div>
            </div>

            {/* Grand M italic rose gold */}
            <div style={{
              fontSize: "160px",
              fontFamily: serif,
              fontStyle: "italic",
              color: GOLD,
              lineHeight: 1,
              opacity: 0.75,
              position: "absolute",
              display: "flex",
              top: "20px",
            }}>
              M
            </div>

            {/* Petit M blanc en superposition */}
            <div style={{
              fontSize: "72px",
              fontFamily: serif,
              fontWeight: 700,
              color: WHITE,
              lineHeight: 1,
              position: "absolute",
              display: "flex",
              opacity: 0.95,
              top: "60px",
            }}>
              M
            </div>
          </div>

          {/* REINE DU META */}
          <div style={{
            fontFamily: serif,
            fontSize: "68px",
            fontWeight: 700,
            color: GOLD2,
            letterSpacing: "14px",
            display: "flex",
            marginBottom: "6px",
          }}>
            REINE DU META
          </div>

          {/* BY HELEN */}
          <div style={{
            fontFamily: serif,
            fontSize: "22px",
            color: GOLD,
            letterSpacing: "10px",
            opacity: 0.65,
            display: "flex",
            marginBottom: "32px",
          }}>
            BY HELEN
          </div>

          {/* Bouton CTA */}
          <div style={{
            background: `linear-gradient(135deg, #F0C040, ${ACCENT})`,
            borderRadius: "99px",
            padding: "14px 48px",
            display: "flex",
            alignItems: "center",
          }}>
            <span style={{ fontFamily: serif, fontSize: "22px", fontWeight: 700, color: WHITE, letterSpacing: "2px" }}>
              Voter maintenant →
            </span>
          </div>
        </div>

        {/* URL site en bas à droite */}
        <div style={{
          position: "absolute",
          bottom: "20px",
          right: "32px",
          fontFamily: serif,
          fontSize: "15px",
          color: GOLD,
          opacity: 0.3,
          letterSpacing: "2px",
          display: "flex",
        }}>
          isticvote.online
        </div>

        {/* Sparkles décoratifs coins */}
        {[
          { top: "30px",  left: "40px"  },
          { top: "40px",  left: "1130px" },
          { top: "560px", left: "40px"  },
          { top: "550px", left: "1130px" },
        ].map((pos, i) => (
          <div key={i} style={{ position: "absolute", ...pos, display: "flex", opacity: 0.4 }}>
            <div style={{ position: "relative", width: "12px", height: "12px", display: "flex" }}>
              <div style={{ position: "absolute", width: "2px", height: "12px", background: WHITE, top: 0, left: "5px", display: "flex" }} />
              <div style={{ position: "absolute", width: "12px", height: "2px", background: WHITE, top: "5px", left: 0, display: "flex" }} />
            </div>
          </div>
        ))}
      </div>
    ),
    options
  );
}
