import Portal from "../../lib/Portal";
import { useState, useCallback } from "react";
import { Zap, Plus, X, Trash2, Edit2, Brain, RefreshCw, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { useApi } from "../../lib/useApi";
import { matchesApi, candidatesApi, companiesApi, prologApi } from "../../lib/api";
import { useToast } from "../../lib/toast";

const STATUSES = ["In Review", "Applied", "Interview", "Offer Sent", "Rejected"];
const statusMap = { "In Review":"badge-yellow","Interview":"badge-green","Applied":"badge-blue","Offer Sent":"badge-green","Rejected":"badge-red" };
const scoreColor = (s) => s >= 85 ? "#1a9e75" : s >= 70 ? "#f0992b" : "#e24b4a";
const scoreBg    = (s) => s >= 85 ? "rgba(26,158,117,0.1)" : s >= 70 ? "rgba(240,153,43,0.1)" : "rgba(226,75,74,0.1)";

// ─── AI Run Modal ─────────────────────────────────────────────────────────────
function AIRunModal({ onClose, onDone }) {
  const toast = useToast();
  const { data: candData } = useApi(() => candidatesApi.list({ limit: 200 }), []);
  const candidates = candData?.data || [];
  const [mode,        setMode]        = useState("single"); // "single" | "all"
  const [candidateId, setCandidateId] = useState("");
  const [running,     setRunning]     = useState(false);
  const [result,      setResult]      = useState(null);

  const run = async () => {
    setRunning(true); setResult(null);
    try {
      let res;
      if (mode === "all") {
        res = await prologApi.matchAll();
        if (!res.processed) toast("No open internships found. Add internships first.", "error");
        else toast("✅ Batch complete — " + res.totalMatches + " matches saved");
      } else {
        if (!candidateId) { toast("Select a candidate", "error"); setRunning(false); return; }
        res = await prologApi.matchCandidate(candidateId);
        if (res.totalInternships === 0) {
          toast("❌ No internships in DB. Run the seed or add internships first.", "error");
        } else if (res.matchCount === 0) {
          toast("No skill overlap found. Check candidate skills vs internship requirements.", "error");
        } else {
          toast("✅ " + res.matchCount + " matches found for " + res.candidate?.name);
        }
      }
      setResult(res);
      onDone();
    } catch (e) {
      toast(e.message || "Prolog engine error", "error");
    } finally { setRunning(false); }
  };

  return (
    <Portal><div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Brain size={16} style={{ color:"var(--primary)" }}/>
            <span className="modal-title">Run Prolog AI Matching</span>
          </div>
          <button className="btn btn-ghost" style={{padding:"4px 6px"}} onClick={onClose}><X size={15}/></button>
        </div>

        <div className="modal-body">
          {/* Info banner */}
          <div style={{ background:"rgba(26,158,117,0.07)", border:"1px solid rgba(26,158,117,0.2)", borderRadius:8, padding:"10px 14px", fontSize:12, color:"var(--text-secondary)", lineHeight:1.6 }}>
            <strong style={{color:"var(--primary)"}}>How it works:</strong> Your Prolog rules run against live MongoDB data.
            Skills from each candidate are matched against internship requirements using
            <code style={{background:"rgba(0,0,0,0.06)",padding:"1px 5px",borderRadius:4,margin:"0 3px"}}>match_score/3</code>,
            <code style={{background:"rgba(0,0,0,0.06)",padding:"1px 5px",borderRadius:4,margin:"0 3px"}}>skill_gap/3</code>, and
            <code style={{background:"rgba(0,0,0,0.06)",padding:"1px 5px",borderRadius:4,margin:"0 3px"}}>matched_skills/3</code>.
            Results are saved back to the Matches collection.
          </div>

          {/* Mode select */}
          <div className="form-group">
            <label className="form-label">Matching Mode</label>
            <div style={{ display:"flex", gap:8 }}>
              {[["single","Single Candidate"],["all","All Active Candidates"]].map(([v,l])=>(
                <button key={v} onClick={()=>setMode(v)} style={{
                  flex:1, padding:"9px 12px", borderRadius:8, cursor:"pointer", fontSize:12.5, fontWeight:500,
                  border: mode===v ? "2px solid var(--primary)" : "var(--border)",
                  background: mode===v ? "rgba(26,158,117,0.08)" : "var(--surface-2)",
                  color: mode===v ? "var(--primary)" : "var(--text-secondary)",
                  transition:"all 0.15s",
                }}>
                  {v==="single" ? "🎯" : "⚡"} {l}
                </button>
              ))}
            </div>
          </div>

          {mode === "single" && (
            <div className="form-group">
              <label className="form-label">Select Candidate</label>
              <select className="input" value={candidateId} onChange={e=>setCandidateId(e.target.value)}>
                <option value="">Choose a candidate…</option>
                {candidates.map(c=>(
                  <option key={c._id} value={c._id}>
                    {c.name} — {(c.skills||[]).slice(0,3).join(", ")}{c.skills?.length>3 ? "…" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Results */}
          {result && (
            <div style={{ background:"var(--surface-2)", borderRadius:8, padding:12, maxHeight:220, overflowY:"auto" }}>
              {mode === "single" && result.totalInternships === 0 && (
                <div style={{textAlign:"center",padding:"12px 0"}}>
                  <div style={{fontSize:22,marginBottom:6}}>⚠️</div>
                  <div style={{fontSize:12.5,fontWeight:600,color:"#f0992b",marginBottom:4}}>No Internships in Database</div>
                  <div style={{fontSize:11.5,color:"var(--text-muted)",lineHeight:1.6}}>
                    Run <code style={{background:"rgba(0,0,0,0.08)",padding:"1px 5px",borderRadius:4}}>npm run seed</code> in your backend,
                    or add internships manually via the Internships section.
                  </div>
                </div>
              )}
              {mode === "single" && result.totalInternships > 0 && result.matchCount === 0 && (
                <div style={{textAlign:"center",padding:"12px 0"}}>
                  <div style={{fontSize:22,marginBottom:6}}>🔍</div>
                  <div style={{fontSize:12.5,fontWeight:600,color:"#e24b4a",marginBottom:4}}>No Skill Overlap Found</div>
                  <div style={{fontSize:11.5,color:"var(--text-muted)",lineHeight:1.6}}>
                    Checked <strong>{result.totalInternships}</strong> internship{result.totalInternships!==1?"s":""}.
                    Candidate skills: <strong>{(result.candidate?.skills||[]).join(", ") || "none"}</strong>.
                    Add more skills to the candidate profile or internship requirements.
                  </div>
                </div>
              )}
              {mode === "single" && result.matchCount > 0 ? (
                <>
                  <div style={{ fontSize:12, fontWeight:600, marginBottom:8, color:"var(--text-secondary)" }}>
                    {result.matchCount} matches found for <strong>{result.candidate?.name}</strong>
                  </div>
                  {(result.data||[]).map(r=>(
                    <div key={r.internshipId} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 0", borderBottom:"var(--border)", fontSize:12 }}>
                      <div>
                        <div style={{fontWeight:500}}>{r.internshipTitle}</div>
                        <div style={{color:"var(--text-muted)",fontSize:11}}>
                          ✅ {r.matchedSkills.join(", ") || "none"} &nbsp;
                          {r.skillGap.length > 0 && <span style={{color:"#e24b4a"}}>❌ missing: {r.skillGap.join(", ")}</span>}
                        </div>
                      </div>
                      <span style={{ fontWeight:700, color:scoreColor(r.score), background:scoreBg(r.score), padding:"2px 8px", borderRadius:12, fontSize:12 }}>{r.score}%</span>
                    </div>
                  ))}
                </>
              ) : null}
              {mode === "single" ? null : (
                <>
                  <div style={{ fontSize:12, fontWeight:600, marginBottom:8, color:"var(--text-secondary)" }}>
                    Processed {result.processed} candidates → {result.totalMatches} matches saved
                  </div>
                  {(result.summary||[]).map(s=>(
                    <div key={s.candidateId} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", fontSize:12, borderBottom:"var(--border)" }}>
                      <span>{s.name}</span>
                      <span style={{color:"var(--primary)",fontWeight:600}}>{s.matchCount} match{s.matchCount!==1?"es":""}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={run} disabled={running} style={{gap:6,display:"flex",alignItems:"center"}}>
            {running ? <><RefreshCw size={13} style={{animation:"spin 1s linear infinite"}}/> Running…</> : <><Brain size={13}/> Run Prolog Match</>}
          </button>
        </div>
      </div>
    </div></Portal>
  );
}

// ─── Manual Create/Edit Modal ─────────────────────────────────────────────────
function MatchModal({ onClose, onSaved, existing }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const { data: candData } = useApi(() => candidatesApi.list({ limit: 200 }), []);
  const { data: compData } = useApi(() => companiesApi.list({ limit: 200 }), []);
  const candidates = candData?.data || [];
  const companies  = compData?.data || [];

  const [form, setForm] = useState(existing ? {
    candidateId:   existing.candidateId?._id || existing.candidateId,
    companyId:     existing.companyId?._id   || existing.companyId,
    role:          existing.role,
    aiScore:       existing.aiScore,
    matchedSkills: (existing.matchedSkills||[]).join(", "),
    status:        existing.status,
  } : { candidateId:"", companyId:"", role:"", aiScore:75, matchedSkills:"", status:"In Review" });

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSave = async () => {
    if (!form.candidateId || !form.companyId || !form.role) { toast("Candidate, company and role are required","error"); return; }
    setSaving(true);
    try {
      const payload = { ...form, aiScore: parseInt(form.aiScore)||75, matchedSkills: form.matchedSkills.split(",").map(s=>s.trim()).filter(Boolean) };
      if (existing) { await matchesApi.update(existing._id, payload); toast("Match updated!"); }
      else           { await matchesApi.create(payload); toast("Match created!"); }
      onSaved(); onClose();
    } catch(e) { toast(e.message||"Failed","error"); }
    finally { setSaving(false); }
  };

  return (
    <Portal><div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{existing ? "Edit Match" : "Create New Match"}</span>
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
              {STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?"Saving…": existing ? "Save Changes" : "Create Match"}</button>
        </div>
      </div>
    </div></Portal>
  );
}

// ─── Match Row — expandable skill detail ──────────────────────────────────────
function MatchRow({ m, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const gap = m.skillGap || [];

  return (
    <>
      <tr style={{ cursor:"pointer" }} onClick={()=>setExpanded(e=>!e)}>
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
            <span style={{fontWeight:700,fontSize:12,color:scoreColor(m.aiScore),background:scoreBg(m.aiScore),padding:"1px 6px",borderRadius:8}}>{m.aiScore}%</span>
          </div>
        </td>
        <td>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {(m.matchedSkills||[]).slice(0,3).map(s=><span key={s} className="badge badge-gray" style={{fontSize:10}}>{s}</span>)}
            {(m.matchedSkills||[]).length > 3 && <span className="badge badge-gray" style={{fontSize:10}}>+{m.matchedSkills.length-3}</span>}
          </div>
        </td>
        <td><span className={`badge ${statusMap[m.status]||"badge-gray"}`}>{m.status}</span></td>
        <td>
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            <button className="btn btn-ghost" style={{padding:"4px 7px"}} title="Edit" onClick={e=>{e.stopPropagation();onEdit(m)}}><Edit2 size={13}/></button>
            <button className="btn btn-ghost" style={{padding:"4px 7px",color:"#e24b4a"}} title="Delete" onClick={e=>{e.stopPropagation();onDelete(m._id)}}><Trash2 size={13}/></button>
            {expanded ? <ChevronUp size={13} style={{color:"var(--text-muted)"}}/> : <ChevronDown size={13} style={{color:"var(--text-muted)"}}/> }
          </div>
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={7} style={{padding:"0 16px 12px",background:"var(--surface-2)"}}>
            <div style={{display:"flex",gap:24,padding:"10px 0",fontSize:12}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,marginBottom:6,color:"var(--primary)",fontSize:11,textTransform:"uppercase",letterSpacing:"0.5px"}}>✅ Matched Skills</div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {(m.matchedSkills||[]).length
                    ? (m.matchedSkills||[]).map(s=><span key={s} style={{background:"rgba(26,158,117,0.12)",color:"#1a9e75",padding:"3px 8px",borderRadius:12,fontSize:11,fontWeight:500}}>{s}</span>)
                    : <span style={{color:"var(--text-muted)"}}>None</span>}
                </div>
              </div>
              {gap.length > 0 && (
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,marginBottom:6,color:"#e24b4a",fontSize:11,textTransform:"uppercase",letterSpacing:"0.5px"}}>❌ Skill Gap</div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    {gap.map(s=><span key={s} style={{background:"rgba(226,75,74,0.1)",color:"#e24b4a",padding:"3px 8px",borderRadius:12,fontSize:11,fontWeight:500}}>{s}</span>)}
                  </div>
                </div>
              )}
              <div>
                <div style={{fontWeight:600,marginBottom:6,color:"var(--text-muted)",fontSize:11,textTransform:"uppercase",letterSpacing:"0.5px"}}>Score</div>
                <div style={{fontSize:22,fontWeight:800,color:scoreColor(m.aiScore)}}>{m.aiScore}<span style={{fontSize:13,fontWeight:400}}>%</span></div>
                <div style={{fontSize:10,color:"var(--text-muted)"}}>Prolog AI Score</div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Matches() {
  const [status,    setStatus]    = useState("All");
  const [page,      setPage]      = useState(1);
  const [modal,     setModal]     = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [aiModal,   setAiModal]   = useState(false);
  const [refresh,   setRefresh]   = useState(0);
  const toast = useToast();

  const fetchFn = useCallback(
    () => matchesApi.list({ page, limit: 10, ...(status!=="All"&&{status}) }),
    [page, status, refresh]
  );
  const { data, loading, error } = useApi(fetchFn, [page, status, refresh]);
  const matches    = data?.data || [];
  const pagination = data?.pagination;

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this match?")) return;
    try { await matchesApi.delete(id); toast("Match deleted"); setRefresh(r=>r+1); }
    catch(e) { toast(e.message||"Failed to delete","error"); }
  };

  return (
    <div className="page-enter">
      {(modal || editing) && <MatchModal existing={editing} onClose={()=>{ setModal(false); setEditing(null); }} onSaved={()=>setRefresh(r=>r+1)}/>}
      {aiModal && <AIRunModal onClose={()=>setAiModal(false)} onDone={()=>setRefresh(r=>r+1)}/>}

      <div className="page-header">
        <div>
          <div className="page-title">AI Matches</div>
          <div className="page-subtitle">Candidate-company matches powered by Prolog AI scoring</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn" style={{display:"flex",alignItems:"center",gap:6,border:"1px solid var(--primary)",color:"var(--primary)"}} onClick={()=>setAiModal(true)}>
            <Brain size={13}/> Run AI Match
          </button>
          <button className="btn btn-primary" onClick={()=>setModal(true)}><Plus size={13}/> New Match</button>
        </div>
      </div>

      <div className="card">
        <div style={{padding:"12px 16px",borderBottom:"var(--border)",display:"flex",alignItems:"center",gap:10}}>
          <Zap size={14} style={{color:"var(--primary)"}}/>
          <span style={{fontWeight:600,fontSize:13,flex:1}}>All Matches</span>
          <div className="tabs">
            {["All",...STATUSES].map(s=>(
              <button key={s} className={`tab ${status===s?"active":""}`} onClick={()=>{setStatus(s);setPage(1);}}>{s}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{padding:32,textAlign:"center",color:"var(--text-muted)",fontSize:13}}>Loading matches…</div>
        ) : error ? (
          <div style={{padding:24,textAlign:"center",color:"#e24b4a",fontSize:13}}>{error}</div>
        ) : matches.length===0 ? (
          <div className="empty-state">
            <Brain size={32} style={{color:"var(--text-muted)",marginBottom:8}}/>
            <p>No matches yet. Click <strong>Run AI Match</strong> to generate Prolog-based matches.</p>
          </div>
        ) : (
          <>
            <table>
              <thead><tr><th>Candidate</th><th>Company</th><th>Role</th><th>AI Score</th><th>Matched Skills</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {matches.map(m=>(
                  <MatchRow key={m._id} m={m} onEdit={setEditing} onDelete={handleDelete}/>
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
