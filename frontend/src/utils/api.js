// Central place every screen uses to talk to the backend.
// Rudhu/Namii: point BASE_URL at your Express server (server.js) and add
// matching routes under backend/routes/*. Nothing else in the frontend
// needs to change once your endpoints exist.

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

async function request(path, { method = "GET", body, token } = {}) {
    const headers = { "Content-Type": "application/json" };
    const authToken = token || localStorage.getItem("assetflow_token");
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `Request failed: ${res.status}`);
    }
    return res.json();
}

export const api = {
    // --- Auth ---
    login: (email, password) =>
        request("/auth/login", { method: "POST", body: { email, password } }),
    signup: (name, email, password) =>
        request("/auth/signup", { method: "POST", body: { name, email, password } }),

    // --- Assets ---
    getAssets: (params = {}) =>
        request(`/assets?${new URLSearchParams(params)}`),
    getAssetById: (id) =>
        request(`/assets/${id}`),
    registerAsset: (payload) =>
        request("/assets", { method: "POST", body: payload }),
    updateAsset: (id, payload) =>
        request(`/assets/${id}`, { method: "PATCH", body: payload }),
    allocateAsset: (assetId, payload) =>
        request(`/assets/${assetId}/allocate`, { method: "POST", body: payload }),

    // --- Asset Passport & Timeline ---
    getAssetPassport: (id) =>
        request(`/assets/${id}/passport`),
    getAssetTimeline: (id) =>
        request(`/assets/${id}/timeline`),
    getAssetInsights: (id) => request(`/intelligence/assets/${id}/insights`),
    getDocuments: (id) => request(`/assets/${id}/documents`),
    uploadDocument: (id, payload) => request(`/assets/${id}/documents`, { method: "POST", body: payload }),
    replaceDocument: (id, payload) => request(`/documents/${id}`, { method: "PATCH", body: payload }),
    deleteDocument: (id) => request(`/documents/${id}`, { method: "DELETE" }),

    // --- QR ---
    lookupByQR: (qrCode) =>
        request(`/assets/qr/lookup/${encodeURIComponent(qrCode)}`),
    regenerateQR: (id) =>
        request(`/assets/${id}/qr/regenerate`, { method: "POST" }),
    getQRDownloadUrl: (id) =>
        `${BASE_URL}/assets/${id}/qr/download`,

    // --- Bookings ---
    getBookings: (resourceId) => request(`/bookings?resourceId=${resourceId}`),
    createBooking: (payload) =>
        request("/bookings", { method: "POST", body: payload }),

    // --- Dashboard KPIs ---
    getDashboardStats: () => request("/dashboard"),
    getIntelligenceOverview: () => request("/intelligence/overview"),
    naturalSearch: (query) => request("/intelligence/search", { method: "POST", body: { query } }),
    askAssistant: (question) => request("/intelligence/assistant", { method: "POST", body: { question } }),
    executiveReport: (type) => request("/intelligence/reports/executive", { method: "POST", body: { type } }),
    getUnreadNotifications: () => request("/notifications/unread-count"),
    extractInvoice: (text) => request("/intelligence/ocr/invoice", { method: "POST", body: { text } }),
};

export default api;
