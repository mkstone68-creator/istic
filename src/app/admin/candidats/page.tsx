"use client";
import { useState, useEffect, useRef } from "react";
import {
  Plus, Pencil, Trash2, Trophy, Link2, Camera, X,
  AlertTriangle, Check, User, ChevronRight, Loader2,
} from "lucide-react";

interface Candidate {
  id: string; number: number; name: string; filiere: string;
  photoUrl: string; description: string | null; whatsappGroup: string | null; voteCount: number;
}

const emptyForm = { number: "", name: "", filiere: "", photoUrl: "", description: "", whatsappGroup: "" };

const inp = (
  value: string,
  onChange: (v: string) => void,
  placeholder = "",
  type = "text"
) => (
  <input
    type={type} value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    style={{ width: "100%", border: "2px solid #EEEDE8", borderRadius: 10, padding: "11px 14px", fontSize: ".88rem", fontFamily: "var(--font-body)", outline: "none", color: "#1A1914", background: "white", boxSizing: "border-box" }}
    onFocus={e => { e.target.style.borderColor = "#C9950A"; }}
    onBlur={e => { e.target.style.borderColor = "#EEEDE8"; }}
  />
);

export default function AdminCandidatsPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Form modal ──────────────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Vote edit modal ─────────────────────────────────────────────────────────
  const [voteEdit, setVoteEdit] = useState<{ id: string; name: string } | null>(null);
  const [voteValue, setVoteValue] = useState("");
  const [voteSaving, setVoteSaving] = useState(false);
  const [voteError, setVoteError] = useState("");

  // ── Delete confirm ──────────────────────────────────────────────────────────
  const [deleteConfirm, setDeleteConfirm] = useState<Candidate | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/candidates", { credentials: "include" });
    const d = await res.json();
    if (d.success) setCandidates(d.data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditId(null); setForm(emptyForm); setPhotoPreview(""); setFormError(""); setShowForm(true);
  }
  function openEdit(c: Candidate) {
    setEditId(c.id);
    setForm({ number: String(c.number), name: c.name, filiere: c.filiere, photoUrl: c.photoUrl ?? "", description: c.description ?? "", whatsappGroup: c.whatsappGroup ?? "" });
    setPhotoPreview(c.photoUrl && !c.photoUrl.startsWith("/placeholder") ? c.photoUrl : "");
    setFormError(""); setShowForm(true);
  }
  function openVoteEdit(c: Candidate) {
    setVoteEdit({ id: c.id, name: c.name });
    setVoteValue(String(c.voteCount));
    setVoteError("");
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      setPhotoPreview(dataUrl); setUploadingPhoto(true);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: dataUrl.split(",")[1], mimeType: file.type }) });
        const d = await res.json();
        if (d.success) { setForm(f => ({ ...f, photoUrl: d.data.url })); setPhotoPreview(d.data.url); }
        else setFormError("Upload: " + (d.error ?? "Cloudinary non configuré"));
      } catch { setFormError("Erreur upload photo"); }
      finally { setUploadingPhoto(false); }
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true); setFormError("");
    try {
      const url = editId ? `/api/admin/candidates/${editId}` : "/api/admin/candidates";
      const res = await fetch(url, { method: editId ? "PUT" : "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ number: parseInt(form.number), name: form.name, filiere: form.filiere, photoUrl: form.photoUrl || "", description: form.description || null, whatsappGroup: form.whatsappGroup || null }) });
      const d = await res.json();
      if (d.success) { setShowForm(false); load(); }
      else setFormError(d.error ?? "Erreur");
    } catch { setFormError("Erreur réseau"); }
    finally { setSaving(false); }
  }

  async function handleVoteSave() {
    if (!voteEdit) return;
    const n = parseInt(voteValue);
    if (isNaN(n) || n < 0) { setVoteError("Nombre invalide"); return; }
    setVoteSaving(true); setVoteError("");
    try {
      const res = await fetch(`/api/admin/candidates/${voteEdit.id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ voteCount: n }) });
      const d = await res.json();
      if (d.success) { setVoteEdit(null); load(); }
      else setVoteError(d.error ?? "Erreur");
    } catch { setVoteError("Erreur réseau"); }
    finally { setVoteSaving(false); }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/candidates/${deleteConfirm.id}`, { method: "DELETE", credentials: "include" });
      const d = await res.json();
      if (d.success) { setDeleteConfirm(null); load(); }
    } finally { setDeleting(false); }
  }

  const canSave = !saving && !uploadingPhoto && !!form.name && !!form.filiere && !!form.number;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 900, color: "#1A1914" }}>Candidats</h1>
          <div style={{ fontSize: ".8rem", color: "#9E9C91", marginTop: 2 }}>{candidates.length} candidat{candidates.length > 1 ? "s" : ""}</div>
        </div>
        <button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#F0C040,#C9950A)", color: "white", border: "none", borderRadius: "99px", padding: "11px 20px", fontWeight: 700, fontSize: ".88rem", cursor: "pointer", boxShadow: "0 4px 16px rgba(201,149,10,.3)", fontFamily: "var(--font-body)" }}>
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {/* ── Desktop table ── */}
      <style>{`
        .cand-table { display: block; }
        .cand-cards { display: none; }
        @media (max-width: 767px) {
          .cand-table { display: none; }
          .cand-cards { display: flex; flex-direction: column; gap: 12px; }
        }
      `}</style>

      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#9E9C91" }}>
          <Loader2 size={28} style={{ animation: "spin 1s linear infinite", display: "inline-block" }} />
        </div>
      ) : candidates.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center", color: "#9E9C91", background: "white", borderRadius: 16 }}>Aucun candidat. Ajoutez-en un !</div>
      ) : (
        <>
          {/* Table desktop */}
          <div className="cand-table" style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F7F7F5", borderBottom: "1px solid #EEEDE8" }}>
                  {["Photo", "N°", "Nom", "Filière", "Votes", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: ".72rem", fontWeight: 700, color: "#9E9C91", letterSpacing: ".05em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {candidates.map(c => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #F7F7F5" }}>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#1C0F0A", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {c.photoUrl && !c.photoUrl.startsWith("/placeholder")
                          ? <img src={c.photoUrl} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <User size={20} color="rgba(201,168,130,.4)" />}
                      </div>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ background: "linear-gradient(135deg,#F0C040,#C9950A)", color: "white", borderRadius: 99, padding: "3px 10px", fontSize: ".72rem", fontWeight: 700 }}>
                        {String(c.number).padStart(2, "0")}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px", fontWeight: 600, fontSize: ".9rem", color: "#1A1914" }}>
                      {c.name}
                      {c.whatsappGroup && <span style={{ marginLeft: 6, width: 8, height: 8, borderRadius: "50%", background: "#25D366", display: "inline-block" }} title="WhatsApp configuré" />}
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: ".84rem", color: "#5E5C53" }}>{c.filiere}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1rem", color: "#C9950A" }}>{c.voteCount.toLocaleString("fr-FR")}</span>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => openEdit(c)} title="Modifier" style={{ width: 32, height: 32, borderRadius: 8, background: "#F7F7F5", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#5E5C53" }}><Pencil size={14} /></button>
                        <button onClick={() => openVoteEdit(c)} title="Modifier les votes" style={{ width: 32, height: 32, borderRadius: 8, background: "#FFF7ED", border: "1px solid #FCD34D", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#92400E" }}><Trophy size={14} /></button>
                        <button onClick={() => setDeleteConfirm(c)} title="Supprimer" style={{ width: 32, height: 32, borderRadius: 8, background: "#FEF2F2", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#B91C1C" }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards mobile */}
          <div className="cand-cards">
            {candidates.map(c => (
              <div key={c.id} style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,.06)", display: "flex", alignItems: "center", gap: 0 }}>
                {/* Photo */}
                <div style={{ width: 72, height: 72, flexShrink: 0, background: "#1C0F0A", display: "flex", alignItems: "center", justifyContent: "center", alignSelf: "stretch" }}>
                  {c.photoUrl && !c.photoUrl.startsWith("/placeholder")
                    ? <img src={c.photoUrl} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <User size={26} color="rgba(201,168,130,.4)" />}
                </div>

                {/* Info */}
                <div style={{ flex: 1, padding: "12px 14px", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span style={{ background: "linear-gradient(135deg,#F0C040,#C9950A)", color: "white", borderRadius: 99, padding: "1px 8px", fontSize: ".65rem", fontWeight: 700 }}>
                      #{String(c.number).padStart(2, "0")}
                    </span>
                    {c.whatsappGroup && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#25D366", flexShrink: 0 }} />}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: ".9rem", color: "#1A1914", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                  <div style={{ fontSize: ".72rem", color: "#9E9C91" }}>{c.filiere}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                    <Trophy size={12} color="#C9950A" />
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: ".88rem", color: "#C9950A" }}>{c.voteCount.toLocaleString("fr-FR")}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", borderLeft: "1px solid #F7F7F5", alignSelf: "stretch" }}>
                  <button onClick={() => openEdit(c)} style={{ flex: 1, width: 48, background: "none", border: "none", borderBottom: "1px solid #F7F7F5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#5E5C53" }}>
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => openVoteEdit(c)} style={{ flex: 1, width: 48, background: "none", border: "none", borderBottom: "1px solid #F7F7F5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#92400E" }}>
                    <Trophy size={15} />
                  </button>
                  <button onClick={() => setDeleteConfirm(c)} style={{ flex: 1, width: 48, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444" }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL — Ajouter / Modifier candidat
      ══════════════════════════════════════════════════════════════════════ */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setShowForm(false)}>
          <div style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 580, maxHeight: "92dvh", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(0,0,0,.35)", overflow: "hidden" }}
            onClick={e => e.stopPropagation()}>

            {/* Header modal */}
            <div style={{ background: "linear-gradient(135deg,#1C0F0A,#2D1A0E)", padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 900, color: "white" }}>
                  {editId ? "Modifier le candidat" : "Nouveau candidat"}
                </div>
                <div style={{ fontSize: ".72rem", color: "rgba(201,168,130,.6)", marginTop: 2 }}>
                  {editId ? "Mettez à jour les informations" : "Renseignez les informations du candidat"}
                </div>
              </div>
              <button onClick={() => setShowForm(false)} style={{ background: "rgba(255,255,255,.1)", border: "none", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                <X size={17} />
              </button>
            </div>

            {/* Corps scrollable */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

              {/* Zone photo + champs principaux */}
              <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>

                {/* Upload photo */}
                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div onClick={() => fileInputRef.current?.click()}
                    style={{ width: 96, height: 116, borderRadius: 14, border: `2px dashed ${uploadingPhoto ? "#C9950A" : "#EEEDE8"}`, background: "#FAFAF9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", transition: "border-color .15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#C9950A"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = uploadingPhoto ? "#C9950A" : "#EEEDE8"; }}>
                    {uploadingPhoto ? (
                      <Loader2 size={24} color="#C9950A" style={{ animation: "spin 1s linear infinite" }} />
                    ) : photoPreview ? (
                      <img src={photoPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ textAlign: "center", color: "#9E9C91", padding: 8 }}>
                        <Camera size={22} style={{ marginBottom: 4, display: "block", margin: "0 auto 6px" }} />
                        <div style={{ fontSize: ".65rem", lineHeight: 1.4 }}>Cliquer pour<br/>choisir</div>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: "none" }} />
                  <div style={{ fontSize: ".62rem", color: "#9E9C91", textAlign: "center" }}>JPG/PNG · 5MB max</div>
                </div>

                {/* Champs N° / Nom / Filière */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: ".72rem", fontWeight: 700, color: "#5E5C53", display: "block", marginBottom: 5 }}>N° *</label>
                      {inp(form.number, v => setForm(f => ({ ...f, number: v })), "01", "number")}
                    </div>
                    <div>
                      <label style={{ fontSize: ".72rem", fontWeight: 700, color: "#5E5C53", display: "block", marginBottom: 5 }}>Nom complet *</label>
                      {inp(form.name, v => setForm(f => ({ ...f, name: v })), "Prénom Nom")}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: ".72rem", fontWeight: 700, color: "#5E5C53", display: "block", marginBottom: 5 }}>Filière *</label>
                    {inp(form.filiere, v => setForm(f => ({ ...f, filiere: v })), "INFO, RESEAUX, GIT…")}
                  </div>
                </div>
              </div>

              {/* URL Photo */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: ".72rem", fontWeight: 700, color: "#5E5C53", display: "block", marginBottom: 5 }}>
                  URL Photo directe
                  {form.photoUrl && <span style={{ marginLeft: 6, color: "#10B981", display: "inline-flex", alignItems: "center", gap: 2 }}><Check size={11} /> OK</span>}
                </label>
                <div style={{ position: "relative" }}>
                  <Link2 size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9E9C91" }} />
                  <input value={form.photoUrl} onChange={e => { setForm(f => ({ ...f, photoUrl: e.target.value })); setPhotoPreview(e.target.value); }}
                    placeholder="https://res.cloudinary.com/..."
                    style={{ width: "100%", border: "2px solid #EEEDE8", borderRadius: 10, padding: "11px 14px 11px 36px", fontSize: ".88rem", fontFamily: "var(--font-body)", outline: "none", color: "#1A1914", background: "white", boxSizing: "border-box" }}
                    onFocus={e => { e.target.style.borderColor = "#C9950A"; }}
                    onBlur={e => { e.target.style.borderColor = "#EEEDE8"; }} />
                </div>
              </div>

              {/* WhatsApp */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: ".72rem", fontWeight: 700, color: "#5E5C53", display: "block", marginBottom: 5 }}>
                  Groupe WhatsApp fans <span style={{ fontWeight: 400, color: "#9E9C91" }}>(optionnel)</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Link2 size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#25D366" }} />
                  <input value={form.whatsappGroup} onChange={e => setForm(f => ({ ...f, whatsappGroup: e.target.value }))}
                    placeholder="https://chat.whatsapp.com/..."
                    style={{ width: "100%", border: "2px solid #EEEDE8", borderRadius: 10, padding: "11px 14px 11px 36px", fontSize: ".88rem", fontFamily: "var(--font-body)", outline: "none", color: "#1A1914", background: "white", boxSizing: "border-box" }}
                    onFocus={e => { e.target.style.borderColor = "#25D366"; }}
                    onBlur={e => { e.target.style.borderColor = "#EEEDE8"; }} />
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: ".72rem", fontWeight: 700, color: "#5E5C53", display: "block", marginBottom: 5 }}>
                  Biographie <span style={{ fontWeight: 400, color: "#9E9C91" }}>(optionnel)</span>
                </label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Passion, programme, slogan…"
                  rows={3}
                  style={{ width: "100%", border: "2px solid #EEEDE8", borderRadius: 10, padding: "11px 14px", fontSize: ".88rem", fontFamily: "var(--font-body)", outline: "none", color: "#1A1914", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }}
                  onFocus={e => { e.target.style.borderColor = "#C9950A"; }}
                  onBlur={e => { e.target.style.borderColor = "#EEEDE8"; }} />
              </div>

              {formError && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FEF2F2", border: "1.5px solid #FCA5A5", borderRadius: 10, padding: "10px 14px", color: "#B91C1C", fontSize: ".82rem", marginTop: 10 }}>
                  <AlertTriangle size={14} /> {formError}
                </div>
              )}
            </div>

            {/* Footer modal */}
            <div style={{ borderTop: "1px solid #EEEDE8", padding: "16px 28px", display: "flex", gap: 10, flexShrink: 0, background: "white" }}>
              <button onClick={handleSave} disabled={!canSave}
                style={{ flex: 1, background: canSave ? "linear-gradient(135deg,#F0C040,#C9950A)" : "#EEEDE8", color: canSave ? "white" : "#9E9C91", border: "none", borderRadius: "99px", padding: "13px", fontWeight: 700, fontSize: ".92rem", cursor: canSave ? "pointer" : "not-allowed", fontFamily: "var(--font-body)", transition: "all .15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                {saving ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Enregistrement…</> : uploadingPhoto ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Upload…</> : <><Check size={16} /> {editId ? "Mettre à jour" : "Créer le candidat"}</>}
              </button>
              <button onClick={() => setShowForm(false)} style={{ padding: "13px 20px", background: "#F7F7F5", color: "#5E5C53", border: "none", borderRadius: "99px", fontWeight: 600, fontSize: ".88rem", cursor: "pointer", fontFamily: "var(--font-body)" }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal votes ── */}
      {voteEdit && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setVoteEdit(null)}>
          <div style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 380, boxShadow: "0 32px 80px rgba(0,0,0,.35)", overflow: "hidden" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ background: "linear-gradient(135deg,#FFF7ED,#FEF3C7)", borderBottom: "1px solid #FDE68A", padding: "20px 24px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#F0C040,#C9950A)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trophy size={18} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: ".95rem", color: "#1A1914" }}>Modifier les votes</div>
                <div style={{ fontSize: ".78rem", color: "#92400E" }}>{voteEdit.name}</div>
              </div>
            </div>
            <div style={{ padding: "24px" }}>
              <label style={{ fontSize: ".78rem", fontWeight: 700, color: "#5E5C53", display: "block", marginBottom: 8 }}>Nombre de votes</label>
              <input type="number" min={0} value={voteValue} onChange={e => setVoteValue(e.target.value)}
                style={{ width: "100%", border: "2px solid #EEEDE8", borderRadius: 10, padding: "14px", fontSize: "1.1rem", fontFamily: "var(--font-body)", outline: "none", color: "#1A1914", marginBottom: 12, boxSizing: "border-box", fontWeight: 700, textAlign: "center" }}
                onFocus={e => { e.target.style.borderColor = "#C9950A"; }}
                onBlur={e => { e.target.style.borderColor = "#EEEDE8"; }} />
              {voteError && <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#B91C1C", fontSize: ".8rem", marginBottom: 12 }}><AlertTriangle size={13} /> {voteError}</div>}
              <div style={{ background: "#FFF7ED", border: "1px solid #FDE68A", borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: ".78rem", color: "#92400E", display: "flex", alignItems: "flex-start", gap: 6 }}>
                <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                Modification directe sans transaction. Irréversible.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleVoteSave} disabled={voteSaving}
                  style={{ flex: 1, background: "linear-gradient(135deg,#F0C040,#C9950A)", color: "white", border: "none", borderRadius: "99px", padding: "12px", fontWeight: 700, cursor: voteSaving ? "not-allowed" : "pointer", fontSize: ".9rem", fontFamily: "var(--font-body)", opacity: voteSaving ? .6 : 1 }}>
                  {voteSaving ? "Sauvegarde…" : "Confirmer"}
                </button>
                <button onClick={() => setVoteEdit(null)} style={{ flex: 1, background: "#F7F7F5", color: "#5E5C53", border: "none", borderRadius: "99px", padding: "12px", fontWeight: 600, cursor: "pointer", fontSize: ".9rem", fontFamily: "var(--font-body)" }}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal suppression ── */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setDeleteConfirm(null)}>
          <div style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 400, textAlign: "center", boxShadow: "0 32px 80px rgba(0,0,0,.35)", overflow: "hidden" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: "32px 32px 24px" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Trash2 size={24} color="#EF4444" />
              </div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1A1914", marginBottom: 8 }}>Supprimer {deleteConfirm.name} ?</div>
              <p style={{ color: "#5E5C53", fontSize: ".88rem", lineHeight: 1.6 }}>
                Cette action supprimera le candidat, ses <strong>{deleteConfirm.voteCount}</strong> votes et toutes ses transactions. Irréversible.
              </p>
            </div>
            <div style={{ display: "flex", gap: 0, borderTop: "1px solid #F7F7F5" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "16px", background: "none", border: "none", borderRight: "1px solid #F7F7F5", fontWeight: 600, color: "#5E5C53", cursor: "pointer", fontSize: ".92rem", fontFamily: "var(--font-body)" }}>
                Annuler
              </button>
              <button onClick={handleDelete} disabled={deleting} style={{ flex: 1, padding: "16px", background: "none", border: "none", fontWeight: 700, color: "#EF4444", cursor: deleting ? "not-allowed" : "pointer", fontSize: ".92rem", fontFamily: "var(--font-body)", opacity: deleting ? .6 : 1 }}>
                {deleting ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
