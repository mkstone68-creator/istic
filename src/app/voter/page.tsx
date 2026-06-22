"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/layout/BottomNav";
import { ArrowLeft, CheckCircle2, XCircle, User, Heart } from "lucide-react";
import type { Candidate } from "@/types";

const VOTED_KEY = "mr_voted_date";
const todayStr = () => new Date().toISOString().slice(0, 10);

function VoterInner() {
  const router = useRouter();
  const params = useSearchParams();
  const candidateId = params.get("id");

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"vote" | "success" | "error" | "already">("vote");
  const [votingStatus, setVotingStatus] = useState<{ active: boolean; message?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/voting-status")
      .then(r => r.json())
      .then(d => setVotingStatus(d))
      .catch(() => setVotingStatus({ active: true }));
  }, []);

  // Limite : un vote par personne et par jour.
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(VOTED_KEY) === todayStr()) {
      setStep("already");
    }
  }, []);

  useEffect(() => {
    if (!candidateId) return;
    fetch(`/api/candidates/${candidateId}`)
      .then(r => r.json())
      .then(d => setCandidate(d.data));
  }, [candidateId]);

  async function handleVote() {
    if (!candidateId || loading) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId }),
      });
      const data = await res.json().catch(() => ({ success: false }));
      if (!res.ok || !data.success) {
        if (data.alreadyVoted) {
          if (typeof window !== "undefined") localStorage.setItem(VOTED_KEY, todayStr());
          setStep("already");
          setLoading(false);
          return;
        }
        setErrorMsg((data.error as string) ?? "Impossible d'enregistrer le vote.");
        setStep("error");
        setLoading(false);
        return;
      }
      if (data.data?.voteCount != null) {
        setCandidate(prev => (prev ? { ...prev, voteCount: data.data.voteCount } : prev));
      }
      if (typeof window !== "undefined") localStorage.setItem(VOTED_KEY, todayStr());
      setStep("success");
      setLoading(false);
    } catch {
      setErrorMsg("Erreur réseau. Vérifiez votre connexion.");
      setStep("error");
      setLoading(false);
    }
  }

  function reset() {
    setStep("vote");
    setErrorMsg("");
  }

  if (!candidateId) {
    return (
      <div className="shell">
        <div className="page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "40px 24px" }}>
          <div style={{ fontSize: "3.5rem" }}>🗳️</div>
          <h2 style={{ fontFamily: "var(--font-display)", textAlign: "center" }}>Choisissez un candidat</h2>
          <Link href="/candidats" className="btn btn-primary" style={{ width: "auto", padding: "14px 32px" }}>Voir les candidats</Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="shell">
        <div className="page animate-fadeup" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", gap: 20 }}>
          <div style={{ width: 90, height: 90, background: "linear-gradient(135deg,#F0C040,#C9950A)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-gold)" }}><CheckCircle2 size={44} color="white" /></div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 900, textAlign: "center" }}>Vote confirmé !</h2>
          <p style={{ color: "var(--gray-600)", textAlign: "center" }}>
            Merci d&apos;avoir voté pour <strong>{candidate?.name}</strong>.
          </p>
          <div style={{ display: "flex", gap: 12, width: "100%" }}>
            <Link href="/classement" className="btn btn-outline" style={{ flex: 1 }}>Classement</Link>
            <Link href="/candidats" className="btn btn-primary" style={{ flex: 1 }}>Autres candidats</Link>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (step === "already") {
    return (
      <div className="shell">
        <div className="page animate-fadeup" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", gap: 20 }}>
          <div style={{ width: 90, height: 90, background: "#FEF3C7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><CheckCircle2 size={44} color="#C9950A" /></div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 900, textAlign: "center" }}>Vous avez déjà voté</h2>
          <p style={{ color: "var(--gray-600)", textAlign: "center" }}>
            Vous ne pouvez voter qu&apos;une seule fois par jour. Revenez demain pour voter à nouveau !
          </p>
          <div style={{ display: "flex", gap: 12, width: "100%" }}>
            <Link href="/classement" className="btn btn-outline" style={{ flex: 1 }}>Classement</Link>
            <Link href="/candidats" className="btn btn-primary" style={{ flex: 1 }}>Candidats</Link>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="shell">
        <div className="animate-fadeup" style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", gap: 20 }}>
          <div style={{ width: 64, height: 64, background: "#FEF2F2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><XCircle size={36} color="#EF4444" /></div>
          <h2 style={{ fontFamily: "var(--font-display)", textAlign: "center" }}>Vote impossible</h2>
          <p style={{ color: "var(--gray-600)", textAlign: "center", background: "#FEF2F2", padding: "12px 16px", borderRadius: "var(--radius-md)", fontSize: ".9rem" }}>{errorMsg}</p>
          <button className="btn btn-primary" onClick={reset}>Réessayer</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="shell">
      <div className="page">
        <div className="page-header">
          <button className="back-btn" onClick={() => router.back()}><ArrowLeft size={18} /></button>
          <h1>Voter</h1>
        </div>

        <div style={{ padding: "20px 20px 0" }}>
          {candidate ? (
            <div className="animate-fadeup" style={{ background: "linear-gradient(135deg,#1C0F0A 0%,#2D1A0E 100%)", borderRadius: "var(--radius-xl)", overflow: "hidden", marginBottom: 24, position: "relative" }}>
              <div style={{ position: "absolute", top: 12, left: 12, background: "linear-gradient(135deg,#F0C040,#C9950A)", color: "white", borderRadius: "99px", padding: "3px 10px", fontSize: ".72rem", fontWeight: 700, zIndex: 2 }}>
                {String(candidate.number).padStart(2, "0")}
              </div>
              <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "6rem", position: "relative", overflow: "hidden" }}>
                {candidate.photoUrl && !candidate.photoUrl.startsWith("/placeholder")
                  ? <img src={candidate.photoUrl} alt={candidate.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  : <User size={48} color="rgba(201,168,130,.4)" />}
              </div>
              <div style={{ padding: "14px 18px 16px" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 900, color: "white" }}>{candidate.name}</div>
                <div style={{ fontSize: ".82rem", color: "#C9A882" }}>{candidate.filiere}</div>
                <div style={{ fontSize: ".78rem", color: "rgba(201,168,130,.6)", marginTop: 4 }}>
                  {candidate.voteCount.toLocaleString("fr-FR")} vote{candidate.voteCount > 1 ? "s" : ""}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ height: 320, background: "var(--gray-50)", borderRadius: "var(--radius-xl)", marginBottom: 24 }} />
          )}

          {votingStatus && !votingStatus.active ? (
            <div style={{ background: "#FEF2F2", border: "1.5px solid #FCA5A5", borderRadius: "var(--radius-lg)", padding: "18px 20px", marginBottom: 24, display: "flex", alignItems: "flex-start", gap: 12 }}>
              <XCircle size={22} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: ".9rem", color: "#B91C1C", marginBottom: 4 }}>Vote indisponible</div>
                <div style={{ fontSize: ".84rem", color: "#7F1D1D" }}>{votingStatus.message}</div>
              </div>
            </div>
          ) : (
            <>
              <p style={{ textAlign: "center", color: "var(--gray-600)", fontSize: ".92rem", marginBottom: 16 }}>
                Cliquez sur le bouton pour valider votre vote.
              </p>
              <button className="btn btn-primary" onClick={handleVote}
                disabled={loading || !candidate}
                style={{ fontSize: "1.05rem", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                {loading ? <><div className="spinner" /> Enregistrement…</> : <><Heart size={20} fill="white" /> Voter</>}
              </button>
            </>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

export default function VoterPage() {
  return (
    <Suspense fallback={<div className="shell" style={{ minHeight: "100dvh" }} />}>
      <VoterInner />
    </Suspense>
  );
}
