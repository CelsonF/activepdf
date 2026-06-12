"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { PDFDocumentProxy } from "pdfjs-dist";
import {
  ArrowLeft,
  FilePdf,
  PencilLine,
  Tag,
  CalendarBlank,
  FileText,
  HardDrive,
} from "@phosphor-icons/react";

interface Props {
  id: string;
  name: string;
  description: string | null;
  tags: string[];
  pageCount: number | null;
  fileSize: number | null;
  createdAt: string;
  pdfData: string;
}

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function fmtSize(bytes: number | null) {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function LibraryPdfViewer({
  id,
  name,
  description,
  tags,
  pageCount,
  fileSize,
  createdAt,
  pdfData,
}: Props) {
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const [pages, setPages] = useState(0);
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
        for (let i = 0; i < binary.length; i++)
          bytes[i] = binary.charCodeAt(i);

        const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
        if (cancelled) return;

        pdfDocRef.current = doc;
        setPages(doc.numPages);
      } catch {
        if (!cancelled) setPdfError(true);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [pdfData]);

  // Render pages once canvases mount
  useEffect(() => {
    if (!pages || !pdfDocRef.current) return;

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
    return () => { cancelled = true; };
  }, [pages]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* PDF viewer */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white border-b border-slate-200 px-4 h-[52px] flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard/library"
            className="ui-btn ui-btn-secondary ui-btn-sm gap-1 shrink-0"
          >
            <ArrowLeft size={13} /> Biblioteca
          </Link>
          <div className="ui-divider" />
          <p className="text-sm font-semibold text-slate-800 truncate">
            {name}
          </p>
        </div>

        {/* Pages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 items-center">
          {pdfError && (
            <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
              <FilePdf size={36} />
              <p className="text-sm">Erro ao carregar o PDF.</p>
            </div>
          )}

          {!pdfError && pages === 0 && (
            <div className="flex flex-col items-center gap-3 py-16">
              <div className="ui-spinner w-6 h-6 border-2 text-violet-600" />
              <p className="text-sm text-slate-400">Carregando PDF...</p>
            </div>
          )}

          {Array.from({ length: pages }, (_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm overflow-hidden w-full max-w-2xl"
            >
              <canvas
                ref={(el) => { canvasRefs.current[i] = el; }}
                className="w-full block"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Info panel */}
      <div className="w-[300px] shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-y-auto">
        <div className="px-5 py-5 flex flex-col gap-5">
          {/* Icon + name */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
              <FilePdf size={20} weight="fill" className="text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 leading-snug">
                {name}
              </p>
              {description && (
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-col gap-2.5">
            {[
              {
                icon: <FileText size={13} className="text-slate-400" />,
                label: "Páginas",
                value: pageCount != null ? `${pageCount} páginas` : "—",
              },
              {
                icon: <HardDrive size={13} className="text-slate-400" />,
                label: "Tamanho",
                value: fmtSize(fileSize) ?? "—",
              },
              {
                icon: <CalendarBlank size={13} className="text-slate-400" />,
                label: "Adicionado em",
                value: fmtDate(createdAt),
              },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-2">
                {row.icon}
                <span className="text-xs text-slate-500 w-24 shrink-0">
                  {row.label}
                </span>
                <span className="text-xs font-medium text-slate-700">
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 text-[11px] font-semibold border border-violet-100"
                  >
                    <Tag size={9} /> {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Ações
            </p>
            <Link
              href={`/dashboard/exercises/new?libraryId=${id}`}
              className="ui-btn ui-btn-primary ui-btn-md gap-1.5 w-full justify-center"
            >
              <PencilLine size={14} weight="bold" /> Criar exercício
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
