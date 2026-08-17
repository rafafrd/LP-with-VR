import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cloud: {
          50: "#ffffff",
          100: "#fbfbfd",
          200: "#f5f5f7",
          300: "#e5e5ea",
          400: "#d1d1d6",
        },
        slate: {
          charcoal: "#1d1d1f",
          titanium: "#424245",
          muted: "#6e6e73",
          light: "#86868b",
        },
        apple: {
          blue: "#0071e3",
          "blue-hover": "#0077ed",
          "blue-subtle": "rgba(0, 113, 227, 0.08)",
          cobalt: "#3b4261",
          emerald: "#34c759",
        },
      },
      fontFamily: {
        display: [
          '"Plus Jakarta Sans"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          '"SFMono-Regular"',
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        glass: "0 10px 30px -10px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)",
        "glass-elevated":
          "0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)",
        "apple-card":
          "0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)",
      },
    },
  },
  plugins: [],
} satisfies Config;
