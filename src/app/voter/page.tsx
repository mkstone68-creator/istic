"use client";
// src/app/voter/page.tsx — Voter flow avec rate limit 2min affiché à l'utilisateur
import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/layout/BottomNav";
import CurrencyConverter from "@/components/ui/CurrencyConverter";
import { ArrowLeft, ExternalLink, Smartphone } from "lucide-react";
import type { Candidate } from "@/types";
import { VOTE_PACKS, VOTE_PRICE_FCFA, EUROPE_WIRE } from "@/lib/constants";
import { formatAmount } from "@/lib/currency";

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

// ── Composant countdown pour le rate limit ───────────────────────────────────
function RateLimitCountdown({ seconds, onExpire }: { seconds: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) { onExpire(); return; }
    timerRef.current = setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [remaining, onExpire]);

  const pct = Math.max(0, (remaining / seconds) * 100);

  return (
    <div style={{
      background: "#FFF7ED", border: "2px solid #FCD34D", borderRadius: 16,
      padding: "20px 24px", textAlign: "center",
    }}>
      <div style={{ fontSize: "2rem", marginBottom: 8 }}>⏳</div>
      <div style={{ fontWeight: 700, fontSize: ".95rem", color: "#92400E", marginBottom: 6 }}>
        Patientez avant de voter à nouveau
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", fontWeight: 900, color: "#C9950A", marginBottom: 12 }}>
        {remaining}s
      </div>
      <div style={{ background: "#FDE68A", borderRadius: 99, height: 6, overflow: "hidden" }}>
        <div style={{
          height: "100%", background: "linear-gradient(90deg,#F0C040,#C9950A)",
          width: pct + "%", transition: "width 1s linear", borderRadius: 99,
        }} />
      </div>
      <div style={{ fontSize: ".75rem", color: "#92400E", marginTop: 10 }}>
        Limite anti-abus : 1 vote toutes les 2 minutes par numéro
      </div>
    </div>
  );
}

