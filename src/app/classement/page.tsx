"use client";
// src/app/classement/page.tsx
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import BottomNav from "@/components/layout/BottomNav";
import { RefreshCw, TrendingUp, Share2, Check, Users, User, Trophy } from "lucide-react";
import type { RankingEntry } from "@/types";
import { APP_URL } from "@/lib/constants";

const MEDAL_COLORS = ["linear-gradient(135deg,#F0C040,#C9950A)", "#9CA3AF", "#CD7F32"];

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

interface RankingEntryWithWA extends RankingEntry {
  whatsappGroup?: string | null;
}

export default function ClassementPage() {
  const [ranking, setRanking] = useState<RankingEntryWithWA[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadRanking = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/ranking");
      const data = await res.json();
      if (data.success) {
        setRanking(data.data.ranking);
        setTotalVotes(data.data.totalVotes);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRanking();
    const interval = setInterval(() => loadRanking(), 30_000);
    return () => clearInterval(interval);
  }, [loadRanking]);

  async function handleShare(entry: RankingEntryWithWA) {
    const url = `${APP_URL}/voter?id=${entry.id}`;
    const shareData = {
      title: `Votez pour ${entry.name} — Reine du Meta By Helen`,
      text: `${entry.name} est N°${entry.rank} avec ${entry.voteCount} votes ! Soutenez-le/la !`,
      url,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

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
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 900 }}>Classement</h1>
            <div style={{ fontSize: ".7rem", color: "var(--gold)", fontWeight: 600, letterSpacing: ".05em" }}>
              Reine du Meta By Helen
            </div>
          </div>
          <button
            onClick={() => loadRanking(true)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-600)", display: "flex", alignItems: "center", padding: 6 }}
          >
            <RefreshCw
              size={20}
              className={refreshing ? "spin-icon" : ""}
              style={{ transition: "color .2s" }}
            />
          </button>
          <style>{`
            @keyframes spin-icon-anim { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .spin-icon { animation: spin-icon-anim .65s linear infinite; }
          `}</style>
        </header>

        <div style={{ padding: "14px 20px 0" }}>
          {/* Live banner */}
          <div style={{
            background: "linear-gradient(135deg, var(--dark-bg), var(--dark-mid))",
            border: "1px solid rgba(201,168,130,.18)",
            borderRadius: "var(--radius-lg)", padding: "14px 18px",
            display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36,
                background: "linear-gradient(135deg,#F0C040,#C9950A)",
                borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <TrendingUp size={17} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: ".88rem", color: "white" }}>Résultats en temps réel</div>
                <div style={{ fontSize: ".72rem", color: "var(--rose-gold)", opacity: .7 }}>Mis à jour toutes les 30s</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: ".72rem", color: "#4ADE80", fontWeight: 700 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", animation: "pulse 1.5s ease infinite" }} />
              LIVE
            </div>
          </div>

          {/* Total votes */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, padding: "0 4px" }}>
            <span style={{ fontSize: ".82rem", color: "var(--gray-400)", fontWeight: 500 }}>Total des votes</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Users size={20} color="var(--gold)" />
              <span style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 900, color: "var(--gold)" }}>
                {totalVotes.toLocaleString("fr-FR")}
              </span>
            </div>
          </div>
        </div>

        {/* Ranking list */}
        <div style={{ padding: "0 20px" }}>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ height: 88, background: "var(--gray-50)", borderRadius: "var(--radius-lg)", marginBottom: 10, animation: "pulse 1.5s ease infinite" }} />
              ))
            : ranking.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="animate-fadeup"
                  style={{
                    animationDelay: `${idx * 0.06}s`,
                    borderRadius: "var(--radius-lg)",
                    marginBottom: 10,
                    overflow: "hidden",
                    border: idx === 0 ? "1.5px solid rgba(201,149,10,.3)" : "1.5px solid var(--gray-100)",
                    background: idx === 0
                      ? "linear-gradient(135deg, var(--dark-bg), var(--dark-mid))"
                      : "var(--white)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
                    {/* Rank */}
                    <div style={{ width: 30, textAlign: "center", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {idx < 3
                        ? <div style={{ width: 28, height: 28, borderRadius: "50%", background: MEDAL_COLORS[idx], display: "flex", alignItems: "center", justifyContent: "center" }}><Trophy size={13} color="white" /></div>
                        : <span style={{ fontSize: ".95rem", fontWeight: 900, color: "var(--gray-400)" }}>{entry.rank}</span>
                      }
                    </div>

                    {/* Avatar */}
                    <div style={{
                      width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
                      background: idx === 0
                        ? "linear-gradient(135deg,rgba(201,149,10,.25),rgba(201,149,10,.1))"
                        : "linear-gradient(135deg,#FDF6E3,#FEF3C7)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.6rem",
                      border: idx === 0 ? "2px solid var(--gold)" : "none",
                      overflow: "hidden",
                    }}>
                      {entry.photoUrl && !entry.photoUrl.startsWith("/placeholder")
                        ? <img src={entry.photoUrl} alt={entry.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <User size={20} color="rgba(201,168,130,.5)" />
                      }
                    </div>

                    {/* Info + progress */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 700, fontSize: ".88rem", marginBottom: 1,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        color: idx === 0 ? "white" : "var(--gray-900)",
                      }}>
                        {entry.name}
                      </div>
                      <div style={{ fontSize: ".7rem", color: idx === 0 ? "var(--rose-gold)" : "var(--gray-400)", marginBottom: 6 }}>
                        {entry.filiere}
                      </div>
                      <div className="progress-bar" style={{ background: idx === 0 ? "rgba(255,255,255,.1)" : "var(--gray-100)" }}>
                        <div className="progress-fill" style={{ width: `${entry.percentage}%` }} />
                      </div>
                      <div style={{ fontSize: ".68rem", color: idx === 0 ? "rgba(201,168,130,.6)" : "var(--gray-400)", marginTop: 3 }}>
                        {entry.percentage}%
                      </div>
                    </div>

                    {/* Votes + actions */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{
                        fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1rem",
                        color: idx === 0 ? "var(--gold-light)" : "var(--gray-900)",
                      }}>
                        {entry.voteCount.toLocaleString("fr-FR")}
                      </div>
                      <div style={{ fontSize: ".66rem", color: idx === 0 ? "rgba(201,168,130,.5)" : "var(--gray-400)", marginBottom: 6 }}>votes</div>
                      {/* Action icons */}
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => handleShare(entry)}
                          title="Partager"
                          style={{
                            width: 26, height: 26, borderRadius: "50%",
                            background: idx === 0 ? "rgba(255,255,255,.1)" : "var(--gray-50)",
                            border: "none", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: copiedId === entry.id ? "#22C55E" : (idx === 0 ? "var(--rose-gold)" : "var(--gray-400)"),
                          }}
                        >
                          {copiedId === entry.id ? <Check size={12} /> : <Share2 size={12} />}
                        </button>
                        {(entry.whatsappGroup) && (
                          <a
                            href={entry.whatsappGroup}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Groupe WhatsApp support"
                            style={{
                              width: 26, height: 26, borderRadius: "50%",
                              background: "#25D366",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "white", textDecoration: "none",
                            }}
                          >
                            <WhatsAppIcon size={13} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Vote CTA for top 3 */}
                  {idx < 3 && (
                    <div style={{ padding: "0 16px 14px" }}>
                      <Link
                        href={`/voter?id=${entry.id}`}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center",
                          padding: "9px", borderRadius: "var(--radius-xl)",
                          background: idx === 0
                            ? "linear-gradient(135deg,#F0C040,#C9950A)"
                            : "var(--gray-50)",
                          color: idx === 0 ? "white" : "var(--gray-600)",
                          textDecoration: "none", fontSize: ".78rem", fontWeight: 700,
                          gap: 6,
                        }}
                      >
                        Voter pour {entry.name.split(" ")[0]} →
                      </Link>
                    </div>
                  )}
                </div>
              ))
          }
        </div>

        {!loading && ranking.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--gray-400)" }}>
            Aucun vote enregistré pour l'instant
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
