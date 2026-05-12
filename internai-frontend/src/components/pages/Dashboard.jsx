import { Users, Building2, Briefcase, CheckCircle, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { useApi } from "../../lib/useApi";
import { dashboardApi } from "../../lib/api";

const scoreColor = (s) => s >= 85 ? "#1a9e75" : s >= 70 ? "#f0992b" : "#e24b4a";

const statusBadge = (status) => {
  const map = { "In Review": "badge-yellow", "Interview": "badge-green", "Applied": "badge-blue", "Offer Sent": "badge-green", "Rejected": "badge-red" };
  return map[status] || "badge-gray";
};

function StatCards({ stats }) {
  if (!stats) return null;
  const cards = [
    { label: "Active Students",    value: stats.activeStudents,    icon: Users },
    { label: "Partner Companies",  value: stats.partnerCompanies,  icon: Building2 },
    { label: "Open Internships",   value: stats.openInternships,   icon: Briefcase },
    { label: "Successful Matches", value: stats.successfulMatches, icon: CheckCircle },
  ];
  return (
    <div className="grid-4">
      {cards.map(({ label, value, icon: Icon }) => (
        <div className="stat-card" key={label}>
          <div className="stat-label">
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Icon size={12} style={{ opacity: 0.6 }} /> {label}
            </span>
          </div>
          <div className="stat-value">{value ?? "—"}</div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { data: statsRes,      loading: sl } = useApi(dashboardApi.stats);
  const { data: matchesRes,    loading: ml } = useApi(dashboardApi.topMatches);
  const { data: interviewsRes, loading: il } = useApi(dashboardApi.upcomingInterviews);

  const stats      = statsRes?.data;
  const matches    = matchesRes?.data || [];
  const interviews = interviewsRes?.data || [];

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="page-header">
          <div>
            <div className="page-title">Welcome back, Admin!</div>
            <div className="page-subtitle">InternAI Dashboard</div>
          </div>
        </div>

        {sl ? <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>Loading stats...</div> : <StatCards stats={stats} />}

        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ padding: "12px 16px", borderBottom: "var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
            <Zap size={14} style={{ color: "var(--primary)" }} />
            <span style={{ fontWeight: 600, fontSize: 13.5 }}>Top AI Matches</span>
          </div>
          {ml ? (
            <div style={{ padding: 20, color: "var(--text-muted)", fontSize: 13 }}>Loading matches...</div>
          ) : (
            <table>
              <thead><tr><th>Candidate</th><th>Role</th><th>Company</th><th>AI Score</th><th>Status</th></tr></thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="avatar" style={{ background: m.candidateId?.avatarColor, color: m.candidateId?.avatarTextColor }}>
                          {m.candidateId?.initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 12.5 }}>{m.candidateId?.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{m.candidateId?.degree}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{m.role}</td>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{m.companyId?.name}</td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: 13, color: scoreColor(m.aiScore) }}>{m.aiScore}</span>
                    </td>
                    <td><span className={`badge ${statusBadge(m.status)}`}>{m.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div style={{ width: 260, flexShrink: 0 }}>
        <div className="card">
          <div style={{ padding: "12px 16px", borderBottom: "var(--border)", fontWeight: 600, fontSize: 13 }}>Upcoming Interviews</div>
          {il ? (
            <div style={{ padding: 16, color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
          ) : interviews.length === 0 ? (
            <div style={{ padding: 16, color: "var(--text-muted)", fontSize: 13 }}>No upcoming interviews</div>
          ) : (
            <div style={{ padding: "8px 0" }}>
              {interviews.map((i) => (
                <div key={i._id} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border-color, #f0f0f0)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div className="avatar" style={{ width: 28, height: 28, fontSize: 11, background: i.candidateId?.avatarColor, color: i.candidateId?.avatarTextColor }}>
                      {i.candidateId?.initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 12 }}>{i.candidateId?.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{i.companyId?.name} · {i.role}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", paddingLeft: 36 }}>
                    {i.scheduledDate} at {i.scheduledTime}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
