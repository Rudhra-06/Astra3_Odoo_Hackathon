import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import api from "../utils/api";

export default function AssetDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [regenerating, setRegenerating] = useState(false);
    const [regenSuccess, setRegenSuccess] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.getAssetById(id);
            setAsset(res.data.asset);
        } catch (err) {
            setError(err.message || "Failed to load asset.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    async function handleRegenerate() {
        if (!window.confirm("Regenerate QR code? The old QR will stop working.")) return;
        setRegenerating(true);
        setRegenSuccess(false);
        try {
            const res = await api.regenerateQR(id);
            setAsset((prev) => ({ ...prev, qrCodeUrl: res.data.asset.qrCodeUrl }));
            setRegenSuccess(true);
            setTimeout(() => setRegenSuccess(false), 3000);
        } catch (err) {
            alert(err.message || "Failed to regenerate QR.");
        } finally {
            setRegenerating(false);
        }
    }

    function handleDownload() {
        const url = api.getQRDownloadUrl(id);
        const token = localStorage.getItem("assetflow_token");
        // Fetch with auth header then trigger browser download
        fetch(url, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => {
                if (!res.ok) throw new Error("Download failed");
                return res.blob();
            })
            .then((blob) => {
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `${asset.assetTag}-qr.png`;
                a.click();
                URL.revokeObjectURL(a.href);
            })
            .catch(() => alert("QR download failed."));
    }

    if (loading) return (
        <Layout title="Asset Detail">
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3 text-gray-400">
                    <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Loading asset…</span>
                </div>
            </div>
        </Layout>
    );

    if (error) return (
        <Layout title="Asset Detail">
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <span className="text-4xl">⚠️</span>
                <p className="text-gray-500 text-sm">{error}</p>
                <button onClick={() => navigate("/assets")} className="text-sm text-teal-600 hover:underline">
                    ← Back to Assets
                </button>
            </div>
        </Layout>
    );

    if (!asset) return null;

    const activeAllocation = asset.allocations?.find((a) => a.isActive);

    return (
        <Layout title={`Asset — ${asset.assetTag}`}>
            {/* Back nav */}
            <button
                onClick={() => navigate("/assets")}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-ink-900 mb-5 transition-colors"
            >
                <span>←</span> Back to Assets
            </button>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* ── Left column: QR card ── */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center gap-4">
                        <div className="text-center">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">QR Code</p>
                            <p className="font-mono text-sm font-semibold text-ink-900">{asset.assetTag}</p>
                        </div>

                        {/* QR image */}
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 bg-gray-50">
                            {asset.qrCodeUrl ? (
                                <img
                                    src={asset.qrCodeUrl}
                                    alt={`QR code for ${asset.assetTag}`}
                                    className="w-48 h-48 object-contain"
                                />
                            ) : (
                                <div className="w-48 h-48 flex flex-col items-center justify-center text-gray-300 gap-2">
                                    <span className="text-5xl">▣</span>
                                    <span className="text-xs">No QR generated</span>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 w-full">
                            <button
                                onClick={handleDownload}
                                disabled={!asset.qrCodeUrl}
                                className="w-full flex items-center justify-center gap-2 bg-ink-900 text-white text-sm py-2.5 rounded-lg hover:bg-ink-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <span>↓</span> Download QR (PNG)
                            </button>
                            <button
                                onClick={handleRegenerate}
                                disabled={regenerating}
                                className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-600 text-sm py-2.5 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
                            >
                                {regenerating ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                                        Regenerating…
                                    </>
                                ) : (
                                    <><span>↺</span> Regenerate QR</>
                                )}
                            </button>
                        </div>

                        {regenSuccess && (
                            <p className="text-xs text-teal-600 font-medium text-center">
                                ✓ QR code regenerated successfully
                            </p>
                        )}

                        <p className="text-xs text-gray-400 text-center leading-relaxed">
                            Scan to instantly open this asset's profile. Print and attach to the physical device.
                        </p>
                    </div>
                </div>

                {/* ── Right column: Asset details ── */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Header card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                                <h2 className="font-display font-semibold text-xl text-ink-900">{asset.name}</h2>
                                <p className="font-mono text-sm text-gray-400 mt-0.5">{asset.assetTag}</p>
                            </div>
                            <StatusBadge status={toDisplayStatus(asset.status)} />
                        </div>
                    </div>

                    {/* Details grid */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Asset Information</p>
                        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                            <Detail label="Category" value={asset.category?.name} />
                            <Detail label="Serial Number" value={asset.serialNumber} mono />
                            <Detail label="Condition" value={asset.condition} />
                            <Detail label="Location" value={asset.location} />
                            <Detail label="Vendor" value={asset.vendor?.name} />
                            <Detail label="Invoice No." value={asset.invoiceNumber} mono />
                            <Detail
                                label="Purchase Date"
                                value={asset.acquisitionDate ? new Date(asset.acquisitionDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null}
                            />
                            <Detail
                                label="Purchase Cost"
                                value={asset.acquisitionCost ? `₹${Number(asset.acquisitionCost).toLocaleString("en-IN")}` : null}
                            />
                            <Detail
                                label="Warranty Start"
                                value={asset.warrantyStart ? new Date(asset.warrantyStart).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null}
                            />
                            <Detail
                                label="Warranty Expiry"
                                value={asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null}
                                highlight={warrantyHighlight(asset.warrantyExpiry)}
                            />
                            <Detail label="Bookable" value={asset.isBookable ? "Yes" : "No"} />
                            <Detail
                                label="Registered"
                                value={new Date(asset.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            />
                        </dl>
                    </div>

                    {/* Current holder */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Current Holder</p>
                        {activeAllocation ? (
                            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                <Detail label="Assigned To" value={activeAllocation.allocatedToUser?.name} />
                                <Detail label="Email" value={activeAllocation.allocatedToUser?.email} />
                                <Detail label="Condition at Issue" value={activeAllocation.conditionAtIssue} />
                                <Detail
                                    label="Expected Return"
                                    value={activeAllocation.expectedReturnDate
                                        ? new Date(activeAllocation.expectedReturnDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                        : "—"}
                                    highlight={overdueHighlight(activeAllocation.expectedReturnDate)}
                                />
                            </dl>
                        ) : (
                            <p className="text-sm text-gray-400">This asset is not currently allocated.</p>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

function Detail({ label, value, mono, highlight }) {
    return (
        <div>
            <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
            <dd className={`font-medium text-ink-900 ${mono ? "font-mono text-xs" : ""} ${highlight || ""}`}>
                {value || <span className="text-gray-300 font-normal">—</span>}
            </dd>
        </div>
    );
}

function toDisplayStatus(s) {
    const map = {
        AVAILABLE: "Available", ALLOCATED: "Allocated", RESERVED: "Reserved",
        UNDER_MAINTENANCE: "Under Maintenance", LOST: "Lost", RETIRED: "Retired", DISPOSED: "Disposed",
    };
    return map[s] || s;
}

function warrantyHighlight(expiry) {
    if (!expiry) return "";
    const days = Math.ceil((new Date(expiry) - new Date()) / 86400000);
    if (days < 0) return "text-red-600";
    if (days <= 30) return "text-amber-600";
    return "text-green-600";
}

function overdueHighlight(date) {
    if (!date) return "";
    return new Date(date) < new Date() ? "text-red-600" : "";
}
