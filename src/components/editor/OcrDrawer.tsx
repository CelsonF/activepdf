"use client";
import { useRef, useState } from "react";
import { useEditor } from "@/store";
import { extractPageText, extractAllPagesText } from "@/lib/ocr";
import type { OcrProgress } from "@/lib/ocr";

export function OcrDrawer() {
  const {
    pdfDoc, currentPage, totalPages, pdfName,
    ocrOpen, ocrResults,
    setOcrOpen, setOcrResult, setOcrResults,
  } = useEditor();

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<OcrProgress | null>(null);
  const [activePage, setActivePage] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!ocrOpen) return null;

  const currentText = ocrResults[currentPage] ?? "";
  const allPagesExtracted = totalPages > 0 && Array.from({ length: totalPages }, (_, i) => i + 1).every((p) => ocrResults[p]);

  async function handleExtractPage() {
    if (!pdfDoc || loading) return;
    setLoading(true);
    setActivePage(currentPage);
    setProgress({ status: "Iniciando...", progress: 0 });
    try {
      const text = await extractPageText(pdfDoc, currentPage, (p) => setProgress(p));
      setOcrResult(currentPage, text);
    } catch (e) {
      console.error("OCR error:", e);
    } finally {
      setLoading(false);
      setProgress(null);
      setActivePage(null);
    }
  }

  async function handleExtractAll() {
    if (!pdfDoc || loading) return;
    setLoading(true);
    setProgress({ status: "Preparando...", progress: 0 });
    try {
      const results = await extractAllPagesText(pdfDoc, totalPages, (page, p) => {
        setActivePage(page);
        setProgress(p);
      });
      setOcrResults(results);
    } catch (e) {
      console.error("OCR error:", e);
    } finally {
      setLoading(false);
      setProgress(null);
      setActivePage(null);
    }
  }

  async function handleCopy() {
    const text = textareaRef.current?.value ?? currentText;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const text = allPagesExtracted
      ? Object.entries(ocrResults)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([p, t]) => `=== Página ${p} ===\n\n${t}`)
          .join("\n\n")
      : currentText;
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pdfName}_ocr.txt`;
    a.click();
    requestAnimationFrame(() => URL.revokeObjectURL(url));
  }

  const progressPct = progress ? Math.round(progress.progress * 100) : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => !loading && setOcrOpen(false)}
        style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.3)", zIndex: 40, backdropFilter: "blur(1px)" }}
      />

      {/* Drawer */}
      <aside
        className="animate-slideIn"
        style={{ position: "fixed", top: 0, right: 0, height: "100vh", width: 460, background: "white", boxShadow: "-4px 0 32px rgba(0,0,0,0.14)", zIndex: 50, display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        {/* Header */}
        <div style={{ padding: "16px 20px 14px", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--brand-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>Extração de Texto (OCR)</h2>
            </div>
            <button
              onClick={() => !loading && setOcrOpen(false)}
              style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
            Extraindo texto da página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> — idioma: Português
          </p>
        </div>

        {/* Actions */}
        <div style={{ padding: "12px 20px", borderBottom: "1px solid #f1f5f9", flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleExtractPage}
              disabled={loading}
              style={{ flex: 1, padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", border: "1.5px solid var(--brand)", background: ocrResults[currentPage] ? "var(--brand-light)" : "var(--brand)", color: ocrResults[currentPage] ? "var(--brand)" : "white", transition: "all 0.15s", opacity: loading ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              {loading && activePage === currentPage ? (
                <svg style={{ animation: "spin 1s linear infinite" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              )}
              {ocrResults[currentPage] ? "Reextrair esta página" : "Extrair esta página"}
            </button>

            {totalPages > 1 && (
              <button
                onClick={handleExtractAll}
                disabled={loading}
                style={{ flex: 1, padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", border: "1.5px solid #e2e8f0", background: "white", color: "#475569", transition: "all 0.15s", opacity: loading ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                {loading && activePage !== currentPage ? (
                  <svg style={{ animation: "spin 1s linear infinite" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h6v6H4z"/><path d="M14 4h6v6h-6z"/><path d="M4 14h6v6H4z"/><path d="M14 14h6v6h-6z"/></svg>
                )}
                Extrair todas ({totalPages} págs.)
              </button>
            )}
          </div>

          {/* Progress bar */}
          {loading && progress && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "#64748b" }}>{progress.status}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--brand)" }}>{progressPct}%</span>
              </div>
              <div style={{ height: 4, background: "#f1f5f9", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progressPct}%`, background: "var(--brand)", borderRadius: 2, transition: "width 0.2s ease" }} />
              </div>
            </div>
          )}

          {/* Page cache status */}
          {totalPages > 1 && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <div
                  key={p}
                  title={`Página ${p}${ocrResults[p] ? " — extraída" : ""}`}
                  style={{ width: 20, height: 20, borderRadius: 4, fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", cursor: "default", border: `1.5px solid ${p === currentPage ? "var(--brand)" : ocrResults[p] ? "#86efac" : "#e2e8f0"}`, background: p === currentPage ? "var(--brand-light)" : ocrResults[p] ? "#f0fdf4" : "white", color: p === currentPage ? "var(--brand)" : ocrResults[p] ? "#166534" : "#94a3b8" }}
                >
                  {p}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Text area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "12px 20px 0", overflow: "hidden", minHeight: 0 }}>
          {currentText ? (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Texto extraído — Página {currentPage}
                </span>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>
                  {currentText.length} caracteres
                </span>
              </div>
              <textarea
                ref={textareaRef}
                defaultValue={currentText}
                key={currentPage + currentText.slice(0, 20)}
                spellCheck={false}
                style={{ flex: 1, resize: "none", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", fontSize: 13, lineHeight: 1.65, color: "#0f172a", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", outline: "none", background: "#fafafa", overflowY: "auto" }}
              />
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8", gap: 10 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <p style={{ fontSize: 13, textAlign: "center", maxWidth: 280 }}>
                Clique em <strong>Extrair esta página</strong> para reconhecer o texto do PDF.
                <br /><br />
                <span style={{ fontSize: 11 }}>Na primeira execução, o idioma português (~10 MB) é baixado automaticamente.</span>
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {currentText && (
          <div style={{ padding: "12px 20px", borderTop: "1px solid #f1f5f9", flexShrink: 0, display: "flex", gap: 8 }}>
            <button
              onClick={handleCopy}
              style={{ flex: 1, padding: "7px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1.5px solid #e2e8f0", background: copied ? "#f0fdf4" : "white", color: copied ? "#166534" : "#475569", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              {copied ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              )}
              {copied ? "Copiado!" : "Copiar texto"}
            </button>
            <button
              onClick={handleDownload}
              style={{ flex: 1, padding: "7px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1.5px solid #e2e8f0", background: "white", color: "#475569", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Baixar .txt
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
