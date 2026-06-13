import { createFileRoute } from "@tanstack/react-router";

// Dynamic Open Graph image (1200×630) rendered per-route via Satori.
// Each page points og:image at /og.png?eyebrow=…&title=…&desc=… so the social
// card mirrors that page. Brand tokens below are hex approximations of the
// oklch tokens in styles.css (Satori doesn't parse oklch reliably).
const PAPER = "#f1f4f8"; // --background (paper)
const INK = "#141728"; // --ink / --foreground (navy)
const HIGHLIGHT = "#f5d21e"; // --highlight (marker yellow)
const MUTED = "#5b6172"; // muted ink for body copy

// Satori reads ttf/otf/woff (not woff2). Fontsource ships stable .woff files.
const FONT_FILES = {
  interRegular:
    "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/files/inter-latin-400-normal.woff",
  interBold:
    "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/files/inter-latin-700-normal.woff",
  archivo:
    "https://cdn.jsdelivr.net/npm/@fontsource/archivo-black@5.0.16/files/archivo-black-latin-400-normal.woff",
} as const;

type LoadedFont = { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" };

// Fetch fonts once per warm instance; only the cold start pays the network cost.
let fontsPromise: Promise<LoadedFont[]> | undefined;
function loadFonts(): Promise<LoadedFont[]> {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      fetch(FONT_FILES.interRegular).then((r) => r.arrayBuffer()),
      fetch(FONT_FILES.interBold).then((r) => r.arrayBuffer()),
      fetch(FONT_FILES.archivo).then((r) => r.arrayBuffer()),
    ]).then(([interRegular, interBold, archivo]): LoadedFont[] => [
      { name: "Inter", data: interRegular, weight: 400, style: "normal" },
      { name: "Inter", data: interBold, weight: 700, style: "normal" },
      { name: "Archivo Black", data: archivo, weight: 400, style: "normal" },
    ]);
  }
  return fontsPromise;
}

function clamp(value: string | null, max: number, fallback: string): string {
  const text = (value ?? "").trim() || fallback;
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export const Route = createFileRoute("/og.png")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Dynamic import keeps @vercel/og out of the client bundle.
        const { ImageResponse } = await import("@vercel/og");

        const params = new URL(request.url).searchParams;
        const eyebrow = clamp(params.get("eyebrow"), 38, "Grifo · Editor de PDF");
        const title = clamp(params.get("title"), 90, "Qualquer PDF vira prática que engaja");
        const desc = clamp(
          params.get("desc"),
          150,
          "Adicione campos sobre a página, responda e exporte preenchido — direto no navegador.",
        );
        const fonts = await loadFonts();

        return new ImageResponse(
          (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                padding: 80,
                backgroundColor: PAPER,
                fontFamily: "Inter",
                justifyContent: "space-between",
              }}
            >
              {/* eyebrow as a highlighter mark — the brand's signature */}
              <div
                style={{
                  display: "flex",
                  alignSelf: "flex-start",
                  fontSize: 22,
                  letterSpacing: 5,
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: INK,
                  backgroundColor: HIGHLIGHT,
                  padding: "8px 16px",
                }}
              >
                {eyebrow}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <div
                  style={{
                    display: "flex",
                    fontFamily: "Archivo Black",
                    fontSize: 74,
                    lineHeight: 1.05,
                    color: INK,
                  }}
                >
                  {title}
                </div>
                <div
                  style={{ display: "flex", fontSize: 32, lineHeight: 1.35, color: MUTED, maxWidth: 940 }}
                >
                  {desc}
                </div>
              </div>

              {/* footer: logo block + domain */}
              <div
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 60,
                      height: 60,
                      borderRadius: 14,
                      backgroundColor: INK,
                      fontFamily: "Archivo Black",
                      fontSize: 32,
                      color: HIGHLIGHT,
                    }}
                  >
                    G
                  </div>
                  <div style={{ display: "flex", fontFamily: "Archivo Black", fontSize: 36, color: INK }}>
                    Grifo
                  </div>
                </div>
                <div style={{ display: "flex", fontSize: 24, color: MUTED }}>www.grifo-pdf.com</div>
              </div>
            </div>
          ),
          {
            width: 1200,
            height: 630,
            fonts,
            headers: {
              "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
            },
          },
        );
      },
    },
  },
});
