"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  UploadSimple,
  X,
  Trash,
  FilePdf,
  Tag,
  Plus,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

// ── Upload Modal ──────────────────────────────────────────────────────────────

interface UploadModalProps {
  onClose: () => void;
}

export function UploadModal({ onClose }: UploadModalProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
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

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  }

  function removeTag(t: string) {
    setTags((prev) => prev.filter((x) => x !== t));
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
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UploadSimple size={15} weight="bold" className="text-violet-600" />
            <p className="text-sm font-bold text-slate-800">
              Adicionar à biblioteca
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors",
              dragging
                ? "border-violet-400 bg-violet-50"
                : pdfFile
                ? "border-emerald-300 bg-emerald-50"
                : "border-slate-300 hover:border-violet-300 hover:bg-violet-50/50"
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
                <span className="text-violet-600 font-semibold">clique para selecionar</span>
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
              if (f) handleFile(f);
            }}
          />

          {/* Name */}
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

          {/* Description */}
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

          {/* Tags */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
              Tags
            </label>
            <div className="flex gap-1.5 flex-wrap mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold"
                >
                  <Tag size={10} /> {t}
                  <button onClick={() => removeTag(t)} className="ml-0.5 hover:text-violet-900">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="grammar, B1, vocabulary…"
                className="ui-input flex-1"
              />
              <button
                onClick={addTag}
                disabled={!tagInput.trim()}
                className="ui-btn ui-btn-secondary ui-btn-sm"
              >
                <Plus size={13} weight="bold" />
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 font-medium">{error}</p>
          )}
        </div>

        {/* Footer */}
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

// ── Delete button ─────────────────────────────────────────────────────────────

interface DeleteBtnProps {
  id: string;
  name: string;
}

export function DeleteLibraryPdf({ id, name }: DeleteBtnProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    await fetch(`/api/library/${id}`, { method: "DELETE" });
    startTransition(() => router.refresh());
    setConfirming(false);
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-[11px] text-red-600 font-semibold">Excluir?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="ui-btn ui-btn-danger ui-btn-xs"
        >
          Sim
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="ui-btn ui-btn-secondary ui-btn-xs"
        >
          Não
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="ui-btn ui-btn-ghost ui-btn-sm text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200"
    >
      <Trash size={14} />
    </button>
  );
}

// ── Library trigger button (renders in server page) ───────────────────────────

export function LibraryPageClient() {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowUpload(true)}
        className="ui-btn ui-btn-primary ui-btn-md gap-1.5"
      >
        <UploadSimple size={14} weight="bold" /> Adicionar PDF
      </button>
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </>
  );
}
