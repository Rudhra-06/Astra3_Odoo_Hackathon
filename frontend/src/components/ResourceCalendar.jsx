import { useState } from "react";
import { findOverlap } from "../utils/dateUtils";

const START_HOUR = 8, END_HOUR = 20;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

export default function ResourceCalendar({ date, bookings, onCreateBooking }) {
  const [dragStart, setDragStart] = useState(null);
  const [selection, setSelection] = useState(null);
  const [error, setError] = useState(null);

  function hourToTime(hour) {
    const h = Math.floor(hour), m = (hour % 1) * 60;
    return `${date}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
  }

  function handleSlotClick(hour) {
    if (dragStart === null) {
      setDragStart(hour); setSelection({ startHour: hour, endHour: hour + 1 }); setError(null); return;
    }
    const startHour = Math.min(dragStart, hour), endHour = Math.max(dragStart, hour) + 1;
    const start = hourToTime(startHour), end = hourToTime(endHour);
    const conflict = findOverlap(start, end, bookings);
    if (conflict) {
      setError(`Overlaps "${conflict.title}" booked by ${conflict.bookedBy}. Choose a different slot.`);
    } else {
      setError(null); onCreateBooking?.({ start, end });
    }
    setDragStart(null); setSelection(null);
  }

  function bookingForHour(hour) {
    const s = hourToTime(hour), e = hourToTime(hour + 1);
    return bookings.find(b => findOverlap(s, e, [b]));
  }

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(15,23,42,0.06)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "18px 22px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Daily Schedule</p>
          <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{date}</p>
        </div>
        {dragStart !== null && (
          <span style={{ fontSize: 11, fontWeight: 600, color: "#2563EB", background: "#EFF6FF", padding: "4px 12px", borderRadius: 99 }}>
            Click end slot to confirm
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ margin: "12px 22px 0", padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, fontSize: 12, color: "#DC2626", display: "flex", gap: 8, alignItems: "flex-start" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {/* Slots */}
      <div style={{ padding: "12px 22px 20px" }}>
        {HOURS.map(hour => {
          const existing = bookingForHour(hour);
          const isSelected = selection && hour >= selection.startHour && hour < selection.endHour;
          return (
            <div key={hour} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
              <span style={{ width: 40, fontSize: 11, color: "#94A3B8", fontFamily: "'IBM Plex Mono',monospace", textAlign: "right", flexShrink: 0 }}>
                {String(hour).padStart(2,"0")}:00
              </span>
              <button
                onClick={() => handleSlotClick(hour)}
                disabled={!!existing}
                style={{
                  flex: 1, height: 38, borderRadius: 8,
                  display: "flex", alignItems: "center", paddingLeft: 12,
                  fontSize: 12, fontWeight: existing ? 500 : 400,
                  cursor: existing ? "not-allowed" : "pointer",
                  transition: "all 0.12s",
                  border: existing ? "1px solid #BFDBFE" : isSelected ? "1px solid #10B981" : "1px solid #F1F5F9",
                  background: existing ? "#EFF6FF" : isSelected ? "#ECFDF5" : "#F8FAFC",
                  color: existing ? "#2563EB" : isSelected ? "#059669" : "#94A3B8",
                }}
                onMouseEnter={e => { if (!existing && !isSelected) { e.currentTarget.style.background = "#F1F5F9"; e.currentTarget.style.borderColor = "#E2E8F0"; }}}
                onMouseLeave={e => { if (!existing && !isSelected) { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.borderColor = "#F1F5F9"; }}}
              >
                {existing ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6", flexShrink: 0 }} />
                    {existing.title} · {existing.bookedBy}
                  </span>
                ) : ""}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
