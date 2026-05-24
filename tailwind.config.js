/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff1f5",
          100: "#ffe4ec",
          300: "#fda4ba",
          500: "#f43f6b",
          600: "#e11d48",
          700: "#be123c"
        },
        health: {
          bg: "#eceff3",
          surface: "#ffffff",
          surfaceSoft: "#f8fafc",
          text: "#0f172a",
          muted: "#475569",
          border: "#dce2ea",
          accent: "#e11d48",
          accentDark: "#be123c",
          success: "#059669",
          warning: "#ea580c",
          danger: "#e11d48"
        }
      }
    }
  },
  plugins: []
};
