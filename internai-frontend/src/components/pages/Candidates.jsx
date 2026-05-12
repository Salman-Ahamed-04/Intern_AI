import { useState, useCallback } from "react";
import { Search, Plus, Mail, Phone, X, Trash2, Edit2 } from "lucide-react";
import { useApi } from "../../lib/useApi";
import { candidatesApi } from "../../lib/api";
import { useToast } from "../../lib/toast";

const statusMap = { "Active": "badge-green", "Placed": "badge-blue", "Interview": "badge-yellow", "Inactive": "badge-gray" };

const AVATAR_COLORS = [
  ["#d1fae5","#065f46"],["#dbeafe","#1e40af"],["#fce7f3","#9d174d"],
  ["#fef3c7","#92400e"],["#ede9fe","#5b21b6"],["#fee2e2","#991b1b"],
];

function CandidateModal({ onClose, onSaved, existing }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(existing ? {
    name:       existing.name,
    email:      existing.email,
    phone:      existing.phone || "",
    university: existing.university || "",
    degree:     existing.degree || "",
    gpa:        existing.gpa || "",
    skills:     (existing.skills||[]).join(", "),
    status:     existing.status,
  } : {
    name: "", email: "", phone: "", university: "", degree: "",
    gpa: "", skills: "", status: "Active"
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.email) { toast("Name and email are required", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        gpa: parseFloat(form.gpa) || 0,
        skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
      };
      if (existing) {
        await candidatesApi.update(existing._id, payload);
        toast("Candidate updated!");
      } else {
        const idx = Math.floor(Math.random() * AVATAR_COLORS.length);
        const [avatarColor, avatarTextColor] = AVATAR_COLORS[idx];
        const initials = form.name.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase();
        await candidatesApi.create({ ...payload, avatarColor, avatarTextColor, initials });
        toast("Candidate added!");
      }
      onSaved();
      onClose();
    } catch (e) {
      toast(e.message || "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{existing ? "Edit Candidate" : "Add New Candidate"}</span>
          <button className="btn btn-ghost" style={{ padding: "4px 6px" }} onClick={onClose}><X size={15} /></button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="input" placeholder="e.g. Jane Smith" value={form.name} onChange={e => set("name", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="input" type="email" placeholder="jane@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="input" placeholder="+1 234 567 8900" value={form.phone} onChange={e => set("phone", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">GPA</label>
              <input className="input" type="number" step="0.01" min="0" max="4" placeholder="3.80" value={form.gpa} onChange={e => set("gpa", e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">University</label>
            <input className="input" placeholder="e.g. MIT" value={form.university} onChange={e => set("university", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Degree</label>
            <input className="input" placeholder="e.g. BSc Computer Science" value={form.degree} onChange={e => set("degree", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Skills (comma separated)</label>
            <input className="input" placeholder="React, Python, SQL" value={form.skills} onChange={e => set("skills", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="input" value={form.status} onChange={e => set("status", e.target.value)}>
              {["Active","Interview","Placed","Inactive"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : existing ? "Save Changes" : "Add Candidate"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Candidates() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [page,   setPage]   = useState(1);
  const [modal,  setModal]  = useState(false);
  const [editing, setEditing] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const toast = useToast();

  const fetchFn = useCallback(
    () => candidatesApi.list({ page, limit: 10, search, ...(status !== "All" && { status }) }),
    [page, search, status, refresh]
  );
  const { data, loading, error } = useApi(fetchFn, [page, search, status, refresh]);

  const candidates = data?.data || [];
  const pagination = data?.pagination;

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handleStatus = (s)  => { setStatus(s); setPage(1); };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this candidate?")) return;
    try {
      await candidatesApi.delete(id);
      toast("Candidate deleted");
      setRefresh(r=>r+1);
    } catch(e) { toast(e.message||"Failed to delete","error"); }
  };

  return (
    <div className="page-enter">
      {(modal || editing) && (
        <CandidateModal
          existing={editing}
          onClose={() => { setModal(false); setEditing(null); }}
          onSaved={() => setRefresh(r => r+1)}
        />
      )}

      <div className="page-header">
        <div>
          <div className="page-title">Candidates</div>
          <div className="page-subtitle">Browse and manage student candidates</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={13} /> Add Candidate</button>      </div>

      {pagination && (
        <div className="grid-4">
          {[
            { label: "Total Candidates", value: pagination.total },
            { label: "Active",  value: candidates.filter(c => c.status === "Active").length },
            { label: "Placed",  value: candidates.filter(c => c.status === "Placed").length },
            { label: "Avg GPA", value: candidates.length ? (candidates.reduce((s,c) => s+(c.gpa||0),0)/candidates.length).toFixed(2) : "—" },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div style={{ padding: "12px 16px", borderBottom: "var(--border)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
            <Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input className="input" style={{ paddingLeft: 28, fontSize: 12 }} placeholder="Search by name, university…"
              value={search} onChange={handleSearch} />
          </div>
          <div className="tabs">
            {["All","Active","Interview","Placed","Inactive"].map(s => (
              <button key={s} className={`tab ${status===s?"active":""}`} onClick={() => handleStatus(s)}>{s}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading candidates…</div>
        ) : error ? (
          <div style={{ padding: 24, textAlign: "center", color: "#e24b4a", fontSize: 13 }}>{error}</div>
        ) : candidates.length === 0 ? (
          <div className="empty-state"><p>No candidates found.</p></div>
        ) : (
          <>
            <table>
              <thead>
                <tr><th>Candidate</th><th>University</th><th>Skills</th><th>GPA</th><th>Status</th><th>Contact</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {candidates.map(c => (
                  <tr key={c._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="avatar" style={{ background: c.avatarColor, color: c.avatarTextColor }}>{c.initials}</div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 12.5 }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.degree}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>{c.university}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {(c.skills||[]).slice(0,3).map(s => <span key={s} className="badge badge-gray" style={{ fontSize: 10 }}>{s}</span>)}
                        {(c.skills||[]).length > 3 && <span className="badge badge-gray" style={{ fontSize: 10 }}>+{c.skills.length-3}</span>}
                      </div>
                    </td>
                    <td><span style={{ fontWeight: 600, color: c.gpa >= 3.8 ? "var(--primary)" : "var(--text)" }}>{c.gpa}</span></td>
                    <td><span className={`badge ${statusMap[c.status]||"badge-gray"}`}>{c.status}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <a href={`mailto:${c.email}`}><button className="btn btn-ghost" style={{ padding: "4px 7px" }}><Mail size={13} /></button></a>
                        {c.phone && <a href={`tel:${c.phone}`}><button className="btn btn-ghost" style={{ padding: "4px 7px" }}><Phone size={13} /></button></a>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn btn-ghost" style={{ padding: "4px 7px" }} title="Edit" onClick={() => setEditing(c)}><Edit2 size={13} /></button>
                        <button className="btn btn-ghost" style={{ padding: "4px 7px", color: "#e24b4a" }} title="Delete" onClick={() => handleDelete(c._id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pagination && (
              <div className="pagination">
                <span>Showing {candidates.length} of {pagination.total}</span>
                <div className="page-btns">
                  <button className="pg-btn" disabled={page<=1} onClick={() => setPage(p=>p-1)}>‹</button>
                  {Array.from({ length: pagination.pages }, (_,i) => (
                    <button key={i+1} className={`pg-btn ${page===i+1?"active":""}`} onClick={() => setPage(i+1)}>{i+1}</button>
                  ))}
                  <button className="pg-btn" disabled={page>=pagination.pages} onClick={() => setPage(p=>p+1)}>›</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
