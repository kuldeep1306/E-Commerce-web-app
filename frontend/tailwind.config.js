/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EDF7F6",
          100: "#D3EBE8",
          200: "#A7D7D1",
          300: "#6FBDB3",
          400: "#3AA096",
          500: "#0F766E", // main brand
          600: "#0C5F58",
          700: "#0B5952",
          800: "#083F3A",
          900: "#062C29",
        },
        accent: {
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
        },
        ink: {
          900: "#111827",
          700: "#374151",
          500: "#6B7280",
          300: "#D1D5DB",
          100: "#F3F4F6",
        },
      },
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(17,24,39,0.06), 0 4px 12px rgba(17,24,39,0.06)",
        cardHover: "0 8px 24px rgba(15,118,110,0.14)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
