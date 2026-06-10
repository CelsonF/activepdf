"use client";
import { useEffect, useRef } from "react";
import type React from "react";
import { useEditor } from "@/store";
import { useFieldInteraction } from "@/hooks/useFieldInteraction";
import { FieldMarker } from "@/components/editor/FieldMarker";
import { PageNavBtn } from "@/components/ui/Buttons";

const FILL_INPUT_BASE: React.CSSProperties = {
  position: "absolute",
  background: "rgba(255,255,255,0.01)",
  border: "1.5px dashed rgba(79,70,229,0.45)",
  borderRadius: 3,
  outline: "none",
  fontFamily: "Helvetica, Arial, sans-serif",
  color: "var(--text-primary)",
  padding: "2px 4px",
  zIndex: 10,
  boxSizing: "border-box",
};

export function PdfCanvas() {
  const {
    pdfDoc, currentPage, totalPages, scale,
    fields, selectedFieldId, appMode,
    fieldValues, setFieldValue,
    setViewport, setPage,
  } = useEditor();

  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const overlayRef  = useRef<HTMLDivElement>(null);
  const dragRectRef = useRef<HTMLDivElement>(null);
  const vpRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const vsRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  const { onOverlayMouseDown, onOverlayMouseMove, onOverlayMouseUp, onMarkerMouseDown, onResizeMouseDown } =
    useFieldInteraction(overlayRef, dragRectRef, vpRef, vsRef);

  useEffect(() => {
    if (!pdfDoc) return;
    let cancelled = false;
    let renderTask: { promise: Promise<void>; cancel: () => void } | null = null;
    (async () => {
      const page = await pdfDoc.getPage(currentPage);
      if (cancelled || !canvasRef.current) return;
      const vp  = page.getViewport({ scale });
      const vs1 = page.getViewport({ scale: 1 });
      vpRef.current = { w: vp.width,  h: vp.height  };
      vsRef.current = { w: vs1.width, h: vs1.height };
      setViewport({ width: vp.width, height: vp.height }, { width: vs1.width, height: vs1.height });
      const canvas = canvasRef.current;
      canvas.width  = vp.width;
      canvas.height = vp.height;
      renderTask = page.render({ canvasContext: canvas.getContext("2d")!, viewport: vp });
      try {
        await renderTask.promise;
      } catch {
        // RenderingCancelledException — ignorado intencionalmente
      }
    })();
    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [pdfDoc, currentPage, scale]);

  const pageFields = fields.filter((f) => f.page === currentPage);
  const isFill = appMode === "fill";

  return (
    <main className="flex-1 overflow-auto bg-slate-200 flex flex-col items-center px-7 pt-5 pb-7">
      {totalPages > 0 && (
        <div className="flex items-center gap-2 mb-[14px] bg-white rounded-[10px] px-[14px] py-[6px] shadow-[0_2px_8px_rgba(0,0,0,0.10)] border border-slate-200">
          <PageNavBtn onClick={() => currentPage > 1 && setPage(currentPage - 1)} disabled={currentPage <= 1}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </PageNavBtn>
          <input
            type="number" min={1} max={totalPages} value={currentPage}
            onChange={(e) => { const n = parseInt(e.target.value, 10); if (n >= 1 && n <= totalPages) setPage(n); }}
            className="w-[46px] text-center px-1 py-[3px] border border-slate-200 rounded-[6px] text-[13px] font-bold text-slate-900 outline-none"
          />
          <span className="text-[13px] text-slate-400 font-medium">/ {totalPages}</span>
          <PageNavBtn onClick={() => currentPage < totalPages && setPage(currentPage + 1)} disabled={currentPage >= totalPages}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </PageNavBtn>
        </div>
      )}

      <div className="relative inline-block bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-[2px]">
        <canvas ref={canvasRef} style={{ display: "block" }} />

        <div
          ref={overlayRef}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
          className={isFill ? "cursor-default pointer-events-none" : "cursor-crosshair"}
          onMouseDown={isFill ? undefined : onOverlayMouseDown}
          onMouseMove={isFill ? undefined : onOverlayMouseMove}
          onMouseUp={isFill ? undefined : onOverlayMouseUp}
        >
          <div ref={dragRectRef} className="drag-rect" style={{ display: "none" }} />
          {!isFill && pageFields.map((f) => (
            <FieldMarker
              key={f.id}
              field={f}
              selected={f.id === selectedFieldId}
              onMarkerMouseDown={onMarkerMouseDown}
              onResizeMouseDown={onResizeMouseDown}
            />
          ))}
        </div>

        {isFill && pageFields.map((f) =>
          f.multiline ? (
            <textarea
              key={f.id}
              value={fieldValues[f.id] ?? ""}
              onChange={(e) => setFieldValue(f.id, e.target.value)}
              aria-label={f.label || f.name}
              style={{ ...FILL_INPUT_BASE, left: f.px, top: f.py, width: f.pw, height: f.ph, resize: "none", lineHeight: 1.4, overflow: "hidden", fontSize: Math.round(f.fontSize * scale) }}
            />
          ) : (
            <input
              key={f.id}
              type="text"
              value={fieldValues[f.id] ?? ""}
              onChange={(e) => setFieldValue(f.id, e.target.value)}
              aria-label={f.label || f.name}
              style={{ ...FILL_INPUT_BASE, left: f.px, top: f.py, width: f.pw, height: f.ph, fontSize: Math.round(f.fontSize * scale) }}
            />
          )
        )}
      </div>
    </main>
  );
}
