import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Zap, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../store/auth";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [show,    setShow]    = useState(false);
  const [form,    setForm]    = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        (import.meta.env.VITE_API_URL || "http://localhost:5000/api") + "/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      // auto-login after register
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed.");
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
          <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Create your account</p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {error && (
              <div style={{ background: "#fff0f0", border: "1px solid #fcc", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#c00" }}>
                {error}
              </div>
            )}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 6, color: "var(--text-secondary)" }}>Full Name</label>
              <input className="input" type="text" placeholder="John Doe" required
                value={form.name} onChange={e => set("name", e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 6, color: "var(--text-secondary)" }}>Email Address</label>
              <input className="input" type="email" placeholder="your@email.com" required
                value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 6, color: "var(--text-secondary)" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input className="input" type={show ? "text" : "password"} placeholder="Min. 6 characters" required
                  value={form.password} onChange={e => set("password", e.target.value)}
                  style={{ paddingRight: 36 }} />
                <button type="button" onClick={() => setShow(!show)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 6, color: "var(--text-secondary)" }}>Confirm Password</label>
              <input className="input" type="password" placeholder="Re-enter password" required
                value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit"
              style={{ justifyContent: "center", padding: "10px", fontSize: 13, marginTop: 4 }} disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
          <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--primary)", fontWeight: 500 }}>Sign in</Link>
          </div>
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 20 }}>
          © 2024 InternAI. All rights reserved.
        </p>
      </div>
    </div>
  );
}
