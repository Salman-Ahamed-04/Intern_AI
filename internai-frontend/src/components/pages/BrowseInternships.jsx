import { useState, useCallback } from "react";
import { Search, Briefcase, MapPin, Building2 } from "lucide-react";
import { useApi } from "../../lib/useApi";
import { companiesApi, applicationsApi } from "../../lib/api";
import { useAuth } from "../../store/auth";
import { useToast } from "../../lib/toast";

export default function BrowseInternships() {
  const { user } = useAuth();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [applying, setApplying] = useState(null);

  const fetchFn = useCallback(
    () => companiesApi.list({ page, limit: 12, search, status: "Active" }),
    [page, search]
  );
  const { data, loading, error } = useApi(fetchFn, [page, search]);
  const companies  = data?.data || [];
  const pagination = data?.pagination;

  const handleApply = async (company) => {
    const role = window.prompt(`Apply to ${company.name}\nEnter the role you are applying for:`);
    if (!role) return;
    setApplying(company._id);
    try {
      await applicationsApi.create({
        candidateId: user?.profileId,
        companyId:   company._id,
        role,
        appliedDate: new Date().toISOString().split("T")[0],
        status: "Applied",
      });
      toast(`Applied to ${company.name} successfully!`);
    } catch (e) {
      toast(e.message || "Failed to apply", "error");
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">Browse Internships</div>
          <div className="page-subtitle">Discover opportunities from partner companies</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ position:"relative", flex:1 }}>
            <Search size={13} style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }}/>
            <input className="input" style={{ paddingLeft:28, fontSize:12 }} placeholder="Search companies or industries…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding:32, textAlign:"center", color:"var(--text-muted)", fontSize:13 }}>Loading internships...</div>
      ) : error ? (
        <div style={{ padding:24, textAlign:"center", color:"#e24b4a", fontSize:13 }}>{error}</div>
      ) : companies.length === 0 ? (
        <div className="empty-state"><p>No companies found.</p></div>
      ) : (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:14 }}>
            {companies.map(c => (
              <div key={c._id} className="card" style={{ padding:18 }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14 }}>{c.name}</div>
                    <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>{c.industry}</div>
                  </div>
                  <span className={`badge ${c.status === "Active" ? "badge-green" : "badge-gray"}`}>{c.status}</span>
                </div>
                {c.location && (
                  <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"var(--text-secondary)", marginBottom:6 }}>
                    <MapPin size={11}/> {c.location}
                  </div>
                )}
                {c.description && (
                  <div style={{ fontSize:12, color:"var(--text-secondary)", marginBottom:10, lineHeight:1.5,
                    overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                    {c.description}
                  </div>
                )}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"var(--text-muted)" }}>
                    <Briefcase size={11}/> {c.openRoles} open role{c.openRoles !== 1 ? "s" : ""}
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ padding:"5px 14px", fontSize:12 }}
                    disabled={applying === c._id || !user?.profileId}
                    onClick={() => handleApply(c)}
                  >
                    {applying === c._id ? "Applying..." : "Apply"}
                  </button>
                </div>
              </div>
            ))}
          </div>
          {pagination && pagination.pages > 1 && (
            <div className="pagination" style={{ marginTop:16 }}>
              <span>Showing {companies.length} of {pagination.total}</span>
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
