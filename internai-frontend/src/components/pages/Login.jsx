import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Moon, Sun } from "lucide-react";
import { useAuth } from "../../store/auth";
import { useTheme } from "../../store/theme";
import Logo from "../../assets/Logo.png";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";

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

  const t = dark ? {
    pageBg:      "linear-gradient(135deg, #0d1b4b 0%, #1a2a6b 50%, #0d1b4b 100%)",
    circle1:     "rgba(255,165,0,0.18)",
    circle2:     "rgba(255,50,100,0.13)",
    heading:     "white",
    subtitle:    "rgba(255,255,255,0.6)",
    pillBg:      "rgba(255,255,255,0.07)",
    pillBorder:  "rgba(255,255,255,0.1)",
    pillText:    "rgba(255,255,255,0.8)",
    formBg:      "rgba(255,255,255,0.04)",
    formBorder:  "rgba(255,255,255,0.09)",
    formShadow:  "none",
    formHeading: "white",
    formSub:     "rgba(255,255,255,0.5)",
    labelColor:  "rgba(255,255,255,0.55)",
    inputBg:     "rgba(255,255,255,0.08)",
    inputBorder: "rgba(255,255,255,0.15)",
    inputColor:  "white",
    eyeColor:    "rgba(255,255,255,0.45)",
    rememberClr: "rgba(255,255,255,0.5)",
    errorBg:     "rgba(220,38,38,0.15)",
    errorBorder: "rgba(220,38,38,0.35)",
    errorText:   "#fca5a5",
    footerLink:  "rgba(255,255,255,0.35)",
    copyright:   "rgba(255,255,255,0.2)",
    toggleBg:    "rgba(255,255,255,0.1)",
    toggleBdr:   "rgba(255,255,255,0.15)",
    toggleClr:   "rgba(255,255,255,0.75)",
    badgeBg:     "rgba(255,255,255,0.06)",
    badgeBdr:    "rgba(255,255,255,0.1)",
    logoShadow:  "rgba(255,100,50,0.35)",
    blur:        "blur(16px)",
  } : {
    pageBg:      "#f0f4f8",
    circle1:     "rgba(240,153,43,0.15)",
    circle2:     "rgba(26,158,117,0.12)",
    heading:     "#1a2a6b",
    subtitle:    "#64748b",
    pillBg:      "white",
    pillBorder:  "#e2e8f0",
    pillText:    "#334155",
    formBg:      "white",
    formBorder:  "#e2e8f0",
    formShadow:  "-4px 0 24px rgba(0,0,0,0.05)",
    formHeading: "#1e293b",
    formSub:     "#94a3b8",
    labelColor:  "#64748b",
    inputBg:     "#f8fafc",
    inputBorder: "#e2e8f0",
    inputColor:  "#1e293b",
    eyeColor:    "#94a3b8",
    rememberClr: "#64748b",
    errorBg:     "#fef2f2",
    errorBorder: "#fecaca",
    errorText:   "#dc2626",
    footerLink:  "#94a3b8",
    copyright:   "#cbd5e1",
    toggleBg:    "white",
    toggleBdr:   "#e2e8f0",
    toggleClr:   "#64748b",
    badgeBg:     "rgba(26,42,107,0.06)",
    badgeBdr:    "rgba(26,42,107,0.1)",
    logoShadow:  "rgba(240,153,43,0.25)",
    blur:        "none",
  };

  return (
    <div style={{
      minHeight:"100vh", display:"flex",
      background: t.pageBg,
      overflow:"hidden", position:"relative",
      transition:"background 0.3s ease",
    }}>

      {/* Toggle button */}
      <button
        onClick={toggle}
        title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        style={{
          position:"absolute", top:18, right:18, zIndex:10,
          display:"flex", alignItems:"center", gap:7,
          padding:"8px 14px", borderRadius:20,
          background: t.toggleBg,
          border:`1px solid ${t.toggleBdr}`,
          color: t.toggleClr,
          cursor:"pointer", fontSize:12.5, fontWeight:500,
          backdropFilter: dark ? "blur(8px)" : "none",
          boxShadow: dark ? "none" : "0 1px 4px rgba(0,0,0,0.07)",
          transition:"all 0.25s ease",
        }}
      >
        {dark ? <Sun size={14}/> : <Moon size={14}/>}
        {dark ? "Light Mode" : "Dark Mode"}
      </button>

      {/* Background circles */}
      <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", border:`1.5px solid ${t.circle1}`, top:-100, left:-100, animation:"floatUp 6s ease-in-out infinite" }}/>
      <div style={{ position:"absolute", width:340, height:340, borderRadius:"50%", border:`1.5px solid ${t.circle2}`, bottom:-80, right:-60, animation:"floatUp 8s ease-in-out infinite reverse" }}/>
      <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle, rgba(26,158,117,0.07) 0%, transparent 70%)", top:"40%", right:"10%" }}/>

      {/* Left panel */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 40px", position:"relative", animation:"fadeInLeft 0.6s cubic-bezier(0.22,1,0.36,1) both" }}>
        <img src={Logo} alt="InternAI Logo" style={{ width:200, height:200, objectFit:"contain", marginBottom:28, filter:`drop-shadow(0 8px 32px ${t.logoShadow})`, animation:"floatUp 4s ease-in-out infinite" }}/>

        <h1 style={{ fontSize:38, fontWeight:800, color:t.heading, letterSpacing:"-1px", marginBottom:10, textAlign:"center", transition:"color 0.3s ease" }}>
          INTERN<span style={{ color:"#f0992b" }}>AI</span>
        </h1>
        <p style={{ fontSize:14, color:t.subtitle, textAlign:"center", maxWidth:280, lineHeight:1.7, transition:"color 0.3s ease" }}>
          The AI-powered internship placement platform connecting students with top companies.
        </p>

        <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:32, width:"100%", maxWidth:280 }}>
          {[
            { emoji:"🧠", text:"Intelligent AI Matching" },
            { emoji:"🎯", text:"Centralized Opportunities" },
            { emoji:"⚡", text:"Faster Hiring Process" },
          ].map(({ emoji, text }, i) => (
            <div key={text} style={{
              display:"flex", alignItems:"center", gap:10,
              background:t.pillBg, borderRadius:8, padding:"10px 14px",
              border:`1px solid ${t.pillBorder}`,
              backdropFilter: dark ? "blur(6px)" : "none",
              boxShadow: dark ? "none" : "0 1px 4px rgba(0,0,0,0.06)",
              animation:`fadeInLeft 0.5s ${0.2 + i*0.1}s cubic-bezier(0.22,1,0.36,1) both`, opacity:0,
              transition:"background 0.3s ease, border-color 0.3s ease",
            }}>
              <span style={{ fontSize:18 }}>{emoji}</span>
              <span style={{ fontSize:12.5, color:t.pillText, fontWeight:500, transition:"color 0.3s ease" }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Mode info badge */}
        <div style={{
          marginTop:36, display:"flex", alignItems:"center", gap:7,
          padding:"8px 16px", borderRadius:20,
          background:t.badgeBg, border:`1px solid ${t.badgeBdr}`,
          fontSize:11.5, color:t.subtitle, transition:"all 0.3s ease",
        }}>
          {dark
            ? <><Moon size={12}/>&nbsp;Dark mode — easier on the eyes at night</>
            : <><Sun size={12}/>&nbsp;Light mode — clear and clean for daytime</>
          }
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        width:420, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        padding:"40px 36px",
        background:t.formBg, backdropFilter:t.blur,
        borderLeft:`1px solid ${t.formBorder}`,
        boxShadow:t.formShadow,
        animation:"fadeInRight 0.6s 0.1s cubic-bezier(0.22,1,0.36,1) both", opacity:0,
        transition:"background 0.3s ease, border-color 0.3s ease",
      }}>
        <div style={{ width:"100%", maxWidth:340 }}>
          <div style={{ marginBottom:28 }}>
            <h2 style={{ fontSize:20, fontWeight:700, color:t.formHeading, marginBottom:6, transition:"color 0.3s ease" }}>Welcome back 👋</h2>
            <p style={{ fontSize:12.5, color:t.formSub, transition:"color 0.3s ease" }}>Sign in to your dashboard to continue</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {error && (
              <div style={{ background:t.errorBg, border:`1px solid ${t.errorBorder}`, borderRadius:8, padding:"10px 14px", fontSize:12, color:t.errorText, animation:"fadeInDown 0.2s ease both" }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ display:"block", fontSize:11.5, fontWeight:600, marginBottom:6, color:t.labelColor, textTransform:"uppercase", letterSpacing:"0.5px", transition:"color 0.3s ease" }}>
                Email Address
              </label>
              <input className="input" type="email" placeholder="your@email.com" required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                style={{ background:t.inputBg, border:`1px solid ${t.inputBorder}`, color:t.inputColor, borderRadius:8, transition:"all 0.3s ease" }}
              />
            </div>

            <div>
              <label style={{ display:"block", fontSize:11.5, fontWeight:600, marginBottom:6, color:t.labelColor, textTransform:"uppercase", letterSpacing:"0.5px", transition:"color 0.3s ease" }}>
                Password
              </label>
              <div style={{ position:"relative" }}>
                <input className="input" type={show ? "text" : "password"} placeholder="••••••••" required
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ paddingRight:36, background:t.inputBg, border:`1px solid ${t.inputBorder}`, color:t.inputColor, borderRadius:8, transition:"all 0.3s ease" }}
                />
                <button type="button" onClick={() => setShow(!show)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:t.eyeColor }}>
                  {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:12 }}>
              <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", color:t.rememberClr }}>
                <input type="checkbox"/> Remember me
              </label>
              <a href="#" style={{ color:"#f0992b", fontWeight:500 }}>Forgot password?</a>
            </div>

            <button className="btn btn-primary" type="submit"
              style={{ justifyContent:"center", padding:"11px", fontSize:13.5, marginTop:4, borderRadius:8, fontWeight:600 }}
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <div style={{ textAlign:"center", marginTop:22, fontSize:12, color:t.footerLink }}>
            Don't have an account?{" "}
            <a href="/register" style={{ color:"#1a9e75", fontWeight:500 }}>Create an account</a>
          </div>

          <p style={{ textAlign:"center", fontSize:11, color:t.copyright, marginTop:28 }}>
            © 2024 InternAI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
