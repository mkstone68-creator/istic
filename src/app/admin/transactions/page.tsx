"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

interface Transaction {
  id: string;
  amount: number;
  voteCount: number;
  phoneNumber: string;
  paymentMethod: string;
  currency: string;
  status: "PENDING" | "CONFIRMED" | "FAILED" | "EXPIRED";
  isEuropeWire: boolean;
  externalRef: string | null;
  createdAt: string;
  candidate: { name: string; number: number };
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

function TransactionsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusFilter = searchParams.get("status") ?? "ALL";

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadTransactions = useCallback(async (p = 1) => {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(p) });
    if (statusFilter !== "ALL") qs.set("status", statusFilter);
    const res = await fetch(`/api/admin/transactions?${qs}`);
    const data = await res.json();
    if (data.success) {
      setTransactions(data.data.transactions);
      setTotal(data.data.total);
      setPages(data.data.pages);
      setPage(p);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { loadTransactions(1); }, [loadTransactions]);

  async function handleAction(id: string, action: "confirm" | "reject") {
    setActionLoading(id + action);
    try {
      const res = await fetch(`/api/admin/transactions/${id}/${action}`, { method: "POST" });
      const data = await res.json();
      if (data.success) loadTransactions(page);
    } finally {
      setActionLoading(null);
    }
  }

  function setFilter(s: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (s === "ALL") params.delete("status");
    else params.set("status", s);
    router.push(`?${params.toString()}`);
  }

  const filters = ["ALL", "PENDING", "CONFIRMED", "FAILED", "EXPIRED"];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 900, color: "#1A1914" }}>Transactions</h1>
        <div style={{ fontSize: ".8rem", color: "#9E9C91", marginTop: 2 }}>{total} transaction{total > 1 ? "s" : ""}</div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 16px", borderRadius: "99px",
              border: `2px solid ${statusFilter === f ? "#C9950A" : "#EEEDE8"}`,
              background: statusFilter === f ? "#FDF6E3" : "white",
              color: statusFilter === f ? "#C9950A" : "#5E5C53",
              fontWeight: statusFilter === f ? 700 : 500,
              cursor: "pointer", fontSize: ".82rem",
              fontFamily: "var(--font-body)",
            }}
          >
            {f === "ALL" ? "Toutes" : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9E9C91" }}>Chargement…</div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#9E9C91" }}>Aucune transaction</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F7F7F5", borderBottom: "1px solid #EEEDE8" }}>
                {["Date", "Candidat", "Montant", "Votes", "Méthode", "Contact", "Statut", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: ".72rem", fontWeight: 700, color: "#9E9C91", letterSpacing: ".05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: "1px solid #F7F7F5" }}>
                  <td style={{ padding: "12px 14px", fontSize: ".78rem", color: "#9E9C91", whiteSpace: "nowrap" }}>
                    {new Date(tx.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: ".84rem", fontWeight: 600, color: "#1A1914" }}>
                      {tx.candidate.name}
                    </div>
                    <div style={{ fontSize: ".7rem", color: "#9E9C91" }}>N°{String(tx.candidate.number).padStart(2, "0")}</div>
                  </td>
                  <td style={{ padding: "12px 14px", fontWeight: 700, fontSize: ".88rem", color: "#1A1914", whiteSpace: "nowrap" }}>
                    {tx.amount.toLocaleString("fr-FR")} {tx.currency}
                  </td>
                  <td style={{ padding: "12px 14px", fontFamily: "var(--font-display)", fontWeight: 900, color: "#C9950A" }}>
                    {tx.voteCount}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {tx.isEuropeWire ? (
                      <span style={{ background: "#EFF6FF", color: "#2563EB", borderRadius: "99px", padding: "3px 9px", fontSize: ".72rem", fontWeight: 700 }}>
                        🇪🇺 Virement
                      </span>
                    ) : (
                      <span style={{ background: "#F0FDF4", color: "#16A34A", borderRadius: "99px", padding: "3px 9px", fontSize: ".72rem", fontWeight: 700 }}>
                        📱 Mobile
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: ".82rem", color: "#5E5C53" }}>
                    {tx.phoneNumber}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{
                      background: STATUS_COLORS[tx.status] + "20",
                      color: STATUS_COLORS[tx.status],
                      borderRadius: "99px",
                      padding: "4px 10px",
                      fontSize: ".72rem",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}>
                      {STATUS_LABELS[tx.status]}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {tx.status === "PENDING" && tx.isEuropeWire && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleAction(tx.id, "confirm")}
                          disabled={actionLoading !== null}
                          style={{
                            background: "#F0FDF4", color: "#16A34A", border: "1.5px solid #86EFAC",
                            borderRadius: "8px", padding: "6px 12px", fontSize: ".75rem",
                            fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)",
                            opacity: actionLoading === tx.id + "confirm" ? .6 : 1,
                          }}
                        >
                          {actionLoading === tx.id + "confirm" ? "…" : "✓ Confirmer"}
                        </button>
                        <button
                          onClick={() => handleAction(tx.id, "reject")}
                          disabled={actionLoading !== null}
                          style={{
                            background: "#FEF2F2", color: "#B91C1C", border: "1.5px solid #FCA5A5",
                            borderRadius: "8px", padding: "6px 12px", fontSize: ".75rem",
                            fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)",
                            opacity: actionLoading === tx.id + "reject" ? .6 : 1,
                          }}
                        >
                          {actionLoading === tx.id + "reject" ? "…" : "✗ Rejeter"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => loadTransactions(i + 1)}
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: page === i + 1 ? "linear-gradient(135deg,#F0C040,#C9950A)" : "white",
                color: page === i + 1 ? "white" : "#5E5C53",
                border: "none", fontWeight: 700, cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,.08)",
                fontFamily: "var(--font-body)",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminTransactionsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: "#9E9C91" }}>Chargement…</div>}>
      <TransactionsInner />
    </Suspense>
  );
}
