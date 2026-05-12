import { Users, Building2, Briefcase, CheckCircle, Zap, Calendar, TrendingUp, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../lib/useApi";
import { dashboardApi } from "../../lib/api";
import { useAuth } from "../../store/auth";

const scoreColor = (s) => s >= 85 ? "#1a9e75" : s >= 70 ? "#f0992b" : "#e24b4a";
const statusBadge = (s) => ({ "In Review":"badge-yellow","Interview":"badge-green","Applied":"badge-blue","Offer Sent":"badge-green","Rejected":"badge-red" }[s] || "badge-gray");

// ─── ADMIN DASHBOARD ────────────────────────────────────────────────
function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: statsRes,      loading: sl } = useApi(dashboardApi.stats);
  const { data: matchesRes,    loading: ml } = useApi(dashboardApi.topMatches);
  const { data: interviewsRes, loading: il } = useApi(dashboardApi.upcomingInterviews);

  const stats      = statsRes?.data;
  const matches    = matchesRes?.data || [];
  const interviews = interviewsRes?.data || [];
  const pendingTotal = (stats?.pendingCompanies || 0) + (stats?.pendingInternships || 0);

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="page-header">
          <div>
            <div className="page-title">Welcome back, {user?.name}!</div>
            <div className="page-subtitle">Admin Dashboard — full platform overview</div>
          </div>
        </div>

        {sl ? <div style={{ color:"var(--text-muted)", fontSize:13, marginBottom:16 }}>Loading stats...</div> : (
          <div className="grid-4">
            {[
              { label:"Active Students",    value: stats?.activeStudents,    icon: Users },
              { label:"Partner Companies",  value: stats?.partnerCompanies,  icon: Building2 },
              { label:"Open Internships",   value: stats?.openInternships,   icon: Briefcase },
              { label:"Successful Matches", value: stats?.successfulMatches, icon: CheckCircle },
            ].map(({ label, value, icon: Icon }) => (
              <div className="stat-card" key={label}>
                <div className="stat-label"><span style={{ display:"flex", alignItems:"center", gap:5 }}><Icon size={12} style={{ opacity:0.6 }}/> {label}</span></div>
                <div className="stat-value">{value ?? "—"}</div>
              </div>
            ))}
          </div>
        )}

        {/* Pending approvals alert */}
        {pendingTotal > 0 && (
          <div
            onClick={() => navigate("/approvals")}
            style={{ background:"#fff8e1", border:"1px solid #f0992b", borderRadius:8,
              padding:"12px 16px", marginBottom:16, fontSize:13, color:"#92400e",
              display:"flex", alignItems:"center", justifyContent:"space-between",
              cursor:"pointer" }}
          >
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <ShieldCheck size={15}/>
              <span>
                <strong>{pendingTotal}</strong> item{pendingTotal !== 1 ? "s" : ""} awaiting approval —
                {stats?.pendingCompanies > 0 && ` ${stats.pendingCompanies} company registration${stats.pendingCompanies !== 1 ? "s" : ""}`}
                {stats?.pendingCompanies > 0 && stats?.pendingInternships > 0 && ","}
                {stats?.pendingInternships > 0 && ` ${stats.pendingInternships} internship post${stats.pendingInternships !== 1 ? "s" : ""}`}
              </span>
            </div>
            <span style={{ fontSize:12, fontWeight:600 }}>Review →</span>
          </div>
        )}

        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ padding:"12px 16px", borderBottom:"var(--border)", display:"flex", alignItems:"center", gap:8 }}>
            <Zap size={14} style={{ color:"var(--primary)" }}/>
            <span style={{ fontWeight:600, fontSize:13.5 }}>Top AI Matches</span>
          </div>
          {ml ? <div style={{ padding:20, color:"var(--text-muted)", fontSize:13 }}>Loading...</div> : (
            <table>
              <thead><tr><th>Candidate</th><th>Role</th><th>Company</th><th>AI Score</th><th>Status</th></tr></thead>
              <tbody>
                {matches.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign:"center", color:"var(--text-muted)", padding:24 }}>No matches yet</td></tr>
                ) : matches.map(m => (
                  <tr key={m._id}>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div className="avatar" style={{ background:m.candidateId?.avatarColor, color:m.candidateId?.avatarTextColor }}>{m.candidateId?.initials}</div>
                        <div>
                          <div style={{ fontWeight:500, fontSize:12.5 }}>{m.candidateId?.name}</div>
                          <div style={{ fontSize:11, color:"var(--text-muted)" }}>{m.candidateId?.degree}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize:12, color:"var(--text-secondary)" }}>{m.role}</td>
                    <td style={{ fontSize:12, color:"var(--text-secondary)" }}>{m.companyId?.name}</td>
                    <td><span style={{ fontWeight:700, fontSize:13, color:scoreColor(m.aiScore) }}>{m.aiScore}</span></td>
                    <td><span className={`badge ${statusBadge(m.status)}`}>{m.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div style={{ width:260, flexShrink:0 }}>
        <div className="card">
          <div style={{ padding:"12px 16px", borderBottom:"var(--border)", fontWeight:600, fontSize:13 }}>Upcoming Interviews</div>
          {il ? <div style={{ padding:16, color:"var(--text-muted)", fontSize:13 }}>Loading...</div>
            : interviews.length === 0 ? <div style={{ padding:16, color:"var(--text-muted)", fontSize:13 }}>No upcoming interviews</div>
            : (
              <div style={{ padding:"8px 0" }}>
                {interviews.map(i => (
                  <div key={i._id} style={{ padding:"10px 16px", borderBottom:"1px solid var(--border-color)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <div className="avatar" style={{ width:28, height:28, fontSize:11, background:i.candidateId?.avatarColor, color:i.candidateId?.avatarTextColor }}>{i.candidateId?.initials}</div>
                      <div>
                        <div style={{ fontWeight:500, fontSize:12 }}>{i.candidateId?.name}</div>
                        <div style={{ fontSize:11, color:"var(--text-muted)" }}>{i.companyId?.name} · {i.role}</div>
                      </div>
                    </div>
                    <div style={{ fontSize:11, color:"var(--text-muted)", paddingLeft:36 }}>{i.scheduledDate} at {i.scheduledTime}</div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

// ─── STUDENT DASHBOARD ──────────────────────────────────────────────
function StudentDashboard() {
  const { user } = useAuth();
  const { data: res, loading } = useApi(dashboardApi.student);
  const d = res?.data;

  if (loading) return <div style={{ padding:32, color:"var(--text-muted)", fontSize:13 }}>Loading your dashboard...</div>;

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">Welcome back, {user?.name}!</div>
          <div className="page-subtitle">Your internship journey at a glance</div>
        </div>
      </div>

      <div className="grid-4">
        {[
          { label:"Applications Sent",  value: d?.stats?.totalApplications ?? 0, icon: Briefcase },
          { label:"AI Matches",         value: d?.stats?.activeMatches ?? 0,      icon: Zap },
          { label:"Interviews",         value: d?.stats?.interviews ?? 0,         icon: Calendar },
          { label:"Offers Received",    value: d?.stats?.offers ?? 0,             icon: CheckCircle },
        ].map(({ label, value, icon: Icon }) => (
          <div className="stat-card" key={label}>
            <div className="stat-label"><span style={{ display:"flex", alignItems:"center", gap:5 }}><Icon size={12} style={{ opacity:0.6 }}/> {label}</span></div>
            <div className="stat-value">{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Recent Applications */}
        <div className="card">
          <div style={{ padding:"12px 16px", borderBottom:"var(--border)", fontWeight:600, fontSize:13 }}>Recent Applications</div>
          {!d?.applications?.length ? (
            <div className="empty-state"><p>No applications yet. <a href="/browse" style={{ color:"var(--primary)" }}>Browse internships</a></p></div>
          ) : (
            <table>
              <thead><tr><th>Company</th><th>Role</th><th>Status</th></tr></thead>
              <tbody>
                {d.applications.map(a => (
                  <tr key={a._id}>
                    <td style={{ fontSize:12 }}>{a.companyId?.name}</td>
                    <td style={{ fontSize:12, color:"var(--text-secondary)" }}>{a.role}</td>
                    <td><span className={`badge ${statusBadge(a.status)}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Top Matches */}
        <div className="card">
          <div style={{ padding:"12px 16px", borderBottom:"var(--border)", display:"flex", alignItems:"center", gap:8 }}>
            <Zap size={13} style={{ color:"var(--primary)" }}/><span style={{ fontWeight:600, fontSize:13 }}>Your Top Matches</span>
          </div>
          {!d?.matches?.length ? (
            <div className="empty-state"><p>No matches yet. Complete your profile to get matched.</p></div>
          ) : (
            <table>
              <thead><tr><th>Company</th><th>Role</th><th>Score</th></tr></thead>
              <tbody>
                {d.matches.map(m => (
                  <tr key={m._id}>
                    <td style={{ fontSize:12 }}>{m.companyId?.name}</td>
                    <td style={{ fontSize:12, color:"var(--text-secondary)" }}>{m.role}</td>
                    <td><span style={{ fontWeight:700, fontSize:12, color:scoreColor(m.aiScore) }}>{m.aiScore}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Upcoming Interviews */}
      {d?.interviews?.length > 0 && (
        <div className="card" style={{ marginTop:16 }}>
          <div style={{ padding:"12px 16px", borderBottom:"var(--border)", display:"flex", alignItems:"center", gap:8 }}>
            <Calendar size={13} style={{ color:"var(--primary)" }}/><span style={{ fontWeight:600, fontSize:13 }}>Upcoming Interviews</span>
          </div>
          <table>
            <thead><tr><th>Company</th><th>Role</th><th>Date</th><th>Time</th><th>Type</th></tr></thead>
            <tbody>
              {d.interviews.map(i => (
                <tr key={i._id}>
                  <td style={{ fontSize:12 }}>{i.companyId?.name}</td>
                  <td style={{ fontSize:12, color:"var(--text-secondary)" }}>{i.role}</td>
                  <td style={{ fontSize:12 }}>{i.scheduledDate}</td>
                  <td style={{ fontSize:12 }}>{i.scheduledTime}</td>
                  <td><span className="badge badge-blue">{i.type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── COMPANY DASHBOARD ──────────────────────────────────────────────
function CompanyDashboard() {
  const { user } = useAuth();
  const { data: res, loading } = useApi(dashboardApi.company);
  const d = res?.data;

  if (loading) return <div style={{ padding:32, color:"var(--text-muted)", fontSize:13 }}>Loading your dashboard...</div>;

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">Welcome back, {user?.name}!</div>
          <div className="page-subtitle">Company recruitment overview</div>
        </div>
      </div>

      <div className="grid-4">
        {[
          { label:"Total Applicants",  value: d?.stats?.totalApplications ?? 0, icon: Users },
          { label:"AI Matches",        value: d?.stats?.activeMatches ?? 0,      icon: Zap },
          { label:"Interviews",        value: d?.stats?.interviews ?? 0,         icon: Calendar },
          { label:"Offers Sent",       value: d?.stats?.offers ?? 0,             icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div className="stat-card" key={label}>
            <div className="stat-label"><span style={{ display:"flex", alignItems:"center", gap:5 }}><Icon size={12} style={{ opacity:0.6 }}/> {label}</span></div>
            <div className="stat-value">{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Recent Applicants */}
        <div className="card">
          <div style={{ padding:"12px 16px", borderBottom:"var(--border)", fontWeight:600, fontSize:13 }}>Recent Applicants</div>
          {!d?.applications?.length ? (
            <div className="empty-state"><p>No applications received yet.</p></div>
          ) : (
            <table>
              <thead><tr><th>Candidate</th><th>Role</th><th>Status</th></tr></thead>
              <tbody>
                {d.applications.map(a => (
                  <tr key={a._id}>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div className="avatar" style={{ background:a.candidateId?.avatarColor, color:a.candidateId?.avatarTextColor }}>{a.candidateId?.initials}</div>
                        <div style={{ fontSize:12, fontWeight:500 }}>{a.candidateId?.name}</div>
                      </div>
                    </td>
                    <td style={{ fontSize:12, color:"var(--text-secondary)" }}>{a.role}</td>
                    <td><span className={`badge ${statusBadge(a.status)}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Top Matched Candidates */}
        <div className="card">
          <div style={{ padding:"12px 16px", borderBottom:"var(--border)", display:"flex", alignItems:"center", gap:8 }}>
            <Zap size={13} style={{ color:"var(--primary)" }}/><span style={{ fontWeight:600, fontSize:13 }}>Top Matched Candidates</span>
          </div>
          {!d?.matches?.length ? (
            <div className="empty-state"><p>No matches yet.</p></div>
          ) : (
            <table>
              <thead><tr><th>Candidate</th><th>Role</th><th>Score</th></tr></thead>
              <tbody>
                {d.matches.map(m => (
                  <tr key={m._id}>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div className="avatar" style={{ background:m.candidateId?.avatarColor, color:m.candidateId?.avatarTextColor }}>{m.candidateId?.initials}</div>
                        <div style={{ fontSize:12, fontWeight:500 }}>{m.candidateId?.name}</div>
                      </div>
                    </td>
                    <td style={{ fontSize:12, color:"var(--text-secondary)" }}>{m.role}</td>
                    <td><span style={{ fontWeight:700, fontSize:12, color:scoreColor(m.aiScore) }}>{m.aiScore}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Upcoming Interviews */}
      {d?.interviews?.length > 0 && (
        <div className="card" style={{ marginTop:16 }}>
          <div style={{ padding:"12px 16px", borderBottom:"var(--border)", display:"flex", alignItems:"center", gap:8 }}>
            <Calendar size={13} style={{ color:"var(--primary)" }}/><span style={{ fontWeight:600, fontSize:13 }}>Upcoming Interviews</span>
          </div>
          <table>
            <thead><tr><th>Candidate</th><th>Role</th><th>Date</th><th>Time</th><th>Type</th></tr></thead>
            <tbody>
              {d.interviews.map(i => (
                <tr key={i._id}>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div className="avatar" style={{ background:i.candidateId?.avatarColor, color:i.candidateId?.avatarTextColor }}>{i.candidateId?.initials}</div>
                      <div style={{ fontSize:12, fontWeight:500 }}>{i.candidateId?.name}</div>
                    </div>
                  </td>
                  <td style={{ fontSize:12, color:"var(--text-secondary)" }}>{i.role}</td>
                  <td style={{ fontSize:12 }}>{i.scheduledDate}</td>
                  <td style={{ fontSize:12 }}>{i.scheduledTime}</td>
                  <td><span className="badge badge-blue">{i.type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── ROOT EXPORT ────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === "admin")   return <AdminDashboard />;
  if (user?.role === "company") return <CompanyDashboard />;
  return <StudentDashboard />;
}
