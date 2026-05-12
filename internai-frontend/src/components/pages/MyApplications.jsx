import { useState, useCallback } from "react";
import { useApi } from "../../lib/useApi";
import { applicationsApi } from "../../lib/api";
import { useAuth } from "../../store/auth";

const statusMap = { "Applied":"badge-blue","In Review":"badge-yellow","Interview":"badge-green","Offer Sent":"badge-green","Rejected":"badge-red" };

export default function MyApplications() {
  const { user } = useAuth();
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);

  const fetchFn = useCallback(
    () => applicationsApi.list({ page, limit: 10, ...(status !== "All" && { status }) }),
    [page, status, user?.profileId]
  );
  const { data, loading, error } = useApi(fetchFn, [page, status]);
  const applications = (data?.data || []).filter(a =>
    String(a.candidateId?._id || a.candidateId) === String(user?.profileId)
  );
  const pagination = data?.pagination;

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">My Applications</div>
          <div className="page-subtitle">Track all your internship applications</div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding:"12px 16px", borderBottom:"var(--border)", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          <div className="tabs">
            {["All","Applied","In Review","Interview","Offer Sent","Rejected"].map(s => (
              <button key={s} className={`tab ${status === s ? "active" : ""}`} onClick={() => { setStatus(s); setPage(1); }}>{s}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding:32, textAlign:"center", color:"var(--text-muted)", fontSize:13 }}>Loading...</div>
        ) : error ? (
          <div style={{ padding:24, textAlign:"center", color:"#e24b4a", fontSize:13 }}>{error}</div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <p>No applications found. <a href="/browse" style={{ color:"var(--primary)" }}>Browse internships</a> to apply.</p>
          </div>
        ) : (
          <>
            <table>
              <thead><tr><th>Company</th><th>Role</th><th>Applied Date</th><th>Notes</th><th>Status</th></tr></thead>
              <tbody>
                {applications.map(a => (
                  <tr key={a._id}>
                    <td>
                      <div style={{ fontWeight:500, fontSize:12.5 }}>{a.companyId?.name}</div>
                      <div style={{ fontSize:11, color:"var(--text-muted)" }}>{a.companyId?.industry}</div>
                    </td>
                    <td style={{ fontSize:12 }}>{a.role}</td>
                    <td style={{ fontSize:12, color:"var(--text-muted)" }}>{a.appliedDate}</td>
                    <td style={{ fontSize:12, color:"var(--text-muted)", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.notes || "—"}</td>
                    <td><span className={`badge ${statusMap[a.status] || "badge-gray"}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pagination && (
              <div className="pagination">
                <span>Showing {applications.length} results</span>
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
    </div>
  );
}
