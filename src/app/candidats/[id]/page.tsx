"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/layout/BottomNav";
import { ArrowLeft, Trophy, Share2, Check, Heart } from "lucide-react";
import { APP_URL } from "@/lib/constants";

interface Candidate {
  id: string;
  number: number;
  name: string;
  filiere: string;
  photoUrl: string;
  description?: string | null;
  whatsappGroup?: string | null;
  voteCount: number;
}

export default function CandidatDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/candidates/${id}`)
      .then(r => r.json())
      .then(d => { setCandidate(d.data ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleShare() {
    const url = `${APP_URL}/voter?id=${id}`;
    if (navigator.share) {
      try { await navigator.share({ title: candidate?.name, text: `Votez pour ${candidate?.name} !`, url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  if (loading) {
    return (
      <div className="shell">
        <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="shell">
        <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
          <div style={{ fontSize: "3rem" }}>😕</div>
          <p style={{ color: "var(--gray-600)" }}>Candidat introuvable</p>
          <Link href="/candidats" className="btn btn-primary" style={{ width: "auto" }}>Retour</Link>
        </div>
      </div>
    );
  }

  const hasPhoto = candidate.photoUrl && !candidate.photoUrl.startsWith("/placeholder") && !imgError;

  return (
    <div className="shell">
      <div className="page" style={{ paddingBottom: 100 }}>

        {/* Hero photo */}
        <div style={{ position: "relative", width: "100%", paddingBottom: "125%", background: "linear-gradient(135deg,#1C0F0A,#2D1A0E)", overflow: "hidden" }}>
          {hasPhoto ? (
            <img
              src={candidate.photoUrl}
              alt={candidate.name}
              onError={() => setImgError(true)}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
            />
          ) : (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8rem" }}>👤</div>
          )}

          {/* Gradient overlay */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,15,10,.95) 0%, rgba(28,15,10,.3) 50%, transparent 100%)" }} />

          {/* Bouton retour */}
          <button
            onClick={() => router.back()}
            style={{ position: "absolute", top: 16, left: 16, width: 38, height: 38, borderRadius: "50%", background: "rgba(0,0,0,.45)", backdropFilter: "blur(6px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
            <ArrowLeft size={18} />
          </button>

          {/* Bouton partager */}
          <button
            onClick={handleShare}
            style={{ position: "absolute", top: 16, right: 16, width: 38, height: 38, borderRadius: "50%", background: copied ? "rgba(34,197,94,.8)" : "rgba(0,0,0,.45)", backdropFilter: "blur(6px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
            {copied ? <Check size={17} /> : <Share2 size={17} />}
          </button>

          {/* Numéro badge */}
          <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#F0C040,#C9950A)", color: "white", borderRadius: 99, padding: "4px 14px", fontSize: ".78rem", fontWeight: 800, boxShadow: "0 2px 12px rgba(201,149,10,.5)" }}>
            #{String(candidate.number).padStart(2, "0")}
          </div>

          {/* Infos en bas du hero */}
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

          {/* Description */}
          {candidate.description ? (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--gray-400)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10 }}>
                À propos
              </div>
              <p style={{ color: "var(--gray-700)", lineHeight: 1.75, fontSize: ".93rem", whiteSpace: "pre-line" }}>
                {candidate.description}
              </p>
            </div>
          ) : (
            <div style={{ marginBottom: 28, padding: "16px", background: "var(--gray-50)", borderRadius: 12, textAlign: "center", color: "var(--gray-400)", fontSize: ".88rem" }}>
              Aucune description disponible.
            </div>
          )}

          {/* Stats card */}
          <div style={{ background: "linear-gradient(135deg,#FDF6E3,#FEF3C7)", border: "1.5px solid rgba(201,149,10,.2)", borderRadius: 16, padding: "18px 20px", marginBottom: 28, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, background: "linear-gradient(135deg,#F0C040,#C9950A)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 16px rgba(201,149,10,.3)" }}>
              <Trophy size={22} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 900, color: "var(--gold-dark)", lineHeight: 1 }}>
                {candidate.voteCount.toLocaleString("fr-FR")}
              </div>
              <div style={{ fontSize: ".78rem", color: "#92400E", fontWeight: 600, marginTop: 2 }}>
                votes reçus · 100 FCFA / vote
              </div>
            </div>
          </div>

          {/* CTA Voter */}
          <Link
            href={`/voter?id=${candidate.id}`}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "16px", borderRadius: "var(--radius-xl)", background: "linear-gradient(135deg,#F0C040,#C9950A)", color: "white", textDecoration: "none", fontWeight: 800, fontSize: "1.05rem", boxShadow: "0 6px 24px rgba(201,149,10,.4)", marginBottom: 12 }}>
            <Heart size={20} fill="white" />
            Voter pour {candidate.name.split(" ")[0]}
          </Link>

          {/* Partager */}
          <button
            onClick={handleShare}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px", borderRadius: "var(--radius-xl)", background: "white", border: `2px solid ${copied ? "#22C55E" : "var(--gray-200)"}`, color: copied ? "#16A34A" : "var(--gray-700)", fontWeight: 700, fontSize: ".92rem", cursor: "pointer", transition: "all .2s" }}>
            {copied ? <><Check size={18} /> Lien copié !</> : <><Share2 size={18} /> Partager le lien de vote</>}
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
