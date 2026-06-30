"use client";
// src/components/ui/CurrencyConverter.tsx
import { useState, useEffect } from "react";
import { CURRENCIES, xafToTarget, toXAF, votesFromAmount, formatAmount, isEuropeCurrency, minAmountForVote } from "@/lib/currency";
import { VOTE_PRICE_FCFA } from "@/lib/constants";
import { ChevronDown } from "lucide-react";

interface Props {
  onAmountChange: (amountXAF: number, currency: string, isEurope: boolean) => void;
  initialVotes?: number;
}

function CurrencyRow({ c, active, onClick }: { c: typeof CURRENCIES[0]; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 12,
      padding: "10px 14px", border: "none",
      background: active ? "var(--gold-pale)" : "transparent",
      cursor: "pointer", textAlign: "left", transition: "background .15s",
    }}>
      <span style={{ fontSize: "1.2rem" }}>{c.flag}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: ".85rem", color: active ? "var(--gold-dark)" : "var(--gray-900)" }}>{c.code}</div>
        <div style={{ fontSize: ".72rem", color: "var(--gray-400)" }}>{c.name}</div>
      </div>
      {active && (
        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "white" }} />
        </div>
      )}
    </button>
  );
}

export default function CurrencyConverter({ onAmountChange, initialVotes = 1 }: Props) {
  const [currency, setCurrency] = useState("XAF");
  const [amount, setAmount] = useState<string>(String(initialVotes * VOTE_PRICE_FCFA));
  const [showPicker, setShowPicker] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  // Montants en multiples du prix d'un vote (50 FCFA)
  const xafRaw = toXAF(numAmount, currency);
  const xafAmount = Math.floor(xafRaw / VOTE_PRICE_FCFA) * VOTE_PRICE_FCFA;
  const votes = votesFromAmount(numAmount, currency);
  const isEurope = isEuropeCurrency(currency);
  const curr = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  useEffect(() => {
    onAmountChange(xafAmount, currency, isEurope);
  }, [xafAmount, currency, isEurope]);

  function setCurrencyAndUpdate(code: string) {
    const prevVotes = votes || 1;
    const newAmt = xafToTarget(prevVotes * VOTE_PRICE_FCFA, code);
    const formatted = ["XAF","XOF","GNF"].includes(code) ? String(Math.round(newAmt)) : newAmt.toFixed(2);
    setCurrency(code);
    setAmount(formatted);
    setShowPicker(false);
  }

  return (
    <div style={{ position: "relative" }}>
      <div style={{ border: "2px solid var(--gray-100)", borderRadius: "var(--radius-md)", overflow: "visible", background: "var(--white)" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={(e) => {
              // Snap XAF : multiples de 50, minimum 100 (2 votes)
              if (currency === "XAF") {
                const snapped = Math.round(parseFloat(e.target.value || "0") / VOTE_PRICE_FCFA) * VOTE_PRICE_FCFA;
                const v = Math.max(VOTE_PRICE_FCFA * 2, snapped);
                setAmount(String(v));
              }
            }}
            placeholder={String(VOTE_PRICE_FCFA)}
            style={{
              flex: 1, border: "none", outline: "none",
              padding: "14px 14px", fontSize: "1.2rem", fontWeight: 700,
              fontFamily: "var(--font-body)", color: "var(--gray-900)", background: "transparent", minWidth: 0,
            }}
          />
          <button
            onClick={() => setShowPicker(!showPicker)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "12px 14px", background: "var(--gray-50)",
              border: "none", borderLeft: "1px solid var(--gray-100)",
              cursor: "pointer", flexShrink: 0, color: "var(--gray-900)",
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>{curr.flag}</span>
            <span style={{ fontWeight: 700, fontSize: ".88rem" }}>{currency}</span>
            <ChevronDown size={14} color="var(--gray-400)" />
          </button>
        </div>
        <div style={{
          padding: "8px 14px", background: votes > 0 ? "var(--gold-pale)" : "var(--gray-50)",
          borderTop: "1px solid var(--gray-100)", display: "flex", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: ".78rem", color: "var(--gray-400)" }}>
            {currency !== "XAF" ? `≈ ${formatAmount(xafAmount, "XAF")}` : `1 vote = ${VOTE_PRICE_FCFA} FCFA`}
          </span>
          <span style={{ fontSize: ".82rem", fontWeight: 700, color: votes > 0 ? "var(--gold)" : "var(--gray-400)" }}>
            {votes > 0 ? `= ${votes} vote${votes > 1 ? "s" : ""}` : "0 vote"}
          </span>
        </div>
      </div>

      {showPicker && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: "var(--white)", borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)", border: "1px solid var(--gray-100)", zIndex: 200, overflow: "hidden",
        }}>
          <div style={{ padding: "8px 14px 4px", fontSize: ".68rem", fontWeight: 700, color: "var(--gray-400)", letterSpacing: ".08em", textTransform: "uppercase" }}>
            🌍 Afrique
          </div>
          {CURRENCIES.filter((c) => c.region === "africa").map((c) => (
            <CurrencyRow key={c.code} c={c} active={currency === c.code} onClick={() => setCurrencyAndUpdate(c.code)} />
          ))}
          <div style={{ padding: "8px 14px 4px", fontSize: ".68rem", fontWeight: 700, color: "var(--gray-400)", letterSpacing: ".08em", textTransform: "uppercase", borderTop: "1px solid var(--gray-100)", marginTop: 4 }}>
            🌍 Europe &amp; Monde
          </div>
          {CURRENCIES.filter((c) => c.region !== "africa").map((c) => (
            <CurrencyRow key={c.code} c={c} active={currency === c.code} onClick={() => setCurrencyAndUpdate(c.code)} />
          ))}
        </div>
      )}

      {isEurope && numAmount > 0 && (
        <div style={{
          marginTop: 10, background: "#FFF7ED", border: "1.5px solid #FED7AA",
          borderRadius: "var(--radius-md)", padding: "12px 14px",
        }}>
          <div style={{ fontWeight: 700, fontSize: ".82rem", color: "#C2410C", marginBottom: 4 }}>
            🇪🇺 Paiement depuis l'Europe
          </div>
          <div style={{ fontSize: ".78rem", color: "#9A3412", lineHeight: 1.5 }}>
            Effectuez un dépôt de{" "}
            <strong>{formatAmount(xafAmount, "XAF")}</strong>{" "}
            au <strong>+237 690 768 603</strong> (MTN/Orange Money) puis envoyez le reçu par WhatsApp.
          </div>
        </div>
      )}
    </div>
  );
}
