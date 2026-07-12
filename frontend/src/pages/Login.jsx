import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const [mode, setMode] = useState("login"); // "login" | "signup" | "forgot"
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login, signup } = useAuth();
    const navigate = useNavigate();

    function update(field, value) {
        setForm((f) => ({ ...f, [field]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (mode === "login") {
                await login(form.email, form.password);
            } else if (mode === "signup") {
                // No role field is ever sent - backend should always default new
                // accounts to Employee. Promotion happens later via Admin > Org Setup.
                await signup(form.name, form.email, form.password);
            }
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <span className="asset-code text-teal-500 text-xs bg-ink-800 px-2 py-1 rounded">AF-0001</span>
                    <h1 className="font-display text-white text-3xl font-semibold mt-3">AssetFlow</h1>
                    <p className="text-gray-400 text-sm mt-1">Enterprise Asset & Resource Management</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex mb-5 rounded-md bg-gray-100 p-1 text-sm">
                        {["login", "signup"].map((m) => (
                            <button
                                key={m}
                                onClick={() => {
                                    setMode(m);
                                    setError(null);
                                }}
                                className={`flex-1 py-1.5 rounded-md capitalize transition-colors ${mode === m ? "bg-white shadow text-ink-900 font-medium" : "text-gray-500"
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    {mode === "forgot" ? (
                        <ForgotPassword onBack={() => setMode("login")} />
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {mode === "signup" && (
                                <Field label="Full name">
                                    <input
                                        required
                                        value={form.name}
                                        onChange={(e) => update("name", e.target.value)}
                                        className="input"
                                        placeholder="Priya Sharma"
                                    />
                                </Field>
                            )}
                            <Field label="Email">
                                <input
                                    required
                                    type="email"
                                        value={form.email}
                                        autoComplete="email"
                                    onChange={(e) => update("email", e.target.value)}
                                    className="input"
                                    placeholder="you@company.com"
                                />
                            </Field>
                            <Field label="Password">
                                <input
                                    required
                                        type="password"
                                        value={form.password}
                                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                                    onChange={(e) => update("password", e.target.value)}
                                    className="input"
                                    placeholder="••••••••"
                                />
                            </Field>

                            {mode === "signup" && (
                                <p className="text-xs text-gray-400 -mt-2">
                                    New accounts start as <strong>Employee</strong>. An Admin can promote you to
                                    Department Head or Asset Manager later.
                                </p>
                            )}

                            {error && <p className="text-sm text-status-lost">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-ink-900 text-white rounded-md py-2.5 font-medium hover:bg-ink-800 disabled:opacity-60"
                            >
                                {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
                            </button>

                            {mode === "login" && (
                                <button
                                    type="button"
                                    onClick={() => setMode("forgot")}
                                    className="w-full text-xs text-gray-400 hover:text-teal-600 mt-1"
                                >
                                    Forgot password?
                                </button>
                            )}
                        </form>
                    )}
                </div>
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

function ForgotPassword({ onBack }) {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        // Wire to POST /api/auth/forgot-password once the backend route exists.
        setSent(true);
    }

    if (sent) {
        return (
            <div className="text-center space-y-3">
                <p className="text-sm text-ink-900">
                    If an account exists for <strong>{email}</strong>, a reset link has been sent.
                </p>
                <button onClick={onBack} className="text-sm text-teal-600 hover:underline">
                    Back to login
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email">
                <input
                    required
                    type="email"
                    value={email}
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="you@company.com"
                />
            </Field>
            <button className="w-full bg-ink-900 text-white rounded-md py-2.5 font-medium hover:bg-ink-800">
                Send reset link
            </button>
            <button type="button" onClick={onBack} className="w-full text-xs text-gray-400">
                Back to login
            </button>
        </form>
    );
}
