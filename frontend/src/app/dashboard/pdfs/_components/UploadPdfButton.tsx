"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FilePdf, UploadSimple } from "@phosphor-icons/react";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/Dialog";
import { PdfDropZone } from "@/components/upload/PdfDropZone";

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const CHUNK = 8192;
  for (let i = 0; i < bytes.byteLength; i += CHUNK) {
    binary += String.fromCharCode(...Array.from(bytes.subarray(i, i + CHUNK)));
  }
  return btoa(binary);
}

export function UploadPdfButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setTitle("");
      setPdfFile(null);
      setError("");
    }
  }

  function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      setError("Apenas arquivos PDF são aceitos.");
      return;
    }
    setPdfFile(file);
    if (!title) setTitle(file.name.replace(/\.pdf$/i, ""));
    setError("");
  }

  async function handleSubmit() {
    if (!pdfFile) { setError("Selecione um arquivo PDF."); return; }
    if (!title.trim()) { setError("Informe um título."); return; }

    setUploading(true);
    setError("");
    try {
      const pdfData = arrayBufferToBase64(await pdfFile.arrayBuffer());
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          pdfName: pdfFile.name,
          pdfData,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Erro ao enviar o PDF.");
        return;
      }
      handleOpenChange(false);
      router.refresh();
    } catch {
      setError("Erro ao processar o arquivo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <DialogRoot open={open} onOpenChange={handleOpenChange}>
      <button
        onClick={() => setOpen(true)}
        className="ui-btn ui-btn-primary ui-btn-sm gap-1.5"
      >
        <UploadSimple size={13} weight="bold" />
        Enviar PDF
      </button>

      <DialogContent>
        <DialogHeader
          title="Enviar meu PDF"
          icon={<FilePdf size={14} weight="bold" className="text-brand" />}
        />

        <div className="px-5 py-4 flex flex-col gap-4">
          <PdfDropZone pdfFile={pdfFile} onFile={handleFile} accent="emerald" />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Unit 3 — Daily Routines"
              className="ui-input text-sm"
            />
          </div>

          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <button
            onClick={() => handleOpenChange(false)}
            className="ui-btn ui-btn-ghost ui-btn-md"
          >
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
            {uploading ? "Enviando..." : "Enviar PDF"}
          </button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
