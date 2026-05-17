import { useState, useCallback } from "react";
import { Search, MapPin, Clock, DollarSign, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../lib/useApi";
import { internshipsApi } from "../../lib/api";

const typeColor = { Remote:"badge-blue", "On-site":"badge-green", Hybrid:"badge-purple" };

function InternshipCard({ internship }) {
  const navigate = useNavigate();
  return (
    <div
      className="card"
      style={{ cursor:"pointer", overflow:"hidden", display:"flex", flexDirection:"column", transition:"box-shadow 0.18s, transform 0.18s" }}
      onClick={() => navigate(`/internship/${internship._id}`)}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}
    >
      {/* Compact image strip */}
      {internship.imageUrl ? (
        <img src={internship.imageUrl} alt={internship.title}
          style={{ width:"100%", height:90, objectFit:"cover" }} />
      ) : (
        <div style={{ width:"100%", height:56, background:"var(--primary-light)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Briefcase size={20} style={{ color:"var(--primary)", opacity:0.5 }}/>
        </div>
      )}

      <div style={{ padding:"12px 14px", flex:1, display:"flex", flexDirection:"column", gap:6 }}>
        {/* Company name */}
        <div style={{ fontSize:11, color:"var(--text-muted)", fontWeight:500 }}>{internship.companyId?.name}</div>

        {/* Title */}
        <div style={{ fontWeight:600, fontSize:13, lineHeight:1.3, color:"var(--text)" }}>{internship.title}</div>

        {/* Badges row */}
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", alignItems:"center" }}>
          {internship.type && (
            <span className={`badge ${typeColor[internship.type] || "badge-gray"}`} style={{ fontSize:10 }}>{internship.type}</span>
          )}
          {internship.location && (
            <span style={{ fontSize:10, color:"var(--text-secondary)", display:"flex", alignItems:"center", gap:2 }}>
              <MapPin size={9}/>{internship.location}
            </span>
          )}
          {internship.duration && (
            <span style={{ fontSize:10, color:"var(--text-secondary)", display:"flex", alignItems:"center", gap:2 }}>
              <Clock size={9}/>{internship.duration}
            </span>
          )}
        </div>

        {/* Skills — max 3 */}
        {internship.skills?.length > 0 && (
          <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
            {internship.skills.slice(0,3).map(s => (
              <span key={s} className="badge badge-gray" style={{ fontSize:10 }}>{s}</span>
            ))}
            {internship.skills.length > 3 && (
              <span className="badge badge-gray" style={{ fontSize:10 }}>+{internship.skills.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"auto", paddingTop:8, borderTop:"var(--border)" }}>
          <span style={{ fontSize:11, color:"var(--primary)", fontWeight:600 }}>
            {internship.stipend || "Stipend N/A"}
          </span>
          <span style={{ fontSize:10, color:"var(--text-muted)" }}>
            {internship.deadline ? `Due ${internship.deadline}` : "Open"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function BrowseInternships() {
  const [search, setSearch] = useState("");
  const [type,   setType]   = useState("All");
  const [page,   setPage]   = useState(1);

  const fetchFn = useCallback(
    () => internshipsApi.list({ page, limit: 12, search, ...(type !== "All" && { type }) }),
    [page, search, type]
  );
  const { data, loading, error } = useApi(fetchFn, [page, search, type]);
  const internships = data?.data || [];
  const pagination  = data?.pagination;

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">Browse Internships</div>
          <div className="page-subtitle">Find the perfect internship — click any card for full details</div>
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
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:14 }}>
            {internships.map(i => <InternshipCard key={i._id} internship={i} />)}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="pagination" style={{ marginTop:16 }}>
              <span>Showing {internships.length} of {pagination.total}</span>
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
