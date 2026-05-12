import { useState, useCallback } from "react";
import { Plus, X, Edit2, Trash2, ImageIcon, MapPin, Clock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../lib/useApi";
import { internshipsApi } from "../../lib/api";
import { useAuth } from "../../store/auth";
import { useToast } from "../../lib/toast";

const statusMap = { Open:"badge-green", Closed:"badge-gray" };
const typeColor = { Remote:"badge-blue", "On-site":"badge-green", Hybrid:"badge-purple" };

function InternshipModal({ onClose, onSaved, existing, companyId }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(existing?.imageUrl || null);
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState({
    title:        existing?.title        || "",
    description:  existing?.description  || "",
    requirements: existing?.requirements || "",
    location:     existing?.location     || "",
    type:         existing?.type         || "On-site",
    duration:     existing?.duration     || "",
    stipend:      existing?.stipend      || "",
    skills:       (existing?.skills || []).join(", "),
    deadline:     existing?.deadline     || "",
    status:       existing?.status       || "Open",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.title) { toast("Title is required", "error"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append("image", imageFile);

      if (existing) {
        await internshipsApi.update(existing._id, fd);
        toast("Internship updated!");
      } else {
        await internshipsApi.create(fd);
        toast("Internship posted!");
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
      <div className="modal" style={{ maxWidth:600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{existing ? "Edit Internship" : "Post New Internship"}</span>
          <button className="btn btn-ghost" style={{ padding:"4px 6px" }} onClick={onClose}><X size={15}/></button>
        </div>
        <div className="modal-body">
          {/* Image upload */}
          <div className="form-group">
            <label className="form-label">Banner Image (optional)</label>
            <label style={{
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              border:"2px dashed var(--border-color)", borderRadius:8, padding:16, cursor:"pointer",
              background: preview ? "transparent" : "var(--surface-2)", overflow:"hidden", minHeight:120,
              position:"relative"
            }}>
              {preview ? (
                <img src={preview} alt="preview" style={{ width:"100%", maxHeight:180, objectFit:"cover", borderRadius:6 }}/>
              ) : (
                <>
                  <ImageIcon size={28} style={{ color:"var(--text-muted)", marginBottom:8 }}/>
                  <span style={{ fontSize:12, color:"var(--text-muted)" }}>Click to upload image (JPG, PNG, max 5MB)</span>
                </>
              )}
              <input type="file" accept="image/*" style={{ display:"none" }} onChange={handleImage}/>
            </label>
            {preview && (
              <button className="btn btn-ghost" style={{ fontSize:11, marginTop:4, color:"#e24b4a" }}
                onClick={() => { setPreview(null); setImageFile(null); }}>
                Remove image
              </button>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Job Title *</label>
            <input className="input" placeholder="e.g. Frontend Developer Intern" value={form.title} onChange={e => set("title", e.target.value)}/>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="input" placeholder="e.g. Colombo, Sri Lanka" value={form.location} onChange={e => set("location", e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Work Type</label>
              <select className="input" value={form.type} onChange={e => set("type", e.target.value)}>
                <option>On-site</option><option>Remote</option><option>Hybrid</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Duration</label>
              <input className="input" placeholder="e.g. 3 months" value={form.duration} onChange={e => set("duration", e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Stipend</label>
              <input className="input" placeholder="e.g. $500/month or Unpaid" value={form.stipend} onChange={e => set("stipend", e.target.value)}/>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Application Deadline</label>
              <input className="input" type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="input" value={form.status} onChange={e => set("status", e.target.value)}>
                <option>Open</option><option>Closed</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Required Skills (comma separated)</label>
            <input className="input" placeholder="React, Node.js, MongoDB" value={form.skills} onChange={e => set("skills", e.target.value)}/>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="input" rows={4} placeholder="Describe the internship role, responsibilities…"
              value={form.description} onChange={e => set("description", e.target.value)} style={{ resize:"vertical" }}/>
          </div>

          <div className="form-group">
            <label className="form-label">Requirements</label>
            <textarea className="input" rows={3} placeholder="What qualifications or experience is needed…"
              value={form.requirements} onChange={e => set("requirements", e.target.value)} style={{ resize:"vertical" }}/>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Posting..." : existing ? "Save Changes" : "Post Internship"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PostInternship() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const fetchFn = useCallback(
    () => internshipsApi.list({ companyId: user?.profileId, status: "All", limit: 50 }),
    [refresh, user?.profileId]
  );
  const { data, loading, error } = useApi(fetchFn, [refresh]);
  const internships = data?.data || [];

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this internship posting?")) return;
    try {
      await internshipsApi.delete(id);
      toast("Internship deleted");
      setRefresh(r => r + 1);
    } catch (e) {
      toast(e.message || "Failed", "error");
    }
  };

  return (
    <div className="page-enter">
      {(modal || editing) && (
        <InternshipModal
          existing={editing}
          companyId={user?.profileId}
          onClose={() => { setModal(false); setEditing(null); }}
          onSaved={() => setRefresh(r => r + 1)}
        />
      )}

      <div className="page-header">
        <div>
          <div className="page-title">My Internship Posts</div>
          <div className="page-subtitle">Create and manage your internship advertisements</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={13}/> Post Internship</button>
      </div>

      {loading ? (
        <div style={{ padding:32, textAlign:"center", color:"var(--text-muted)", fontSize:13 }}>Loading...</div>
      ) : error ? (
        <div style={{ padding:24, textAlign:"center", color:"#e24b4a", fontSize:13 }}>{error}</div>
      ) : internships.length === 0 ? (
        <div className="empty-state" style={{ marginTop:40 }}>
          <p>No internships posted yet.</p>
          <button className="btn btn-primary" style={{ marginTop:12 }} onClick={() => setModal(true)}>Post your first internship</button>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:16 }}>
          {internships.map(i => (
            <div key={i._id} className="card" style={{ overflow:"hidden" }}>
              {i.imageUrl && (
                <img src={i.imageUrl} alt={i.title} style={{ width:"100%", height:90, objectFit:"cover", cursor:"pointer" }}
                  onClick={() => navigate(`/internship/${i._id}`)}/>
              )}
              <div style={{ padding:14 }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:6 }}>
                  <div style={{ fontWeight:600, fontSize:13, flex:1, cursor:"pointer", lineHeight:1.3 }}
                    onClick={() => navigate(`/internship/${i._id}`)}>
                    {i.title}
                  </div>
                  <span className={`badge ${statusMap[i.status] || "badge-gray"}`} style={{ marginLeft:8, flexShrink:0 }}>{i.status}</span>
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
                  {i.type && <span className={`badge ${typeColor[i.type] || "badge-gray"}`} style={{ fontSize:10 }}>{i.type}</span>}
                  {i.location && <span style={{ fontSize:10, color:"var(--text-secondary)", display:"flex", alignItems:"center", gap:2 }}><MapPin size={9}/>{i.location}</span>}
                  {i.duration && <span style={{ fontSize:10, color:"var(--text-secondary)", display:"flex", alignItems:"center", gap:2 }}><Clock size={9}/>{i.duration}</span>}
                </div>
                {i.stipend && <div style={{ fontSize:11, color:"var(--primary)", fontWeight:600, marginBottom:6 }}>{i.stipend}</div>}
                <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:10 }}>
                  {(i.skills || []).slice(0,3).map(s => <span key={s} className="badge badge-gray" style={{ fontSize:10 }}>{s}</span>)}
                  {(i.skills||[]).length > 3 && <span className="badge badge-gray" style={{ fontSize:10 }}>+{i.skills.length-3}</span>}
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:"var(--border)", paddingTop:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"var(--text-muted)" }}>
                    <Users size={11}/> {i.applicants} applicant{i.applicants !== 1 ? "s" : ""}
                    {i.deadline && <span style={{ marginLeft:6 }}>· Due {i.deadline}</span>}
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    <button className="btn btn-ghost" style={{ padding:"4px 8px" }} onClick={() => setEditing(i)}><Edit2 size={13}/></button>
                    <button className="btn btn-ghost" style={{ padding:"4px 8px", color:"#e24b4a" }} onClick={() => handleDelete(i._id)}><Trash2 size={13}/></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
