import { getSettings } from "@/lib/settings";

export default async function MaintenancePage() {
  const settings = await getSettings().catch(() => null);
  const msg = settings?.maintenanceMsg ?? "Notre plateforme est temporairement en maintenance. Revenez bientôt.";

  return (
    <div style={{
      minHeight: "100dvh",
      background: "linear-gradient(135deg, #1C0F0A 0%, #2D1A0E 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "var(--font-body)",
    }}>
      <div style={{ textAlign: "center", maxWidth: 380 }}>
        <div style={{
          width: 96, height: 96,
          background: "linear-gradient(135deg,#F0C040,#C9950A)",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "2.8rem",
          margin: "0 auto 24px",
          boxShadow: "0 8px 32px rgba(201,149,10,.4)",
        }}>
          🔧
        </div>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "2rem",
          fontWeight: 900,
          color: "white",
          marginBottom: 16,
          lineHeight: 1.15,
        }}>
          Site en maintenance
        </h1>
        <p style={{
          color: "rgba(201,168,130,.8)",
          fontSize: ".95rem",
          lineHeight: 1.7,
          marginBottom: 32,
        }}>
          {msg}
        </p>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(201,168,130,.1)",
          border: "1px solid rgba(201,168,130,.2)",
          borderRadius: "99px", padding: "10px 20px",
          fontSize: ".78rem", color: "rgba(201,168,130,.7)", fontWeight: 600,
          letterSpacing: ".05em",
        }}>
          Reine du Meta By Helen · isticvote.online
        </div>
      </div>
    </div>
  );
}
