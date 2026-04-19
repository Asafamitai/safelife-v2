import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SafeLife theme tokens — keep in sync with CLAUDE.md §5
        ink: {
          DEFAULT: "#0A0A0F",
          2: "#2B2E38",
        },
        muted: "#6B7280",
        line: "#E6E9F0",
        panel: "#F4F6FB",
        "off-white": "#FBFBFD",
        accent: "#1357D3",
        "chip-blue": "#E8F0FE",
        scam: {
          bg: "#FEECEC",
          ink: "#B42318",
        },
        med: {
          bg: "#E8F0FE",
          ink: "#1D4FD8",
        },
        family: {
          bg: "#EFE9FE",
          ink: "#5B2BD9",
        },
        ok: {
          bg: "#D8F5E3",
          ink: "#0B7A3B",
        },
        ride: {
          bg: "#FFF2D6",
          ink: "#8A5A00",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      letterSpacing: {
        tight: "-0.02em",
        tighter: "-0.03em",
      },
      boxShadow: {
        card: "0 10px 24px -10px rgba(15, 23, 42, 0.25)",
        phone:
          "0 40px 80px -20px rgba(15, 23, 42, 0.35), 0 8px 20px -6px rgba(15, 23, 42, 0.15)",
      },
      borderRadius: {
        card: "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
