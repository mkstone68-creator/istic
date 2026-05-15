// src/app/page.tsx
import Link from "next/link";
import BottomNav from "@/components/layout/BottomNav";
import Logo from "@/components/ui/Logo";
import { Shield, Zap, Globe, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="shell">
      <div className="page" style={{ paddingBottom: "88px" }}>

        {/* Hero header */}
        <header style={{ padding: "24px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Logo size={44} variant="icon" />
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 900, color: "var(--gray-900)", lineHeight: 1 }}>
                MISS &amp; MISTER
              </div>
              <div style={{ fontSize: ".62rem", fontWeight: 700, color: "var(--gold)", letterSpacing: ".12em", textTransform: "uppercase" }}>
                ISTIC.YDE. 2026
              </div>
            </div>
          </div>
          <span className="badge-gold">Officiel</span>
        </header>

        {/* Hero text */}
        <section className="animate-fadeup" style={{ padding: "28px 24px 0" }}>
          <div style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10 }}>
            Plateforme officielle de vote
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "2.3rem", fontWeight: 900,
            lineHeight: 1.1, color: "var(--gray-900)", marginBottom: 14,
          }}>
            Votez pour vos{" "}
            <span className="text-gold-shimmer">candidats</span>{" "}
            préférés
          </h1>
          <p style={{ color: "var(--gray-600)", fontSize: ".93rem", marginBottom: 26, maxWidth: 290, lineHeight: 1.6 }}>
            Soutenez vos favoris et contribuez à faire gagner le meilleur de l'ISTIC Yaoundé.
          </p>
          <Link href="/candidats" className="btn btn-primary" style={{ fontSize: "1rem" }}>
            Commencer à voter <ArrowRight size={18} />
          </Link>
        </section>

        {/* Hero visual — dark luxury card */}
        <section style={{ padding: "28px 24px 0" }}>
          <div style={{
            background: "linear-gradient(135deg, #1C0F0A 0%, #2D1A0E 60%, #1C0F0A 100%)",
            borderRadius: "var(--radius-xl)",
            padding: "32px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 180,
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Decorative rings */}
            {[120, 90, 60].map((r, i) => (
              <div key={i} style={{
                position: "absolute",
                width: r * 2, height: r * 2,
                borderRadius: "50%",
                border: "1px solid rgba(201,168,130," + (0.12 + i * 0.04) + ")",
                top: "50%", left: "50%",
                transform: "translate(-50%,-50%)",
                pointerEvents: "none",
              }} />
            ))}
            <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
              <Logo size={70} variant="icon" />
              <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8,
                background: "linear-gradient(135deg,#F0C040,#C9950A)",
                borderRadius: "99px", padding: "7px 18px", color: "white", fontSize: ".8rem", fontWeight: 700,
                boxShadow: "var(--shadow-gold)",
              }}>
                ✓ Vote sécurisé &amp; transparent
              </div>
            </div>
            {/* Sparkles */}
            <svg style={{ position: "absolute", top: 12, right: 16 }} width="50" height="50" viewBox="0 0 50 50" fill="none">
              <path d="M25 4 L26.5 10 L25 16 L23.5 10 Z" fill="white" opacity="0.5"/>
              <path d="M19 10 L25 11.5 L31 10 L25 8.5 Z" fill="white" opacity="0.5"/>
              <path d="M40 30 L41 33 L40 36 L39 33 Z" fill="white" opacity="0.3"/>
              <path d="M37 33 L40 34 L43 33 L40 32 Z" fill="white" opacity="0.3"/>
            </svg>
          </div>
        </section>

        {/* Feature trio */}
        <section style={{ padding: "24px 24px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
            {[
              { icon: Shield, label: "Sécurisé", desc: "Vote 100% sécurisé et transparent" },
              { icon: Zap,    label: "Rapide",   desc: "Résultats en temps réel" },
              { icon: Globe,  label: "Partout",  desc: "Depuis l'Afrique et l'Europe" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} style={{
                background: "var(--gray-50)", borderRadius: "var(--radius-md)",
                padding: "14px 10px", textAlign: "center",
              }}>
                <div style={{
                  width: 36, height: 36,
                  background: "linear-gradient(135deg,#1C0F0A,#2D1A0E)",
                  borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", margin: "0 auto 8px",
                }}>
                  <Icon size={17} color="var(--gold-light)" />
                </div>
                <div style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--gray-900)", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: ".64rem", color: "var(--gray-400)", lineHeight: 1.4 }}>{desc}</div>
              </div>
            ))}
          </div>

          {/* Price info card */}
          <div style={{
            background: "linear-gradient(135deg,#1C0F0A 0%,#2D1A0E 100%)",
            borderRadius: "var(--radius-lg)", padding: "18px 20px",
            display: "flex", alignItems: "center", gap: 14, marginBottom: 20,
          }}>
            <div style={{
              width: 48, height: 48,
              background: "linear-gradient(135deg,#F0C040,#C9950A)",
              borderRadius: "50%", display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0, fontSize: "1.4rem",
              boxShadow: "var(--shadow-gold)",
            }}>🪙</div>
            <div>
              <div style={{ fontSize: ".68rem", color: "rgba(201,168,130,.7)", fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 2 }}>
                Prix du vote
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 900, color: "#F0C040" }}>
                100 FCFA
              </div>
              <div style={{ fontSize: ".72rem", color: "rgba(201,168,130,.6)" }}>
                Paiement Mobile Money · Virement Europe
              </div>
            </div>
          </div>

          {/* CTA secondary */}
          <Link href="/classement" className="btn btn-outline" style={{ marginBottom: 24 }}>
            Voir le classement en direct 🏆
          </Link>
        </section>
      </div>
      <BottomNav />
    </div>
  );
}
