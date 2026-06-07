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
  color: "#111827",
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

  // Render PDF page onto canvas
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
    <main style={{ flex: 1, overflow: "auto", background: "#e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 28px 28px" }}>
      {/* Pagination */}
      {totalPages > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, background: "white", borderRadius: 10, padding: "6px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.10)", border: "1px solid #e2e8f0" }}>
          <PageNavBtn onClick={() => currentPage > 1 && setPage(currentPage - 1)} disabled={currentPage <= 1}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </PageNavBtn>
          <input
            type="number" min={1} max={totalPages} value={currentPage}
            onChange={(e) => { const n = parseInt(e.target.value, 10); if (n >= 1 && n <= totalPages) setPage(n); }}
            style={{ width: 46, textAlign: "center", padding: "3px 4px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, fontWeight: 700, color: "#0f172a", outline: "none" }}
          />
          <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>/ {totalPages}</span>
          <PageNavBtn onClick={() => currentPage < totalPages && setPage(currentPage + 1)} disabled={currentPage >= totalPages}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </PageNavBtn>
        </div>
      )}

      {/* PDF canvas + overlays */}
      <div style={{ position: "relative", display: "inline-block", background: "white", boxShadow: "0 4px 24px rgba(0,0,0,0.12)", borderRadius: 2 }}>
        <canvas ref={canvasRef} style={{ display: "block" }} />

        {/* Design-mode drag overlay + field markers */}
        <div
          ref={overlayRef}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", cursor: isFill ? "default" : "crosshair", pointerEvents: isFill ? "none" : "auto" }}
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

        {/* Fill-mode inputs overlaid on PDF */}
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
