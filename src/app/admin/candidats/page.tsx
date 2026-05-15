"use client";
import { useState, useEffect, useRef } from "react";

interface Candidate {
  id: string;
  number: number;
  name: string;
  filiere: string;
  photoUrl: string;
  description: string | null;
  whatsappGroup: string | null;
  voteCount: number;
}

const emptyForm = { number: "", name: "", filiere: "", photoUrl: "", description: "", whatsappGroup: "" };

function CandidatePhoto({ url, name, size = 40 }: { url: string; name: string; size?: number }) {
  const hasPhoto = url && !url.startsWith("/placeholder");
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg,#1C0F0A,#2D1A0E)",
      overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.45 + "px",
    }}>
      {hasPhoto
        ? <img src={url} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : "👤"}
    </div>
  );
}

export default function AdminCandidatsPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Vote edit modal ──────────────────────────────────────────────────────
  const [voteEditId, setVoteEditId] = useState<string | null>(null);
  const [voteEditName, setVoteEditName] = useState("");
  const [voteEditValue, setVoteEditValue] = useState("");
  const [voteEditSaving, setVoteEditSaving] = useState(false);
  const [voteEditError, setVoteEditError] = useState("");

  async function loadCandidates() {
    // FIX: credentials: "include" pour envoyer le cookie d'auth
    const res = await fetch("/api/admin/candidates", { credentials: "include" });
    const data = await res.json();
    if (data.success) setCandidates(data.data);
    setLoading(false);
  }

  useEffect(() => { loadCandidates(); }, []);

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setPhotoPreview("");
    setError("");
    setShowForm(true);
  }

  function openEdit(c: Candidate) {
    setEditId(c.id);
    setForm({
      number: String(c.number),
      name: c.name,
      filiere: c.filiere,
      photoUrl: c.photoUrl ?? "",
      description: c.description ?? "",
      whatsappGroup: c.whatsappGroup ?? "",
    });
    setPhotoPreview(c.photoUrl && !c.photoUrl.startsWith("/placeholder") ? c.photoUrl : "");
    setError("");
    setShowForm(true);
  }

  function openVoteEdit(c: Candidate) {
    setVoteEditId(c.id);
    setVoteEditName(c.name);
    setVoteEditValue(String(c.voteCount));
    setVoteEditError("");
  }

  async function handleVoteEditSave() {
    if (!voteEditId) return;
    const newVotes = parseInt(voteEditValue);
    if (isNaN(newVotes) || newVotes < 0) {
      setVoteEditError("Nombre de votes invalide");
      return;
    }
    setVoteEditSaving(true);
    setVoteEditError("");
    try {
      // FIX: credentials: "include"
      const res = await fetch(`/api/admin/candidates/${voteEditId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteCount: newVotes }),
      });
      const data = await res.json();
      if (data.success) {
        setVoteEditId(null);
        loadCandidates();
      } else {
        setVoteEditError(data.error ?? "Erreur");
      }
    } catch {
      setVoteEditError("Erreur réseau");
    } finally {
      setVoteEditSaving(false);
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      setPhotoPreview(dataUrl);

      setUploadingPhoto(true);
      const base64 = dataUrl.split(",")[1];
      try {
        // FIX: credentials: "include"
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: base64, mimeType: file.type }),
        });
        const data = await res.json();
        if (data.success) {
          setForm((f) => ({ ...f, photoUrl: data.data.url }));
          setPhotoPreview(data.data.url);
        } else {
          setError("Erreur upload: " + (data.error ?? "Cloudinary non configuré"));
        }
      } catch {
        setError("Erreur upload photo");
      } finally {
        setUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const url = editId ? `/api/admin/candidates/${editId}` : "/api/admin/candidates";
      const method = editId ? "PUT" : "POST";
      // FIX: credentials: "include" — c'est la cause principale du bouton Créer qui ne fait rien
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: parseInt(form.number),
          name: form.name,
          filiere: form.filiere,
          photoUrl: form.photoUrl || "",
          description: form.description || null,
          whatsappGroup: form.whatsappGroup || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        loadCandidates();
      } else {
        setError(data.error ?? "Erreur");
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      // FIX: credentials: "include"
      const res = await fetch(`/api/admin/candidates/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setDeleteConfirm(null);
        loadCandidates();
      }
    } finally {
      setDeleting(false);
    }
  }

  const inp = (field: keyof typeof form, placeholder = "") => (
    <input
      value={form[field]}
      onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
      placeholder={placeholder}
      style={{
        width: "100%", border: "2px solid #EEEDE8", borderRadius: "10px",
        padding: "10px 14px", fontSize: ".88rem", fontFamily: "var(--font-body)",
        outline: "none", color: "#1A1914", background: "white",
      }}
      onFocus={(e) => { e.target.style.borderColor = "#C9950A"; }}
      onBlur={(e) => { e.target.style.borderColor = "#EEEDE8"; }}
    />
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 900, color: "#1A1914" }}>Candidats</h1>
          <div style={{ fontSize: ".8rem", color: "#9E9C91", marginTop: 2 }}>{candidates.length} candidat{candidates.length > 1 ? "s" : ""}</div>
        </div>
        <button
          onClick={openCreate}
          style={{
            background: "linear-gradient(135deg,#F0C040,#C9950A)",
            color: "white", border: "none", borderRadius: "99px",
            padding: "11px 22px", fontWeight: 700, fontSize: ".88rem",
            cursor: "pointer", boxShadow: "0 4px 16px rgba(201,149,10,.3)",
            fontFamily: "var(--font-body)",
          }}
        >
          + Ajouter un candidat
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{
          background: "white", borderRadius: 16, padding: "24px 26px",
          marginBottom: 24, boxShadow: "0 2px 16px rgba(0,0,0,.08)",
          border: "2px solid rgba(201,149,10,.2)",
        }}>
          <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 20, color: "#1A1914" }}>
            {editId ? "Modifier le candidat" : "Nouveau candidat"}
          </div>

          <div style={{ display: "flex", gap: 20, marginBottom: 18 }}>
            {/* Photo upload */}
            <div style={{ flexShrink: 0 }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: 100, height: 125, borderRadius: 12,
                  border: "2px dashed #D9D7CF",
                  background: "#F7F7F5",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden", position: "relative",
                  transition: "border-color .15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#C9950A"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#D9D7CF"; }}
              >
                {uploadingPhoto ? (
                  <div style={{ textAlign: "center", color: "#9E9C91", fontSize: ".75rem" }}>Upload…</div>
                ) : photoPreview ? (
                  <img src={photoPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ textAlign: "center", color: "#9E9C91" }}>
                    <div style={{ fontSize: "1.8rem", marginBottom: 4 }}>📷</div>
                    <div style={{ fontSize: ".7rem", lineHeight: 1.3 }}>Cliquer pour<br/>choisir</div>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              <div style={{ fontSize: ".65rem", color: "#9E9C91", marginTop: 4, textAlign: "center", maxWidth: 100 }}>
                JPG/PNG max 5MB
              </div>
            </div>

            {/* Fields */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 2fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: ".75rem", fontWeight: 600, color: "#5E5C53", display: "block", marginBottom: 6 }}>N° *</label>
                  {inp("number", "01")}
                </div>
                <div>
                  <label style={{ fontSize: ".75rem", fontWeight: 600, color: "#5E5C53", display: "block", marginBottom: 6 }}>Nom complet *</label>
                  {inp("name", "Prénom Nom")}
                </div>
                <div>
                  <label style={{ fontSize: ".75rem", fontWeight: 600, color: "#5E5C53", display: "block", marginBottom: 6 }}>Filière *</label>
                  {inp("filiere", "INFO, RESEAUX…")}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: ".75rem", fontWeight: 600, color: "#5E5C53", display: "block", marginBottom: 6 }}>
                    URL Photo {form.photoUrl ? "✓" : "(ou upload ci-contre)"}
                  </label>
                  <input
                    value={form.photoUrl}
                    onChange={(e) => { setForm((f) => ({ ...f, photoUrl: e.target.value })); setPhotoPreview(e.target.value); }}
                    placeholder="https://..."
                    style={{
                      width: "100%", border: "2px solid #EEEDE8", borderRadius: "10px",
                      padding: "10px 14px", fontSize: ".82rem", fontFamily: "var(--font-body)",
                      outline: "none", color: "#1A1914",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "#C9950A"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#EEEDE8"; }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: ".75rem", fontWeight: 600, color: "#5E5C53", display: "block", marginBottom: 6 }}>Groupe WhatsApp (URL)</label>
                  {inp("whatsappGroup", "https://wa.me/...")}
                </div>
              </div>
              <div>
                <label style={{ fontSize: ".75rem", fontWeight: 600, color: "#5E5C53", display: "block", marginBottom: 6 }}>
                  Description / Biographie <span style={{ color: "#D9D7CF", fontWeight: 400 }}>(optionnel)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Quelques mots sur le candidat : passion, programme, slogan…"
                  rows={3}
                  style={{
                    width: "100%", border: "2px solid #EEEDE8", borderRadius: "10px",
                    padding: "10px 14px", fontSize: ".85rem", fontFamily: "var(--font-body)",
                    outline: "none", color: "#1A1914", resize: "vertical", lineHeight: 1.5,
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#C9950A"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#EEEDE8"; }}
                />
              </div>
            </div>
          </div>

          {error && <div style={{ color: "#B91C1C", fontSize: ".82rem", marginBottom: 14 }}>⚠️ {error}</div>}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleSave}
              disabled={saving || uploadingPhoto || !form.name || !form.filiere || !form.number}
              style={{
                background: "linear-gradient(135deg,#F0C040,#C9950A)",
                color: "white", border: "none", borderRadius: "99px",
                padding: "10px 24px", fontWeight: 700, fontSize: ".88rem",
                cursor: (saving || uploadingPhoto) ? "not-allowed" : "pointer",
                opacity: (saving || uploadingPhoto) ? .6 : 1,
                fontFamily: "var(--font-body)",
              }}
            >
              {saving ? "Enregistrement…" : uploadingPhoto ? "Upload en cours…" : editId ? "Mettre à jour" : "Créer"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                background: "#F7F7F5", color: "#5E5C53", border: "none",
                borderRadius: "99px", padding: "10px 20px",
                fontWeight: 600, fontSize: ".88rem", cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9E9C91" }}>Chargement…</div>
        ) : candidates.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#9E9C91" }}>Aucun candidat. Ajoutez-en un !</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F7F7F5", borderBottom: "1px solid #EEEDE8" }}>
                {["Photo", "N°", "Nom", "Filière", "Votes", "WhatsApp", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: ".72rem", fontWeight: 700, color: "#9E9C91", letterSpacing: ".05em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #F7F7F5" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <CandidatePhoto url={c.photoUrl} name={c.name} size={42} />
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      background: "linear-gradient(135deg,#F0C040,#C9950A)",
                      color: "white", borderRadius: "99px", padding: "3px 10px",
                      fontSize: ".75rem", fontWeight: 700,
                    }}>
                      {String(c.number).padStart(2, "0")}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: ".9rem", color: "#1A1914" }}>{c.name}</td>
                  <td style={{ padding: "12px 16px", fontSize: ".84rem", color: "#5E5C53" }}>{c.filiere}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1rem", color: "#C9950A" }}>
                      {c.voteCount.toLocaleString("fr-FR")}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {c.whatsappGroup
                      ? <a href={c.whatsappGroup} target="_blank" rel="noopener noreferrer" style={{ color: "#25D366", fontSize: ".78rem", fontWeight: 600 }}>Lien ✓</a>
                      : <span style={{ color: "#D9D7CF", fontSize: ".78rem" }}>—</span>
                    }
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button onClick={() => openEdit(c)} style={{ background: "#F7F7F5", border: "none", borderRadius: "8px", padding: "7px 14px", fontSize: ".78rem", fontWeight: 600, cursor: "pointer", color: "#5E5C53", fontFamily: "var(--font-body)" }}>
                        Modifier
                      </button>
                      {/* NOUVEAU: bouton modifier les votes */}
                      <button
                        onClick={() => openVoteEdit(c)}
                        style={{ background: "#FFF7ED", border: "1px solid #FCD34D", borderRadius: "8px", padding: "7px 14px", fontSize: ".78rem", fontWeight: 600, cursor: "pointer", color: "#92400E", fontFamily: "var(--font-body)" }}
                      >
                        🗳️ Votes
                      </button>
                      <button onClick={() => setDeleteConfirm(c.id)} style={{ background: "#FEF2F2", border: "none", borderRadius: "8px", padding: "7px 14px", fontSize: ".78rem", fontWeight: 600, cursor: "pointer", color: "#B91C1C", fontFamily: "var(--font-body)" }}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Vote edit modal */}
      {voteEditId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "white", borderRadius: 20, padding: "32px 36px", maxWidth: 380, width: "90%", boxShadow: "0 24px 80px rgba(0,0,0,.3)" }}>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 6, color: "#1A1914" }}>Modifier les votes</div>
            <div style={{ fontSize: ".84rem", color: "#5E5C53", marginBottom: 20 }}>{voteEditName}</div>
            <label style={{ fontSize: ".78rem", fontWeight: 600, color: "#5E5C53", display: "block", marginBottom: 8 }}>
              Nombre de votes
            </label>
            <input
              type="number"
              min={0}
              value={voteEditValue}
              onChange={(e) => setVoteEditValue(e.target.value)}
              style={{
                width: "100%", border: "2px solid #EEEDE8", borderRadius: "10px",
                padding: "12px 14px", fontSize: "1rem", fontFamily: "var(--font-body)",
                outline: "none", color: "#1A1914", marginBottom: 16,
              }}
              onFocus={(e) => { e.target.style.borderColor = "#C9950A"; }}
              onBlur={(e) => { e.target.style.borderColor = "#EEEDE8"; }}
            />
            {voteEditError && <div style={{ color: "#B91C1C", fontSize: ".8rem", marginBottom: 12 }}>⚠️ {voteEditError}</div>}
            <div style={{ background: "#FFF7ED", border: "1px solid #FCD34D", borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: ".78rem", color: "#92400E" }}>
              ⚠️ Cette action modifie directement le compteur de votes sans créer de transaction.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleVoteEditSave}
                disabled={voteEditSaving}
                style={{
                  flex: 1, background: "linear-gradient(135deg,#F0C040,#C9950A)", color: "white",
                  border: "none", borderRadius: "99px", padding: "12px", fontWeight: 700,
                  cursor: voteEditSaving ? "not-allowed" : "pointer", fontSize: ".9rem",
                  opacity: voteEditSaving ? .6 : 1, fontFamily: "var(--font-body)",
                }}
              >
                {voteEditSaving ? "Sauvegarde…" : "Confirmer"}
              </button>
              <button
                onClick={() => setVoteEditId(null)}
                style={{ flex: 1, background: "#F7F7F5", color: "#5E5C53", border: "none", borderRadius: "99px", padding: "12px", fontWeight: 600, cursor: "pointer", fontSize: ".9rem", fontFamily: "var(--font-body)" }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "white", borderRadius: 20, padding: "32px 36px", maxWidth: 400, width: "90%", textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,.3)" }}>
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>⚠️</div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 8, color: "#1A1914" }}>Confirmer la suppression</div>
            <p style={{ color: "#5E5C53", fontSize: ".88rem", marginBottom: 24 }}>
              Cette action supprimera le candidat, ses votes et toutes ses transactions.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={deleting} style={{ background: "#EF4444", color: "white", border: "none", borderRadius: "99px", padding: "12px 24px", fontWeight: 700, cursor: deleting ? "not-allowed" : "pointer", fontSize: ".9rem", fontFamily: "var(--font-body)" }}>
                {deleting ? "Suppression…" : "Supprimer"}
              </button>
              <button onClick={() => setDeleteConfirm(null)} style={{ background: "#F7F7F5", color: "#5E5C53", border: "none", borderRadius: "99px", padding: "12px 24px", fontWeight: 600, cursor: "pointer", fontSize: ".9rem", fontFamily: "var(--font-body)" }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
