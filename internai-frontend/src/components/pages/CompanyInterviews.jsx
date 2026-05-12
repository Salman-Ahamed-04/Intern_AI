import { useState, useCallback } from "react";
import { Calendar, Plus, Video, MapPin, Phone, X, Trash2, Edit2 } from "lucide-react";
import { useApi } from "../../lib/useApi";
import { interviewsApi, candidatesApi } from "../../lib/api";
import { useAuth } from "../../store/auth";
import { useToast } from "../../lib/toast";

const STATUSES = ["Scheduled", "Confirmed", "Pending", "Completed", "Cancelled"];
const statusMap = { Scheduled:"badge-blue", Confirmed:"badge-green", Pending:"badge-yellow", Completed:"badge-gray", Cancelled:"badge-red" };
const typeIcon = t => t === "Video" ? <Video size={12}/> : t === "Phone" ? <Phone size={12}/> : <MapPin size={12}/>;

function ScheduleModal({ onClose, onSaved, companyId }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const { data: candData } = useApi(() => candidatesApi.list({ limit: 200 }), []);
  const candidates = candData?.data || [];
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    candidateId:"", role:"", scheduledDate:today, scheduledTime:"10:00",
    type:"Video", interviewer:"", meetingLink:"", status:"Scheduled"
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.candidateId || !form.role) { toast("Candidate and role are required", "error"); return; }
    setSaving(true);
    try {
      await interviewsApi.create({ ...form, companyId });
      toast("Interview scheduled!");
      onSaved(); onClose();
    } catch (e) {
      toast(e.message || "Failed", "error");
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Schedule Interview</span>
          <button className="btn btn-ghost" style={{ padding:"4px 6px" }} onClick={onClose}><X size={15}/></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Candidate *</label>
            <select className="input" value={form.candidateId} onChange={e => set("candidateId", e.target.value)}>
              <option value="">Select candidate…</option>
              {candidates.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Role *</label>
              <input className="input" placeholder="e.g. Frontend Intern" value={form.role} onChange={e => set("role", e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="input" value={form.type} onChange={e => set("type", e.target.value)}>
                <option>Video</option><option>Onsite</option><option>Phone</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="input" type="date" value={form.scheduledDate} onChange={e => set("scheduledDate", e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input className="input" type="time" value={form.scheduledTime} onChange={e => set("scheduledTime", e.target.value)}/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Interviewer Name</label>
            <input className="input" placeholder="e.g. HR Manager" value={form.interviewer} onChange={e => set("interviewer", e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Meeting Link</label>
            <input className="input" placeholder="https://meet.google.com/…" value={form.meetingLink} onChange={e => set("meetingLink", e.target.value)}/>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Schedule"}</button>
        </div>
      </div>
    </div>
  );
}

export default function CompanyInterviews() {
  const { user } = useAuth();
  const toast = useToast();
  const [modal, setModal] = useState(false);
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);

  const fetchFn = useCallback(
    () => interviewsApi.list({ page, limit: 10, ...(status !== "All" && { status }) }),
    [page, status, refresh]
  );
  const { data, loading, error } = useApi(fetchFn, [page, status, refresh]);
  const interviews = (data?.data || []).filter(i =>
    String(i.companyId?._id || i.companyId) === String(user?.profileId)
  );
  const pagination = data?.pagination;

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this interview?")) return;
    try {
      await interviewsApi.delete(id);
      toast("Interview deleted");
      setRefresh(r => r + 1);
    } catch (e) { toast(e.message || "Failed", "error"); }
  };

  return (
    <div className="page-enter">
      {modal && <ScheduleModal companyId={user?.profileId} onClose={() => setModal(false)} onSaved={() => setRefresh(r => r+1)}/>}

      <div className="page-header">
        <div>
          <div className="page-title">Interviews</div>
          <div className="page-subtitle">Schedule and manage candidate interviews</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={13}/> Schedule Interview</button>
      </div>

      <div className="card">
        <div style={{ padding:"12px 16px", borderBottom:"var(--border)", display:"flex", alignItems:"center", gap:10 }}>
          <Calendar size={14} style={{ color:"var(--primary)" }}/>
          <span style={{ fontWeight:600, fontSize:13, flex:1 }}>All Interviews</span>
          <div className="tabs">
            {["All", ...STATUSES].map(s => (
              <button key={s} className={`tab ${status === s ? "active" : ""}`} onClick={() => { setStatus(s); setPage(1); }}>{s}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding:32, textAlign:"center", color:"var(--text-muted)", fontSize:13 }}>Loading...</div>
        ) : error ? (
          <div style={{ padding:24, textAlign:"center", color:"#e24b4a", fontSize:13 }}>{error}</div>
        ) : interviews.length === 0 ? (
          <div className="empty-state"><p>No interviews found.</p></div>
        ) : (
          <table>
            <thead><tr><th>Candidate</th><th>Role</th><th>Date and Time</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {interviews.map(i => (
                <tr key={i._id}>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div className="avatar" style={{ background:i.candidateId?.avatarColor, color:i.candidateId?.avatarTextColor }}>{i.candidateId?.initials}</div>
                      <span style={{ fontWeight:500, fontSize:12.5 }}>{i.candidateId?.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize:12 }}>{i.role}</td>
                  <td style={{ fontSize:12, color:"var(--text-secondary)" }}>{i.scheduledDate} at {i.scheduledTime}</td>
                  <td><span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:12 }}>{typeIcon(i.type)} {i.type}</span></td>
                  <td>
                    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                      <span className={`badge ${statusMap[i.status] || "badge-gray"}`}>{i.status}</span>
                      {i.meetingLink && <a href={i.meetingLink} target="_blank" rel="noreferrer" style={{ fontSize:10, color:"var(--primary)" }}>Join</a>}
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-ghost" style={{ padding:"4px 7px", color:"#e24b4a" }} onClick={() => handleDelete(i._id)}><Trash2 size={13}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
