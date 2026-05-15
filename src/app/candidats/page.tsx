"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import BottomNav from "@/components/layout/BottomNav";
import { Search, Trophy, Share2, Check } from "lucide-react";
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

export default function CandidatsPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filtered, setFiltered] = useState<Candidate[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/candidates")
      .then(r => r.json())
      .then(data => {
        const list = data.data ?? [];
        setCandidates(list);
        setFiltered(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(candidates.filter(c =>
      c.name.toLowerCase().includes(q) || c.filiere.toLowerCase().includes(q)
    ));
  }, [search, candidates]);

  const handleShare = useCallback(async (c: Candidate) => {
    const url = `${APP_URL}/voter?id=${c.id}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: c.name, text: `Votez pour ${c.name} !`, url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      setCopiedId(c.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  }, []);

  return (
    <div className="shell">
      <div className="page">

        {/* Header */}
        <header style={{ padding: "20px 20px 14px", position: "sticky", top: 0, background: "white", zIndex: 50, borderBottom: "1px solid var(--gray-100)" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 900, marginBottom: 2 }}>
            Nos candidats
          </h1>
          <div style={{ fontSize: ".72rem", color: "var(--gold)", fontWeight: 600, letterSpacing: ".05em" }}>
            Miss &amp; Mister ISTIC.YDE 2026
          </div>
        </header>

        {/* Search */}
        <div style={{ padding: "14px 20px" }}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
            <input
              className="input-gold"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un candidat…"
              style={{ paddingLeft: 42, fontSize: ".9rem" }}
            />
          </div>
        </div>

        {/* Grid */}
        <div style={{ padding: "0 16px 100px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>

          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 16, overflow: "hidden", background: "var(--gray-50)", height: 280 }} />
            ))
          ) : filtered.map((c, idx) => (
            <div key={c.id}
              className="animate-fadeup"
              style={{ animationDelay: `${idx * 0.06}s`, borderRadius: 16, overflow: "hidden", background: "white", boxShadow: "0 2px 12px rgba(0,0,0,.07)", border: "1px solid var(--gray-100)", display: "flex", flexDirection: "column" }}>

              {/* Photo */}
              <div style={{ position: "relative", paddingBottom: "120%", background: "linear-gradient(135deg,#1C0F0A,#2D1A0E)", overflow: "hidden" }}>
                {c.photoUrl && !c.photoUrl.startsWith("/placeholder") ? (
                  <img
                    src={c.photoUrl}
                    alt={c.name}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                  />
                ) : (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>👤</div>
                )}

                {/* Numéro badge */}
                <div style={{ position: "absolute", top: 8, left: 8, background: "linear-gradient(135deg,#F0C040,#C9950A)", color: "white", borderRadius: 99, padding: "2px 9px", fontSize: ".68rem", fontWeight: 800, boxShadow: "0 2px 8px rgba(201,149,10,.4)" }}>
                  #{String(c.number).padStart(2, "0")}
                </div>

                {/* Partager */}
                <button
                  onClick={() => handleShare(c)}
                  style={{ position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: "50%", background: copiedId === c.id ? "#DCFCE7" : "rgba(255,255,255,.85)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: copiedId === c.id ? "#166534" : "var(--gray-600)", backdropFilter: "blur(4px)" }}>
                  {copiedId === c.id ? <Check size={13} /> : <Share2 size={13} />}
                </button>

                {/* Gradient bas */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to top, rgba(28,15,10,.85), transparent)" }} />

                {/* Votes overlay */}
                <div style={{ position: "absolute", bottom: 8, left: 8, display: "flex", alignItems: "center", gap: 4 }}>
                  <Trophy size={12} color="#F0C040" />
                  <span style={{ fontSize: ".7rem", fontWeight: 700, color: "white" }}>
                    {c.voteCount.toLocaleString("fr-FR")}
                  </span>
                </div>
              </div>

              {/* Infos */}
              <div style={{ padding: "10px 12px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ fontWeight: 700, fontSize: ".88rem", color: "var(--gray-900)", lineHeight: 1.3 }}>{c.name}</div>
                <div style={{ fontSize: ".72rem", color: "var(--gray-400)", marginBottom: 8 }}>{c.filiere}</div>

                <Link
                  href={`/voter?id=${c.id}`}
                  className="btn btn-primary"
                  style={{ padding: "9px 12px", fontSize: ".78rem", textAlign: "center", textDecoration: "none", marginTop: "auto" }}>
                  Voter
                </Link>
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
      <BottomNav />
    </div>
  );
}
