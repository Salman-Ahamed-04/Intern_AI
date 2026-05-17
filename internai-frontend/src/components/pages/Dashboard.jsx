import { Users, Building2, Briefcase, CheckCircle, Zap, Calendar, TrendingUp, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApi } from "../../lib/useApi";
import { dashboardApi } from "../../lib/api";
import { useAuth } from "../../store/auth";
import { useState } from "react";

// ─── MINI CALENDAR ───────────────────────────────────────────────────
const CAL_DAYS = ["Mo","Tu","We","Th","Fr","Sa","Su"];
const CAL_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function MiniCalendar({ interviews = [] }) {
  const today = new Date();
  const [cur, setCur] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const prev = () => setCur(c => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 });
  const next = () => setCur(c => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 });

  const firstDay = new Date(cur.year, cur.month, 1).getDay();
  const daysInMonth = new Date(cur.year, cur.month + 1, 0).getDate();
  const startOffset = (firstDay === 0 ? 6 : firstDay - 1);
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const interviewDays = new Set(
    (interviews || [])
      .map(i => {
        if (!i.scheduledDate) return null;
        const d = new Date(i.scheduledDate);
        return d.getFullYear() === cur.year && d.getMonth() === cur.month ? d.getDate() : null;
      })
      .filter(Boolean)
  );

  const isToday = (d) => d === today.getDate() && cur.month === today.getMonth() && cur.year === today.getFullYear();

  return (
    <div className="card" style={{ padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>{CAL_MONTHS[cur.month]}</span>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{cur.year}</span>
          <Zap size={12} style={{ color: "var(--primary)", marginLeft: 2 }} />
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          <button onClick={prev} className="btn btn-ghost" style={{ padding: "3px 5px" }}><ChevronLeft size={13} /></button>
          <button onClick={next} className="btn btn-ghost" style={{ padding: "3px 5px" }}><ChevronRight size={13} /></button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
        {CAL_DAYS.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, color: "var(--text-muted)", fontWeight: 500, padding: "2px 0" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
        {cells.map((d, i) => (
          <div key={i} style={{
            height: 26, display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 5, fontSize: 11, position: "relative",
            background: isToday(d) ? "var(--primary)" : "transparent",
            color: isToday(d) ? "white" : d ? "var(--text)" : "transparent",
            fontWeight: isToday(d) ? 600 : 400,
            cursor: d ? "pointer" : "default",
          }}>
            {d}
            {d && interviewDays.has(d) && !isToday(d) && (
              <span style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "var(--primary)" }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

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
          <div className="grid-4 anim-list">
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

      <div className="right-panel" style={{ width:268, flexShrink:0, display:"flex", flexDirection:"column", gap:12 }}>
        {/* Mini Calendar */}
        <MiniCalendar interviews={interviews} />

        {/* Upcoming Interviews */}
        <div className="card">
          <div style={{ padding:"10px 14px", borderBottom:"var(--border)", fontWeight:600, fontSize:12.5, display:"flex", alignItems:"center", gap:6 }}>
            <Calendar size={12} style={{ color:"var(--primary)" }} /> Upcoming Interviews
          </div>
          {il ? <div style={{ padding:14, color:"var(--text-muted)", fontSize:12 }}>Loading...</div>
            : interviews.length === 0 ? <div style={{ padding:14, color:"var(--text-muted)", fontSize:12 }}>No upcoming interviews</div>
            : (
              <div style={{ padding:"6px 0" }}>
                {interviews.map(i => (
                  <div key={i._id} style={{ padding:"8px 14px", borderBottom:"1px solid var(--border-color)" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:2 }}>
                      <div style={{ fontWeight:500, fontSize:12 }}>{i.candidateId?.name}</div>
                      <div style={{ fontSize:11, color:"var(--text-muted)" }}>{i.scheduledTime}</div>
                    </div>
                    <div style={{ fontSize:11, color:"var(--text-muted)" }}>{i.companyId?.name}{i.role ? ` · ${i.role}` : ""}</div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* AI Insights Card */}
        <div className="card" style={{ padding:"16px", background:"#f0faf6", border:"1px solid #b8e8d8", position:"relative", overflow:"hidden" }}>
          <div style={{ fontSize:18, marginBottom:8 }}>✦</div>
          <div style={{ fontWeight:600, fontSize:13, lineHeight:1.4, marginBottom:6 }}>
            Need Quick Insights Or Help Managing Your Pipeline?
          </div>
          <p style={{ fontSize:11.5, color:"var(--text-secondary)", lineHeight:1.5, marginBottom:12 }}>
            Use AI to summarize matches, draft outreach messages, or get hiring recommendations instantly.
          </p>
          <button
            className="btn btn-primary"
            style={{ fontSize:11.5, padding:"6px 12px" }}
            onClick={() => navigate("/analytics")}
          >
            View Analytics →
          </button>
          <div style={{ position:"absolute", bottom:10, right:14, fontSize:22, opacity:0.18 }}>🐟</div>
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

// ─── OVERVIEW SECTION ───────────────────────────────────────────────
function OverviewSection() {
  const navigate = useNavigate();

  const features = [
    {
      emoji: "🧠",
      iconBg: "#eef2ff",
      title: "Intelligent Matching",
      desc: "AI reasoning automatically matches student skills with company requirements, eliminating manual search effort.",
    },
    {
      emoji: "🎯",
      iconBg: "#e8f5f0",
      title: "Centralized Platform",
      desc: "A single, free destination connecting students with curated, high-quality opportunities across industries.",
    },
    {
      emoji: "⚡",
      iconBg: "#fef3f2",
      title: "Faster Hiring",
      desc: "Helps companies filter through noise and find suitable interns faster with AI-verified skill profiles.",
    },
  ];

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Hero card */}
      <div className="card" style={{ padding: "32px 36px 28px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 620 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>
            Solving the Internship Placement Gap
          </h2>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            Many undergraduates, HND students, and fresh graduates struggle to find suitable internships
            because opportunities are scattered, and manual matching is inefficient. Our centralized AI platform
            bridges this gap.
          </p>
        </div>
        <div style={{ position: "absolute", right: 40, top: "50%", transform: "translateY(-50%)", fontSize: 72, opacity: 0.1, userSelect: "none" }}>🤝</div>
      </div>

      {/* Feature cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 16 }}>
        {features.map(({ emoji, iconBg, title, desc }) => (
          <div key={title} className="card feature-card" style={{ padding: "22px 20px" }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10, background: iconBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, marginBottom: 14
            }}>
              {emoji}
            </div>
            <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 8 }}>{title}</div>
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* CTA footer strip */}
      <div style={{
        background: "var(--surface-2)", border: "var(--border)", borderRadius: "var(--radius)",
        padding: "28px 36px", display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 20
      }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
            Ready to streamline your internship placements?
          </h3>
          <p style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
            Join universities and companies already using InternAI to match top talent.
          </p>
        </div>
        <div style={{ display: "flex", gap: 32, flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>Contact Support</div>
            <a href="mailto:admin@internai.edu" style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>ADMIN@INTERNAI.EDU</a>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>Visit Portal</div>
            <a href="https://internai.edu" target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>INTERNAI.EDU</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT EXPORT ────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const tab = new URLSearchParams(location.search).get("tab");

  if (tab === "overview") return <OverviewSection />;
  if (user?.role === "admin")   return <AdminDashboard />;
  if (user?.role === "company") return <CompanyDashboard />;
  return <StudentDashboard />;
}
