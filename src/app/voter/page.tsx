"use client";
import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/layout/BottomNav";
import CurrencyConverter from "@/components/ui/CurrencyConverter";
import { ArrowLeft, ExternalLink, Smartphone, CheckCircle2, XCircle, Clock, User, Lock, Copy, Check, Upload } from "lucide-react";
import type { Candidate } from "@/types";
import { VOTE_PACKS, VOTE_PRICE_FCFA } from "@/lib/constants";
import { formatAmount } from "@/lib/currency";

const WIRE_NUMBER = "+237690768603";
const WIRE_NAME   = "Messina bengono";
const SUPPORT_WA  = "237694600007";

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function EuropePaySection({
  candidateName, computedVotes, amountXAF,
}: { candidateName: string; computedVotes: number; amountXAF: number }) {
  const [copiedNum, setCopiedNum] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function copyNumber() {
    await navigator.clipboard.writeText(WIRE_NUMBER);
    setCopiedNum(true);
    setTimeout(() => setCopiedNum(false), 2000);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onloadend = () => setScreenshot(reader.result as string);
    reader.readAsDataURL(f);
  }

  function handlePaid() {
    const msg = [
      `Bonjour, je souhaite voter pour *${candidateName || "..."}*.`,
      ``,
      `Votes souhaités : *${computedVotes} vote${computedVotes > 1 ? "s" : ""}*`,
      `Montant payé : *${amountXAF.toLocaleString("fr-FR")} FCFA*`,
      `Destinataire : ${WIRE_NAME} (${WIRE_NUMBER})`,
      ``,
      `Veuillez trouver ci-joint le reçu de paiement.`,
      `Merci de créditer les votes après vérification.`,
    ].join("\n");
    window.open(`https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <div>
      {/* Bénéficiaire */}
      <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1.5px solid var(--gray-100)", marginBottom: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,.06)" }}>
        <div style={{ background: "var(--gray-50)", padding: "10px 16px", borderBottom: "1px solid var(--gray-100)" }}>
          <div style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--gray-400)" }}>Destinataire du virement</div>
        </div>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--gray-900)", marginBottom: 6 }}>{WIRE_NAME}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "1rem", color: "var(--gray-900)", letterSpacing: ".04em" }}>{WIRE_NUMBER}</span>
            <button onClick={copyNumber}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, background: copiedNum ? "#F0FDF4" : "var(--gray-50)", border: `1px solid ${copiedNum ? "#86EFAC" : "var(--gray-200)"}`, borderRadius: 8, padding: "5px 12px", fontSize: ".78rem", fontWeight: 600, cursor: "pointer", color: copiedNum ? "#16A34A" : "var(--gray-600)", fontFamily: "var(--font-body)", transition: "all .2s" }}>
              {copiedNum ? <><Check size={12} /> Copié</> : <><Copy size={12} /> Copier</>}
            </button>
          </div>
          <div style={{ fontSize: ".72rem", color: "var(--gray-400)", marginTop: 6 }}>MTN · Orange Money · Virement bancaire</div>
        </div>
      </div>

      {/* Montant à payer */}
      <div style={{ background: "linear-gradient(135deg,#FDF6E3,#FEF3C7)", border: "1.5px solid rgba(201,149,10,.2)", borderRadius: "var(--radius-md)", padding: "14px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#92400E", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 3 }}>Montant à envoyer</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 900, color: "var(--gold-dark)" }}>
            {amountXAF.toLocaleString("fr-FR")} FCFA
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#92400E", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 3 }}>Votes</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 900, color: "var(--gold-dark)" }}>{computedVotes}</div>
        </div>
      </div>

      {/* Upload capture */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: ".78rem", fontWeight: 600, color: "var(--gray-600)", marginBottom: 8 }}>
          Capture du reçu de paiement
          <span style={{ fontWeight: 400, color: "var(--gray-400)", marginLeft: 4 }}>(optionnel, à joindre sur WhatsApp)</span>
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        {screenshot ? (
          <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "2px solid var(--gray-200)" }}>
            <img src={screenshot} alt="Reçu" style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }} />
            <button onClick={() => setScreenshot(null)}
              style={{ position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,.5)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
              <XCircle size={16} />
            </button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()}
            style={{ width: "100%", padding: "20px", border: "2px dashed var(--gray-200)", borderRadius: 12, background: "var(--gray-50)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--gray-400)", fontSize: ".88rem", fontFamily: "var(--font-body)" }}>
            <Upload size={18} /> Sélectionner une image
          </button>
        )}
      </div>

      {/* Instructions */}
      <div style={{ background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: 20, fontSize: ".78rem", color: "#0C4A6E", lineHeight: 1.7 }}>
        <strong>Instructions :</strong> Effectuez le virement au numéro ci-dessus, puis cliquez sur «&nbsp;J&apos;ai payé&nbsp;» pour envoyer votre confirmation par WhatsApp. Joignez la capture dans le message WhatsApp. Les votes seront crédités après vérification.
      </div>

      {/* CTA */}
      <button onClick={handlePaid}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "16px", borderRadius: "var(--radius-xl)", background: "#25D366", color: "white", fontWeight: 700, fontSize: "1rem", border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(37,211,102,.35)", marginBottom: 8, fontFamily: "var(--font-body)" }}>
        <WhatsAppIcon size={22} /> J&apos;ai payé — Envoyer la confirmation
      </button>
      <p style={{ textAlign: "center", fontSize: ".72rem", color: "var(--gray-400)", marginBottom: 24 }}>
        Vous serez redirigé vers WhatsApp avec le message pré-rempli
      </p>
    </div>
  );
}

function VoterInner() {
  const router = useRouter();
  const params = useSearchParams();
  const candidateId = params.get("id");
  const txFromUrl   = params.get("tx");
  const statusFromUrl = params.get("status");

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [voteCount, setVoteCount] = useState(2);
  const [useCustom, setUseCustom] = useState(false);
  const [amountXAF, setAmountXAF] = useState(VOTE_PRICE_FCFA * 2);
  const [selectedCurrency, setSelectedCurrency] = useState("XAF");
  const [isEurope, setIsEurope] = useState(false);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"vote" | "processing" | "success" | "error" | "rateLimit">("vote");
  const [votingStatus, setVotingStatus] = useState<{ active: boolean; message?: string } | null>(null);
  const [paymentData, setPaymentData] = useState<{ transactionId: string; voteCount: number; paymentLink?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);

  const pollingRef = useRef(false);

  useEffect(() => {
    fetch("/api/voting-status")
      .then(r => r.json())
      .then(d => setVotingStatus(d))
      .catch(() => setVotingStatus({ active: true }));
  }, []);

  useEffect(() => {
    if (!candidateId) return;
    fetch(`/api/candidates/${candidateId}`)
      .then(r => r.json())
      .then(d => setCandidate(d.data));
  }, [candidateId]);

  // ── Retour depuis Fapshi : reprendre le polling immédiatement ──────────────
  useEffect(() => {
    if (txFromUrl && statusFromUrl === "success" && !pollingRef.current) {
      setStep("processing");
      setPaymentData({ transactionId: txFromUrl, voteCount: 0 });
      pollStatus(txFromUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txFromUrl, statusFromUrl]);

  useEffect(() => {
    if (!useCustom) setAmountXAF(voteCount * VOTE_PRICE_FCFA);
  }, [voteCount, useCustom]);

  const handleCurrencyChange = useCallback((xaf: number, currency: string, europe: boolean) => {
    setAmountXAF(xaf);
    setSelectedCurrency(currency);
    setIsEurope(europe);
    if (!useCustom && xaf > 0) setVoteCount(Math.floor(xaf / VOTE_PRICE_FCFA));
  }, [useCustom]);

  const computedVotes = Math.floor(amountXAF / VOTE_PRICE_FCFA);

  async function handleAfricaPay() {
    if (!candidateId || !phone) return;
    if (amountXAF < 100 || computedVotes < 2) { setErrorMsg("Minimum 2 votes (100 FCFA)"); return; }
    if (!/^(6|2)[0-9]{8}$/.test(phone)) { setErrorMsg("Numéro invalide (ex: 677000000)"); return; }

    setLoading(true);
    setStep("processing");
    setErrorMsg("");

    try {
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, amount: amountXAF, phoneNumber: phone, paymentMethod: "MOBILE_MONEY" }),
      });

      const data = await res.json().catch(() => ({ success: false, error: "Réponse invalide" }));

      if (!res.ok || !data.success) {
        if (res.status === 429 && data.retryAfterSeconds) {
          setRateLimitSeconds(data.retryAfterSeconds as number);
          setStep("rateLimit");
        } else {
          setErrorMsg((data.error as string) ?? "Erreur de paiement");
          setStep("error");
        }
        setLoading(false);
        return;
      }

      const txId       = (data.data?.transactionId ?? data.transactionId) as string;
      const nVotes     = (data.data?.voteCount ?? data.votes ?? computedVotes) as number;
      const paymentLink = (data.data?.paymentLink ?? data.paymentUrl) as string | undefined;

      setPaymentData({ transactionId: txId, voteCount: nVotes, paymentLink });
      pollStatus(txId);
    } catch {
      setErrorMsg("Erreur réseau. Vérifiez votre connexion.");
      setStep("error");
      setLoading(false);
    }
  }

  async function pollStatus(transactionId: string, attempts = 0) {
    pollingRef.current = true;
    if (attempts > 40) {
      setErrorMsg("Délai dépassé. Vérifiez votre paiement et contactez le support.");
      setStep("error");
      setLoading(false);
      pollingRef.current = false;
      return;
    }
    await new Promise(r => setTimeout(r, 3000));
    try {
      const res  = await fetch(`/api/payment/status/${transactionId}`);
      const data = await res.json().catch(() => ({}));
      const status = data.data?.status as string | undefined;

      if (status === "CONFIRMED") {
        setPaymentData(prev => ({ ...prev!, voteCount: data.data?.voteCount ?? prev?.voteCount ?? 0 }));
        setStep("success");
        setLoading(false);
        pollingRef.current = false;
        return;
      }
      if (status === "FAILED" || status === "EXPIRED") {
        setErrorMsg("Paiement refusé ou expiré.");
        setStep("error");
        setLoading(false);
        pollingRef.current = false;
        return;
      }
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
    pollingRef.current = false;
    if (candidateId) router.replace(`/voter?id=${candidateId}`);
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

  if (step === "rateLimit") {
    return (
      <div className="shell">
        <div className="page animate-fadeup" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", gap: 20 }}>
          <div style={{ width: 64, height: 64, background: "#FEF3C7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><Clock size={30} color="#F59E0B" /></div>
          <h2 style={{ fontFamily: "var(--font-display)", textAlign: "center" }}>Patientez {rateLimitSeconds}s</h2>
          <button className="btn btn-outline" onClick={reset} style={{ width: "100%" }}>Revenir</button>
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
            <strong style={{ color: "var(--gold)" }}>{paymentData?.voteCount ?? computedVotes} vote(s)</strong>{" "}ajouté(s) pour <strong>{candidate?.name}</strong>
          </p>
          <div style={{ display: "flex", gap: 12, width: "100%" }}>
            <Link href="/classement" className="btn btn-outline" style={{ flex: 1 }}>Classement</Link>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={reset}>Voter encore</button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

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
            Confirmez le paiement sur votre téléphone.<br/>Cette page se met à jour automatiquement.
          </p>
        </div>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="shell">
        <div className="animate-fadeup" style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", gap: 20 }}>
          <div style={{ width: 64, height: 64, background: "#FEF2F2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><XCircle size={36} color="#EF4444" /></div>
          <h2 style={{ fontFamily: "var(--font-display)", textAlign: "center" }}>Paiement échoué</h2>
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
              <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "6rem", position: "relative", overflow: "hidden" }}>
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
            <div style={{ height: 240, background: "var(--gray-50)", borderRadius: "var(--radius-xl)", marginBottom: 24 }} />
          )}

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--gray-600)", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>Montant &amp; devise</div>
            <CurrencyConverter onAmountChange={handleCurrencyChange} initialVotes={2} />
          </div>

          {!isEurope && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--gray-600)", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>Packs rapides (FCFA)</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {VOTE_PACKS.map(pack => (
                  <button key={pack.votes}
                    onClick={() => { setVoteCount(pack.votes); setUseCustom(false); }}
                    style={{ padding: "9px 14px", borderRadius: "99px", border: `2px solid ${amountXAF === pack.price ? "var(--gold)" : "var(--gray-100)"}`, background: amountXAF === pack.price ? "var(--gold-pale)" : "var(--white)", cursor: "pointer", fontSize: ".8rem", fontWeight: 700, color: amountXAF === pack.price ? "var(--gold-dark)" : "var(--gray-600)", transition: "all .15s", whiteSpace: "nowrap" }}>
                    {pack.label}
                    {pack.discount > 0 && <span style={{ marginLeft: 4, fontSize: ".65rem", color: "#166534" }}>-{pack.discount}%</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isEurope ? (
            <>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--gray-600)", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>Méthode de paiement</div>
                <div style={{ padding: "14px 16px", border: "2px solid var(--gold)", borderRadius: "var(--radius-md)", background: "var(--gold-pale)", display: "flex", alignItems: "center", gap: 12 }}>
                  <Smartphone size={20} color="var(--gold)" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: ".9rem" }}>Fapshi</div>
                    <div style={{ fontSize: ".75rem", color: "var(--gray-400)" }}>MTN, Orange, Moov…</div>
                  </div>
                </div>
              </div>

              <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: ".84rem", color: "var(--gray-600)" }}>Votes obtenus</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 900, color: "var(--gold)" }}>
                  {computedVotes} vote{computedVotes > 1 ? "s" : ""}
                </span>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: ".82rem", fontWeight: 600, color: "var(--gray-600)", marginBottom: 8, display: "block" }}>Numéro de paiement</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontWeight: 700, color: "var(--gray-600)", fontSize: ".9rem" }}>+237</span>
                  <input className="input-gold" type="tel" value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="677 000 000" style={{ paddingLeft: 60 }} />
                </div>
                {errorMsg && <p style={{ color: "#B91C1C", fontSize: ".8rem", marginTop: 6 }}>{errorMsg}</p>}
              </div>

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
                  <button className="btn btn-primary" onClick={handleAfricaPay}
                    disabled={loading || !phone || amountXAF < 100 || computedVotes < 2}
                    style={{ fontSize: "1rem", marginBottom: 8 }}>
                    {loading ? <><div className="spinner" /> Traitement…</> : <>Valider et payer · {formatAmount(amountXAF, "XAF")}</>}
                  </button>
                  <p style={{ textAlign: "center", fontSize: ".75rem", color: "var(--gray-400)", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <Lock size={11} /> Paiement sécurisé via Fapshi
                  </p>
                </>
              )}
            </>
          ) : (
            <EuropePaySection
              candidateName={candidate?.name ?? ""}
              computedVotes={computedVotes}
              amountXAF={amountXAF}
            />
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
