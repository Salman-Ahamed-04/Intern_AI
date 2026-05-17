import Portal from "../../lib/Portal";
import { useState, useCallback } from "react";
import { Search, Plus, X, Trash2, Edit2 } from "lucide-react";
import { useApi } from "../../lib/useApi";
import { applicationsApi, candidatesApi, companiesApi } from "../../lib/api";
import { useToast } from "../../lib/toast";

const STATUSES = ["Applied", "In Review", "Interview", "Offer Sent", "Rejected"];
const statusMap = { "Applied":"badge-blue","In Review":"badge-yellow","Interview":"badge-green","Offer Sent":"badge-green","Rejected":"badge-red" };

function AppModal({ onClose, onSaved, existing }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const { data: candData } = useApi(() => candidatesApi.list({ limit: 200 }), []);
  const { data: compData } = useApi(() => companiesApi.list({ limit: 200 }), []);
  const candidates = candData?.data || [];
  const companies  = compData?.data || [];

  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState(existing ? {
    candidateId: existing.candidateId?._id || existing.candidateId,
    companyId:   existing.companyId?._id   || existing.companyId,
    role:        existing.role,
    appliedDate: existing.appliedDate,
    notes:       existing.notes || "",
    status:      existing.status,
  } : { candidateId:"", companyId:"", role:"", appliedDate: today, notes:"", status:"Applied" });

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSave = async () => {
    if (!form.candidateId || !form.companyId || !form.role) { toast("Candidate, company and role are required","error"); return; }
    setSaving(true);
    try {
      if (existing) {
        await applicationsApi.update(existing._id, form);
        toast("Application updated!");
      } else {
        await applicationsApi.create(form);
        toast("Application created!");
      }
      onSaved(); onClose();
    } catch(e) {
      toast(e.message||"Failed","error");
    } finally { setSaving(false); }
  };

  return (
    <Portal><div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{existing ? "Edit Application" : "New Application"}</span>
          <button className="btn btn-ghost" style={{padding:"4px 6px"}} onClick={onClose}><X size={15}/></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Candidate *</label>
            <select className="input" value={form.candidateId} onChange={e=>set("candidateId",e.target.value)}>
              <option value="">Select candidate…</option>
              {candidates.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Company *</label>
            <select className="input" value={form.companyId} onChange={e=>set("companyId",e.target.value)}>
              <option value="">Select company…</option>
              {companies.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Role *</label>
              <input className="input" placeholder="e.g. Data Analyst Intern" value={form.role} onChange={e=>set("role",e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Applied Date</label>
              <input className="input" type="date" value={form.appliedDate} onChange={e=>set("appliedDate",e.target.value)}/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="input" value={form.status} onChange={e=>set("status",e.target.value)}>
              {STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="input" rows={3} placeholder="Any additional notes…" value={form.notes} onChange={e=>set("notes",e.target.value)} style={{resize:"vertical"}}/>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?"Saving…": existing ? "Save Changes" : "Create Application"}</button>
        </div>
      </div>
    </div></Portal>
  );
}

export default function Applications() {
  const [search,  setSearch]  = useState("");
  const [status,  setStatus]  = useState("All");
  const [page,    setPage]    = useState(1);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const toast = useToast();

  const fetchFn = useCallback(
    () => applicationsApi.list({ page, limit: 10, search, ...(status!=="All"&&{status}) }),
    [page, search, status, refresh]
  );
  const { data, loading, error } = useApi(fetchFn, [page, search, status, refresh]);
  const applications = data?.data || [];
  const pagination   = data?.pagination;

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this application?")) return;
    try {
      await applicationsApi.delete(id);
      toast("Application deleted");
      setRefresh(r=>r+1);
    } catch(e) { toast(e.message||"Failed to delete","error"); }
  };

  return (
    <div className="page-enter">
      {(modal || editing) && (
        <AppModal
          existing={editing}
          onClose={()=>{ setModal(false); setEditing(null); }}
          onSaved={()=>setRefresh(r=>r+1)}
        />
      )}

      <div className="page-header">
        <div>
          <div className="page-title">Applications</div>
          <div className="page-subtitle">Track and manage internship applications</div>
        </div>
        <button className="btn btn-primary" onClick={()=>setModal(true)}><Plus size={13}/> New Application</button>
      </div>

      <div className="card">
        <div style={{padding:"12px 16px",borderBottom:"var(--border)",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <div style={{position:"relative",flex:1,minWidth:180}}>
            <Search size={13} style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"var(--text-muted)"}}/>
            <input className="input" style={{paddingLeft:28,fontSize:12}} placeholder="Search by candidate, company, role…"
              value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/>
          </div>
          <div className="tabs">
            {["All",...STATUSES].map(s=>(
              <button key={s} className={`tab ${status===s?"active":""}`} onClick={()=>{setStatus(s);setPage(1);}}>{s}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{padding:32,textAlign:"center",color:"var(--text-muted)",fontSize:13}}>Loading applications…</div>
        ) : error ? (
          <div style={{padding:24,textAlign:"center",color:"#e24b4a",fontSize:13}}>{error}</div>
        ) : applications.length===0 ? (
          <div className="empty-state"><p>No applications found.</p></div>
        ) : (
          <>
            <table>
              <thead><tr><th>Candidate</th><th>Company</th><th>Role</th><th>Applied</th><th>Notes</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {applications.map(a=>(
                  <tr key={a._id}>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div className="avatar" style={{background:a.candidateId?.avatarColor,color:a.candidateId?.avatarTextColor}}>{a.candidateId?.initials}</div>
                        <div>
                          <div style={{fontWeight:500,fontSize:12.5}}>{a.candidateId?.name}</div>
                          <div style={{fontSize:11,color:"var(--text-muted)"}}>{a.candidateId?.university}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{fontSize:12,color:"var(--text-secondary)"}}>{a.companyId?.name}</td>
                    <td style={{fontSize:12}}>{a.role}</td>
                    <td style={{fontSize:12,color:"var(--text-muted)"}}>{a.appliedDate}</td>
                    <td style={{fontSize:12,color:"var(--text-muted)",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.notes||"—"}</td>
                    <td><span className={`badge ${statusMap[a.status]||"badge-gray"}`}>{a.status}</span></td>
                    <td>
                      <div style={{display:"flex",gap:4}}>
                        <button className="btn btn-ghost" style={{padding:"4px 7px"}} title="Edit" onClick={()=>setEditing(a)}><Edit2 size={13}/></button>
                        <button className="btn btn-ghost" style={{padding:"4px 7px",color:"#e24b4a"}} title="Delete" onClick={()=>handleDelete(a._id)}><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pagination && (
              <div className="pagination">
                <span>Showing {applications.length} of {pagination.total}</span>
                <div className="page-btns">
                  <button className="pg-btn" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>‹</button>
                  {Array.from({length:pagination.pages},(_,i)=>(
                    <button key={i+1} className={`pg-btn ${page===i+1?"active":""}`} onClick={()=>setPage(i+1)}>{i+1}</button>
                  ))}
                  <button className="pg-btn" disabled={page>=pagination.pages} onClick={()=>setPage(p=>p+1)}>›</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
