import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { hasAnyRole, roleLabel } from "../utils/auth";

const NAV_ITEMS = [
    { to: "/scanner", label: "QR Scanner", icon: "QR", roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { to: "/assistant", label: "AI Assistant", icon: "AI", roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { to: "/dashboard", label: "Dashboard", icon: "◧", roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { to: "/org-setup", label: "Organization Setup", icon: "▤", roles: ["ADMIN"] },
    { to: "/assets", label: "Assets", icon: "▣", roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { to: "/allocation", label: "Allocation & Transfer", icon: "⇄", roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"] },
    { to: "/booking", label: "Resource Booking", icon: "▦", roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { to: "/maintenance", label: "Maintenance", icon: "✚", roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { to: "/audit", label: "Asset Audit", icon: "✓", roles: ["ADMIN", "ASSET_MANAGER"] },
    { to: "/reports", label: "Reports & Analytics", icon: "▥", roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"] },
    { to: "/activity", label: "Activity & Notifications", icon: "◔", roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
];

export default function Sidebar() {
    const { user } = useAuth();
    const items = NAV_ITEMS.filter((item) => hasAnyRole(user, item.roles));

    return (
        <aside className="w-64 shrink-0 bg-ink-900 text-gray-300 flex flex-col h-screen sticky top-0">
            <div className="px-5 py-6 border-b border-ink-700">
                <div className="flex items-center gap-2">
                    <span className="asset-code text-teal-500 text-xs bg-ink-800 px-2 py-1 rounded">AF-0001</span>
                </div>
                <h1 className="font-display text-white text-xl font-semibold mt-2">AssetFlow</h1>
                <p className="text-xs text-gray-500 mt-0.5">Asset & Resource Management</p>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
                {items.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${isActive
                                ? "bg-ink-800 text-white border-r-2 border-teal-500"
                                : "hover:bg-ink-800/60 hover:text-white"
                            }`
                        }
                    >
                        <span className="w-4 text-center">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="px-5 py-4 border-t border-ink-700 text-xs text-gray-500">
                Signed in as <span className="text-gray-300">{roleLabel(user?.role)}</span>
            </div>
        </aside>
    );
}
