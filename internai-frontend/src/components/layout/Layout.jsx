import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  const location = useLocation();
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar />
        <main
          key={location.pathname + location.search}
          className="page-enter"
          style={{ flex: 1, overflowY: "auto", padding: 20 }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
