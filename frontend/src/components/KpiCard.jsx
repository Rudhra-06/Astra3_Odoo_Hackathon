const ACCENT = {
  teal:  { bar: "#10B981", bg: "rgba(16,185,129,0.10)", light: "#ECFDF5", text: "#059669" },
  blue:  { bar: "#2563EB", bg: "rgba(37,99,235,0.10)",  light: "#EFF6FF", text: "#2563EB" },
  amber: { bar: "#D97706", bg: "rgba(217,119,6,0.10)",  light: "#FFFBEB", text: "#D97706" },
  red:   { bar: "#DC2626", bg: "rgba(220,38,38,0.10)",  light: "#FEF2F2", text: "#DC2626" },
};

const ICONS = {
  teal:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  blue:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  amber: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  red:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
};

export default function KpiCard({ label, value, accent = "teal", onClick }) {
  const a = ACCENT[accent] || ACCENT.teal;
  return (
    <button onClick={onClick} style={{
      background: "#fff",
      border: "1px solid #E2E8F0",
      borderRadius: 16,
      padding: "20px 22px",
      textAlign: "left", width: "100%",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.2s ease",
      boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
      position: "relative", overflow: "hidden",
    }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(15,23,42,0.10)"; e.currentTarget.style.borderColor = "#CBD5E1"; }}}
    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(15,23,42,0.06)"; e.currentTarget.style.borderColor = "#E2E8F0"; }}
    >
      {/* Subtle top accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: a.bar, borderRadius: "16px 16px 0 0", opacity: 0.7 }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: a.light, display: "flex", alignItems: "center", justifyContent: "center", color: a.text, flexShrink: 0 }}>
          {ICONS[accent]}
        </div>
      </div>

      <p style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em", lineHeight: 1, fontFamily: "'Inter',sans-serif" }}>
        {value}
      </p>

      <div style={{ marginTop: 14, height: 3, background: "#F1F5F9", borderRadius: 99 }}>
        <div style={{ height: "100%", width: "55%", background: a.bar, borderRadius: 99, opacity: 0.6 }} />
      </div>
    </button>
  );
}
