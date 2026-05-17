import { Bell, Search, LogOut, Sun, Moon } from "lucide-react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { useTheme } from "../../store/theme";
import { useNotifications } from "../../store/notifications";
import { useState, useRef, useEffect } from "react";
import NotificationDropdown from "../../components/NotificationDropdown";

// Nav tabs per role
const adminTabs = [
  { label: "Overview",     to: "/dashboard?tab=overview" },
  { label: "Applications", to: "/applications" },
  { label: "Matches",      to: "/matches" },
  { label: "Companies",    to: "/companies" },
];
const companyTabs = [
  { label: "Overview",    to: "/dashboard?tab=overview" },
  { label: "Applicants",  to: "/company-applicants" },
  { label: "Matches",     to: "/company-matches" },
  { label: "Interviews",  to: "/company-interviews" },
];
const studentTabs = [
  { label: "Overview",      to: "/dashboard?tab=overview" },
  { label: "Browse",        to: "/browse" },
  { label: "Applications",  to: "/my-applications" },
  { label: "Matches",       to: "/my-matches" },
];

export default function Topbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const bellRef = useRef(null);

  const handleLogout = () => { logout(); navigate("/login"); };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim()) {
      const q = search.toLowerCase();
      if (q.includes("candidate") || q.includes("student")) navigate("/candidates");
      else if (q.includes("compan")) navigate("/companies");
      else if (q.includes("match")) navigate("/matches");
      else if (q.includes("interview")) navigate("/interviews");
      else if (q.includes("application") || q.includes("apply")) navigate("/applications");
      else if (q.includes("analytic") || q.includes("stat")) navigate("/analytics");
      else navigate("/dashboard");
      setSearch("");
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase()
    : "?";

  const role = user?.role || "student";
  const tabs = role === "admin" ? adminTabs : role === "company" ? companyTabs : studentTabs;

  return (
    <div style={{
      borderBottom: "var(--border)", background: "var(--surface)", flexShrink: 0,
      transition: "background var(--transition), border-color var(--transition)"
    }}>
      {/* Top row: search + user controls */}
      <div style={{ height: 52, display: "flex", alignItems: "center", padding: "0 20px", gap: 12 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
          <Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            className="input"
            style={{ paddingLeft: 28, fontSize: 12, height: 32 }}
            placeholder="Search internships, skills…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {/* Dark/Light toggle */}
          <button className="btn btn-ghost" style={{ padding: "6px 8px" }} onClick={toggle} title="Toggle theme">
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Bell */}
          <div ref={bellRef} style={{ position: "relative" }}>
            <button
              className="btn btn-ghost"
              style={{ padding: "6px 8px", position: "relative" }}
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span style={{ position: "absolute", top: 4, right: 4, width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }} />
              )}
            </button>
            <NotificationDropdown
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>

          {/* User */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 600 }}>
              {initials}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>{user?.name || "Admin"}</span>
              <span style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.2, textTransform: "capitalize" }}>{user?.role || "staff"}</span>
            </div>
          </div>

          <button className="btn btn-ghost" style={{ padding: "6px 8px" }} onClick={handleLogout} title="Logout">
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* Tab navigation row */}
      <div style={{ display: "flex", alignItems: "center", padding: "0 20px", gap: 4, marginBottom: -1 }}>
        {tabs.map(({ label, to }) => {
          const [tabPath, tabQuery] = to.split("?");
          const tabParam = tabQuery ? new URLSearchParams(tabQuery).get("tab") : null;
          const currentParam = new URLSearchParams(location.search).get("tab");
          const isActive = tabParam
            ? location.pathname === tabPath && currentParam === tabParam
            : location.pathname === tabPath && !currentParam;
          return (
            <NavLink
              key={to}
              to={to}
              style={{
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? "var(--primary)" : "var(--text-secondary)",
                borderBottom: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                textDecoration: "none",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
