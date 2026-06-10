"use client";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
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
        className="fixed inset-0 bg-slate-900/30 z-40 backdrop-blur-[1px]"
      />

      {/* Drawer */}
      <aside className="animate-slideIn fixed top-0 right-0 h-screen w-[460px] bg-white shadow-[-4px_0_32px_rgba(0,0,0,0.14)] z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-4 pb-[14px] border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-light flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <h2 className="text-sm font-bold text-slate-900">Extração de Texto (OCR)</h2>
            </div>
            <button
              onClick={() => !loading && setOcrOpen(false)}
              className={cn(
                "w-7 h-7 rounded-[7px] border-none bg-transparent flex items-center justify-center text-slate-400",
                loading ? "cursor-not-allowed" : "cursor-pointer hover:bg-slate-100",
              )}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Extraindo texto da página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> — idioma: Português
          </p>
        </div>

        {/* Actions */}
        <div className="px-5 py-3 border-b border-slate-100 flex-shrink-0 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleExtractPage}
              disabled={loading}
              className={cn(
                "ui-btn ui-btn-md flex-1 justify-center",
                ocrResults[currentPage] ? "ui-btn-outline" : "ui-btn-primary",
              )}
            >
              {loading && activePage === currentPage ? (
                <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              )}
              {ocrResults[currentPage] ? "Reextrair esta página" : "Extrair esta página"}
            </button>

            {totalPages > 1 && (
              <button
                onClick={handleExtractAll}
                disabled={loading}
                className="ui-btn ui-btn-md ui-btn-secondary flex-1 justify-center"
              >
                {loading && activePage !== currentPage ? (
                  <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h6v6H4z"/><path d="M14 4h6v6h-6z"/><path d="M4 14h6v6H4z"/><path d="M14 14h6v6h-6z"/></svg>
                )}
                Extrair todas ({totalPages} págs.)
              </button>
            )}
          </div>

          {loading && progress && (
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[11px] text-slate-500">{progress.status}</span>
                <span className="text-[11px] font-semibold text-brand">{progressPct}%</span>
              </div>
              <div className="h-1 bg-slate-100 rounded overflow-hidden">
                <div
                  className="h-full bg-brand rounded transition-[width] duration-200 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <div
                  key={p}
                  title={`Página ${p}${ocrResults[p] ? " — extraída" : ""}`}
                  className={cn(
                    "w-5 h-5 rounded-[4px] text-[10px] font-semibold flex items-center justify-center cursor-default border-[1.5px]",
                    p === currentPage
                      ? "border-brand bg-brand-light text-brand"
                      : ocrResults[p]
                      ? "border-green-300 bg-green-50 text-green-800"
                      : "border-slate-200 bg-white text-slate-400",
                  )}
                >
                  {p}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Text area */}
        <div className="flex-1 flex flex-col px-5 pt-3 overflow-hidden min-h-0">
          {currentText ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.05em]">
                  Texto extraído — Página {currentPage}
                </span>
                <span className="text-[11px] text-slate-400">
                  {currentText.length} caracteres
                </span>
              </div>
              <textarea
                ref={textareaRef}
                defaultValue={currentText}
                key={currentPage + currentText.slice(0, 20)}
                spellCheck={false}
                className="flex-1 resize-none border-[1.5px] border-slate-200 rounded-lg px-3 py-2.5 text-[13px] leading-[1.65] text-slate-900 font-mono outline-none bg-slate-50 overflow-y-auto focus:border-brand focus:shadow-[0_0_0_3px_rgba(79,70,229,0.1)]"
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2.5">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <p className="text-[13px] text-center max-w-[280px]">
                Clique em <strong>Extrair esta página</strong> para reconhecer o texto do PDF.
                <br /><br />
                <span className="text-[11px]">Na primeira execução, o idioma português (~10 MB) é baixado automaticamente.</span>
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {currentText && (
          <div className="px-5 py-3 border-t border-slate-100 flex-shrink-0 flex gap-2">
            <button
              onClick={handleCopy}
              className={cn(
                "ui-btn ui-btn-sm flex-1 justify-center",
                copied ? "ui-btn-success" : "ui-btn-secondary",
              )}
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
              className="ui-btn ui-btn-sm ui-btn-secondary flex-1 justify-center"
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
