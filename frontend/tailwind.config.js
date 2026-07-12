/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                ink: {
                    950: "#0B1220",
                    900: "#101828",
                    800: "#1D2839",
                    700: "#2B3A55",
                },
                teal: {
                    600: "#0D9488",
                    500: "#14B8A6",
                },
                status: {
                    available: "#16A34A",
                    allocated: "#2563EB",
                    reserved: "#7C3AED",
                    maintenance: "#D97706",
                    lost: "#DC2626",
                    retired: "#6B7280",
                    disposed: "#374151",
                },
            },
            fontFamily: {
                display: ["'Space Grotesk'", "sans-serif"],
                body: ["'Inter'", "sans-serif"],
                mono: ["'IBM Plex Mono'", "monospace"],
            },
        },
    },
    plugins: [],
};