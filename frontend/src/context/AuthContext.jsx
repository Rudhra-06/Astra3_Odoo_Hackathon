import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authMessage, setAuthMessage] = useState(null);

    const clearSession = useCallback((message = null) => {
        localStorage.removeItem("assetflow_token");
        localStorage.removeItem("assetflow_user");
        setUser(null);
        setAuthMessage(message);
    }, []);

    const persistSession = useCallback((session, message = null) => {
        if (!session?.token || !session?.user) {
            throw new Error("The authentication response was incomplete. Please try again.");
        }
        localStorage.setItem("assetflow_token", session.token);
        localStorage.setItem("assetflow_user", JSON.stringify(session.user));
        setUser(session.user);
        setAuthMessage(message);
    }, []);

    useEffect(() => {
        let mounted = true;

        async function restoreSession() {
            const storedToken = localStorage.getItem("assetflow_token");
            const storedUser = localStorage.getItem("assetflow_user");

            if (!storedToken) {
                if (mounted) {
                    clearSession();
                    setLoading(false);
                }
                return;
            }

            try {
                const response = await api.getCurrentUser();
                const serverUser = response.data?.user || response.user || response.data || response;
                if (!serverUser?.id) {
                    throw new Error("Unable to restore the authenticated user.");
                }

                if (mounted) {
                    persistSession({ token: storedToken, user: serverUser });
                }
            } catch (error) {
                const reason = error.message?.toLowerCase().includes("expired") || error.message?.toLowerCase().includes("token")
                    ? "Your session has expired. Please sign in again."
                    : "We could not restore your session. Please sign in again.";

                if (mounted) {
                    clearSession(reason);
                    if (!window.location.pathname.startsWith("/login")) {
                        window.location.replace(`/login?reason=session-expired`);
                    }
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        restoreSession();
        return () => {
            mounted = false;
        };
    }, [clearSession, persistSession]);

    async function login(email, password) {
        const response = await api.login(email, password);
        const session = response.data || response;
        persistSession(session);
        return session.user;
    }

    async function signup(name, email, password) {
        const response = await api.signup(name, email, password);
        const session = response.data || response;
        persistSession(session);
        return session.user;
    }

    function logout(redirectToLogin = false) {
        clearSession("You have been logged out.");
        if (redirectToLogin && !window.location.pathname.startsWith("/login")) {
            window.location.replace("/login?reason=logout");
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, authMessage, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
