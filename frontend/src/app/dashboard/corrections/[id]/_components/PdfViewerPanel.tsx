"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { ArrowLeft, FilePdf, Student } from "@phosphor-icons/react";

interface PdfViewerPanelProps {
  pdfData: string;
  pdfName: string;
  title: string;
  studentName: string;
}

export function PdfViewerPanel({ pdfData, pdfName, title, studentName }: PdfViewerPanelProps) {
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const [pdfPages, setPdfPages] = useState(0);
  const [pdfError, setPdfError] = useState(false);

  // Load PDF document
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";

        const binary = atob(pdfData);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

        const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
        if (cancelled) return;

        pdfDocRef.current = doc;
        setPdfPages(doc.numPages);
      } catch {
        if (!cancelled) setPdfError(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [pdfData]);

  // Render pages after canvases are mounted
  useEffect(() => {
    if (!pdfPages || !pdfDocRef.current) return;

    const doc = pdfDocRef.current;
    let cancelled = false;

    async function renderAll() {
      for (let i = 1; i <= doc.numPages; i++) {
        if (cancelled) break;
        const page = await doc.getPage(i);
        const canvas = canvasRefs.current[i - 1];
        if (!canvas) continue;

        const viewport = page.getViewport({ scale: 1.5 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        await page.render({ canvasContext: ctx, viewport }).promise;
      }
    }

    renderAll();
    return () => {
      cancelled = true;
    };
  }, [pdfPages]);

  return (
    <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-4 h-[52px] flex items-center gap-3 shrink-0">
        <Link href="/dashboard/corrections" className="ui-btn ui-btn-secondary ui-btn-sm gap-1 shrink-0">
          <ArrowLeft size={13} /> Correções
        </Link>
        <div className="ui-divider" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{title}</p>
          <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 leading-tight">
            <Student size={10} /> {studentName} · {pdfName}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 items-center">
        {pdfError && (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
            <FilePdf size={36} />
            <p className="text-sm">Erro ao carregar o PDF.</p>
          </div>
        )}

        {!pdfError && pdfPages === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="ui-spinner w-6 h-6 border-2 text-brand" />
            <p className="text-sm text-slate-400">Carregando PDF...</p>
          </div>
        )}

        {Array.from({ length: pdfPages }, (_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden w-full max-w-2xl">
            <canvas
              ref={(el) => {
                canvasRefs.current[i] = el;
              }}
              className="w-full block"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
