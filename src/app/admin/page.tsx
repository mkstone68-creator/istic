"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Stats {
  candidateCount: number;
  totalVotes: number;
  revenue: number;
  pendingCount: number;
  pendingEuropeCount: number;
  confirmedCount: number;
  failedCount: number;
  recentTransactions: Array<{
    id: string;
    amount: number;
    voteCount: number;
    status: string;
    isEuropeWire: boolean;
    createdAt: string;
    candidate: { name: string; number: number };
  }>;
  topCandidates: Array<{
    id: string;
    name: string;
    number: number;
    filiere: string;
    voteCount: number;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#F59E0B",
  CONFIRMED: "#10B981",
  FAILED: "#EF4444",
  EXPIRED: "#9E9C91",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmé",
  FAILED: "Échoué",
  EXPIRED: "Expiré",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d.data);
        else setError(d.error);
      })
      .catch(() => setError("Erreur de connexion"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 900, marginBottom: 8, color: "#1A1914" }}>Dashboard</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 100, background: "#EEEDE8", borderRadius: 16, animation: "pulse 1.5s ease infinite" }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div style={{ color: "#EF4444", padding: 24 }}>Erreur: {error}</div>;
  }

  if (!stats) return null;

  const kpis = [
    { label: "Total Votes", value: stats.totalVotes.toLocaleString("fr-FR"), icon: "🗳️", color: "#C9950A" },
    { label: "Revenus (FCFA)", value: stats.revenue.toLocaleString("fr-FR"), icon: "💰", color: "#10B981" },
    { label: "En attente", value: stats.pendingCount, icon: "⏳", color: "#F59E0B", alert: stats.pendingEuropeCount > 0 },
    { label: "Candidats", value: stats.candidateCount, icon: "👥", color: "#6366F1" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 900, color: "#1A1914", lineHeight: 1.1 }}>
            Dashboard
          </h1>
          <div style={{ fontSize: ".82rem", color: "#9E9C91", marginTop: 4 }}>
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
        {stats.pendingEuropeCount > 0 && (
          <Link href="/admin/transactions?status=PENDING" style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#FEF3C7", border: "1.5px solid #FCD34D",
            borderRadius: "99px", padding: "9px 16px",
            textDecoration: "none", fontSize: ".82rem", fontWeight: 700, color: "#92400E",
          }}>
            ⚠️ {stats.pendingEuropeCount} virement(s) à valider
          </Link>
        )}
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {kpis.map(({ label, value, icon, color, alert }) => (
          <div key={label} style={{
            background: "white",
            borderRadius: 16,
            padding: "20px 22px",
            boxShadow: "0 2px 12px rgba(0,0,0,.06)",
            border: alert ? "1.5px solid #FCD34D" : "1.5px solid transparent",
            position: "relative",
          }}>
            {alert && (
              <div style={{
                position: "absolute", top: -6, right: -6,
                width: 20, height: 20, borderRadius: "50%",
                background: "#EF4444", color: "white",
                fontSize: ".65rem", fontWeight: 900,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>!</div>
            )}
            <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>{icon}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 900, color, lineHeight: 1 }}>
              {value}
            </div>
            <div style={{ fontSize: ".75rem", color: "#9E9C91", marginTop: 4, fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Transactions récentes */}
        <div style={{ background: "white", borderRadius: 16, padding: "20px 22px", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: ".95rem", color: "#1A1914" }}>Transactions récentes</div>
            <Link href="/admin/transactions" style={{ fontSize: ".75rem", color: "#C9950A", fontWeight: 600, textDecoration: "none" }}>
              Voir tout →
            </Link>
          </div>
          <div>
            {stats.recentTransactions.map((tx) => (
              <div key={tx.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 0", borderBottom: "1px solid #F7F7F5",
              }}>
                <div>
                  <div style={{ fontSize: ".84rem", fontWeight: 600, color: "#1A1914" }}>
                    {tx.candidate.name}
                    {tx.isEuropeWire && <span style={{ marginLeft: 6, fontSize: ".65rem", background: "#EFF6FF", color: "#2563EB", padding: "2px 6px", borderRadius: "99px", fontWeight: 700 }}>🇪🇺</span>}
                  </div>
                  <div style={{ fontSize: ".72rem", color: "#9E9C91" }}>
                    {tx.voteCount} vote{tx.voteCount > 1 ? "s" : ""} · {(tx.amount).toLocaleString("fr-FR")} FCFA
                  </div>
                </div>
                <span style={{
                  background: STATUS_COLORS[tx.status] + "20",
                  color: STATUS_COLORS[tx.status],
                  borderRadius: "99px",
                  padding: "3px 10px",
                  fontSize: ".7rem",
                  fontWeight: 700,
                }}>
                  {STATUS_LABELS[tx.status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top candidats */}
        <div style={{ background: "white", borderRadius: 16, padding: "20px 22px", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: ".95rem", color: "#1A1914" }}>Top candidats</div>
            <Link href="/admin/candidats" style={{ fontSize: ".75rem", color: "#C9950A", fontWeight: 600, textDecoration: "none" }}>
              Gérer →
            </Link>
          </div>
          {stats.topCandidates.map((c, i) => (
            <div key={c.id} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 0", borderBottom: i < stats.topCandidates.length - 1 ? "1px solid #F7F7F5" : "none",
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: i === 0 ? "linear-gradient(135deg,#F0C040,#C9950A)" : i === 1 ? "#E5E7EB" : "#FEF3C7",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: ".9rem", fontWeight: 900, color: i === 0 ? "white" : "#374151",
                flexShrink: 0,
              }}>
                {["🥇", "🥈", "🥉"][i] ?? i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: ".84rem", fontWeight: 700, color: "#1A1914" }}>{c.name}</div>
                <div style={{ fontSize: ".72rem", color: "#9E9C91" }}>{c.filiere}</div>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 900, color: "#C9950A" }}>
                {c.voteCount.toLocaleString("fr-FR")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statuts */}
      <div style={{ background: "white", borderRadius: 16, padding: "20px 22px", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
        <div style={{ fontWeight: 700, fontSize: ".95rem", color: "#1A1914", marginBottom: 16 }}>Statut des transactions</div>
        <div style={{ display: "flex", gap: 16 }}>
          {[
            { label: "Confirmées", value: stats.confirmedCount, color: "#10B981" },
            { label: "En attente", value: stats.pendingCount, color: "#F59E0B" },
            { label: "Échouées", value: stats.failedCount, color: "#EF4444" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
              <span style={{ fontSize: ".82rem", color: "#5E5C53" }}>{label}: </span>
              <span style={{ fontSize: ".82rem", fontWeight: 700, color }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
