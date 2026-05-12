import { useCallback } from "react";
import { Calendar, Video, MapPin, Phone } from "lucide-react";
import { useApi } from "../../lib/useApi";
import { interviewsApi } from "../../lib/api";
import { useAuth } from "../../store/auth";

const statusMap = { "Scheduled":"badge-blue","Confirmed":"badge-green","Pending":"badge-yellow","Completed":"badge-gray","Cancelled":"badge-red" };
const typeIcon = t => t === "Video" ? <Video size={12}/> : t === "Phone" ? <Phone size={12}/> : <MapPin size={12}/>;

export default function MyInterviews() {
  const { user } = useAuth();
  const fetchFn = useCallback(() => interviewsApi.list({ limit: 50 }), []);
  const { data, loading, error } = useApi(fetchFn, []);

  const interviews = (data?.data || []).filter(i =>
    String(i.candidateId?._id || i.candidateId) === String(user?.profileId)
  );

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">My Interviews</div>
          <div className="page-subtitle">All your scheduled and past interviews</div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding:"12px 16px", borderBottom:"var(--border)", display:"flex", alignItems:"center", gap:8 }}>
          <Calendar size={14} style={{ color:"var(--primary)" }}/>
          <span style={{ fontWeight:600, fontSize:13 }}>Interview Schedule</span>
        </div>

        {loading ? (
          <div style={{ padding:32, textAlign:"center", color:"var(--text-muted)", fontSize:13 }}>Loading...</div>
        ) : error ? (
          <div style={{ padding:24, textAlign:"center", color:"#e24b4a", fontSize:13 }}>{error}</div>
        ) : interviews.length === 0 ? (
          <div className="empty-state"><p>No interviews scheduled yet.</p></div>
        ) : (
          <table>
            <thead><tr><th>Company</th><th>Role</th><th>Date</th><th>Time</th><th>Type</th><th>Interviewer</th><th>Status</th><th>Link</th></tr></thead>
            <tbody>
              {interviews.map(i => (
                <tr key={i._id}>
                  <td style={{ fontWeight:500, fontSize:12.5 }}>{i.companyId?.name}</td>
                  <td style={{ fontSize:12, color:"var(--text-secondary)" }}>{i.role}</td>
                  <td style={{ fontSize:12 }}>{i.scheduledDate}</td>
                  <td style={{ fontSize:12 }}>{i.scheduledTime}</td>
                  <td><span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:12 }}>{typeIcon(i.type)} {i.type}</span></td>
                  <td style={{ fontSize:12, color:"var(--text-secondary)" }}>{i.interviewer || "—"}</td>
                  <td><span className={`badge ${statusMap[i.status] || "badge-gray"}`}>{i.status}</span></td>
                  <td>
                    {i.meetingLink ? (
                      <a href={i.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding:"4px 10px", fontSize:11 }}>Join</a>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
