import type { Config } from "tailwindcss";

// Tokens mirror the "Portfolio Redesign" Figma file.
const config: Config = {
  content: ["./app/**/*.{ts,tsx,mdx}", "./components/**/*.{ts,tsx}", "./content/**/*.mdx"],
  theme: {
    extend: {
      colors: {
        page: "#101210",
        surface: "#181c18",
        raised: "#202620",
        moss: "#233019",
        line: "#343c32",
        ink: "#f0f2e9",
        muted: "#a7afa3",
        dim: "#75816f",
        lime: { DEFAULT: "#c5f46b", ink: "#10150b" },
        danger: "#ff8a65",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        label: ["0.75rem", { lineHeight: "1.5" }],
      },
      maxWidth: {
        page: "1440px",
      },
      spacing: {
        gutter: "var(--gutter)",
      },
    },
  },
  plugins: [],
};
export default config;
