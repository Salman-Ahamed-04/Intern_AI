import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../store/auth";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [show,    setShow]    = useState(false);
  const [form,    setForm]    = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #f0faf6 0%, #e8f5f0 40%, #f7f8fa 100%)"
    }}>
      <div style={{ width: "100%", maxWidth: 400, padding: 24 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, background: "var(--primary)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={20} color="white" fill="white" />
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px" }}>InternAI</span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Sign in to your admin dashboard</p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {error && (
              <div style={{ background: "#fff0f0", border: "1px solid #fcc", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#c00" }}>
                {error}
              </div>
            )}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 6, color: "var(--text-secondary)" }}>Email Address</label>
              <input className="input" type="email" placeholder="admin@internai.edu" required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 6, color: "var(--text-secondary)" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input className="input" type={show ? "text" : "password"} placeholder="••••••••" required
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ paddingRight: 36 }} />
                <button type="button" onClick={() => setShow(!show)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: "var(--text-secondary)" }}>
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" style={{ color: "var(--primary)", fontWeight: 500 }}>Forgot password?</a>
            </div>
            <button className="btn btn-primary" type="submit"
              style={{ justifyContent: "center", padding: "10px", fontSize: 13, marginTop: 4 }} disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--text-muted)" }}>
            Don't have an account? <a href="#" style={{ color: "var(--primary)", fontWeight: 500 }}>Contact Admin</a>
          </div>
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 20 }}>
          © 2024 InternAI. All rights reserved.
        </p>
      </div>
    </div>
  );
}
