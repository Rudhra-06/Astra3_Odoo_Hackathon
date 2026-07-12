import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

// Mock data for now - swap for real numbers once a backend report endpoint
// exists (e.g. GET /api/reports/utilization and /api/reports/by-department).
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

export default function AnalyticsCharts() {
    return (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-display font-semibold text-ink-900 mb-3">
                    Allocation Trend (last 4 weeks)
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={UTILIZATION_TREND}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#6b7280" }} />
                        <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="allocated" stroke="#2563EB" strokeWidth={2} name="Allocated" />
                        <Line type="monotone" dataKey="available" stroke="#0D9488" strokeWidth={2} name="Available" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-display font-semibold text-ink-900 mb-3">
                    Department-wise Allocation
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={BY_DEPARTMENT}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="department" tick={{ fontSize: 12, fill: "#6b7280" }} />
                        <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                        <Tooltip />
                        <Bar dataKey="assets" fill="#0D9488" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}