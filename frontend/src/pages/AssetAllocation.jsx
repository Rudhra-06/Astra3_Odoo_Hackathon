import { useState } from "react";
import Layout from "../components/Layout";
import { formatDate, isOverdue } from "../utils/dateUtils";

const MOCK_ALLOCATIONS = [
    {
        assetTag: "AF-0114",
        assetName: "Dell Latitude 5420",
        holder: "Priya Sharma",
        department: "Engineering",
        expectedReturn: "2026-07-08",
    },
    {
        assetTag: "AF-0209",
        assetName: "Toyota Innova",
        holder: "Operations Dept",
        department: "Operations",
        expectedReturn: "2026-08-01",
    },
];

const EMPLOYEES = ["Priya Sharma", "Raj Nair", "Arjun Mehta", "Sana Iyer"];

export default function AssetAllocation() {
    const [allocations, setAllocations] = useState(MOCK_ALLOCATIONS);
    const [form, setForm] = useState({ assetTag: "", employee: "", expectedReturn: "" });
    const [conflict, setConflict] = useState(null);
    const [transferRequested, setTransferRequested] = useState(false);

    function findHolder(assetTag) {
        return allocations.find((a) => a.assetTag === assetTag);
    }

    function handleAllocate(e) {
        e.preventDefault();
        setTransferRequested(false);
        const existing = findHolder(form.assetTag.trim().toUpperCase());

        if (existing) {
            // Blocks the allocation and shows who currently holds it, exactly as
            // described in the brief's Priya/Raj example.
            setConflict(existing);
            return;
        }

        setConflict(null);
        setAllocations((prev) => [
            ...prev,
            {
                assetTag: form.assetTag.trim().toUpperCase(),
                assetName: "New allocation",
                holder: form.employee,
                department: "-",
                expectedReturn: form.expectedReturn,
            },
        ]);
        setForm({ assetTag: "", employee: "", expectedReturn: "" });
    }

    function handleTransferRequest() {
        // Kicks off Requested -> Approved -> Re-allocated workflow.
        // Wire this to POST /api/assets/:id/transfer once the backend exists.
        setTransferRequested(true);
    }

    function handleReturn(assetTag) {
        setAllocations((prev) => prev.filter((a) => a.assetTag !== assetTag));
    }

    return (
        <Layout title="Asset Allocation & Transfer">
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="text-left px-4 py-2.5">Asset</th>
                                <th className="text-left px-4 py-2.5">Held by</th>
                                <th className="text-left px-4 py-2.5">Expected return</th>
                                <th className="text-left px-4 py-2.5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {allocations.map((a) => {
                                const overdue = isOverdue(a.expectedReturn);
                                return (
                                    <tr key={a.assetTag} className="hover:bg-gray-50">
                                        <td className="px-4 py-2.5">
                                            <span className="asset-code text-ink-900">{a.assetTag}</span>
                                            <span className="text-gray-400 ml-2">{a.assetName}</span>
                                        </td>
                                        <td className="px-4 py-2.5">{a.holder}</td>
                                        <td className="px-4 py-2.5">
                                            <span className={overdue ? "text-status-lost font-medium" : "text-gray-500"}>
                                                {formatDate(a.expectedReturn)}
                                                {overdue && " · Overdue"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-right">
                                            <button
                                                onClick={() => handleReturn(a.assetTag)}
                                                className="text-xs text-teal-600 hover:underline"
                                            >
                                                Mark returned
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <form onSubmit={handleAllocate} className="bg-white rounded-lg border border-gray-200 p-4 h-fit space-y-3">
                    <h3 className="font-display font-semibold text-ink-900">Allocate an Asset</h3>

                    <Field label="Asset tag">
                        <input
                            required
                            placeholder="AF-0114"
                            value={form.assetTag}
                            onChange={(e) => setForm((f) => ({ ...f, assetTag: e.target.value }))}
                            className="input asset-code"
                        />
                    </Field>

                    <Field label="Employee">
                        <select
                            required
                            value={form.employee}
                            onChange={(e) => setForm((f) => ({ ...f, employee: e.target.value }))}
                            className="input"
                        >
                            <option value="">Select employee</option>
                            {EMPLOYEES.map((e) => (
                                <option key={e}>{e}</option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Expected return date (optional)">
                        <input
                            type="date"
                            value={form.expectedReturn}
                            onChange={(e) => setForm((f) => ({ ...f, expectedReturn: e.target.value }))}
                            className="input"
                        />
                    </Field>

                    <button className="w-full bg-ink-900 text-white text-sm py-2 rounded-md hover:bg-ink-800">
                        Allocate
                    </button>

                    {conflict && (
                        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm space-y-2">
                            <p className="text-ink-900">
                                <span className="asset-code">{conflict.assetTag}</span> is currently held by{" "}
                                <strong>{conflict.holder}</strong>.
                            </p>
                            {transferRequested ? (
                                <p className="text-teal-600 text-xs">
                                    Transfer request sent — awaiting Asset Manager / Department Head approval.
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleTransferRequest}
                                    className="text-xs font-medium text-white bg-status-maintenance px-3 py-1.5 rounded-md hover:opacity-90"
                                >
                                    Request Transfer
                                </button>
                            )}
                        </div>
                    )}
                </form>
            </div>
        </Layout>
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