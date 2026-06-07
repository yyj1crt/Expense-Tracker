import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          900: "#020617",
          800: "#0f172a",
          700: "#1e293b",
          600: "#334155",
          500: "#475569",
          accent: "#7c3aed",
          surface: "#f8fafc",
        },
      },
      boxShadow: {
        soft: "0 18px 50px rgba(15, 23, 42, 0.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;
