import { useState, useCallback } from "react";
import { useApi } from "../../lib/useApi";
import { applicationsApi } from "../../lib/api";
import { useAuth } from "../../store/auth";
import { useToast } from "../../lib/toast";

const STATUSES = ["Applied", "In Review", "Interview", "Offer Sent", "Rejected"];
const statusMap = { "Applied":"badge-blue","In Review":"badge-yellow","Interview":"badge-green","Offer Sent":"badge-green","Rejected":"badge-red" };

export default function CompanyApplicants() {
  const { user } = useAuth();
  const toast = useToast();
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);

  const fetchFn = useCallback(
    () => applicationsApi.list({ page, limit: 10, ...(status !== "All" && { status }) }),
    [page, status, refresh]
  );
  const { data, loading, error } = useApi(fetchFn, [page, status, refresh]);
  const applications = data?.data || [];
  const pagination = data?.pagination;

  const updateStatus = async (id, newStatus) => {
    try {
      await applicationsApi.update(id, { status: newStatus });
      toast(`Status updated to ${newStatus}`);
      setRefresh(r => r + 1);
    } catch (e) {
      toast(e.message || "Failed", "error");
    }
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">Applicants</div>
          <div className="page-subtitle">Manage candidates who applied to your company</div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding:"12px 16px", borderBottom:"var(--border)", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          <div className="tabs">
            {["All", ...STATUSES].map(s => (
              <button key={s} className={`tab ${status === s ? "active" : ""}`} onClick={() => { setStatus(s); setPage(1); }}>{s}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding:32, textAlign:"center", color:"var(--text-muted)", fontSize:13 }}>Loading applicants...</div>
        ) : error ? (
          <div style={{ padding:24, textAlign:"center", color:"#e24b4a", fontSize:13 }}>{error}</div>
        ) : applications.length === 0 ? (
          <div className="empty-state"><p>No applicants yet.</p></div>
        ) : (
          <>
            <table>
              <thead><tr><th>Candidate</th><th>Role</th><th>Applied</th><th>Skills</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {applications.map(a => (
                  <tr key={a._id}>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div className="avatar" style={{ background:a.candidateId?.avatarColor, color:a.candidateId?.avatarTextColor }}>{a.candidateId?.initials}</div>
                        <div>
                          <div style={{ fontWeight:500, fontSize:12.5 }}>{a.candidateId?.name}</div>
                          <div style={{ fontSize:11, color:"var(--text-muted)" }}>{a.candidateId?.degree}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize:12 }}>{a.role}</td>
                    <td style={{ fontSize:12, color:"var(--text-muted)" }}>{a.appliedDate}</td>
                    <td>
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                        {(a.candidateId?.skills || []).slice(0,3).map(s => (
                          <span key={s} className="badge badge-gray" style={{ fontSize:10 }}>{s}</span>
                        ))}
                      </div>
                    </td>
                    <td><span className={`badge ${statusMap[a.status] || "badge-gray"}`}>{a.status}</span></td>
                    <td>
                      <select
                        className="input"
                        style={{ fontSize:11, padding:"4px 8px", width:"auto" }}
                        value={a.status}
                        onChange={e => updateStatus(a._id, e.target.value)}
                      >
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
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
