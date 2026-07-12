import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AssetRegistration from "./pages/AssetRegistration";
import AssetDetail from "./pages/AssetDetail";
import AssetAllocation from "./pages/AssetAllocation";
import ResourceBooking from "./pages/ResourceBooking";

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/assets" element={<PrivateRoute><AssetRegistration /></PrivateRoute>} />
                    <Route path="/assets/new" element={<PrivateRoute><AssetRegistration /></PrivateRoute>} />
                    <Route path="/assets/:id" element={<PrivateRoute><AssetDetail /></PrivateRoute>} />
                    <Route path="/allocation" element={<PrivateRoute><AssetAllocation /></PrivateRoute>} />
                    <Route path="/booking" element={<PrivateRoute><ResourceBooking /></PrivateRoute>} />

                    {/* <Route path="/org-setup" element={<PrivateRoute><OrgSetup /></PrivateRoute>} /> */}
                    {/* <Route path="/maintenance" element={<PrivateRoute><Maintenance /></PrivateRoute>} /> */}
                    {/* <Route path="/audit" element={<PrivateRoute><AssetAudit /></PrivateRoute>} /> */}
                    {/* <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} /> */}
                    {/* <Route path="/activity" element={<PrivateRoute><Activity /></PrivateRoute>} /> */}

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}