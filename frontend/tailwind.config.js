/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0ea5e9",
        surface: "#0f172a",
        card: "#1e293b",
        border: "#334155",
        accent: "#38bdf8",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        muted: "#64748b",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
