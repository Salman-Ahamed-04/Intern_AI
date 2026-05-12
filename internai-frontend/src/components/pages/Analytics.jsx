import { useApi } from "../../lib/useApi";
import { analyticsApi } from "../../lib/api";

const BAR_COLORS = ["#1a9e75","#2cb88a","#3dd0a0","#51e0b5","#6deec8","#8df5d8","#b0faec","#d5fef5"];

export default function Analytics() {
  const { data: overviewRes,  loading: ol } = useApi(analyticsApi.overview);
  const { data: monthlyRes,   loading: ml } = useApi(analyticsApi.monthly);
  const { data: companiesRes, loading: cl } = useApi(analyticsApi.topCompanies);
  const { data: skillsRes,    loading: sl } = useApi(analyticsApi.topSkills);

  const overview  = overviewRes?.data;
  const monthly   = monthlyRes?.data  || [];
  const companies = companiesRes?.data || [];
  const skills    = skillsRes?.data   || [];

  const maxMatches = Math.max(...monthly.map(m => m.matches), 1);
  const maxSkill   = Math.max(...skills.map(s => s.count), 1);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Analytics</div>
          <div className="page-subtitle">Platform performance and insights</div>
        </div>
      </div>

      {/* Overview KPIs */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {ol ? (
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading...</div>
        ) : [
          { label: "Total Matches",      value: overview?.totalMatches },
          { label: "Placements",         value: overview?.placements },
          { label: "Active Students",    value: overview?.activeStudents },
          { label: "Avg Match Score",    value: overview?.avgMatchScore ? `${overview.avgMatchScore}%` : "—" },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value ?? "—"}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Monthly chart */}
        <div className="card">
          <div style={{ padding: "12px 16px", borderBottom: "var(--border)", fontWeight: 600, fontSize: 13 }}>Monthly Matches & Placements</div>
          {ml ? (
            <div style={{ padding: 20, color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
          ) : (
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 140 }}>
                {monthly.map((m, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: 120, gap: 2 }}>
                      <div style={{ width: "60%", height: `${(m.placements / maxMatches) * 100}%`, background: "#2cb88a", borderRadius: "2px 2px 0 0", minHeight: 2 }} title={`Placements: ${m.placements}`} />
                      <div style={{ width: "100%", height: `${(m.matches / maxMatches) * 100}%`, background: "#e8f5f0", border: "1px solid #c5eadf", borderRadius: "2px 2px 0 0", minHeight: 2 }} title={`Matches: ${m.matches}`} />
                    </div>
                    <span style={{ fontSize: 9, color: "var(--text-muted)" }}>{m.month}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 11 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, background: "#e8f5f0", border: "1px solid #c5eadf", display: "inline-block", borderRadius: 2 }} />Matches</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, background: "#2cb88a", display: "inline-block", borderRadius: 2 }} />Placements</span>
              </div>
            </div>
          )}
        </div>

        {/* Top skills */}
        <div className="card">
          <div style={{ padding: "12px 16px", borderBottom: "var(--border)", fontWeight: 600, fontSize: 13 }}>Top Skills in Demand</div>
          {sl ? (
            <div style={{ padding: 20, color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
          ) : (
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {skills.map((s, i) => (
                <div key={s.skill} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 90, fontSize: 12, fontWeight: 500, color: "var(--text)" }}>{s.skill}</span>
                  <div style={{ flex: 1, height: 8, borderRadius: 4, background: "#f0f0f0", overflow: "hidden" }}>
                    <div style={{ width: `${(s.count / maxSkill) * 100}%`, height: "100%", background: BAR_COLORS[i % BAR_COLORS.length], borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", width: 20, textAlign: "right" }}>{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top companies */}
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div style={{ padding: "12px 16px", borderBottom: "var(--border)", fontWeight: 600, fontSize: 13 }}>Top Hiring Companies</div>
          {cl ? (
            <div style={{ padding: 20, color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
          ) : (
            <table>
              <thead><tr><th>#</th><th>Company</th><th>Industry</th><th>Total Hires</th><th>Open Roles</th></tr></thead>
              <tbody>
                {companies.map((c, i) => (
                  <tr key={c._id}>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>#{i + 1}</td>
                    <td style={{ fontWeight: 500, fontSize: 12.5 }}>{c.name}</td>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{c.industry}</td>
                    <td><span style={{ fontWeight: 700, color: "var(--primary)" }}>{c.totalHires}</span></td>
                    <td><span style={{ background: "var(--primary-light)", color: "var(--primary)", fontWeight: 600, fontSize: 12, padding: "2px 8px", borderRadius: 4 }}>{c.openRoles}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
