export default function KpiCard({ label, value, accent = "teal", onClick }) {
    const accents = {
        teal: "border-teal-600 text-teal-600",
        amber: "border-status-maintenance text-status-maintenance",
        red: "border-status-lost text-status-lost",
        blue: "border-status-allocated text-status-allocated",
    };

    return (
        <button
            onClick={onClick}
            className={`tag-card bg-white border-l-4 shadow-sm rounded-lg p-4 text-left w-full hover:shadow-md transition-shadow ${accents[accent].split(" ")[0]}`}
        >
            <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">{label}</p>
            <p className={`font-display text-3xl font-semibold mt-1 ${accents[accent].split(" ")[1]}`}>
                {value}
            </p>
        </button>
    );
}