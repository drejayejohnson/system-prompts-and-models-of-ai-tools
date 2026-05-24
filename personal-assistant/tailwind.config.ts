import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          50:  "#fff4f1",
          100: "#ffe4dc",
          200: "#ffcbbe",
          300: "#ffa590",
          400: "#f87659",
          500: "#e8836a",
          600: "#d4633e",
          700: "#b24c2d",
          800: "#923e26",
          900: "#793826",
        },
        warm: {
          50:  "#faf9f7",
          100: "#f4f1ec",
          200: "#e8e2d8",
          300: "#d5ccbe",
          400: "#bfb09e",
          500: "#a69381",
          600: "#8c7a6a",
          700: "#726356",
          800: "#5e5147",
          900: "#4d433b",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      animation: {
        "pulse-ring": "pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
        "voice-wave": "voice-wave 1.2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.95)", opacity: "1" },
          "50%": { transform: "scale(1.1)", opacity: "0.7" },
          "100%": { transform: "scale(0.95)", opacity: "1" },
        },
        "voice-wave": {
          "0%, 100%": { transform: "scaleY(0.4)" },
          "50%":       { transform: "scaleY(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
