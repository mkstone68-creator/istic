"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, AlertTriangle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) { router.push("/admin"); router.refresh(); }
      else { setError(data.error ?? "Erreur de connexion"); setLoading(false); }
    } catch {
      setError("Erreur réseau");
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100dvh", background: "linear-gradient(135deg, #1C0F0A 0%, #2D1A0E 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "var(--font-body)" }}>
      <div style={{ background: "white", borderRadius: "24px", padding: "40px 36px", width: "100%", maxWidth: 380, boxShadow: "0 24px 80px rgba(0,0,0,.4)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, background: "linear-gradient(135deg,#1C0F0A,#2D1A0E)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Lock size={26} color="#F0C040" />
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 900, color: "#1A1914", marginBottom: 4 }}>Administration</div>
          <div style={{ fontSize: ".8rem", color: "#9E9C91" }}>Reine du Meta By Helen</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: ".82rem", fontWeight: 600, color: "#5E5C53", marginBottom: 8 }}>Mot de passe admin</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoFocus
              style={{ width: "100%", border: `2px solid ${error ? "#FCA5A5" : "#EEEDE8"}`, borderRadius: "14px", padding: "14px 16px", fontFamily: "var(--font-body)", fontSize: "1rem", fontWeight: 600, color: "#1A1914", background: "white", outline: "none", transition: "border-color .2s" }}
              onFocus={e => { e.target.style.borderColor = "#C9950A"; }}
              onBlur={e => { e.target.style.borderColor = error ? "#FCA5A5" : "#EEEDE8"; }}
            />
            {error && (
              <div style={{ color: "#B91C1C", fontSize: ".8rem", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                <AlertTriangle size={13} /> {error}
              </div>
            )}
          </div>
          <button type="submit" disabled={loading || !password} style={{ width: "100%", background: loading ? "#9E9C91" : "linear-gradient(135deg, #F0C040, #C9950A)", color: "white", border: "none", borderRadius: "99px", padding: "15px", fontSize: ".95rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", boxShadow: loading ? "none" : "0 4px 24px rgba(201,149,10,.3)", transition: "all .2s" }}>
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
