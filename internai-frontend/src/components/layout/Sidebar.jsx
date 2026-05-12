import { NavLink } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, Zap, Building2,
  Users, Calendar, BarChart2, LogOut
} from "lucide-react";

const navItems = [
  { to: "/dashboard",    icon: LayoutDashboard, label: "Dashboard" },
  { to: "/applications", icon: Briefcase,        label: "Applications" },
  { to: "/matches",      icon: Zap,              label: "Matches" },
  { to: "/companies",    icon: Building2,         label: "Companies" },
  { to: "/candidates",   icon: Users,             label: "Candidates" },
  { to: "/interviews",   icon: Calendar,          label: "Interviews" },
  { to: "/analytics",    icon: BarChart2,         label: "Analytics" },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside style={{
      width: "var(--sidebar-w)", minWidth: "var(--sidebar-w)",
      background: "var(--surface)", borderRight: "var(--border)",
      display: "flex", flexDirection: "column", height: "100vh",
      position: "sticky", top: 0, overflow: "hidden",
      transition: "background var(--transition), border-color var(--transition)"
    }}>
      {/* Logo */}
      <div style={{ padding: "18px 16px 14px", borderBottom: "var(--border-light)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 28, height: 28, background: "var(--primary)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={15} color="white" fill="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px" }}>InternAI</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: "flex", alignItems: "center", gap: 9,
            padding: "8px 10px", borderRadius: 6, marginBottom: 2,
            fontSize: 13, fontWeight: isActive ? 500 : 400,
            color: isActive ? "var(--primary)" : "var(--text-secondary)",
            background: isActive ? "var(--primary-light)" : "transparent",
            borderRight: isActive ? "2px solid var(--primary)" : "2px solid transparent",
            transition: "all 0.15s", textDecoration: "none"
          })}>
            {({ isActive }) => (
              <>
                <Icon size={15} style={{ opacity: isActive ? 1 : 0.65 }} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ borderTop: "var(--border)", padding: "10px 8px" }}>
        <button
          className="btn btn-ghost"
          style={{ width: "100%", justifyContent: "flex-start", gap: 9, padding: "8px 10px", fontSize: 13, color: "#ef4444" }}
          onClick={() => { logout(); navigate("/login"); }}
        >
          <LogOut size={15} style={{ opacity: 0.8 }} /> Logout
        </button>
      </div>
    </aside>
  );
}
