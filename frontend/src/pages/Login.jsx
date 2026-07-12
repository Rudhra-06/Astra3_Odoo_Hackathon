import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const inp = {
  width: "100%", height: 44, padding: "0 14px",
  background: "#F8FAFC", border: "1px solid #E2E8F0",
  borderRadius: 10, fontSize: 13, color: "#0F172A",
  outline: "none", transition: "all 0.15s", boxSizing: "border-box",
};

function Input({ type = "text", placeholder, value, onChange, required }) {
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={onChange} required={required}
      style={inp}
      onFocus={e => { e.target.style.borderColor = "#2563EB"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)"; }}
      onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.background = "#F8FAFC"; e.target.style.boxShadow = "none"; }}
    />
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{label}</label>
      {children}
    </div>
  );
}

function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  if (sent) return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <p style={{ fontSize: 13, color: "#0F172A", marginBottom: 16 }}>Reset link sent to <strong>{email}</strong></p>
      <button onClick={onBack} style={{ fontSize: 13, color: "#2563EB", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Back to sign in</button>
    </div>
  );
  return (
    <form onSubmit={e => { e.preventDefault(); setSent(true); }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Field label="Email address"><Input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required /></Field>
      <button type="submit" style={{ height: 44, background: "#2563EB", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Send reset link</button>
      <button type="button" onClick={onBack} style={{ fontSize: 12, color: "#94A3B8", background: "none", border: "none", cursor: "pointer" }}>Back to sign in</button>
    </form>
  );
}

export default function Login() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  async function handleSubmit(e) {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await signup(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) { setError(err.message || "Something went wrong."); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#F1F5F9" }}>
      {/* Left panel */}
      <div style={{
        width: 480, flexShrink: 0, background: "#0F172A",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "40px 48px", position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(37,99,235,0.08)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(37,99,235,0.06)" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#2563EB,#1D4ED8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(37,99,235,0.4)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          <div>
            <p style={{ color: "#F8FAFC", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em", lineHeight: 1 }}>AssetFlow</p>
            <p style={{ color: "#475569", fontSize: 11, marginTop: 3 }}>Enterprise ERP</p>
          </div>
        </div>

        {/* Hero text */}
        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.25)", borderRadius: 99, padding: "4px 12px", marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6" }} />
            <span style={{ fontSize: 11, color: "#93C5FD", fontWeight: 600 }}>Enterprise Asset Management</span>
          </div>
          <h2 style={{ color: "#F8FAFC", fontSize: 34, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 16 }}>
            Track every asset.<br />Manage every resource.
          </h2>
          <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.7 }}>
            A unified platform for asset registration, allocation, maintenance, and resource booking — built for modern enterprises.
          </p>

          {/* Stats */}
          <div style={{ display: "flex", gap: 24, marginTop: 32 }}>
            {[["200+", "Assets tracked"], ["12", "Departments"], ["99.9%", "Uptime"]].map(([v, l]) => (
              <div key={l}>
                <p style={{ color: "#F8FAFC", fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>{v}</p>
                <p style={{ color: "#475569", fontSize: 11, marginTop: 2 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: "#334155", fontSize: 11, position: "relative" }}>© 2026 AssetFlow · All rights reserved</p>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 400, animation: "fadeUp 0.25s ease-out both" }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em", marginBottom: 6 }}>
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p style={{ fontSize: 13, color: "#64748B" }}>
              {mode === "login" ? "Sign in to your AssetFlow workspace" : "Get started with AssetFlow today"}
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{ display: "flex", background: "#F1F5F9", borderRadius: 10, padding: 4, marginBottom: 28 }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(null); }} style={{
                flex: 1, height: 34, borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 600,
                background: mode === m ? "#fff" : "transparent",
                color: mode === m ? "#0F172A" : "#64748B",
                boxShadow: mode === m ? "0 1px 4px rgba(15,23,42,0.10)" : "none",
                transition: "all 0.15s",
              }}>{m === "login" ? "Sign in" : "Sign up"}</button>
            ))}
          </div>

          {mode === "forgot" ? <ForgotPassword onBack={() => setMode("login")} /> : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {mode === "signup" && (
                <Field label="Full name"><Input placeholder="Priya Sharma" value={form.name} onChange={e => update("name", e.target.value)} required /></Field>
              )}
              <Field label="Email address"><Input type="email" placeholder="you@company.com" value={form.email} onChange={e => update("email", e.target.value)} required /></Field>
              <Field label="Password"><Input type="password" placeholder="••••••••" value={form.password} onChange={e => update("password", e.target.value)} required /></Field>

              {mode === "signup" && (
                <p style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.6, marginTop: -4 }}>
                  New accounts start as <strong style={{ color: "#64748B" }}>Employee</strong>. An Admin can promote you later.
                </p>
              )}

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, fontSize: 12, color: "#DC2626" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                height: 46, background: loading ? "#93C5FD" : "#2563EB",
                color: "#fff", border: "none", borderRadius: 10,
                fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 2px 8px rgba(37,99,235,0.30)",
                transition: "all 0.15s", marginTop: 4,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#1D4ED8"; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#2563EB"; }}
              >
                {loading ? "Please wait…" : mode === "login" ? "Sign in to AssetFlow" : "Create account"}
              </button>

              {mode === "login" && (
                <button type="button" onClick={() => setMode("forgot")} style={{ fontSize: 12, color: "#94A3B8", background: "none", border: "none", cursor: "pointer", transition: "color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#2563EB"}
                  onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}
                >Forgot your password?</button>
              )}
            </form>
          )}
        </div>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
