import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { hasAnyRole } from "./utils/auth";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AssetRegistration from "./pages/AssetRegistration";
import AssetDetail from "./pages/AssetDetail";
import AssetAllocation from "./pages/AssetAllocation";
import ResourceBooking from "./pages/ResourceBooking";
import AssetScanner from "./pages/AssetScanner";
import AssetAssistant from "./pages/AssetAssistant";

function PublicRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) return null;
    if (user) {
        const redirectTo = location.state?.from ? `${location.state.from.pathname}${location.state.from.search || ""}` : "/dashboard";
        return <Navigate to={redirectTo} replace />;
    }
    return children;
}

function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) return null;
    if (!user) {
        const requestedPath = `${location.pathname}${location.search}`;
        return <Navigate to={`/login?redirect=${encodeURIComponent(requestedPath)}`} replace />;
    }
    if (allowedRoles.length > 0 && !hasAnyRole(user, allowedRoles)) {
        return <AccessDenied />;
    }
    return children;
}

function RootRedirect() {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

function AccessDenied() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md text-center shadow-sm">
                <p className="text-sm font-medium text-teal-600">Access denied</p>
                <h1 className="mt-2 text-xl font-semibold text-ink-900">You do not have permission to view this page.</h1>
                <p className="mt-3 text-sm text-gray-500">Please contact an administrator if you believe this is a mistake.</p>
            </div>
        </div>
    );
}

function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md text-center shadow-sm">
                <p className="text-sm font-medium text-teal-600">404</p>
                <h1 className="mt-2 text-xl font-semibold text-ink-900">Page not found</h1>
                <p className="mt-3 text-sm text-gray-500">The page you tried to open does not exist or is no longer available.</p>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                    <Route path="/" element={<RootRedirect />} />
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/assets" element={<ProtectedRoute><AssetRegistration /></ProtectedRoute>} />
                    <Route path="/assets/new" element={<ProtectedRoute><AssetRegistration /></ProtectedRoute>} />
                    <Route path="/assets/:id" element={<ProtectedRoute><AssetDetail /></ProtectedRoute>} />
                    <Route path="/allocation" element={<ProtectedRoute allowedRoles={["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"]}><AssetAllocation /></ProtectedRoute>} />
                    <Route path="/booking" element={<ProtectedRoute><ResourceBooking /></ProtectedRoute>} />
                    <Route path="/scanner" element={<ProtectedRoute><AssetScanner /></ProtectedRoute>} />
                    <Route path="/assistant" element={<ProtectedRoute><AssetAssistant /></ProtectedRoute>} />

                    {/* <Route path="/org-setup" element={<ProtectedRoute allowedRoles={["ADMIN"]}><OrgSetup /></ProtectedRoute>} /> */}
                    {/* <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} /> */}
                    {/* <Route path="/audit" element={<ProtectedRoute allowedRoles={["ADMIN", "ASSET_MANAGER"]}><AssetAudit /></ProtectedRoute>} /> */}
                    {/* <Route path="/reports" element={<ProtectedRoute allowedRoles={["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"]}><Reports /></ProtectedRoute>} /> */}
                    {/* <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} /> */}

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
