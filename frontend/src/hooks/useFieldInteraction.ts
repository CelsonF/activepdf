"use client";
import React, { useCallback, useEffect, useRef } from "react";
import { useEditor } from "@/store";
import type { PdfField } from "@/types";
import { screenToPdf } from "@/lib/coordinates";

type Ref<T> = React.RefObject<T>;

export function useFieldInteraction(
  overlayRef: Ref<HTMLDivElement | null>,
  dragRectRef: Ref<HTMLDivElement | null>,
  vpRef: Ref<{ w: number; h: number }>,
  vsRef: Ref<{ w: number; h: number }>,
) {
  const { updateField, selectField } = useEditor();

  const isDragging  = useRef(false);
  const dragStart   = useRef({ x: 0, y: 0 });
  const dragEnd     = useRef({ x: 0, y: 0 });

  const isMoving    = useRef(false);
  const movingId    = useRef<string | null>(null);
  const moveOffset  = useRef({ x: 0, y: 0 });

  const isResizing  = useRef(false);
  const resizingId  = useRef<string | null>(null);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  function getCoords(e: MouseEvent) {
    const rect = overlayRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  const onOverlayMouseDown = useCallback((e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement) !== overlayRef.current &&
      (e.target as HTMLElement) !== dragRectRef.current
    ) return;
    const c = getCoords(e.nativeEvent);
    isDragging.current  = true;
    dragStart.current   = c;
    dragEnd.current     = c;
    const dr = dragRectRef.current!;
    dr.style.display = "block";
    dr.style.left    = c.x + "px";
    dr.style.top     = c.y + "px";
    dr.style.width   = "0px";
    dr.style.height  = "0px";
  }, []);

  const onOverlayMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const c = getCoords(e.nativeEvent);
    dragEnd.current = c;
    const x = Math.min(dragStart.current.x, c.x);
    const y = Math.min(dragStart.current.y, c.y);
    const w = Math.abs(c.x - dragStart.current.x);
    const h = Math.abs(c.y - dragStart.current.y);
    const dr = dragRectRef.current!;
    dr.style.left = x + "px"; dr.style.top    = y + "px";
    dr.style.width = w + "px"; dr.style.height = h + "px";
  }, []);

  const onOverlayMouseUp = useCallback((_e: React.MouseEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const dr = dragRectRef.current!;
    dr.style.display = "none";

    const sx = dragStart.current.x, sy = dragStart.current.y;
    const ex = dragEnd.current.x,   ey = dragEnd.current.y;
    const x = Math.min(sx, ex), y = Math.min(sy, ey);
    const w = Math.abs(ex - sx), h = Math.abs(ey - sy);

    let fx = x, fy = y, fw = w, fh = h;
    if (w < 6 || h < 6) { fx = x - 40; fy = y - 9; fw = 90; fh = 18; }
    else { fw = Math.max(30, w); fh = Math.max(14, h); }

    const { w: vpW, h: vpH } = vpRef.current!;
    fx = Math.max(0, Math.min(fx, vpW - 30));
    fy = Math.max(0, Math.min(fy, vpH - 14));

    const { currentPage, addField, incrementCounter } = useEditor.getState();
    const num = incrementCounter();
    addField({
      id: crypto.randomUUID(),
      name: `campo${num}`,
      label: "",
      fieldType: "input",
      page: currentPage,
      px: fx, py: fy, pw: fw, ph: fh,
      ...screenToPdf(fx, fy, fw, fh, vpRef.current!, vsRef.current!),
      multiline: fh > 30,
      fontSize: 11,
    });
  }, []);

  // Global move / resize tracking
  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (isMoving.current && movingId.current) {
        const rect = overlayRef.current!.getBoundingClientRect();
        const { w: vpW, h: vpH } = vpRef.current!;
        const f = useEditor.getState().fields.find((x) => x.id === movingId.current);
        if (!f) return;
        const newX = Math.max(0, Math.min(e.clientX - rect.left - moveOffset.current.x, vpW - f.pw));
        const newY = Math.max(0, Math.min(e.clientY - rect.top  - moveOffset.current.y, vpH - f.ph));
        updateField(movingId.current, {
          px: newX, py: newY,
          ...screenToPdf(newX, newY, f.pw, f.ph, vpRef.current!, vsRef.current!),
        });
      }
      if (isResizing.current && resizingId.current) {
        const dx = e.clientX - resizeStart.current.x;
        const dy = e.clientY - resizeStart.current.y;
        const f = useEditor.getState().fields.find((x) => x.id === resizingId.current);
        if (!f) return;
        const pw = Math.max(20, resizeStart.current.w + dx);
        const ph = Math.max(14, resizeStart.current.h + dy);
        updateField(resizingId.current, {
          pw, ph, multiline: ph > 30,
          ...screenToPdf(f.px, f.py, pw, ph, vpRef.current!, vsRef.current!),
        });
      }
    }
    function onUp() {
      isMoving.current   = false; movingId.current   = null;
      isResizing.current = false; resizingId.current = null;
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup",   onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup",   onUp);
    };
  }, [updateField]);

  // Keyboard shortcuts (Delete / Escape)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement).matches("input,textarea,select")) return;
      const { selectedFieldId, deleteField } = useEditor.getState();
      if ((e.key === "Delete" || e.key === "Backspace") && selectedFieldId) {
        e.preventDefault();
        deleteField(selectedFieldId);
      }
      if (e.key === "Escape") selectField(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectField]);

  // Called by FieldMarker on the drag/move area
  const onMarkerMouseDown = useCallback((e: React.MouseEvent, f: PdfField) => {
    e.stopPropagation();
    e.preventDefault();
    useEditor.getState().selectField(f.id);
    const rect = overlayRef.current!.getBoundingClientRect();
    isMoving.current   = true;
    movingId.current   = f.id;
    moveOffset.current = { x: e.clientX - rect.left - f.px, y: e.clientY - rect.top - f.py };
  }, []);

  // Called by FieldMarker on the resize handle
  const onResizeMouseDown = useCallback((e: React.MouseEvent, f: PdfField) => {
    e.stopPropagation();
    e.preventDefault();
    useEditor.getState().selectField(f.id);
    isResizing.current  = true;
    resizingId.current  = f.id;
    resizeStart.current = { x: e.clientX, y: e.clientY, w: f.pw, h: f.ph };
  }, []);

  return {
    onOverlayMouseDown,
    onOverlayMouseMove,
    onOverlayMouseUp,
    onMarkerMouseDown,
    onResizeMouseDown,
  };
}
