"use client";
import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/layout/BottomNav";
import {
  CreditCard, Smartphone, CheckCircle2, ArrowRight,
  Globe, Phone, ExternalLink, Copy, Check, Users,
} from "lucide-react";

const DEV_PHONE     = "+237694600007";
const DEV_WA        = "https://wa.me/237694600007";
const DEV_PORTFOLIO = "https://xhrisfolio.vercel.app/";

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function CopyBtn({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  }
  return (
    <button onClick={copy} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: done ? "#F0FDF4" : "var(--gray-50)", border: `1px solid ${done ? "#86EFAC" : "var(--gray-200)"}`, borderRadius: 8, padding: "5px 12px", fontSize: ".78rem", fontWeight: 600, cursor: "pointer", color: done ? "#16A34A" : "var(--gray-600)", fontFamily: "var(--font-body)", transition: "all .2s" }}>
      {done ? <><Check size={12} /> Copié</> : <><Copy size={12} /> {label}</>}
    </button>
  );
}

const STEPS = [
  { Icon: Users,        title: "Choisissez un candidat",               desc: "Parcourez la liste et cliquez sur le candidat que vous souhaitez soutenir." },
  { Icon: CreditCard,   title: "Sélectionnez un montant",              desc: "50 FCFA = 1 vote — minimum 2 votes (100 FCFA). Packs rapides ou montant libre." },
  { Icon: Smartphone,   title: "Mobile Money (Cameroun)",              desc: "Entrez votre numéro Fapshi (MTN ou Orange Money) et confirmez sur votre téléphone." },
  { Icon: Globe,        title: "Virement (hors Cameroun)",             desc: "Transférez vers Messina bengono (+237690768603) puis envoyez le reçu via WhatsApp." },
  { Icon: CheckCircle2, title: "Votes crédités",                       desc: "Mobile Money : instantané. Virement : sous 24h après vérification manuelle." },
];

const FAQ = [
  { q: "Mes votes sont-ils sécurisés ?",        a: "Oui. Chaque paiement est vérifié directement auprès de Fapshi avant tout crédit de votes. Les paiements hors Cameroun sont validés manuellement." },
  { q: "Puis-je voter plusieurs fois ?",         a: "Oui, il n'y a pas de limite. Chaque paiement réussi crédite le nombre de votes correspondant au montant." },
  { q: "Mon vote peut-il être annulé ?",         a: "Non. Les votes crédités sont définitifs et visibles en temps réel dans le classement." },
  { q: "Que faire si mon paiement est bloqué ?", a: "Contactez le support par WhatsApp (+237694600007) avec votre numéro de transaction ou votre reçu." },
];

export default function SupportPage() {
  return (
    <div className="shell">
      <div className="page" style={{ paddingBottom: 100 }}>

        <header style={{ padding: "28px 20px 0", marginBottom: 28 }}>
          <div style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>Aide &amp; Support</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 900, color: "var(--gray-900)", lineHeight: 1.1, marginBottom: 8 }}>Comment voter</h1>
          <p style={{ color: "var(--gray-500)", fontSize: ".9rem", lineHeight: 1.6 }}>
            Tout ce que vous devez savoir pour soutenir votre candidat.
          </p>
        </header>

        <div style={{ padding: "0 20px" }}>

          {/* Étapes */}
          <section style={{ marginBottom: 32 }}>
            <div style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--gray-400)", marginBottom: 14 }}>Processus étape par étape</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {STEPS.map(({ Icon, title, desc }, i) => (
                <div key={i} style={{ display: "flex", gap: 14, padding: "16px 18px", background: "white", borderRadius: i === 0 ? "14px 14px 3px 3px" : i === STEPS.length - 1 ? "3px 3px 14px 14px" : "3px", boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#1C0F0A,#2D1A0E)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={16} color="#F0C040" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: ".88rem", color: "var(--gray-900)", marginBottom: 3 }}>
                      <span style={{ color: "var(--gold)", marginRight: 6, fontFamily: "var(--font-display)" }}>{i + 1}.</span>{title}
                    </div>
                    <div style={{ fontSize: ".8rem", color: "var(--gray-500)", lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tarif CTA */}
          <section style={{ marginBottom: 32 }}>
            <div style={{ background: "linear-gradient(135deg,#1C0F0A,#2D1A0E)", borderRadius: 16, padding: "20px 22px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#F0C040,#C9950A)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <CreditCard size={22} color="white" />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 900, color: "#F0C040" }}>50 FCFA = 1 vote</div>
                <div style={{ fontSize: ".75rem", color: "rgba(201,168,130,.6)", marginTop: 2 }}>Minimum 2 votes · Mobile Money · Virement international</div>
              </div>
              <Link href="/candidats" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#F0C040,#C9950A)", color: "white", textDecoration: "none", borderRadius: 99, padding: "10px 18px", fontWeight: 700, fontSize: ".82rem", whiteSpace: "nowrap", flexShrink: 0 }}>
                Voter <ArrowRight size={14} />
              </Link>
            </div>
          </section>

          {/* Contact développeur */}
          <section style={{ marginBottom: 32 }}>
            <div style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--gray-400)", marginBottom: 14 }}>Contact développeur</div>
            <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,.06)" }}>
              {/* Tel */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderBottom: "1px solid var(--gray-100)" }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--gray-50)", border: "1.5px solid var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Phone size={17} color="var(--gray-600)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: ".7rem", color: "var(--gray-400)", fontWeight: 600, marginBottom: 1 }}>WhatsApp / Téléphone</div>
                  <div style={{ fontWeight: 700, fontSize: ".9rem", color: "var(--gray-900)", fontFamily: "monospace" }}>{DEV_PHONE}</div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <CopyBtn text={DEV_PHONE} label="Copier" />
                  <a href={DEV_WA} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#25D366", borderRadius: 8, padding: "5px 12px", fontSize: ".78rem", fontWeight: 600, color: "white", textDecoration: "none" }}>
                    <WhatsAppIcon size={12} /> Chat
                  </a>
                </div>
              </div>
              {/* Portfolio */}
              <a href={DEV_PORTFOLIO} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", textDecoration: "none" }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#1C0F0A,#2D1A0E)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Globe size={17} color="#F0C040" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: ".7rem", color: "var(--gray-400)", fontWeight: 600, marginBottom: 1 }}>Portfolio</div>
                  <div style={{ fontWeight: 700, fontSize: ".88rem", color: "var(--gray-900)" }}>xhrisfolio.vercel.app</div>
                </div>
                <ExternalLink size={16} color="var(--gray-400)" />
              </a>
            </div>
          </section>

          {/* FAQ */}
          <section style={{ marginBottom: 8 }}>
            <div style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--gray-400)", marginBottom: 14 }}>Questions fréquentes</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {FAQ.map(({ q, a }, i) => (
                <details key={i} style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
                  <summary style={{ padding: "14px 18px", fontWeight: 600, fontSize: ".88rem", color: "var(--gray-900)", cursor: "pointer", listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <span>{q}</span>
                    <ArrowRight size={14} color="var(--gray-400)" style={{ flexShrink: 0 }} />
                  </summary>
                  <div style={{ padding: "0 18px 14px", fontSize: ".82rem", color: "var(--gray-500)", lineHeight: 1.7, borderTop: "1px solid var(--gray-100)" }}>{a}</div>
                </details>
              ))}
            </div>
          </section>

        </div>
      </div>
      <BottomNav />
    </div>
  );
}
