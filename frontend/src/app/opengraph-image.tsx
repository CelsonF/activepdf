import { ImageResponse } from "next/og";

export const alt = "Grifo — Transforme qualquer PDF em atividade interativa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// next/og renderiza fora do DOM/Tailwind: aqui estilo inline é o único caminho.
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#F7F7F5",
          color: "#16181D",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 36, color: "#4A4F57", letterSpacing: 4 }}>
          GRIFO
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 32,
            fontSize: 88,
            fontWeight: 800,
            lineHeight: 1.05,
          }}
        >
          <span>Qualquer PDF vira</span>
          <span style={{ display: "flex" }}>
            prática que{" "}
            <span
              style={{
                marginLeft: 24,
                backgroundImage:
                  "linear-gradient(transparent 55%, #FFD64D 55%, #FFD64D 92%, transparent 92%)",
                padding: "0 8px",
              }}
            >
              engaja.
            </span>
          </span>
        </div>
        <div style={{ display: "flex", marginTop: 48, fontSize: 30, color: "#4A4F57" }}>
          Marque, pratique, aprenda — grátis, direto no navegador.
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 16,
            backgroundColor: "#0B5FFF",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
