import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import KpiCard from "../components/KpiCard";
import AnalyticsCharts from "../components/AnalyticsCharts";
import { formatDate, isOverdue } from "../utils/dateUtils";
import api from "../utils/api";

// Mock data so the screen renders immediately during the hackathon, before
// GET /api/dashboard/stats exists. Replace `stats` with the API response
// once Rudhu/Namii's routes are live - the JSX below doesn't need to change.
const MOCK_STATS = {
    assetsAvailable: 128,
    assetsAllocated: 74,
    maintenanceToday: 5,
    activeBookings: 12,
    pendingTransfers: 3,
    upcomingReturns: 9,
};

const MOCK_RETURNS = [
    { id: 1, asset: "AF-0114", holder: "Priya Sharma", expected: "2026-07-08" },
    { id: 2, asset: "AF-0209", holder: "Arjun Mehta", expected: "2026-07-10" },
    { id: 3, asset: "AF-0031", holder: "Sana Iyer", expected: "2026-07-15" },
    { id: 4, asset: "AF-0087", holder: "Karan Vora", expected: "2026-07-20" },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(MOCK_STATS);

    useEffect(() => {
        api
            .getDashboardStats()
            .then((res) => {
                const summary = res.data?.summary;
                if (!summary) throw new Error("Dashboard summary is unavailable");
                setStats({
                    assetsAvailable: summary.available,
                    assetsAllocated: summary.allocated,
                    maintenanceToday: summary.pendingMaintenance,
                    activeBookings: summary.activeBookings,
                    pendingTransfers: summary.pendingTransfers,
                    upcomingReturns: summary.overdueAllocations,
                });
            })
            .catch(() => setStats(MOCK_STATS)); // backend not ready yet - keep mock data
    }, []);

    const overdue = MOCK_RETURNS.filter((r) => isOverdue(r.expected));
    const upcoming = MOCK_RETURNS.filter((r) => !isOverdue(r.expected));

    return (
        <Layout title="Dashboard" notificationCount={overdue.length}>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                <KpiCard label="Assets Available" value={stats.assetsAvailable} accent="teal" />
                <KpiCard label="Assets Allocated" value={stats.assetsAllocated} accent="blue" />
                <KpiCard label="Maintenance Today" value={stats.maintenanceToday} accent="amber" onClick={() => navigate("/maintenance")} />
                <KpiCard label="Active Bookings" value={stats.activeBookings} accent="teal" onClick={() => navigate("/booking")} />
                <KpiCard label="Pending Transfers" value={stats.pendingTransfers} accent="amber" onClick={() => navigate("/allocation")} />
                <KpiCard label="Overdue Returns" value={stats.upcomingReturns} accent="blue" />
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
                <QuickAction label="Register Asset" onClick={() => navigate("/assets/new")} />
                <QuickAction label="Book Resource" onClick={() => navigate("/booking")} />
                <QuickAction label="Raise Maintenance Request" onClick={() => navigate("/maintenance/new")} />
            </div>

            <AnalyticsCharts />

            <div className="grid md:grid-cols-2 gap-6">
                <ReturnsPanel title="Overdue Returns" items={overdue} tone="danger" />
                <ReturnsPanel title="Upcoming Returns" items={upcoming} tone="default" />
            </div>
        </Layout>
    );
}

function QuickAction({ label, onClick }) {
    return (
        <button
            onClick={onClick}
            className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-ink-900 hover:border-teal-500 hover:text-teal-600 transition-colors"
        >
            + {label}
        </button>
    );
}

function ReturnsPanel({ title, items, tone }) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className={`font-display font-semibold mb-3 ${tone === "danger" ? "text-status-lost" : "text-ink-900"}`}>
                {title} ({items.length})
            </h3>
            {items.length === 0 ? (
                <p className="text-sm text-gray-400">Nothing here right now.</p>
            ) : (
                <ul className="divide-y divide-gray-100">
                    {items.map((r) => (
                        <li key={r.id} className="py-2.5 flex items-center justify-between text-sm">
                            <div>
                                <span className="asset-code text-ink-900 font-medium">{r.asset}</span>
                                <span className="text-gray-500 ml-2">{r.holder}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500">{formatDate(r.expected)}</span>
                                {tone === "danger" && (
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-status-lost">
                                        Overdue
                                    </span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
