import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ title, notificationCount = 0 }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
            <div>
                <h2 className="font-display text-lg font-semibold text-ink-900">{title}</h2>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate("/assets/new")}
                    className="hidden sm:inline-flex text-sm px-3 py-1.5 rounded-md bg-ink-900 text-white hover:bg-ink-800"
                >
                    + Register Asset
                </button>
                <button
                    onClick={() => navigate("/booking")}
                    className="hidden sm:inline-flex text-sm px-3 py-1.5 rounded-md border border-gray-300 text-ink-700 hover:bg-gray-50"
                >
                    Book Resource
                </button>

                <button
                    onClick={() => navigate("/activity")}
                    className="relative w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
                    aria-label="Notifications"
                >
                    🔔
                    {notificationCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-status-lost text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                            {notificationCount}
                        </span>
                    )}
                </button>

                <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-medium">
                        {user?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="text-sm">
                        <p className="font-medium text-ink-900 leading-none">{user?.name || "Guest"}</p>
                        <p className="text-xs text-gray-500">{user?.role || ""}</p>
                    </div>
                    <button onClick={logout} className="text-xs text-gray-400 hover:text-status-lost ml-2">
                        Log out
                    </button>
                </div>
            </div>
        </header>
    );
}