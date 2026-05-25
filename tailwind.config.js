/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ffdad8",
          100: "#ffb3b1",
          300: "#db313f",
          500: "#c61f35",
          600: "#b7102a",
          700: "#92001c"
        },
        health: {
          bg: "#f9f9ff",
          surface: "#ffffff",
          surfaceSoft: "#f0f3ff",
          text: "#001b3c",
          muted: "#5b403f",
          border: "#e4bebc",
          accent: "#2b6485",
          accentDark: "#064c6b",
          success: "#336366",
          warning: "#ba1a1a",
          danger: "#b7102a"
        }
      }
    }
  },
  plugins: []
};
