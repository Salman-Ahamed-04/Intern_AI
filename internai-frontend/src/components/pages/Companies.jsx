import Portal from "../../lib/Portal";
import { useState, useCallback } from "react";
import { Search, Plus, Globe, Mail, X, Trash2, Edit2 } from "lucide-react";
import { useApi } from "../../lib/useApi";
import { companiesApi } from "../../lib/api";
import { useToast } from "../../lib/toast";

function CompanyModal({ onClose, onSaved, existing }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(existing ? {
    name:          existing.name,
    industry:      existing.industry || "",
    location:      existing.location || "",
    contactPerson: existing.contactPerson || "",
    email:         existing.email || "",
    website:       existing.website || "",
    openRoles:     existing.openRoles || 0,
    totalHires:    existing.totalHires || 0,
    status:        existing.status,
  } : { name:"", industry:"", location:"", contactPerson:"", email:"", website:"", openRoles:0, totalHires:0, status:"Active" });

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSave = async () => {
    if (!form.name) { toast("Company name is required","error"); return; }
    setSaving(true);
    try {
      const payload = { ...form, openRoles: parseInt(form.openRoles)||0, totalHires: parseInt(form.totalHires)||0 };
      if (existing) {
        await companiesApi.update(existing._id, payload);
        toast("Company updated!");
      } else {
        await companiesApi.create(payload);
        toast("Company added!");
      }
      onSaved(); onClose();
    } catch(e) { toast(e.message||"Failed","error"); } finally { setSaving(false); }
  };

  return (
    <Portal><div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{existing ? "Edit Company" : "Add Company"}</span>
          <button className="btn btn-ghost" style={{padding:"4px 6px"}} onClick={onClose}><X size={15}/></button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input className="input" placeholder="Acme Corp" value={form.name} onChange={e=>set("name",e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Industry</label>
              <input className="input" placeholder="Technology" value={form.industry} onChange={e=>set("industry",e.target.value)}/>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="input" placeholder="Colombo, LK" value={form.location} onChange={e=>set("location",e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Open Roles</label>
              <input className="input" type="number" min="0" value={form.openRoles} onChange={e=>set("openRoles",e.target.value)}/>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Total Hires</label>
              <input className="input" type="number" min="0" value={form.totalHires} onChange={e=>set("totalHires",e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input className="input" placeholder="John Doe" value={form.contactPerson} onChange={e=>set("contactPerson",e.target.value)}/>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="input" type="email" placeholder="hr@acme.com" value={form.email} onChange={e=>set("email",e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Website</label>
              <input className="input" placeholder="https://acme.com" value={form.website} onChange={e=>set("website",e.target.value)}/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="input" value={form.status} onChange={e=>set("status",e.target.value)}>
              <option>Active</option><option>Inactive</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : existing ? "Save Changes" : "Add Company"}
          </button>
        </div>
      </div>
    </div></Portal>
  );
}

export default function Companies() {
  const [search,  setSearch]  = useState("");
  const [status,  setStatus]  = useState("All");
  const [page,    setPage]    = useState(1);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const toast = useToast();

  const fetchFn = useCallback(
    () => companiesApi.list({ page, limit: 12, search, ...(status!=="All"&&{status}) }),
    [page, search, status, refresh]
  );
  const { data, loading, error } = useApi(fetchFn, [page, search, status, refresh]);
  const companies  = data?.data || [];
  const pagination = data?.pagination;

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this company?")) return;
    try {
      await companiesApi.delete(id);
      toast("Company deleted");
      setRefresh(r=>r+1);
    } catch(e) { toast(e.message||"Failed to delete","error"); }
  };

  return (
    <div className="page-enter">
      {(modal || editing) && (
        <CompanyModal
          existing={editing}
          onClose={()=>{ setModal(false); setEditing(null); }}
          onSaved={()=>setRefresh(r=>r+1)}
        />
      )}

      <div className="page-header">
        <div>
          <div className="page-title">Companies</div>
          <div className="page-subtitle">Manage partner companies and internship providers</div>
        </div>
        <button className="btn btn-primary" onClick={()=>setModal(true)}><Plus size={13}/> Add Company</button>
      </div>

      {pagination && (
        <div className="grid-4">
          {[
            { label:"Total Partners", value:pagination.total },
            { label:"Active",         value:companies.filter(c=>c.status==="Active").length },
            { label:"Open Roles",     value:companies.reduce((s,c)=>s+(c.openRoles||0),0) },
            { label:"Total Hires",    value:companies.reduce((s,c)=>s+(c.totalHires||0),0) },
          ].map(s=>(
            <div className="stat-card" key={s.label}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div style={{padding:"12px 16px",borderBottom:"var(--border)",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <div style={{position:"relative",flex:1,minWidth:180}}>
            <Search size={13} style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"var(--text-muted)"}}/>
            <input className="input" style={{paddingLeft:28,fontSize:12}} placeholder="Search companies…"
              value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/>
          </div>
          <div className="tabs">
            {["All","Active","Inactive"].map(s=>(
              <button key={s} className={`tab ${status===s?"active":""}`} onClick={()=>{setStatus(s);setPage(1);}}>{s}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{padding:32,textAlign:"center",color:"var(--text-muted)",fontSize:13}}>Loading companies…</div>
        ) : error ? (
          <div style={{padding:24,textAlign:"center",color:"#e24b4a",fontSize:13}}>{error}</div>
        ) : companies.length===0 ? (
          <div className="empty-state"><p>No companies found.</p></div>
        ) : (
          <>
            <table>
              <thead><tr><th>Company</th><th>Industry</th><th>Location</th><th>Contact</th><th>Open Roles</th><th>Total Hires</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {companies.map(c=>(
                  <tr key={c._id}>
                    <td>
                      <div style={{fontWeight:500,fontSize:12.5}}>{c.name}</div>
                      <div style={{fontSize:11,color:"var(--text-muted)"}}>{c.contactPerson}</div>
                    </td>
                    <td style={{fontSize:12,color:"var(--text-secondary)"}}>{c.industry}</td>
                    <td style={{fontSize:12,color:"var(--text-secondary)"}}>{c.location}</td>
                    <td>
                      <div style={{display:"flex",gap:4}}>
                        {c.website&&<a href={c.website} target="_blank" rel="noreferrer"><button className="btn btn-ghost" style={{padding:"4px 7px"}}><Globe size={13}/></button></a>}
                        {c.email&&<a href={`mailto:${c.email}`}><button className="btn btn-ghost" style={{padding:"4px 7px"}}><Mail size={13}/></button></a>}
                      </div>
                    </td>
                    <td><span style={{background:"var(--primary-light)",color:"var(--primary)",fontWeight:600,fontSize:12,padding:"2px 8px",borderRadius:4}}>{c.openRoles}</span></td>
                    <td style={{fontWeight:600,fontSize:13}}>{c.totalHires}</td>
                    <td><span className={`badge ${c.status==="Active"?"badge-green":"badge-gray"}`}>{c.status}</span></td>
                    <td>
                      <div style={{display:"flex",gap:4}}>
                        <button className="btn btn-ghost" style={{padding:"4px 7px"}} title="Edit" onClick={()=>setEditing(c)}><Edit2 size={13}/></button>
                        <button className="btn btn-ghost" style={{padding:"4px 7px",color:"#e24b4a"}} title="Delete" onClick={()=>handleDelete(c._id)}><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pagination && (
              <div className="pagination">
                <span>Showing {companies.length} of {pagination.total}</span>
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
