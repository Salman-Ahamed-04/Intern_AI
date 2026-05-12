import { useState, useCallback } from "react";
import { Zap, Plus, X } from "lucide-react";
import { useApi } from "../../lib/useApi";
import { matchesApi, candidatesApi, companiesApi } from "../../lib/api";
import { useToast } from "../../lib/toast";

const statusMap = { "In Review":"badge-yellow","Interview":"badge-green","Applied":"badge-blue","Offer Sent":"badge-green","Rejected":"badge-red" };
const scoreColor = (s) => s >= 85 ? "#1a9e75" : s >= 70 ? "#f0992b" : "#e24b4a";

function AddMatchModal({ onClose, onSaved }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const { data: candData } = useApi(() => candidatesApi.list({ limit: 100 }), []);
  const { data: compData } = useApi(() => companiesApi.list({ limit: 100 }), []);
  const candidates = candData?.data || [];
  const companies  = compData?.data || [];

  const [form, setForm] = useState({ candidateId:"", companyId:"", role:"", aiScore:75, matchedSkills:"", status:"In Review" });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSave = async () => {
    if (!form.candidateId || !form.companyId || !form.role) { toast("Candidate, company and role are required","error"); return; }
    setSaving(true);
    try {
      await matchesApi.create({
        ...form,
        aiScore: parseInt(form.aiScore)||75,
        matchedSkills: form.matchedSkills.split(",").map(s=>s.trim()).filter(Boolean)
      });
      toast("Match created successfully!");
      onSaved(); onClose();
    } catch(e) {
      toast(e.message||"Failed to create match","error");
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Create New Match</span>
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
              <input className="input" placeholder="e.g. Frontend Intern" value={form.role} onChange={e=>set("role",e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">AI Score (0–100)</label>
              <input className="input" type="number" min="0" max="100" value={form.aiScore} onChange={e=>set("aiScore",e.target.value)}/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Matched Skills (comma separated)</label>
            <input className="input" placeholder="React, TypeScript" value={form.matchedSkills} onChange={e=>set("matchedSkills",e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="input" value={form.status} onChange={e=>set("status",e.target.value)}>
              {["In Review","Applied","Interview","Offer Sent","Rejected"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?"Saving…":"Create Match"}</button>
        </div>
      </div>
    </div>
  );
}

export default function Matches() {
  const [status,  setStatus]  = useState("All");
  const [page,    setPage]    = useState(1);
  const [modal,   setModal]   = useState(false);
  const [refresh, setRefresh] = useState(0);

  const fetchFn = useCallback(
    () => matchesApi.list({ page, limit: 10, ...(status!=="All"&&{status}) }),
    [page, status, refresh]
  );
  const { data, loading, error } = useApi(fetchFn, [page, status, refresh]);
  const matches    = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="page-enter">
      {modal && <AddMatchModal onClose={()=>setModal(false)} onSaved={()=>setRefresh(r=>r+1)}/>}

      <div className="page-header">
        <div>
          <div className="page-title">AI Matches</div>
          <div className="page-subtitle">Candidate-company matches powered by AI scoring</div>
        </div>
        <button className="btn btn-primary" onClick={()=>setModal(true)}><Plus size={13}/> New Match</button>
      </div>

      <div className="card">
        <div style={{padding:"12px 16px",borderBottom:"var(--border)",display:"flex",alignItems:"center",gap:10}}>
          <Zap size={14} style={{color:"var(--primary)"}}/>
          <span style={{fontWeight:600,fontSize:13,flex:1}}>All Matches</span>
          <div className="tabs">
            {["All","In Review","Interview","Offer Sent","Rejected"].map(s=>(
              <button key={s} className={`tab ${status===s?"active":""}`} onClick={()=>{setStatus(s);setPage(1);}}>{s}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{padding:32,textAlign:"center",color:"var(--text-muted)",fontSize:13}}>Loading matches…</div>
        ) : error ? (
          <div style={{padding:24,textAlign:"center",color:"#e24b4a",fontSize:13}}>{error}</div>
        ) : matches.length===0 ? (
          <div className="empty-state"><p>No matches found.</p></div>
        ) : (
          <>
            <table>
              <thead><tr><th>Candidate</th><th>Company</th><th>Role</th><th>AI Score</th><th>Matched Skills</th><th>Status</th></tr></thead>
              <tbody>
                {matches.map(m=>(
                  <tr key={m._id}>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div className="avatar" style={{background:m.candidateId?.avatarColor,color:m.candidateId?.avatarTextColor}}>{m.candidateId?.initials}</div>
                        <div>
                          <div style={{fontWeight:500,fontSize:12.5}}>{m.candidateId?.name}</div>
                          <div style={{fontSize:11,color:"var(--text-muted)"}}>{m.candidateId?.degree}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{fontSize:12,color:"var(--text-secondary)"}}>{m.companyId?.name}</td>
                    <td style={{fontSize:12}}>{m.role}</td>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:50,height:5,borderRadius:3,background:"var(--border-color)",overflow:"hidden"}}>
                          <div style={{width:`${m.aiScore}%`,height:"100%",background:scoreColor(m.aiScore),borderRadius:3}}/>
                        </div>
                        <span style={{fontWeight:700,fontSize:12,color:scoreColor(m.aiScore)}}>{m.aiScore}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        {(m.matchedSkills||[]).map(s=><span key={s} className="badge badge-gray" style={{fontSize:10}}>{s}</span>)}
                      </div>
                    </td>
                    <td><span className={`badge ${statusMap[m.status]||"badge-gray"}`}>{m.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pagination && (
              <div className="pagination">
                <span>Showing {matches.length} of {pagination.total}</span>
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
