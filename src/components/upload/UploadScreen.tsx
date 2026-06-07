"use client";
import { useRef, useState } from "react";
import { useEditor } from "@/store";

export function UploadScreen() {
  const { loadPdf } = useEditor();
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") { setError("Por favor, envie um arquivo PDF."); return; }
    setLoading(true); setError("");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;
      const buf = await file.arrayBuffer();
      const bytes = buf.slice(0);
      const doc = await pdfjsLib.getDocument({ data: buf }).promise;
      const name = file.name.replace(/\.pdf$/i, "");
      loadPdf(doc, bytes, name, doc.numPages);
    } catch (e: any) {
      setError("Erro ao carregar PDF: " + e.message);
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: "linear-gradient(135deg, #f0f4ff 0%, #f8fafc 60%, #faf5ff 100%)" }}>
      <div style={{ maxWidth: 640, width: "100%" }}>

        {/* Logo */}
        <div className="animate-fadeUp" style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(79,70,229,0.4)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="9" y1="12" x2="15" y2="12"/>
                <line x1="9" y1="16" x2="15" y2="16"/>
              </svg>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>ActivePDF</h1>
          </div>
          <p style={{ fontSize: 17, color: "#475569", lineHeight: 1.5, maxWidth: 480, margin: "0 auto" }}>
            Adicione campos de resposta interativos em qualquer PDF — sem servidor, sem cadastro.
          </p>
        </div>

        {/* Drop zone */}
        <div
          className="animate-fadeUp"
          style={{ animationDelay: "0.05s" }}
          onClick={() => !loading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        >
          <input ref={inputRef} type="file" accept="application/pdf" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <div style={{
            border: `2px dashed ${dragging ? "var(--brand)" : "#cbd5e1"}`,
            borderRadius: 16,
            padding: "52px 32px",
            textAlign: "center",
            cursor: loading ? "default" : "pointer",
            background: dragging ? "var(--brand-light)" : "white",
            transition: "all 0.2s",
            boxShadow: dragging ? "0 0 0 4px rgba(79,70,229,0.1)" : "0 1px 3px rgba(0,0,0,0.06)",
          }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: dragging ? "var(--brand-light)" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", transition: "all 0.2s" }}>
              {loading ? (
                <div style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTopColor: "var(--brand)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              ) : (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={dragging ? "var(--brand)" : "#64748b"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              )}
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
              {loading ? "Carregando PDF..." : "Arraste seu PDF aqui"}
            </h3>
            <p style={{ color: "#64748b", marginBottom: 24, fontSize: 14 }}>
              {loading ? "Processando páginas..." : "ou clique para selecionar do seu computador"}
            </p>
            {!loading && (
              <button
                style={{ background: "var(--brand)", color: "white", border: "none", borderRadius: 10, padding: "10px 22px", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 2px 8px rgba(79,70,229,0.35)", transition: "all 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-dark)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand)")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Escolher arquivo
              </button>
            )}
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 20 }}>🔒 Seus arquivos ficam apenas no seu navegador</p>
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 14, color: "#b91c1c" }}>
            {error}
          </div>
        )}

        {/* How it works */}
        <div className="animate-fadeUp" style={{ animationDelay: "0.1s", marginTop: 24, background: "white", borderRadius: 14, border: "1px solid #e2e8f0", padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>⚡ Como funciona</h4>
          <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["1", "Carregue seu PDF (livro, apostila, lista de exercícios)"],
              ["2", "Navegue até a página com o exercício"],
              ["3", "Clique e arraste sobre cada espaço em branco — um campo editável aparece ali"],
              ["4", "Arraste e redimensione cada campo como quiser"],
              ["5", "Escolha o tipo de export e baixe o PDF pronto"],
            ].map(([n, txt]) => (
              <li key={n} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 14, color: "#475569" }}>
                <span style={{ fontWeight: 700, color: "var(--brand)", minWidth: 20 }}>{n}.</span>
                <span dangerouslySetInnerHTML={{ __html: txt.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/(Clique e arraste|Arraste e redimensione|Escolha)/g, "<b>$1</b>") }} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
