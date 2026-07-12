import { useState } from "react";
import Layout from "../components/Layout";
import ResourceCalendar from "../components/ResourceCalendar";
import StatusBadge from "../components/StatusBadge";

const RESOURCES = ["Room B2", "Room A1", "Company Vehicle - Innova", "Projector Cart"];

// Matches the brief's example exactly: Room B2 is booked 9-10, so a 9:30-10:30
// request should be rejected while a 10-11 request should succeed.
const INITIAL_BOOKINGS = {
    "Room B2": [
        { id: 1, title: "Team Standup", start: "2026-07-13T09:00", end: "2026-07-13T10:00", bookedBy: "Priya Sharma" },
    ],
    "Room A1": [],
    "Company Vehicle - Innova": [
        { id: 2, title: "Client Visit", start: "2026-07-13T13:00", end: "2026-07-13T15:00", bookedBy: "Arjun Mehta" },
    ],
    "Projector Cart": [],
};

export default function ResourceBooking() {
    const [resource, setResource] = useState(RESOURCES[0]);
    const [bookingsByResource, setBookingsByResource] = useState(INITIAL_BOOKINGS);
    const [confirmed, setConfirmed] = useState(null);

    const bookings = bookingsByResource[resource] || [];

    function handleCreateBooking({ start, end }) {
        const newBooking = {
            id: Date.now(),
            title: "New Booking",
            start,
            end,
            bookedBy: "You",
        };
        setBookingsByResource((prev) => ({
            ...prev,
            [resource]: [...prev[resource], newBooking],
        }));
        setConfirmed(newBooking);
        // Wire to POST /api/bookings once the backend route exists.
    }

    return (
        <Layout title="Resource Booking">
            <div className="grid lg:grid-cols-[16rem_1fr] gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-3 h-fit">
                    <h3 className="font-display font-semibold text-sm text-ink-900 mb-2 px-1">Resources</h3>
                    {RESOURCES.map((r) => (
                        <button
                            key={r}
                            onClick={() => {
                                setResource(r);
                                setConfirmed(null);
                            }}
                            className={`w-full text-left text-sm px-3 py-2 rounded-md mb-1 transition-colors ${resource === r ? "bg-ink-900 text-white" : "hover:bg-gray-100 text-ink-900"
                                }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>

                <div>
                    {confirmed && (
                        <div className="mb-3 bg-green-50 border border-green-200 text-status-available text-sm rounded-md px-3 py-2 flex items-center justify-between">
                            <span>
                                Booking confirmed for {resource}, {new Date(confirmed.start).toLocaleTimeString()} –{" "}
                                {new Date(confirmed.end).toLocaleTimeString()}.
                            </span>
                            <StatusBadge status="Upcoming" />
                        </div>
                    )}
                    <ResourceCalendar date="2026-07-13" bookings={bookings} onCreateBooking={handleCreateBooking} />
                </div>
            </div>
        </Layout>
    );
}