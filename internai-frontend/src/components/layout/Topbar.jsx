import { Bell, Search, LogOut, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { useTheme } from "../../store/theme";
import { useState } from "react";
import { useNavigate as useNav } from "react-router-dom";

export default function Topbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleLogout = () => { logout(); navigate("/login"); };

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim()) {
      // Global search: navigate to the right page based on keyword
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

  return (
    <div style={{
      height: 52, borderBottom: "var(--border)", display: "flex", alignItems: "center",
      padding: "0 20px", gap: 12, background: "var(--surface)", flexShrink: 0,
      transition: "background var(--transition), border-color var(--transition)"
    }}>
      <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
        <Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input
          className="input"
          style={{ paddingLeft: 28, fontSize: 12, height: 32 }}
          placeholder="Search pages… (press Enter)"
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
        <button className="btn btn-ghost" style={{ padding: "6px 8px", position: "relative" }}>
          <Bell size={15} />
          <span style={{ position: "absolute", top: 4, right: 4, width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }} />
        </button>

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
  );
}
