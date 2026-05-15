"use client";
import { useState, useEffect } from "react";

interface Settings {
  votingStartDate: string | null;
  votingEndDate: string | null;
  isMaintenance: boolean;
  maintenanceMsg: string | null;
}

function toInputDate(dt: string | null): string {
  if (!dt) return "";
  return new Date(dt).toISOString().slice(0, 16);
}

export default function AdminParametresPage() {
  const [settings, setSettings] = useState<Settings>({
    votingStartDate: null,
    votingEndDate: null,
    isMaintenance: false,
    maintenanceMsg: "Site en maintenance. Revenez bientôt.",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setSettings({
            votingStartDate: d.data.votingStartDate,
            votingEndDate: d.data.votingEndDate,
            isMaintenance: d.data.isMaintenance ?? false,
            maintenanceMsg: d.data.maintenanceMsg ?? "Site en maintenance. Revenez bientôt.",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          votingStartDate: settings.votingStartDate || null,
          votingEndDate: settings.votingEndDate || null,
          isMaintenance: settings.isMaintenance,
          maintenanceMsg: settings.maintenanceMsg || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.error ?? "Erreur");
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  const inpStyle = {
    width: "100%", border: "2px solid #EEEDE8", borderRadius: "12px",
    padding: "12px 16px", fontSize: ".9rem", fontFamily: "var(--font-body)",
    outline: "none", color: "#1A1914", background: "white",
  };

  if (loading) {
    return <div style={{ padding: 40, color: "#9E9C91" }}>Chargement…</div>;
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 900, color: "#1A1914" }}>Paramètres</h1>
        <div style={{ fontSize: ".8rem", color: "#9E9C91", marginTop: 2 }}>Configuration du site et de la période de votes</div>
      </div>

      {/* Vote period */}
      <div style={{ background: "white", borderRadius: 16, padding: "24px 26px", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
        <div style={{ fontWeight: 700, fontSize: "1rem", color: "#1A1914", marginBottom: 6 }}>
          📅 Période de votes
        </div>
        <div style={{ fontSize: ".82rem", color: "#9E9C91", marginBottom: 20, lineHeight: 1.6 }}>
          Définissez quand les votes commencent et se terminent. Si ces dates ne sont pas définies, les votes sont toujours ouverts.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: ".78rem", fontWeight: 600, color: "#5E5C53", marginBottom: 8 }}>
              Début des votes
            </label>
            <input
              type="datetime-local"
              value={toInputDate(settings.votingStartDate)}
              onChange={(e) => setSettings((s) => ({ ...s, votingStartDate: e.target.value || null }))}
              style={inpStyle}
              onFocus={(e) => { e.target.style.borderColor = "#C9950A"; }}
              onBlur={(e) => { e.target.style.borderColor = "#EEEDE8"; }}
            />
            {settings.votingStartDate && (
              <button
                onClick={() => setSettings((s) => ({ ...s, votingStartDate: null }))}
                style={{ background: "none", border: "none", color: "#9E9C91", fontSize: ".72rem", cursor: "pointer", marginTop: 4, padding: 0 }}
              >
                ✕ Effacer
              </button>
            )}
          </div>
          <div>
            <label style={{ display: "block", fontSize: ".78rem", fontWeight: 600, color: "#5E5C53", marginBottom: 8 }}>
              Fin des votes
            </label>
            <input
              type="datetime-local"
              value={toInputDate(settings.votingEndDate)}
              onChange={(e) => setSettings((s) => ({ ...s, votingEndDate: e.target.value || null }))}
              style={inpStyle}
              onFocus={(e) => { e.target.style.borderColor = "#C9950A"; }}
              onBlur={(e) => { e.target.style.borderColor = "#EEEDE8"; }}
            />
            {settings.votingEndDate && (
              <button
                onClick={() => setSettings((s) => ({ ...s, votingEndDate: null }))}
                style={{ background: "none", border: "none", color: "#9E9C91", fontSize: ".72rem", cursor: "pointer", marginTop: 4, padding: 0 }}
              >
                ✕ Effacer
              </button>
            )}
          </div>
        </div>

        {/* Vote period status */}
        {(settings.votingStartDate || settings.votingEndDate) && (
          <div style={{
            marginTop: 16, padding: "12px 16px",
            background: "#F0FDF4", borderRadius: "10px",
            border: "1px solid #BBF7D0",
            fontSize: ".82rem", color: "#166534",
          }}>
            {(() => {
              const now = new Date();
              const start = settings.votingStartDate ? new Date(settings.votingStartDate) : null;
              const end = settings.votingEndDate ? new Date(settings.votingEndDate) : null;
              if (start && now < start) return `🔒 Votes ouverts le ${start.toLocaleString("fr-FR")}`;
              if (end && now > end) return `🔒 Votes terminés le ${end.toLocaleString("fr-FR")}`;
              return "🗳️ Votes actuellement ouverts";
            })()}
          </div>
        )}
      </div>

      {/* Maintenance */}
      <div style={{
        background: "white", borderRadius: 16, padding: "24px 26px",
        marginBottom: 28, boxShadow: "0 2px 12px rgba(0,0,0,.06)",
        border: settings.isMaintenance ? "2px solid #FCD34D" : "2px solid transparent",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1rem", color: "#1A1914" }}>🔧 Mode maintenance</div>
            <div style={{ fontSize: ".82rem", color: "#9E9C91", marginTop: 4 }}>
              Le site affichera une page de maintenance à tous les visiteurs.
            </div>
          </div>
          {/* Toggle */}
          <button
            onClick={() => setSettings((s) => ({ ...s, isMaintenance: !s.isMaintenance }))}
            style={{
              width: 52, height: 28, borderRadius: "99px",
              background: settings.isMaintenance ? "#C9950A" : "#D9D7CF",
              border: "none", cursor: "pointer", position: "relative",
              transition: "background .2s", flexShrink: 0,
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: "50%", background: "white",
              position: "absolute", top: 3,
              left: settings.isMaintenance ? 27 : 3,
              transition: "left .2s",
              boxShadow: "0 1px 4px rgba(0,0,0,.2)",
            }} />
          </button>
        </div>

        {settings.isMaintenance && (
          <>
            <div style={{
              background: "#FEF3C7", border: "1px solid #FCD34D",
              borderRadius: "10px", padding: "10px 14px",
              fontSize: ".82rem", color: "#92400E", marginBottom: 16,
            }}>
              ⚠️ Le site est actuellement en maintenance. Les utilisateurs ne peuvent pas accéder au site.
            </div>
            <div>
              <label style={{ display: "block", fontSize: ".78rem", fontWeight: 600, color: "#5E5C53", marginBottom: 8 }}>
                Message de maintenance
              </label>
              <textarea
                value={settings.maintenanceMsg ?? ""}
                onChange={(e) => setSettings((s) => ({ ...s, maintenanceMsg: e.target.value }))}
                rows={3}
                style={{
                  ...inpStyle,
                  resize: "vertical",
                  lineHeight: 1.5,
                }}
                placeholder="Site en maintenance. Revenez bientôt."
                onFocus={(e) => { e.target.style.borderColor = "#C9950A"; }}
                onBlur={(e) => { e.target.style.borderColor = "#EEEDE8"; }}
              />
            </div>
          </>
        )}
      </div>

      {/* Save */}
      {error && (
        <div style={{ color: "#B91C1C", background: "#FEF2F2", borderRadius: "10px", padding: "12px 16px", marginBottom: 16, fontSize: ".88rem" }}>
          ⚠️ {error}
        </div>
      )}
      {saved && (
        <div style={{ color: "#166534", background: "#F0FDF4", borderRadius: "10px", padding: "12px 16px", marginBottom: 16, fontSize: ".88rem" }}>
          ✅ Paramètres enregistrés avec succès.
        </div>
      )}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          background: saving ? "#9E9C91" : "linear-gradient(135deg,#F0C040,#C9950A)",
          color: "white", border: "none", borderRadius: "99px",
          padding: "14px 36px", fontWeight: 700, fontSize: ".95rem",
          cursor: saving ? "not-allowed" : "pointer",
          boxShadow: saving ? "none" : "0 4px 20px rgba(201,149,10,.3)",
          fontFamily: "var(--font-body)",
          transition: "all .2s",
        }}
      >
        {saving ? "Enregistrement…" : "Enregistrer les paramètres"}
      </button>
    </div>
  );
}
