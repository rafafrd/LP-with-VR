import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: {
          bg: "#08080a",
          elevated: "#151517",
          card: "#101012",
        },
        acid: {
          DEFAULT: "#cfff04",
          dim: "#8fb300",
        },
        violet: "#8b5cf6",
        magenta: "#ff2e6a",
        ink: {
          DEFAULT: "#f4f4f2",
          dim: "#a3a3aa",
          faint: "#6b6b72",
        },
      },
      fontFamily: {
        display: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
