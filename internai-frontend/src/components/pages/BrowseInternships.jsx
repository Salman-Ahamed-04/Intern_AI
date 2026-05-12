import { useState, useCallback } from "react";
import { Search, MapPin, Clock, DollarSign, X, Briefcase } from "lucide-react";
import { useApi } from "../../lib/useApi";
import { internshipsApi, applicationsApi } from "../../lib/api";
import { useAuth } from "../../store/auth";
import { useToast } from "../../lib/toast";

const typeColor = { Remote:"badge-blue", "On-site":"badge-green", Hybrid:"badge-purple" };

function ApplyModal({ internship, onClose, onApplied }) {
  const { user } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const handleApply = async () => {
    if (!user?.profileId) { toast("Complete your profile first", "error"); return; }
    setSaving(true);
    try {
      await applicationsApi.create({
        candidateId:  user.profileId,
        companyId:    internship.companyId?._id || internship.companyId,
        internshipId: internship._id,
        role:         internship.title,
        appliedDate:  new Date().toISOString().split("T")[0],
        status:       "Applied",
        coverLetter,
      });
      toast(`Applied to "${internship.title}" successfully!`);
      onApplied();
      onClose();
    } catch (e) {
      toast(e.message || "Failed to apply", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth:520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Apply — {internship.title}</div>
            <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>{internship.companyId?.name}</div>
          </div>
          <button className="btn btn-ghost" style={{ padding:"4px 6px" }} onClick={onClose}><X size={15}/></button>
        </div>
        <div className="modal-body">
          {internship.imageUrl && (
            <img src={internship.imageUrl} alt={internship.title}
              style={{ width:"100%", height:160, objectFit:"cover", borderRadius:8, marginBottom:4 }}/>
          )}
          <div style={{ background:"var(--surface-2)", borderRadius:8, padding:12, fontSize:12, color:"var(--text-secondary)", lineHeight:1.6 }}>
            <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:8 }}>
              {internship.location && <span><MapPin size={11} style={{ verticalAlign:"middle" }}/> {internship.location}</span>}
              {internship.type     && <span className={`badge ${typeColor[internship.type] || "badge-gray"}`}>{internship.type}</span>}
              {internship.duration && <span><Clock size={11} style={{ verticalAlign:"middle" }}/> {internship.duration}</span>}
              {internship.stipend  && <span style={{ color:"var(--primary)", fontWeight:500 }}><DollarSign size={11} style={{ verticalAlign:"middle" }}/> {internship.stipend}</span>}
            </div>
            {internship.description && <p style={{ marginBottom:6 }}>{internship.description}</p>}
            {internship.requirements && <p><strong>Requirements:</strong> {internship.requirements}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Cover Letter (optional)</label>
            <textarea className="input" rows={4} placeholder="Tell the company why you're a great fit…"
              value={coverLetter} onChange={e => setCoverLetter(e.target.value)} style={{ resize:"vertical" }}/>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleApply} disabled={saving}>
            {saving ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BrowseInternships() {
  const [search, setSearch] = useState("");
  const [type,   setType]   = useState("All");
  const [page,   setPage]   = useState(1);
  const [applying, setApplying] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const fetchFn = useCallback(
    () => internshipsApi.list({ page, limit: 12, search, ...(type !== "All" && { type }) }),
    [page, search, type, refresh]
  );
  const { data, loading, error } = useApi(fetchFn, [page, search, type, refresh]);
  const internships = data?.data || [];
  const pagination  = data?.pagination;

  return (
    <div className="page-enter">
      {applying && (
        <ApplyModal
          internship={applying}
          onClose={() => setApplying(null)}
          onApplied={() => setRefresh(r => r + 1)}
        />
      )}

      <div className="page-header">
        <div>
          <div className="page-title">Browse Internships</div>
          <div className="page-subtitle">Find the perfect internship opportunity</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, minWidth:200 }}>
          <Search size={13} style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }}/>
          <input className="input" style={{ paddingLeft:28, fontSize:12 }} placeholder="Search by title, skill, location…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/>
        </div>
        <div className="tabs">
          {["All","On-site","Remote","Hybrid"].map(t => (
            <button key={t} className={`tab ${type === t ? "active" : ""}`} onClick={() => { setType(t); setPage(1); }}>{t}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding:32, textAlign:"center", color:"var(--text-muted)", fontSize:13 }}>Loading internships...</div>
      ) : error ? (
        <div style={{ padding:24, textAlign:"center", color:"#e24b4a", fontSize:13 }}>{error}</div>
      ) : internships.length === 0 ? (
        <div className="empty-state"><p>No internships available right now. Check back soon!</p></div>
      ) : (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:16 }}>
            {internships.map(i => (
              <div key={i._id} className="card" style={{ overflow:"hidden", display:"flex", flexDirection:"column" }}>
                {/* Banner image */}
                {i.imageUrl ? (
                  <img src={i.imageUrl} alt={i.title} style={{ width:"100%", height:150, objectFit:"cover" }}/>
                ) : (
                  <div style={{ width:"100%", height:80, background:"var(--primary-light)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Briefcase size={28} style={{ color:"var(--primary)", opacity:0.5 }}/>
                  </div>
                )}

                <div style={{ padding:16, flex:1, display:"flex", flexDirection:"column" }}>
                  {/* Company */}
                  <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:4 }}>{i.companyId?.name}</div>

                  {/* Title */}
                  <div style={{ fontWeight:600, fontSize:14, marginBottom:8, lineHeight:1.3 }}>{i.title}</div>

                  {/* Meta */}
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:8 }}>
                    {i.type     && <span className={`badge ${typeColor[i.type] || "badge-gray"}`} style={{ fontSize:10 }}>{i.type}</span>}
                    {i.location && <span style={{ fontSize:11, color:"var(--text-secondary)", display:"flex", alignItems:"center", gap:3 }}><MapPin size={10}/>{i.location}</span>}
                    {i.duration && <span style={{ fontSize:11, color:"var(--text-secondary)", display:"flex", alignItems:"center", gap:3 }}><Clock size={10}/>{i.duration}</span>}
                  </div>

                  {/* Stipend */}
                  {i.stipend && (
                    <div style={{ fontSize:12, color:"var(--primary)", fontWeight:600, marginBottom:8 }}>{i.stipend}</div>
                  )}

                  {/* Skills */}
                  <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:10 }}>
                    {(i.skills || []).slice(0,4).map(s => <span key={s} className="badge badge-gray" style={{ fontSize:10 }}>{s}</span>)}
                    {(i.skills || []).length > 4 && <span className="badge badge-gray" style={{ fontSize:10 }}>+{i.skills.length - 4}</span>}
                  </div>

                  {/* Description snippet */}
                  {i.description && (
                    <div style={{ fontSize:12, color:"var(--text-secondary)", lineHeight:1.5, marginBottom:12, flex:1,
                      overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                      {i.description}
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:"var(--border)", paddingTop:10, marginTop:"auto" }}>
                    <div style={{ fontSize:11, color:"var(--text-muted)" }}>
                      {i.deadline ? `Deadline: ${i.deadline}` : "No deadline"}
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ padding:"5px 16px", fontSize:12 }}
                      onClick={() => setApplying(i)}
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="pagination" style={{ marginTop:16 }}>
              <span>Showing {internships.length} of {pagination.total} internships</span>
              <div className="page-btns">
                <button className="pg-btn" disabled={page <= 1} onClick={() => setPage(p => p-1)}>‹</button>
                {Array.from({ length: pagination.pages }, (_, i) => (
                  <button key={i+1} className={`pg-btn ${page === i+1 ? "active" : ""}`} onClick={() => setPage(i+1)}>{i+1}</button>
                ))}
                <button className="pg-btn" disabled={page >= pagination.pages} onClick={() => setPage(p => p+1)}>›</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
