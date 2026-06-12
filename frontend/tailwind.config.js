/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Grifo · Folha & Caneta (docs/identidade-grifo.md) ──
        paper: "#F7F7F5",
        ink: {
          DEFAULT: "#16181D",
          soft: "#4A4F57",
          muted: "#8B9097",
        },
        line: {
          DEFAULT: "#E5E5E1",
          strong: "#D2D2CC",
        },
        pen: {
          DEFAULT: "#0B5FFF",
          dark: "#0A4ED6",
          light: "#EBF1FF",
        },
        correction: {
          DEFAULT: "#DE2B1F",
          light: "#FDEDEB",
        },
        marker: {
          DEFAULT: "#FFD64D",
          light: "#FFF6D6",
        },
        // Alias de compatibilidade: telas legadas usam `brand`; aponta para pen.
        // A varredura da Sprint 6 migra brand → pen e remove o alias.
        brand: {
          DEFAULT: "#0B5FFF",
          dark: "#0A4ED6",
          light: "#EBF1FF",
        },
        // Tokens exclusivos da rota /portfolio (peça criativa fora do design system)
        pf: {
          canvas: "#ECEDEF",
          panel: "#FFFFFF",
          ink: "#131417",
          muted: "#5B6068",
          blue: "#0D63FF",
          red: "#E5261F",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        pfmono: ["var(--font-pfmono)", "monospace"],
      },
      boxShadow: {
        xs: "0 1px 2px rgba(22,24,29,0.05)",
        card: "0 1px 4px rgba(22,24,29,0.05)",
        pen: "0 2px 8px rgba(11,95,255,0.30)",
        "pen-hover": "0 4px 12px rgba(11,95,255,0.35)",
        // Aliases legados (brand → pen); somem na varredura da Sprint 6
        brand: "0 2px 8px rgba(11,95,255,0.30)",
        "brand-lg": "0 4px 16px rgba(11,95,255,0.35)",
        "brand-hover": "0 4px 12px rgba(11,95,255,0.35)",
        success: "0 2px 8px rgba(5,150,105,0.35)",
      },
      backgroundImage: {
        "upload-gradient":
          "linear-gradient(135deg, #EBF1FF 0%, #F7F7F5 55%, #FFF6D6 100%)",
      },
    },
  },
  plugins: [],
};
