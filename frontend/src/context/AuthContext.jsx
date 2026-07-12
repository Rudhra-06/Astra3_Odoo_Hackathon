import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Session validation on load (Screen 1 requirement).
        const stored = localStorage.getItem("assetflow_user");
        if (stored) setUser(JSON.parse(stored));
        setLoading(false);
    }, []);

    async function login(email, password) {
        const data = await api.login(email, password);
        // Expected shape from backend: { token, user: { name, email, role, department } }
        localStorage.setItem("assetflow_token", data.token);
        localStorage.setItem("assetflow_user", JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
    }

    async function signup(name, email, password) {
        // Signup always creates a plain Employee account - no role field sent,
        // no role picker in the UI. Promotion only happens later, by an Admin,
        // in Organization Setup > Employee Directory.
        const data = await api.signup(name, email, password);
        localStorage.setItem("assetflow_token", data.token);
        localStorage.setItem("assetflow_user", JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
    }

    function logout() {
        localStorage.removeItem("assetflow_token");
        localStorage.removeItem("assetflow_user");
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}