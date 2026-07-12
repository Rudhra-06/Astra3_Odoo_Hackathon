/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                display: ["'Inter'", "sans-serif"],
                body:    ["'Inter'", "sans-serif"],
                mono:    ["'IBM Plex Mono'", "monospace"],
            },
            colors: {
                ink: {
                    950: "#0B1220", 900: "#0F172A", 800: "#1E293B",
                    700: "#334155", 600: "#475569", 500: "#64748B",
                    400: "#94A3B8", 300: "#CBD5E1",
                },
                teal: { 600: "#0D9488", 500: "#14B8A6", 50: "#F0FDFA" },
                status: {
                    available: "#16A34A", allocated: "#2563EB", reserved: "#7C3AED",
                    maintenance: "#D97706", lost: "#DC2626", retired: "#6B7280", disposed: "#374151",
                },
            },
            keyframes: {
                "fade-in":  { from: { opacity: "0" }, to: { opacity: "1" } },
                "fade-up":  { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
                "scale-in": { from: { opacity: "0", transform: "scale(0.96)" }, to: { opacity: "1", transform: "scale(1)" } },
            },
            animation: {
                "fade-in":  "fade-in 150ms ease-out both",
                "fade-up":  "fade-up 200ms ease-out both",
                "scale-in": "scale-in 150ms ease-out both",
            },
        },
    },
    plugins: [],
};
