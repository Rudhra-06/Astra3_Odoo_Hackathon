const MAP = {
  Available:           { bg: "#F0FDF4", color: "#16A34A", dot: "#22C55E" },
  Allocated:           { bg: "#EFF6FF", color: "#2563EB", dot: "#3B82F6" },
  Reserved:            { bg: "#F5F3FF", color: "#7C3AED", dot: "#8B5CF6" },
  "Under Maintenance": { bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B" },
  Lost:                { bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444" },
  Retired:             { bg: "#F8FAFC", color: "#64748B", dot: "#94A3B8" },
  Disposed:            { bg: "#F1F5F9", color: "#475569", dot: "#64748B" },
  Upcoming:            { bg: "#EFF6FF", color: "#2563EB", dot: "#3B82F6" },
  Ongoing:             { bg: "#F0FDF4", color: "#16A34A", dot: "#22C55E" },
  Completed:           { bg: "#F8FAFC", color: "#64748B", dot: "#94A3B8" },
  Cancelled:           { bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444" },
  Pending:             { bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B" },
  Approved:            { bg: "#F0FDF4", color: "#16A34A", dot: "#22C55E" },
  Rejected:            { bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444" },
};

export default function StatusBadge({ status }) {
  const s = MAP[status] || { bg: "#F1F5F9", color: "#64748B", dot: "#94A3B8" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 99,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600,
      letterSpacing: "0.01em",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0, display: "inline-block" }} />
      {status}
    </span>
  );
}
