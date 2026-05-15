"use client";
// src/app/candidats/page.tsx
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import BottomNav from "@/components/layout/BottomNav";
import { Search, Menu, Share2, Check, X, ExternalLink } from "lucide-react";
import type { Candidate } from "@/types";
import { APP_URL, DEFAULT_WHATSAPP_SUPPORT } from "@/lib/constants";

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

interface CandidateWithWA extends Candidate {
  whatsappGroup?: string | null;
}

/* ── Candidate detail modal ─────────────────────────────────────────────── */
function CandidateModal({
  candidate,
  onClose,
  onShare,
  copied,
}: {
  candidate: CandidateWithWA;
  onClose: () => void;
  onShare: (c: CandidateWithWA) => void;
  copied: boolean;
}) {
  const voteUrl = `${APP_URL}/voter?id=${candidate.id}`;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(28,15,10,.75)",
          backdropFilter: "blur(6px)", zIndex: 200,
          animation: "fadeIn .2s ease",
        }}
      />

      {/* Bottom sheet */}
      <div
        style={{
          position: "fixed", bottom: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "100%", maxWidth: "430px",
          background: "var(--white)",
          borderRadius: "28px 28px 0 0",
          zIndex: 201,
          animation: "slideUp .3s cubic-bezier(.32,1,.4,1)",
          maxHeight: "92dvh",
          overflowY: "auto",
          boxShadow: "0 -20px 60px rgba(28,15,10,.5)",
        }}
      >
        {/* Drag handle */}
        <div style={{ width: 40, height: 4, background: "var(--gray-200)", borderRadius: 99, margin: "12px auto 0" }} />

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            width: 34, height: 34, borderRadius: "50%",
            background: "var(--gray-100)", border: "none",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--gray-600)", zIndex: 5,
          }}
        >
          <X size={16} />
        </button>

        {/* Hero photo */}
        <div style={{
          height: 290,
          background: "linear-gradient(135deg, #1C0F0A, #2D1A0E)",
          position: "relative", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "6rem", marginTop: 8,
        }}>
          {candidate.photoUrl && !candidate.photoUrl.startsWith("/placeholder")
            ? <img
                src={candidate.photoUrl}
                alt={candidate.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
              />
            : "👩"
          }
          {/* Number badge */}
          <div style={{
            position: "absolute", top: 16, left: 16,
            background: "linear-gradient(135deg,#F0C040,#C9950A)",
            color: "white", borderRadius: "99px", padding: "4px 14px",
            fontSize: ".8rem", fontWeight: 700, boxShadow: "0 2px 12px rgba(201,149,10,.4)",
          }}>
            #{String(candidate.number).padStart(2, "0")}
          </div>
          {/* Gradient overlay */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 90,
            background: "linear-gradient(to top, rgba(28,15,10,.9), transparent)",
          }} />
          {/* Name overlay */}
          <div style={{ position: "absolute", bottom: 18, left: 20, right: 20 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 900, color: "white", lineHeight: 1.15 }}>
              {candidate.name}
            </div>
            <div style={{ fontSize: ".84rem", color: "#C9A882", marginTop: 3 }}>
              {candidate.filiere}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "20px 20px 36px" }}>

          {/* Unique vote link */}
          <div style={{
            background: "var(--gray-50)", borderRadius: "var(--radius-md)",
            padding: "12px 14px", marginBottom: 16,
            border: "1px solid var(--gray-100)",
          }}>
            <div style={{ fontSize: ".68rem", fontWeight: 700, color: "var(--gray-400)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 5 }}>
              🔗 Lien de vote unique
            </div>
            <div style={{ fontSize: ".77rem", color: "var(--gray-600)", wordBreak: "break-all", fontFamily: "monospace" }}>
              {voteUrl}
            </div>
          </div>

          {/* Action row */}
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            {/* Share */}
            <button
              onClick={() => onShare(candidate)}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "13px 16px", borderRadius: "var(--radius-xl)",
                border: `2px solid ${copied ? "#166534" : "var(--gray-200)"}`,
                background: copied ? "#DCFCE7" : "var(--white)",
                color: copied ? "#166534" : "var(--gray-700)",
                fontWeight: 700, fontSize: ".88rem", cursor: "pointer",
                transition: "all .2s",
              }}
            >
              {copied ? <Check size={16} /> : <Share2 size={16} />}
              {copied ? "Copié !" : "Partager"}
            </button>

            {/* WhatsApp */}
            {(candidate.whatsappGroup || DEFAULT_WHATSAPP_SUPPORT) && (
              <a
                href={candidate.whatsappGroup ?? DEFAULT_WHATSAPP_SUPPORT}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "13px 16px", borderRadius: "var(--radius-xl)",
                  background: "#25D366", color: "white",
                  fontWeight: 700, fontSize: ".88rem", textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(37,211,102,.35)",
                }}
              >
                <WhatsAppIcon size={16} />
                Support
              </a>
            )}
          </div>

          {/* Main CTA */}
          <Link
            href={`/voter?id=${candidate.id}`}
            className="btn btn-primary"
            style={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: 8 }}
          >
            🗳️ Voter pour {candidate.name.split(" ")[0]}
            <ExternalLink size={16} />
          </Link>

          <p style={{ textAlign: "center", fontSize: ".72rem", color: "var(--gray-400)", marginTop: 12 }}>
            100 FCFA = 1 vote · Paiement sécurisé via Fapshi
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(100%) }
          to   { transform: translateX(-50%) translateY(0) }
        }
      `}</style>
    </>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────────── */
export default function CandidatsPage() {
  const [candidates, setCandidates] = useState<CandidateWithWA[]>([]);
  const [filtered, setFiltered] = useState<CandidateWithWA[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CandidateWithWA | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/candidates")
      .then((r) => r.json())
      .then((data) => {
        setCandidates(data.data ?? []);
        setFiltered(data.data ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      candidates.filter(
        (c) => c.name.toLowerCase().includes(q) || c.filiere.toLowerCase().includes(q)
      )
    );
  }, [search, candidates]);

  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selected]);

  const handleShare = useCallback(async (candidate: CandidateWithWA) => {
    const url = `${APP_URL}/voter?id=${candidate.id}`;
    const shareData = {
      title: `Vote pour ${candidate.name} — Miss & Mister ISTIC.YDE 2026`,
      text: `Soutenez ${candidate.name} (${candidate.filiere}) !`,
      url,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopiedId(candidate.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  }, []);

  return (
    <div className="shell">
      <div className="page">
        {/* Header */}
        <header style={{
          padding: "20px 20px 14px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, background: "white", zIndex: 50,
          borderBottom: "1px solid var(--gray-100)",
        }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 900 }}>
              Nos candidats
            </h1>
            <div style={{ fontSize: ".7rem", color: "var(--gold)", fontWeight: 600, letterSpacing: ".05em" }}>
              Miss &amp; Mister ISTIC.YDE 2026
            </div>
          </div>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-600)" }}>
            <Menu size={22} />
          </button>
        </header>

        {/* Search */}
        <div style={{ padding: "14px 20px" }}>
          <div style={{ position: "relative" }}>
            <Search size={17} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
            <input
              className="input-gold"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un candidat..."
              style={{ paddingLeft: 42, fontSize: ".9rem", fontWeight: 400 }}
            />
          </div>
        </div>

        {/* Grid */}
        <div style={{ padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ background: "var(--gray-50)", borderRadius: "var(--radius-lg)", height: 260 }} />
              ))
            : filtered.map((candidate, idx) => (
                <div
                  key={candidate.id}
                  className="card animate-fadeup"
                  style={{ animationDelay: `${idx * 0.07}s`, position: "relative", cursor: "pointer" }}
                  onClick={() => setSelected(candidate)}
                >
                  {/* Number badge */}
                  <div style={{
                    position: "absolute", top: 10, left: 10, zIndex: 2,
                    background: "linear-gradient(135deg,#F0C040,#C9950A)",
                    color: "white", borderRadius: "99px", padding: "2px 9px",
                    fontSize: ".7rem", fontWeight: 700,
                  }}>
                    {String(candidate.number).padStart(2, "0")}
                  </div>

                  {/* Share button top-right */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleShare(candidate); }}
                    style={{
                      position: "absolute", top: 10, right: 10, zIndex: 2,
                      width: 30, height: 30, borderRadius: "50%",
                      background: copiedId === candidate.id ? "#DCFCE7" : "rgba(255,255,255,.85)",
                      backdropFilter: "blur(4px)",
                      border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: copiedId === candidate.id ? "#166534" : "var(--gray-600)",
                      boxShadow: "var(--shadow-sm)",
                    }}
                    title="Partager le lien unique"
                  >
                    {copiedId === candidate.id ? <Check size={13} /> : <Share2 size={13} />}
                  </button>

                  {/* Photo area */}
                  <div style={{
                    height: 130,
                    background: "linear-gradient(135deg, #1C0F0A, #2D1A0E)",
                    position: "relative", overflow: "hidden",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.5rem",
                  }}>
                    {candidate.photoUrl && !candidate.photoUrl.startsWith("/placeholder")
                      ? <img src={candidate.photoUrl} alt={candidate.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", position: "absolute", inset: 0 }} />
                      : "👩"
                    }

                    {/* WhatsApp support */}
                    {(candidate.whatsappGroup || DEFAULT_WHATSAPP_SUPPORT) && (
                      <a
                        href={candidate.whatsappGroup ?? DEFAULT_WHATSAPP_SUPPORT}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: "absolute", bottom: 8, left: "50%",
                          transform: "translateX(-50%)",
                          background: "#25D366",
                          color: "white",
                          borderRadius: "99px",
                          padding: "5px 10px",
                          display: "flex", alignItems: "center", gap: 5,
                          fontSize: ".62rem", fontWeight: 700,
                          textDecoration: "none",
                          whiteSpace: "nowrap",
                          boxShadow: "0 2px 8px rgba(37,211,102,.4)",
                          zIndex: 3,
                        }}
                      >
                        <WhatsAppIcon size={12} />
                        Groupe support
                      </a>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: "10px 12px 12px" }}>
                    <div style={{ fontWeight: 700, fontSize: ".88rem", color: "var(--gray-900)", marginBottom: 2 }}>
                      {candidate.name}
                    </div>
                    <div style={{ fontSize: ".72rem", color: "var(--gray-400)", marginBottom: 8 }}>
                      {candidate.filiere}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Link
                        href={`/voter?id=${candidate.id}`}
                        className="btn btn-primary"
                        style={{ padding: "9px 12px", fontSize: ".78rem", flex: 1 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Voter
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--gray-400)" }}>
            Aucun candidat trouvé
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <CandidateModal
          candidate={selected}
          onClose={() => setSelected(null)}
          onShare={handleShare}
          copied={copiedId === selected.id}
        />
      )}

      <BottomNav />
    </div>
  );
}
