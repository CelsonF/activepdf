"use client";
import { useRef, useState } from "react";
import { FilePdf } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

interface PdfDropZoneProps {
  pdfFile: File | null;
  onFile: (file: File) => void;
  /** Cor de acento da seção dona do fluxo (biblioteca = violet, exercícios = emerald). */
  accent?: "violet" | "emerald";
}

const ACCENT = {
  violet: {
    dragging: "border-violet-400 bg-violet-50",
    idle: "border-slate-300 hover:border-violet-300 hover:bg-violet-50/50",
    cta: "text-violet-600",
  },
  emerald: {
    dragging: "border-emerald-400 bg-emerald-50",
    idle: "border-slate-300 hover:border-emerald-300 hover:bg-emerald-50/50",
    cta: "text-emerald-600",
  },
} as const;

export function PdfDropZone({ pdfFile, onFile, accent = "violet" }: PdfDropZoneProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const colors = ACCENT[accent];

  return (
    <>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) onFile(file);
        }}
        onClick={() => fileRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors",
          dragging
            ? colors.dragging
            : pdfFile
            ? "border-emerald-300 bg-emerald-50"
            : colors.idle
        )}
      >
        <FilePdf
          size={28}
          weight={pdfFile ? "fill" : "regular"}
          className={pdfFile ? "text-emerald-600" : "text-slate-400"}
        />
        {pdfFile ? (
          <p className="text-sm font-semibold text-emerald-700 text-center">
            {pdfFile.name}
            <span className="block text-xs font-normal text-emerald-500">
              {(pdfFile.size / 1024).toFixed(0)} KB
            </span>
          </p>
        ) : (
          <p className="text-sm text-slate-500 text-center">
            Arraste um PDF aqui ou{" "}
            <span className={cn("font-semibold", colors.cta)}>clique para selecionar</span>
          </p>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </>
  );
}
