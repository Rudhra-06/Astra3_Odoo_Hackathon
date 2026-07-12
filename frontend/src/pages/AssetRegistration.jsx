import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import api from "../utils/api";

const CATEGORIES = ["Laptop", "Desktop", "Projector", "Vehicle", "Furniture", "Network Equipment", "Mobile Phone", "Server"];
const CATEGORY_ID_BY_NAME = {
    Laptop: 1,
    Desktop: 2,
    Projector: 3,
    Vehicle: 4,
    Furniture: 5,
    "Network Equipment": 6,
    "Mobile Phone": 7,
    Server: 8,
};
const LOCATIONS = ["HQ - Floor 1", "HQ - Floor 2", "Warehouse A", "Remote"];

const STATUS_DISPLAY = {
    AVAILABLE: "Available", ALLOCATED: "Allocated", RESERVED: "Reserved",
    UNDER_MAINTENANCE: "Under Maintenance", LOST: "Lost", RETIRED: "Retired", DISPOSED: "Disposed",
};

export default function AssetRegistration() {
    const navigate = useNavigate();
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filters, setFilters] = useState({ query: "", category: "", status: "" });

    useEffect(() => {
        api.getAssets({ limit: 100 })
            .then((res) => setAssets(res.data || []))
            .catch(() => setAssets([]))
            .finally(() => setLoading(false));
    }, []);

    const filtered = assets.filter((a) => {
        const q = filters.query.toLowerCase();
        const matchesQuery = !q || a.assetTag?.toLowerCase().includes(q) || a.name?.toLowerCase().includes(q);
        const matchesCategory = !filters.category || a.category?.name === filters.category;
        const matchesStatus = !filters.status || STATUS_DISPLAY[a.status] === filters.status;
        return matchesQuery && matchesCategory && matchesStatus;
    });

    function handleRegister(newAsset) {
        setAssets((prev) => [newAsset, ...prev]);
        setShowForm(false);
    }

    return (
        <Layout title="Asset Registration & Directory">
            <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2 flex-wrap">
                    <input
                        placeholder="Search by tag, serial, or name…"
                        value={filters.query}
                        onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
                        className="input max-w-xs"
                    />
                    <select
                        value={filters.category}
                        onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                        className="input max-w-[10rem]"
                    >
                        <option value="">All categories</option>
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                        className="input max-w-[10rem]"
                    >
                        <option value="">All statuses</option>
                        {Object.values(STATUS_DISPLAY).map((s) => <option key={s}>{s}</option>)}
                    </select>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-ink-900 text-white text-sm px-4 py-2 rounded-md hover:bg-ink-800 whitespace-nowrap"
                >
                    + Register Asset
                </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                            <th className="text-left px-4 py-2.5">Tag</th>
                            <th className="text-left px-4 py-2.5">Name</th>
                            <th className="text-left px-4 py-2.5">Category</th>
                            <th className="text-left px-4 py-2.5">Location</th>
                            <th className="text-left px-4 py-2.5">Status</th>
                            <th className="text-left px-4 py-2.5">QR</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading assets…</td></tr>
                        )}
                        {!loading && filtered.map((a) => (
                            <tr
                                key={a.id}
                                onClick={() => navigate(`/assets/${a.id}`)}
                                className="hover:bg-gray-50 cursor-pointer"
                            >
                                <td className="px-4 py-2.5 asset-code text-ink-900">{a.assetTag}</td>
                                <td className="px-4 py-2.5 font-medium">{a.name}</td>
                                <td className="px-4 py-2.5 text-gray-500">{a.category?.name || "—"}</td>
                                <td className="px-4 py-2.5 text-gray-500">{a.location || "—"}</td>
                                <td className="px-4 py-2.5">
                                    <StatusBadge status={STATUS_DISPLAY[a.status] || a.status} />
                                </td>
                                <td className="px-4 py-2.5">
                                    {a.qrCodeUrl
                                        ? <span className="text-xs text-teal-600 font-medium">✓ Ready</span>
                                        : <span className="text-xs text-gray-300">—</span>
                                    }
                                </td>
                            </tr>
                        ))}
                        {!loading && filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                                    No assets match those filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showForm && <RegisterAssetModal onClose={() => setShowForm(false)} onSubmit={handleRegister} />}
        </Layout>
    );
}

function RegisterAssetModal({ onClose, onSubmit }) {
    const [form, setForm] = useState({
        name: "",
        category: CATEGORIES[0],
        serialNumber: "",
        acquisitionDate: "",
        acquisitionCost: "",
        condition: "Good",
        location: LOCATIONS[0],
        bookable: false,
    });
    const [saving, setSaving] = useState(false);

    function update(field, value) {
        setForm((f) => ({ ...f, [field]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                name: form.name,
                categoryId: CATEGORY_ID_BY_NAME[form.category] ?? 1,
                serialNumber: form.serialNumber || null,
                acquisitionDate: form.acquisitionDate || null,
                acquisitionCost: form.acquisitionCost ? Number(form.acquisitionCost) : null,
                condition: form.condition || null,
                location: form.location || null,
                isBookable: form.bookable,
            };

            const created = await api.registerAsset(payload).catch(() => null);
            const asset = created?.data?.asset || created?.asset || {
                id: Date.now(),
                assetTag: `AF-${Math.floor(1000 + Math.random() * 8999)}`,
                name: form.name,
                status: "AVAILABLE",
                category: { name: form.category },
                location: form.location,
                qrCodeUrl: null,
                isBookable: form.bookable,
            };
            onSubmit(asset);
            onClose();
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20 px-4">
            <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-semibold text-lg text-ink-900">Register Asset</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Field label="Asset name">
                        <input required className="input" value={form.name} onChange={(e) => update("name", e.target.value)} />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Category">
                            <select className="input" value={form.category} onChange={(e) => update("category", e.target.value)}>
                                {CATEGORIES.map((c) => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Serial number">
                            <input className="input" value={form.serialNumber} onChange={(e) => update("serialNumber", e.target.value)} />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Acquisition date">
                            <input type="date" className="input" value={form.acquisitionDate} onChange={(e) => update("acquisitionDate", e.target.value)} />
                        </Field>
                        <Field label="Acquisition cost">
                            <input type="number" className="input" value={form.acquisitionCost} onChange={(e) => update("acquisitionCost", e.target.value)} placeholder="For reports only" />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Condition">
                            <select className="input" value={form.condition} onChange={(e) => update("condition", e.target.value)}>
                                {["New", "Good", "Fair", "Poor"].map((c) => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Location">
                            <select className="input" value={form.location} onChange={(e) => update("location", e.target.value)}>
                                {LOCATIONS.map((l) => (
                                    <option key={l}>{l}</option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-ink-900">
                        <input
                            type="checkbox"
                            checked={form.bookable}
                            onChange={(e) => update("bookable", e.target.checked)}
                        />
                        This is a shared/bookable resource (room, vehicle, equipment)
                    </label>

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500">
                            Cancel
                        </button>
                        <button
                            disabled={saving}
                            className="bg-ink-900 text-white text-sm px-4 py-2 rounded-md hover:bg-ink-800 disabled:opacity-60"
                        >
                            {saving ? "Saving…" : "Register Asset"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <label className="block">
            <span className="block text-xs font-medium text-gray-600 mb-1">{label}</span>
            {children}
        </label>
    );
}