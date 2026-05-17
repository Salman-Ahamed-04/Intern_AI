import { useCallback } from "react";
import { Zap } from "lucide-react";
import { useApi } from "../../lib/useApi";
import { matchesApi } from "../../lib/api";
import { useAuth } from "../../store/auth";

const scoreColor = (s) => s >= 85 ? "#1a9e75" : s >= 70 ? "#f0992b" : "#e24b4a";
const statusMap = { "In Review":"badge-yellow","Interview":"badge-green","Applied":"badge-blue","Offer Sent":"badge-green","Rejected":"badge-red" };

export default function MyMatches() {
  const { user } = useAuth();
  const fetchFn = useCallback(() => matchesApi.list({ limit: 50 }), []);
  const { data, loading, error } = useApi(fetchFn, []);

  const matches = (data?.data || []).filter(m =>
    String(m.candidateId?._id || m.candidateId) === String(user?.profileId)
  );

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">My Matches</div>
          <div className="page-subtitle">AI-powered internship matches based on your skills</div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding:"12px 16px", borderBottom:"var(--border)", display:"flex", alignItems:"center", gap:8 }}>
          <Zap size={14} style={{ color:"var(--primary)" }}/>
          <span style={{ fontWeight:600, fontSize:13 }}>Your Matches — sorted by AI score</span>
        </div>

        {loading ? (
          <div style={{ padding:32, textAlign:"center", color:"var(--text-muted)", fontSize:13 }}>Loading matches...</div>
        ) : error ? (
          <div style={{ padding:24, textAlign:"center", color:"#e24b4a", fontSize:13 }}>{error}</div>
        ) : matches.length === 0 ? (
          <div className="empty-state"><p>No matches yet. Complete your profile with skills to get matched.</p></div>
        ) : (
          <table>
            <thead><tr><th>Company</th><th>Role</th><th>AI Score</th><th>Matched Skills</th><th>Status</th></tr></thead>
            <tbody>
              {matches.map(m => (
                <tr key={m._id}>
                  <td style={{ fontWeight:500, fontSize:12.5 }}>{m.companyId?.name}</td>
                  <td style={{ fontSize:12, color:"var(--text-secondary)" }}>{m.role}</td>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <div style={{ width:50, height:5, borderRadius:3, background:"var(--border-color)", overflow:"hidden" }}>
                        <div style={{ width:`${m.aiScore}%`, height:"100%", background:scoreColor(m.aiScore), borderRadius:3 }}/>
                      </div>
                      <span style={{ fontWeight:700, fontSize:12, color:scoreColor(m.aiScore) }}>{m.aiScore}%</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                      {(m.matchedSkills || []).map(s => <span key={s} className="badge badge-gray" style={{ fontSize:10 }}>{s}</span>)}
                    </div>
                  </td>
                  <td><span className={`badge ${statusMap[m.status] || "badge-gray"}`}>{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
