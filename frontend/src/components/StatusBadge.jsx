const COLORS = {
    Available: "bg-green-100 text-status-available",
    Allocated: "bg-blue-100 text-status-allocated",
    Reserved: "bg-purple-100 text-status-reserved",
    "Under Maintenance": "bg-amber-100 text-status-maintenance",
    Lost: "bg-red-100 text-status-lost",
    Retired: "bg-gray-200 text-status-retired",
    Disposed: "bg-gray-300 text-status-disposed",
    Upcoming: "bg-blue-100 text-status-allocated",
    Ongoing: "bg-green-100 text-status-available",
    Completed: "bg-gray-200 text-status-retired",
    Cancelled: "bg-red-100 text-status-lost",
    Pending: "bg-amber-100 text-status-maintenance",
    Approved: "bg-green-100 text-status-available",
    Rejected: "bg-red-100 text-status-lost",
};

export default function StatusBadge({ status }) {
    const cls = COLORS[status] || "bg-gray-100 text-gray-600";
    return (
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
            {status}
        </span>
    );
}