function VoterInner() {
  const router = useRouter();
  const params = useSearchParams();
  const candidateId = params.get("id");

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [voteCount, setVoteCount] = useState(1);
  const [useCustom, setUseCustom] = useState(false);
  const [amountXAF, setAmountXAF] = useState(VOTE_PRICE_FCFA);
  const [selectedCurrency, setSelectedCurrency] = useState("XAF");
  const [isEurope, setIsEurope] = useState(false);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"vote" | "processing" | "success" | "error" | "rateLimit">("vote");
  const [paymentData, setPaymentData] = useState<{ transactionId: string; voteCount: number; paymentLink?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);

  useEffect(() => {
    if (!candidateId) return;
    fetch(`/api/candidates/${candidateId}`)
      .then((r) => r.json())
      .then((d) => setCandidate(d.data));
  }, [candidateId]);

  useEffect(() => {
    if (!useCustom) setAmountXAF(voteCount * VOTE_PRICE_FCFA);
  }, [voteCount, useCustom]);

  const handleCurrencyChange = useCallback((xaf: number, currency: string, europe: boolean) => {
    setAmountXAF(xaf);
    setSelectedCurrency(currency);
    setIsEurope(europe);
    if (!useCustom && xaf > 0) {
      setVoteCount(Math.floor(xaf / VOTE_PRICE_FCFA));
    }
  }, [useCustom]);

  const computedVotes = Math.floor(amountXAF / VOTE_PRICE_FCFA);

  function handleEuropeWire() {
    const text = encodeURIComponent(
      `Bonjour, je souhaite voter pour *${candidate?.name}* (${computedVotes} vote${computedVotes > 1 ? "s" : ""}).\n\nMontant : ${formatAmount(amountXAF, "XAF")} FCFA\nDevise payée : ${selectedCurrency}\n\nCi-joint mon reçu de paiement.`
    );
    window.open(`${EUROPE_WIRE.whatsappLink}?text=${text}`, "_blank");
  }

  async function handleAfricaPay() {
    if (!candidateId || !phone) return;
    if (amountXAF < 100) { setErrorMsg("Montant minimum : 100 FCFA"); return; }
    if (!/^(6|2)[0-9]{8}$/.test(phone)) { setErrorMsg("Numéro invalide (ex: 677000000)"); return; }

    setLoading(true);
    setStep("processing");
    setErrorMsg("");

    try {
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          amount: amountXAF,
          phoneNumber: phone,
          paymentMethod: "MOBILE_MONEY",
        }),
      });

      let data: Record<string, unknown> = {};
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        // Server returned HTML (e.g. 502 gateway error) — treat as server error
        setErrorMsg("Le serveur est temporairement indisponible. Réessayez dans quelques instants.");
        setStep("error");
        setLoading(false);
        return;
      }

      if (!data.success) {
        // Vérifier si c'est un rate limit (429)
        if (res.status === 429 && data.retryAfterSeconds) {
          setRateLimitSeconds(data.retryAfterSeconds as number);
          setStep("rateLimit");
          setLoading(false);
          return;
        }
        setErrorMsg((data.error as string) ?? "Erreur de paiement");
        setStep("error");
        setLoading(false);
        return;
      }

      const resData = data.data as { transactionId: string; voteCount: number; paymentLink?: string };
      setPaymentData({
        transactionId: resData.transactionId,
        voteCount: resData.voteCount,
        paymentLink: resData.paymentLink,
      });
      pollStatus(resData.transactionId);
    } catch {
      setErrorMsg("Erreur réseau. Vérifiez votre connexion.");
      setStep("error");
      setLoading(false);
    }
  }

  async function pollStatus(transactionId: string, attempts = 0) {
    if (attempts > 24) {
      setErrorMsg("Délai dépassé. Contactez le support.");
      setStep("error");
      setLoading(false);
      return;
    }
    await new Promise((r) => setTimeout(r, 2500));
    try {
      const res = await fetch(`/api/payment/status/${transactionId}`);
      const data = await res.json();
      if (data.data?.status === "CONFIRMED") { setStep("success"); setLoading(false); return; }
      if (data.data?.status === "FAILED") { setErrorMsg("Paiement refusé."); setStep("error"); setLoading(false); return; }
      pollStatus(transactionId, attempts + 1);
    } catch {
      pollStatus(transactionId, attempts + 1);
    }
  }

  function reset() {
    setStep("vote");
    setVoteCount(1);
    setPhone("");
    setPaymentData(null);
    setErrorMsg("");
    setRateLimitSeconds(0);
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

  // ── RATE LIMIT ────────────────────────────────────────────────────────────
  if (step === "rateLimit") {
    return (
      <div className="shell">
        <div className="page animate-fadeup" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", gap: 20 }}>
          <RateLimitCountdown seconds={rateLimitSeconds} onExpire={reset} />
          <button className="btn btn-outline" onClick={reset} style={{ width: "100%", marginTop: 8 }}>
            Revenir à la page de vote
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── SUCCESS ───────────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="shell">
        <div className="page animate-fadeup" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", gap: 20 }}>
          <div style={{ width: 90, height: 90, background: "linear-gradient(135deg,#F0C040,#C9950A)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", boxShadow: "var(--shadow-gold)" }}>✅</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 900, textAlign: "center" }}>Vote confirmé !</h2>
          <p style={{ color: "var(--gray-600)", textAlign: "center" }}>
            <strong style={{ color: "var(--gold)" }}>{paymentData?.voteCount} vote(s)</strong>{" "}ajouté(s) pour <strong>{candidate?.name}</strong>
          </p>
          <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius-lg)", padding: "16px 20px", width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: ".8rem", color: "var(--gray-400)" }}>Montant débité</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 900, color: "var(--gold)" }}>{formatAmount(amountXAF, "XAF")}</div>
          </div>
          <div style={{ background: "#FFF7ED", border: "1px solid #FCD34D", borderRadius: "var(--radius-md)", padding: "10px 16px", width: "100%", fontSize: ".78rem", color: "#92400E", textAlign: "center" }}>
            ⏳ Vous pouvez voter à nouveau dans 2 minutes
          </div>
          <div style={{ display: "flex", gap: 12, width: "100%" }}>
            <Link href="/classement" className="btn btn-outline" style={{ flex: 1 }}>Classement</Link>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={reset}>Voter encore</button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── PROCESSING ────────────────────────────────────────────────────────────
  if (step === "processing") {
    return (
      <div className="shell">
        <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", gap: 24 }}>
          <div style={{ width: 80, height: 80, background: "linear-gradient(135deg,#F0C040,#C9950A)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-gold)" }}>
            <div className="spinner" />
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", textAlign: "center" }}>Vérification du paiement…</h2>
          {paymentData?.paymentLink && (
            <a href={paymentData.paymentLink} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", background: "var(--gold-pale)", border: "1.5px solid var(--gold)", borderRadius: "var(--radius-xl)", color: "var(--gold-dark)", fontWeight: 700, fontSize: ".88rem", textDecoration: "none" }}>
              <ExternalLink size={16} /> Ouvrir la page de paiement
            </a>
          )}
          <p style={{ color: "var(--gray-400)", fontSize: ".85rem", textAlign: "center" }}>
            Confirmez le paiement sur votre téléphone. Cette page se met à jour automatiquement.
          </p>
        </div>
      </div>
    );
  }

  // ── ERROR ─────────────────────────────────────────────────────────────────
  if (step === "error") {
    return (
      <div className="shell">
        <div className="animate-fadeup" style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", gap: 20 }}>
          <div style={{ fontSize: "3.5rem" }}>❌</div>
          <h2 style={{ fontFamily: "var(--font-display)", textAlign: "center" }}>Paiement échoué</h2>
          <p style={{ color: "var(--gray-600)", textAlign: "center", background: "#FEF2F2", padding: "12px 16px", borderRadius: "var(--radius-md)", fontSize: ".9rem" }}>{errorMsg}</p>
          <button className="btn btn-primary" onClick={reset}>Réessayer</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── MAIN FORM ─────────────────────────────────────────────────────────────
  return (
    <div className="shell">
      <div className="page">
        <div className="page-header">
          <button className="back-btn" onClick={() => router.back()}><ArrowLeft size={18} /></button>
          <h1>Voter</h1>
        </div>

        <div style={{ padding: "20px 20px 0" }}>
          {/* Candidate card */}
          {candidate ? (
            <div className="animate-fadeup" style={{ background: "linear-gradient(135deg,#1C0F0A 0%,#2D1A0E 100%)", borderRadius: "var(--radius-xl)", overflow: "hidden", marginBottom: 24, position: "relative" }}>
              <div style={{ position: "absolute", top: 12, left: 12, background: "linear-gradient(135deg,#F0C040,#C9950A)", color: "white", borderRadius: "99px", padding: "3px 10px", fontSize: ".72rem", fontWeight: 700, zIndex: 2 }}>
                {String(candidate.number).padStart(2, "0")}
              </div>
              <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "6rem", background: "linear-gradient(180deg,rgba(201,149,10,.15) 0%,rgba(201,149,10,.04) 100%)", position: "relative", overflow: "hidden" }}>
                {candidate.photoUrl && !candidate.photoUrl.startsWith("/placeholder")
                  ? <img src={candidate.photoUrl} alt={candidate.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  : "👩"
                }
              </div>
              <div style={{ padding: "14px 18px 16px" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 900, color: "white" }}>{candidate.name}</div>
                <div style={{ fontSize: ".82rem", color: "#C9A882" }}>{candidate.filiere}</div>
              </div>
            </div>
          ) : (
            <div style={{ height: 240, background: "var(--gray-50)", borderRadius: "var(--radius-xl)", marginBottom: 24 }} />
          )}

          {/* Currency converter */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--gray-600)", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>
              Montant &amp; devise
            </div>
            <CurrencyConverter onAmountChange={handleCurrencyChange} initialVotes={1} />
          </div>

          {/* Quick packs */}
          {!isEurope && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--gray-600)", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>
                Packs rapides (FCFA)
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {VOTE_PACKS.map((pack) => (
                  <button
                    key={pack.votes}
                    onClick={() => { setVoteCount(pack.votes); setUseCustom(false); }}
                    style={{
                      padding: "9px 14px", borderRadius: "99px",
                      border: `2px solid ${amountXAF === pack.price ? "var(--gold)" : "var(--gray-100)"}`,
                      background: amountXAF === pack.price ? "var(--gold-pale)" : "var(--white)",
                      cursor: "pointer", fontSize: ".8rem", fontWeight: 700,
                      color: amountXAF === pack.price ? "var(--gold-dark)" : "var(--gray-600)",
                      transition: "all .15s", whiteSpace: "nowrap",
                    }}
                  >
                    {pack.label}
                    {pack.discount > 0 && <span style={{ marginLeft: 4, fontSize: ".65rem", color: "#166534" }}>-{pack.discount}%</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AFRICA payment */}
          {!isEurope ? (
            <>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--gray-600)", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>
                  Méthode de paiement
                </div>
                <div style={{ padding: "14px 16px", border: "2px solid var(--gold)", borderRadius: "var(--radius-md)", background: "var(--gold-pale)", display: "flex", alignItems: "center", gap: 12 }}>
                  <Smartphone size={20} color="var(--gold)" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: ".9rem" }}>Fapshi</div>
                    <div style={{ fontSize: ".75rem", color: "var(--gray-400)" }}>MTN, Orange, Moov…</div>
                  </div>
                  <div style={{ marginLeft: "auto", width: 18, height: 18, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "white" }} />
                  </div>
                </div>
              </div>

              {/* Résumé votes calculés */}
              <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: ".84rem", color: "var(--gray-600)" }}>Votes obtenus</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 900, color: "var(--gold)" }}>
                  {computedVotes} vote{computedVotes > 1 ? "s" : ""}
                </span>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: ".82rem", fontWeight: 600, color: "var(--gray-600)", marginBottom: 8, display: "block" }}>
                  Numéro Fapshi
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontWeight: 700, color: "var(--gray-600)", fontSize: ".9rem" }}>+237</span>
                  <input
                    className="input-gold"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="677 000 000"
                    style={{ paddingLeft: 60 }}
                  />
                </div>
                {errorMsg && <p style={{ color: "#B91C1C", fontSize: ".8rem", marginTop: 6 }}>{errorMsg}</p>}
              </div>

              <button
                className="btn btn-primary"
                onClick={handleAfricaPay}
                disabled={loading || !phone || amountXAF < 100 || computedVotes < 1}
                style={{ fontSize: "1rem", marginBottom: 8 }}
              >
                {loading ? <><div className="spinner" /> Traitement…</> : <>Valider et payer · {formatAmount(amountXAF, "XAF")}</>}
              </button>
              <p style={{ textAlign: "center", fontSize: ".75rem", color: "var(--gray-400)", marginBottom: 8 }}>🔒 Paiement sécurisé via Fapshi</p>
              <p style={{ textAlign: "center", fontSize: ".72rem", color: "var(--gray-400)", marginBottom: 24 }}>⏳ Limite : 1 vote toutes les 2 minutes par numéro</p>
            </>
          ) : (
            /* EUROPE wire transfer */
            <>
              <div style={{ background: "#FFF7ED", border: "2px solid #FED7AA", borderRadius: "var(--radius-lg)", padding: "18px 18px", marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: ".9rem", color: "#C2410C", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  🇪🇺 Instructions de paiement Europe
                </div>
                {EUROPE_WIRE.instructions.map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#C2410C", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".7rem", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                    <div style={{ fontSize: ".82rem", color: "#9A3412", lineHeight: 1.5 }}>{step}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius-lg)", padding: "14px 16px", marginBottom: 20 }}>
                <div style={{ fontSize: ".78rem", color: "var(--gray-400)", marginBottom: 4 }}>Résumé de votre vote</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: ".88rem", color: "var(--gray-600)" }}>Candidat</span>
                  <span style={{ fontWeight: 700, fontSize: ".88rem" }}>{candidate?.name}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: ".88rem", color: "var(--gray-600)" }}>Votes</span>
                  <span style={{ fontWeight: 700, fontSize: ".88rem", color: "var(--gold)" }}>{computedVotes} vote{computedVotes > 1 ? "s" : ""}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: ".88rem", color: "var(--gray-600)" }}>Montant FCFA</span>
                  <span style={{ fontWeight: 700, fontSize: ".88rem" }}>{formatAmount(amountXAF, "XAF")}</span>
                </div>
              </div>

              <a
                href={EUROPE_WIRE.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleEuropeWire}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  padding: "16px", borderRadius: "var(--radius-xl)",
                  background: "#25D366", color: "white", textDecoration: "none",
                  fontWeight: 700, fontSize: "1rem",
                  boxShadow: "0 4px 20px rgba(37,211,102,.35)", marginBottom: 8,
                }}
              >
                <WhatsAppIcon size={22} />
                Envoyer le reçu par WhatsApp
              </a>
              <p style={{ textAlign: "center", fontSize: ".75rem", color: "var(--gray-400)", marginBottom: 24, lineHeight: 1.6 }}>
                Vos votes seront crédités dans les 24h après vérification du paiement.
              </p>
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
