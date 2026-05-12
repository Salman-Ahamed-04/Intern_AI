import { Clock, CheckCircle, XCircle, Building2 } from "lucide-react";
import { useAuth } from "../../store/auth";

export default function PendingApproval() {
  const { user, logout } = useAuth();
  const status = user?.profile?.approvalStatus || "pending";

  const config = {
    pending: {
      icon: <Clock size={40} style={{ color:"#f0992b" }}/>,
      title: "Awaiting Admin Approval",
      message: "Your company account has been submitted and is under review. You'll be able to post internships once an admin approves your account.",
      color: "#f0992b",
      bg: "#fff8e1",
    },
    rejected: {
      icon: <XCircle size={40} style={{ color:"#e24b4a" }}/>,
      title: "Account Not Approved",
      message: user?.profile?.approvalNote
        ? `Your account was not approved. Reason: ${user.profile.approvalNote}`
        : "Your company account was not approved. Please contact the admin for more information.",
      color: "#e24b4a",
      bg: "#fef2f2",
    },
  };

  const c = config[status] || config.pending;

  return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg, #f0faf6 0%, #e8f5f0 40%, #f7f8fa 100%)"
    }}>
      <div style={{ maxWidth:480, width:"100%", padding:24, textAlign:"center" }}>
        <div style={{ marginBottom:16 }}>
          <div style={{ width:36, height:36, background:"var(--primary)", borderRadius:10,
            display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:8 }}>
            <Building2 size={18} color="white"/>
          </div>
          <div style={{ fontSize:20, fontWeight:700 }}>InternAI</div>
        </div>

        <div className="card" style={{ padding:36 }}>
          <div style={{ marginBottom:16 }}>{c.icon}</div>
          <h2 style={{ fontSize:18, fontWeight:700, marginBottom:10 }}>{c.title}</h2>
          <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.7, marginBottom:24 }}>
            {c.message}
          </p>

          <div style={{ background:c.bg, borderRadius:8, padding:"12px 16px", marginBottom:24, fontSize:12, color:c.color }}>
            {status === "pending"
              ? "Typical review time is 1–2 business days."
              : "You may register a new account or contact support."}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {status === "pending" && (
              <div style={{ fontSize:12, color:"var(--text-muted)" }}>
                Logged in as <strong>{user?.name}</strong> ({user?.email})
              </div>
            )}
            <button className="btn" style={{ width:"100%", justifyContent:"center" }}
              onClick={() => { logout(); window.location.href = "/login"; }}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
