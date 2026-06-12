"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadSimple, X } from "@phosphor-icons/react";
import { PdfDropZone } from "@/components/upload/PdfDropZone";
import { TagsInput } from "./TagsInput";

interface UploadModalProps {
  onClose: () => void;
}

export function UploadModal({ onClose }: UploadModalProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      setError("Apenas arquivos PDF são aceitos.");
      return;
    }
    setPdfFile(file);
    if (!name) setName(file.name.replace(/\.pdf$/i, ""));
    setError("");
  }

  async function handleSubmit() {
    if (!pdfFile) { setError("Selecione um arquivo PDF."); return; }
    if (!name.trim()) { setError("Informe um nome."); return; }

    setUploading(true);
    setError("");
    try {
      const arrayBuf = await pdfFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuf);
      let binary = "";
      for (let i = 0; i < bytes.length; i++)
        binary += String.fromCharCode(bytes[i]);
      const pdfData = btoa(binary);

      // Try to get page count
      let pageCount: number | undefined;
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";
        const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
        pageCount = doc.numPages;
      } catch {
        // non-critical
      }

      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          tags,
          pdfData,
          pageCount,
          fileSize: pdfFile.size,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "Erro ao fazer upload.");
        return;
      }

      router.refresh();
      onClose();
    } catch {
      setError("Erro ao processar o arquivo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeUp">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UploadSimple size={15} weight="bold" className="text-violet-600" />
            <p className="text-sm font-bold text-slate-800">Adicionar à biblioteca</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          <PdfDropZone pdfFile={pdfFile} onFile={handleFile} />

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
              Nome *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Unit 3 — Daily Routines"
              className="ui-input"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Observações sobre este material..."
              className="ui-input resize-none"
              rows={2}
            />
          </div>

          <TagsInput tags={tags} onChange={setTags} />

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        </div>

        <div className="px-5 py-3 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="ui-btn ui-btn-secondary ui-btn-md">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || !pdfFile}
            className="ui-btn ui-btn-primary ui-btn-md gap-1.5"
          >
            {uploading ? (
              <span className="ui-spinner w-3.5 h-3.5 border-2 text-white" />
            ) : (
              <UploadSimple size={13} weight="bold" />
            )}
            {uploading ? "Enviando..." : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}
