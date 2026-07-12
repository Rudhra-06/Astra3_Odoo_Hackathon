import { useState } from "react";
import { findOverlap } from "../utils/dateUtils";

const START_HOUR = 8;
const END_HOUR = 20;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

// bookings: [{ id, title, start: "2026-07-12T09:00", end: "2026-07-12T10:00", bookedBy }]
export default function ResourceCalendar({ date, bookings, onCreateBooking }) {
    const [dragStart, setDragStart] = useState(null);
    const [selection, setSelection] = useState(null); // { startHour, endHour }
    const [error, setError] = useState(null);

    function hourToTime(hour) {
        const h = Math.floor(hour);
        const m = (hour % 1) * 60;
        return `${date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }

    function handleSlotClick(hour) {
        if (dragStart === null) {
            setDragStart(hour);
            setSelection({ startHour: hour, endHour: hour + 1 });
            setError(null);
            return;
        }
        const startHour = Math.min(dragStart, hour);
        const endHour = Math.max(dragStart, hour) + 1;
        const start = hourToTime(startHour);
        const end = hourToTime(endHour);

        const conflict = findOverlap(start, end, bookings);
        if (conflict) {
            setError(
                `That overlaps "${conflict.title}" (${conflict.bookedBy}). Choose a slot that starts after it ends.`
            );
        } else {
            setError(null);
            onCreateBooking?.({ start, end });
        }
        setDragStart(null);
        setSelection(null);
    }

    function bookingForHour(hour) {
        const slotStart = hourToTime(hour);
        const slotEnd = hourToTime(hour + 1);
        return bookings.find((b) => findOverlap(slotStart, slotEnd, [b]));
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-ink-900">{date}</h3>
                {dragStart !== null && (
                    <span className="text-xs text-teal-600">Click an end slot to confirm the booking</span>
                )}
            </div>

            {error && (
                <div className="mb-3 text-sm bg-red-50 text-status-lost border border-red-200 rounded-md px-3 py-2">
                    {error}
                </div>
            )}

            <div className="space-y-1">
                {HOURS.map((hour) => {
                    const existing = bookingForHour(hour);
                    const isSelected =
                        selection && hour >= selection.startHour && hour < selection.endHour;
                    return (
                        <div key={hour} className="flex items-center gap-3">
                            <span className="w-14 text-xs text-gray-400 font-mono">
                                {String(hour).padStart(2, "0")}:00
                            </span>
                            <button
                                onClick={() => handleSlotClick(hour)}
                                disabled={!!existing}
                                className={`flex-1 h-9 rounded-md text-xs flex items-center px-3 transition-colors ${existing
                                        ? "bg-blue-100 text-status-allocated cursor-not-allowed"
                                        : isSelected
                                            ? "bg-teal-500/20 border border-teal-500"
                                            : "bg-gray-50 hover:bg-teal-50 border border-transparent"
                                    }`}
                            >
                                {existing ? `${existing.title} — ${existing.bookedBy}` : ""}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}