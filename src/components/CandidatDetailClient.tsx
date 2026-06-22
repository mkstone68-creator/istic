"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy, Share2, Check, Heart, User } from "lucide-react";
import { APP_URL } from "@/lib/constants";

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export interface CandidateDetail {
  id: string;
  number: number;
  name: string;
  filiere: string;
  photoUrl: string;
  description?: string | null;
  whatsappGroup?: string | null;
  voteCount: number;
}

export default function CandidatDetailClient({ candidate }: { candidate: CandidateDetail }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  async function handleShare() {
    const url = `${APP_URL}/voter?id=${candidate.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: candidate.name, text: `Votez pour ${candidate.name} !`, url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  const hasPhoto = candidate.photoUrl && !candidate.photoUrl.startsWith("/placeholder") && !imgError;

  return (
    <div className="shell">
      <div className="page" style={{ paddingBottom: 100 }}>

        {/* Hero photo */}
        <div style={{ position: "relative", width: "100%", paddingBottom: "125%", background: "linear-gradient(135deg,#1C0F0A,#2D1A0E)", overflow: "hidden" }}>
          {hasPhoto ? (
            <img src={candidate.photoUrl} alt={candidate.name} onError={() => setImgError(true)}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
          ) : (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={80} color="rgba(201,168,130,.3)" />
            </div>
          )}

          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,15,10,.95) 0%, rgba(28,15,10,.3) 50%, transparent 100%)" }} />

          <button onClick={() => router.back()}
            style={{ position: "absolute", top: 16, left: 16, width: 38, height: 38, borderRadius: "50%", background: "rgba(0,0,0,.45)", backdropFilter: "blur(6px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
            <ArrowLeft size={18} />
          </button>

          <button onClick={handleShare}
            style={{ position: "absolute", top: 16, right: 16, width: 38, height: 38, borderRadius: "50%", background: copied ? "rgba(34,197,94,.8)" : "rgba(0,0,0,.45)", backdropFilter: "blur(6px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
            {copied ? <Check size={17} /> : <Share2 size={17} />}
          </button>

          <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#F0C040,#C9950A)", color: "white", borderRadius: 99, padding: "4px 14px", fontSize: ".78rem", fontWeight: 800, boxShadow: "0 2px 12px rgba(201,149,10,.5)" }}>
            #{String(candidate.number).padStart(2, "0")}
          </div>

          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 20px 24px" }}>
            <div style={{ fontSize: ".78rem", color: "rgba(201,168,130,.7)", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4 }}>
              {candidate.filiere}
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 900, color: "white", lineHeight: 1.1, marginBottom: 10, textShadow: "0 2px 12px rgba(0,0,0,.5)" }}>
              {candidate.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.1)", backdropFilter: "blur(8px)", borderRadius: 99, padding: "6px 14px", width: "fit-content" }}>
              <Trophy size={15} color="#F0C040" />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1rem", color: "white" }}>
                {candidate.voteCount.toLocaleString("fr-FR")}
              </span>
              <span style={{ fontSize: ".75rem", color: "rgba(255,255,255,.7)" }}>
                vote{candidate.voteCount > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div style={{ padding: "24px 20px" }}>
          {candidate.description ? (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--gray-400)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10 }}>À propos</div>
              <p style={{ color: "var(--gray-700)", lineHeight: 1.75, fontSize: ".93rem", whiteSpace: "pre-line" }}>{candidate.description}</p>
            </div>
          ) : (
            <div style={{ marginBottom: 28, padding: "16px", background: "var(--gray-50)", borderRadius: 12, textAlign: "center", color: "var(--gray-400)", fontSize: ".88rem" }}>
              Aucune description disponible.
            </div>
          )}

          <div style={{ background: "linear-gradient(135deg,#FDF6E3,#FEF3C7)", border: "1.5px solid rgba(201,149,10,.2)", borderRadius: 16, padding: "18px 20px", marginBottom: 28, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, background: "linear-gradient(135deg,#F0C040,#C9950A)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 16px rgba(201,149,10,.3)" }}>
              <Trophy size={22} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 900, color: "var(--gold-dark)", lineHeight: 1 }}>
                {candidate.voteCount.toLocaleString("fr-FR")}
              </div>
              <div style={{ fontSize: ".78rem", color: "#92400E", fontWeight: 600, marginTop: 2 }}>votes reçus</div>
            </div>
          </div>

          <Link href={`/voter?id=${candidate.id}`}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "16px", borderRadius: "var(--radius-xl)", background: "linear-gradient(135deg,#F0C040,#C9950A)", color: "white", textDecoration: "none", fontWeight: 800, fontSize: "1.05rem", boxShadow: "0 6px 24px rgba(201,149,10,.4)", marginBottom: 12 }}>
            <Heart size={20} fill="white" /> Voter pour {candidate.name.split(" ")[0]}
          </Link>

          {candidate.whatsappGroup && (
            <a href={candidate.whatsappGroup} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "14px", borderRadius: "var(--radius-xl)", background: "#25D366", color: "white", textDecoration: "none", fontWeight: 700, fontSize: ".92rem", marginBottom: 12, boxShadow: "0 4px 16px rgba(37,211,102,.3)" }}>
              <WhatsAppIcon size={20} /> Rejoindre le groupe de supporters
            </a>
          )}

          <button onClick={handleShare}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px", borderRadius: "var(--radius-xl)", background: "white", border: `2px solid ${copied ? "#22C55E" : "var(--gray-200)"}`, color: copied ? "#16A34A" : "var(--gray-700)", fontWeight: 700, fontSize: ".92rem", cursor: "pointer", transition: "all .2s" }}>
            {copied ? <><Check size={18} /> Lien copié !</> : <><Share2 size={18} /> Partager le lien de vote</>}
          </button>
        </div>
      </div>
    </div>
  );
}
