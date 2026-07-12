const ROLE_ALIASES = {
    ADMIN: "ADMIN",
    ASSETMANAGER: "ASSET_MANAGER",
    ASSET_MANAGER: "ASSET_MANAGER",
    DEPARTMENTHEAD: "DEPARTMENT_HEAD",
    DEPARTMENT_HEAD: "DEPARTMENT_HEAD",
    EMPLOYEE: "EMPLOYEE",
};

export function normalizeRole(role) {
    const raw = String(role || "EMPLOYEE").trim().toUpperCase().replace(/\s+/g, "_");
    return ROLE_ALIASES[raw] || raw;
}

export function roleLabel(role) {
    const normalized = normalizeRole(role);
    return normalized
        .split("_")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
}

export function hasAnyRole(user, allowedRoles = []) {
    if (!user?.role) return false;
    const normalizedRole = normalizeRole(user.role);
    return allowedRoles.some((role) => normalizeRole(role) === normalizedRole);
}
