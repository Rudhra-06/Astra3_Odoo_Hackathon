import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ title, notificationCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header style={{
      height: 64,
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid #E2E8F0",
      boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px",
      position: "sticky", top: 0, zIndex: 40,
    }}>
      {/* Left — breadcrumb + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#94A3B8", fontSize: 12 }}>AssetFlow</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        <span style={{ color: "#0F172A", fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</span>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* Search */}
        <div style={{ position: "relative", marginRight: 4 }}>
          <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
               width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input placeholder="Search…" style={{
            height: 34, paddingLeft: 30, paddingRight: 12,
            background: "#F8FAFC", border: "1px solid #E2E8F0",
            borderRadius: 8, fontSize: 12, color: "#0F172A",
            outline: "none", width: 180, transition: "all 0.15s",
          }}
          onFocus={e => { e.target.style.borderColor = "#2563EB"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)"; e.target.style.background = "#fff"; }}
          onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; e.target.style.background = "#F8FAFC"; }}
          />
        </div>

        {/* Register Asset */}
        <button onClick={() => navigate("/assets/new")} style={{
          display: "none",
          alignItems: "center", gap: 6,
          height: 34, padding: "0 14px",
          background: "#2563EB", color: "#fff",
          border: "none", borderRadius: 8,
          fontSize: 12, fontWeight: 600, cursor: "pointer",
          boxShadow: "0 1px 3px rgba(37,99,235,0.30)",
          transition: "all 0.15s",
        }}
        className="sm-flex"
        onMouseEnter={e => e.currentTarget.style.background = "#1D4ED8"}
        onMouseLeave={e => e.currentTarget.style.background = "#2563EB"}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Register Asset
        </button>

        {/* Book Resource */}
        <button onClick={() => navigate("/booking")} style={{
          height: 34, padding: "0 14px",
          background: "#fff", color: "#475569",
          border: "1px solid #E2E8F0", borderRadius: 8,
          fontSize: 12, fontWeight: 500, cursor: "pointer",
          transition: "all 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#CBD5E1"; e.currentTarget.style.color = "#0F172A"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = "#475569"; }}
        >
          Book Resource
        </button>

        {/* Notifications */}
        <button onClick={() => navigate("/activity")} aria-label="Notifications" style={{
          position: "relative", width: 36, height: 36,
          background: "transparent", border: "1px solid #E2E8F0",
          borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
          color: "#64748B", cursor: "pointer", transition: "all 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.color = "#0F172A"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748B"; }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {notificationCount > 0 && (
            <span style={{
              position: "absolute", top: -4, right: -4,
              background: "#DC2626", color: "#fff",
              fontSize: 9, fontWeight: 700,
              width: 16, height: 16, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid #fff",
            }}>{notificationCount}</span>
          )}
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: "#E2E8F0", margin: "0 4px" }} />

        {/* Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#0F172A", lineHeight: 1 }}>{user?.name || "Guest"}</span>
            <span style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{user?.role || ""}</span>
          </div>
          <button onClick={logout} style={{
            fontSize: 11, color: "#94A3B8", background: "none", border: "none",
            cursor: "pointer", padding: "4px 8px", borderRadius: 6,
            transition: "all 0.15s", fontWeight: 500,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#DC2626"; e.currentTarget.style.background = "#FEF2F2"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#94A3B8"; e.currentTarget.style.background = "none"; }}
          >Sign out</button>
        </div>
      </div>
    </header>
  );
}
