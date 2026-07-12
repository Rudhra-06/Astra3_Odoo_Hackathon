import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const UTILIZATION_TREND = [
  { week: "Wk 1", allocated: 52, available: 148 },
  { week: "Wk 2", allocated: 61, available: 139 },
  { week: "Wk 3", allocated: 58, available: 142 },
  { week: "Wk 4", allocated: 74, available: 128 },
];

const BY_DEPARTMENT = [
  { department: "Engineering", assets: 46 },
  { department: "Sales", assets: 22 },
  { department: "Operations", assets: 31 },
  { department: "Admin", assets: 14 },
];

const TT = {
  contentStyle: { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, boxShadow: "0 8px 24px rgba(15,23,42,0.12)", fontSize: 12, padding: "10px 14px" },
  labelStyle: { color: "#0F172A", fontWeight: 700, marginBottom: 6, fontSize: 12 },
  itemStyle: { color: "#475569", fontSize: 12 },
  cursor: { stroke: "#F1F5F9", strokeWidth: 2 },
};

function Card({ title, subtitle, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(15,23,42,0.06)", overflow: "hidden" }}>
      <div style={{ padding: "18px 22px 0" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.01em" }}>{title}</p>
        {subtitle && <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{subtitle}</p>}
      </div>
      <div style={{ padding: "16px 22px 20px" }}>{children}</div>
    </div>
  );
}

export default function AnalyticsCharts() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
      <Card title="Allocation Trend" subtitle="Last 4 weeks">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={UTILIZATION_TREND} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip {...TT} />
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
            <Line type="monotone" dataKey="allocated" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4, fill: "#2563EB", strokeWidth: 0 }} activeDot={{ r: 5 }} name="Allocated" />
            <Line type="monotone" dataKey="available" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, fill: "#10B981", strokeWidth: 0 }} activeDot={{ r: 5 }} name="Available" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Department Allocation" subtitle="Assets by department">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={BY_DEPARTMENT} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="department" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip {...TT} />
            <Bar dataKey="assets" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={44} name="Assets" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
