import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import KpiCard from "../components/KpiCard";
import AnalyticsCharts from "../components/AnalyticsCharts";
import { formatDate, isOverdue } from "../utils/dateUtils";
import api from "../utils/api";

const MOCK_STATS = { assetsAvailable: 128, assetsAllocated: 74, maintenanceToday: 5, activeBookings: 12, pendingTransfers: 3, upcomingReturns: 9 };
const MOCK_RETURNS = [
  { id: 1, asset: "AF-0114", holder: "Priya Sharma",  expected: "2026-07-08" },
  { id: 2, asset: "AF-0209", holder: "Arjun Mehta",   expected: "2026-07-10" },
  { id: 3, asset: "AF-0031", holder: "Sana Iyer",     expected: "2026-07-15" },
  { id: 4, asset: "AF-0087", holder: "Karan Vora",    expected: "2026-07-20" },
];

const S = { card: { background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(15,23,42,0.06)" } };

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(MOCK_STATS);
  useEffect(() => { api.getDashboardStats().then(setStats).catch(() => setStats(MOCK_STATS)); }, []);
  const overdue  = MOCK_RETURNS.filter(r => isOverdue(r.expected));
  const upcoming = MOCK_RETURNS.filter(r => !isOverdue(r.expected));

  return (
    <Layout title="Dashboard" notificationCount={overdue.length}>
      {/* Welcome banner */}
      <div style={{
        background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 60%, #3B82F6 100%)",
        borderRadius: 20, padding: "28px 32px", marginBottom: 24,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 8px 32px rgba(37,99,235,0.25)", overflow: "hidden", position: "relative",
      }}>
        <div style={{ position: "absolute", right: -40, top: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", right: 60, bottom: -60, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "relative" }}>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Good morning 👋</p>
          <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 8 }}>
            Asset Management Overview
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>
            {stats.assetsAvailable} assets available · {overdue.length} overdue returns
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, position: "relative" }}>
          <Btn label="Register Asset" onClick={() => navigate("/assets/new")} primary />
          <Btn label="Book Resource"  onClick={() => navigate("/booking")} />
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 16, marginBottom: 24 }}>
        <KpiCard label="Available"         value={stats.assetsAvailable}  accent="teal" />
        <KpiCard label="Allocated"         value={stats.assetsAllocated}  accent="blue" />
        <KpiCard label="Maintenance"       value={stats.maintenanceToday} accent="amber" onClick={() => navigate("/maintenance")} />
        <KpiCard label="Active Bookings"   value={stats.activeBookings}   accent="teal"  onClick={() => navigate("/booking")} />
        <KpiCard label="Pending Transfers" value={stats.pendingTransfers} accent="amber" onClick={() => navigate("/allocation")} />
        <KpiCard label="Upcoming Returns"  value={stats.upcomingReturns}  accent="blue" />
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Register Asset",            path: "/assets/new" },
          { label: "Book Resource",             path: "/booking" },
          { label: "Raise Maintenance Request", path: "/maintenance/new" },
          { label: "View Reports",              path: "/reports" },
        ].map(a => (
          <button key={a.label} onClick={() => navigate(a.path)} style={{
            display: "flex", alignItems: "center", gap: 6,
            height: 36, padding: "0 16px",
            background: "#fff", border: "1px solid #E2E8F0",
            borderRadius: 10, fontSize: 12, fontWeight: 600,
            color: "#475569", cursor: "pointer",
            boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.color = "#2563EB"; e.currentTarget.style.background = "#EFF6FF"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = "#475569"; e.currentTarget.style.background = "#fff"; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {a.label}
          </button>
        ))}
      </div>

      {/* Charts */}
      <AnalyticsCharts />

      {/* Returns panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <ReturnsPanel title="Overdue Returns"  items={overdue}  tone="danger" />
        <ReturnsPanel title="Upcoming Returns" items={upcoming} tone="default" />
      </div>
    </Layout>
  );
}

function Btn({ label, onClick, primary }) {
  return (
    <button onClick={onClick} style={{
      height: 38, padding: "0 18px",
      background: primary ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.10)",
      border: "1px solid rgba(255,255,255,0.25)",
      borderRadius: 10, color: "#fff",
      fontSize: 12, fontWeight: 600, cursor: "pointer",
      backdropFilter: "blur(8px)",
      transition: "all 0.15s",
    }}
    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.28)"}
    onMouseLeave={e => e.currentTarget.style.background = primary ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.10)"}
    >{label}</button>
  );
}

function ReturnsPanel({ title, items, tone }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(15,23,42,0.06)", overflow: "hidden" }}>
      <div style={{ padding: "18px 22px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: tone === "danger" ? "#DC2626" : "#0F172A" }}>{title}</p>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99,
          background: tone === "danger" ? "#FEF2F2" : "#F1F5F9",
          color: tone === "danger" ? "#DC2626" : "#64748B",
        }}>{items.length}</span>
      </div>
      <div style={{ padding: "8px 22px 16px" }}>
        {items.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 0", gap: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p style={{ fontSize: 12, color: "#94A3B8" }}>All clear — nothing here.</p>
          </div>
        ) : items.map((r, i) => (
          <div key={r.id} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "11px 0",
            borderTop: i > 0 ? "1px solid #F8FAFC" : "none",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 600, color: "#2563EB", background: "#EFF6FF", padding: "2px 8px", borderRadius: 6 }}>{r.asset}</span>
              <span style={{ fontSize: 12, color: "#64748B" }}>{r.holder}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "#94A3B8" }}>{formatDate(r.expected)}</span>
              {tone === "danger" && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#FEF2F2", color: "#DC2626" }}>Overdue</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
