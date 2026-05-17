import { NavLink } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, Zap, Building2,
  Users, Calendar, BarChart2, LogOut, Search, ShieldCheck
} from "lucide-react";

import Logo from "../../assets/Logo.png";

const adminNav = [
  { to: "/dashboard",    icon: LayoutDashboard, label: "Dashboard" },
  { to: "/approvals",    icon: ShieldCheck,      label: "Approvals" },
  { to: "/applications", icon: Briefcase,        label: "Applications" },
  { to: "/matches",      icon: Zap,              label: "Matches" },
  { to: "/companies",    icon: Building2,         label: "Companies" },
  { to: "/candidates",   icon: Users,             label: "Candidates" },
  { to: "/interviews",   icon: Calendar,          label: "Interviews" },
  { to: "/analytics",    icon: BarChart2,         label: "Analytics" },
];

const studentNav = [
  { to: "/dashboard",        icon: LayoutDashboard, label: "Dashboard" },
  { to: "/browse",           icon: Search,           label: "Browse Internships" },
  { to: "/my-applications",  icon: Briefcase,        label: "My Applications" },
  { to: "/my-matches",       icon: Zap,              label: "My Matches" },
  { to: "/my-interviews",    icon: Calendar,         label: "My Interviews" },
  { to: "/my-profile",       icon: Users,            label: "My Profile" },
];

const companyNav = [
  { to: "/dashboard",          icon: LayoutDashboard, label: "Dashboard" },
  { to: "/post-internship",    icon: Briefcase,        label: "Post Internship" },
  { to: "/company-applicants", icon: Users,            label: "Applicants" },
  { to: "/company-matches",    icon: Zap,              label: "Matches" },
  { to: "/company-interviews", icon: Calendar,         label: "Interviews" },
  { to: "/company-profile",    icon: Building2,        label: "Company Profile" },
  { to: "/analytics",          icon: BarChart2,        label: "Analytics" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || "student";
  const navItems = role === "admin" ? adminNav : role === "company" ? companyNav : studentNav;

  return (
    <aside style={{
      width: "var(--sidebar-w)", minWidth: "var(--sidebar-w)",
      background: "var(--surface)", borderRight: "var(--border)",
      display: "flex", flexDirection: "column", height: "100vh",
      position: "sticky", top: 0, overflow: "hidden",
      transition: "background var(--transition), border-color var(--transition)"
    }}>
      {/* Logo */}
      <div style={{ padding: "14px 16px 12px", borderBottom: "var(--border-light)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <img
            src={Logo}
            alt="InternAI"
            style={{ width: 34, height: 34, objectFit: "contain", borderRadius: 6, flexShrink: 0 }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              INTERN<span style={{ color: "var(--primary)" }}>AI</span>
            </div>
            <div style={{ fontSize: 9.5, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: 1.2 }}>
              {role === "admin" ? "Admin Panel" : role === "company" ? "Company Portal" : "Student Portal"}
            </div>
          </div>
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
      <div style={{ padding: "10px 8px", borderTop: "var(--border-light)" }}>
        <button
          onClick={() => { logout(); navigate("/login"); }}
          style={{
            display: "flex", alignItems: "center", gap: 9,
            padding: "8px 10px", borderRadius: 6, width: "100%",
            fontSize: 13, color: "#e24b4a", background: "transparent",
            border: "none", cursor: "pointer", transition: "background 0.15s"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  );
}
