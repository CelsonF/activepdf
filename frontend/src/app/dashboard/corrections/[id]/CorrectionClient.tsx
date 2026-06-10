"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { PDFDocumentProxy } from "pdfjs-dist";
import {
  ArrowLeft,
  Check,
  X,
  ClipboardText,
  FloppyDisk,
  Warning,
  Student,
  FilePdf,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

interface FieldItem {
  id: string;
  type: string;
  label: string;
  studentAnswer: string | boolean | null;
  correct: boolean | null;
  feedback: string | null;
}

interface CorrectionState {
  correct: boolean | null;
  feedback: string;
}

interface Props {
  exerciseId: string;
  pdfData: string;
  pdfName: string;
  title: string;
  studentName: string;
  items: FieldItem[];
  initialGrade: string | null;
  initialComment: string | null;
}

const GRADES = ["A+", "A", "B+", "B", "C", "D", "F"] as const;

export function CorrectionClient({
  exerciseId,
  pdfData,
  pdfName,
  title,
  studentName,
  items: initialItems,
  initialGrade,
  initialComment,
}: Props) {
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const [pdfPages, setPdfPages] = useState(0);
  const [pdfError, setPdfError] = useState(false);
  const [corrections, setCorrections] = useState<
    Record<string, CorrectionState>
  >(() =>
    Object.fromEntries(
      initialItems.map((f) => [
        f.id,
        { correct: f.correct ?? null, feedback: f.feedback ?? "" },
      ])
    )
  );
  const [grade, setGrade] = useState(initialGrade ?? "");
  const [comment, setComment] = useState(initialComment ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  function toggleCorrect(fieldId: string, value: boolean) {
    setCorrections((prev) => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        correct: prev[fieldId].correct === value ? null : value,
      },
    }));
    setSaved(false);
  }

  function setFeedback(fieldId: string, text: string) {
    setCorrections((prev) => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], feedback: text },
    }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const items = Object.fromEntries(
        Object.entries(corrections).map(([id, c]) => [
          id,
          { correct: c.correct ?? false, feedback: c.feedback || null },
        ])
      );
      const res = await fetch(`/api/exercises/${exerciseId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: grade || null,
          comment: comment || null,
          items,
        }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  const correctedCount = Object.values(corrections).filter(
    (c) => c.correct !== null
  ).length;
  const totalFields = initialItems.length;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* ── PDF Panel ── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* PDF panel header */}
        <div className="bg-white border-b border-slate-200 px-4 h-[52px] flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard/corrections"
            className="ui-btn ui-btn-secondary ui-btn-sm gap-1 shrink-0"
          >
            <ArrowLeft size={13} /> Correções
          </Link>
          <div className="ui-divider" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
              {title}
            </p>
            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 leading-tight">
              <Student size={10} /> {studentName} · {pdfName}
            </p>
          </div>
        </div>

        {/* PDF pages */}
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
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm overflow-hidden w-full max-w-2xl"
            >
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

      {/* ── Correction Panel ── */}
      <div className="w-[400px] shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden">
        {/* Panel header */}
        <div className="px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClipboardText
                size={15}
                weight="bold"
                className="text-amber-500"
              />
              <p className="text-sm font-bold text-slate-800">Correção</p>
            </div>
            <span className="text-xs text-slate-400 tabular-nums">
              {correctedCount}/{totalFields} campos
            </span>
          </div>

          {/* Grade */}
          <div className="mb-3">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
              Nota
            </label>
            <div className="flex flex-wrap gap-1.5">
              {GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setGrade(grade === g ? "" : g);
                    setSaved(false);
                  }}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold border transition-colors",
                    grade === g
                      ? "bg-brand text-white border-brand"
                      : "bg-white text-slate-600 border-slate-200 hover:border-brand/50 hover:text-brand"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
              Comentário geral
            </label>
            <textarea
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setSaved(false);
              }}
              placeholder="Feedback para o aluno..."
              className="ui-input resize-none text-xs leading-relaxed"
              rows={2}
            />
          </div>
        </div>

        {/* Fields list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {initialItems.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Warning size={28} className="mx-auto mb-2" />
              <p className="text-xs">Este exercício não tem campos definidos.</p>
            </div>
          ) : (
            initialItems.map((field) => {
              const state = corrections[field.id];
              const hasAnswer =
                field.studentAnswer !== null &&
                field.studentAnswer !== "" &&
                field.studentAnswer !== undefined;

              return (
                <div
                  key={field.id}
                  className={cn(
                    "rounded-xl border p-3 transition-colors",
                    state.correct === true &&
                      "border-emerald-200 bg-emerald-50",
                    state.correct === false && "border-red-200 bg-red-50",
                    state.correct === null && "border-slate-200 bg-slate-50"
                  )}
                >
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">
                    {field.label}
                  </p>

                  {hasAnswer ? (
                    <div className="text-sm text-slate-800 font-medium mb-2.5 bg-white rounded-lg px-3 py-2 border border-slate-200 leading-relaxed">
                      {field.type === "checkbox"
                        ? field.studentAnswer
                          ? "✓ Marcado"
                          : "☐ Não marcado"
                        : String(field.studentAnswer)}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic mb-2.5">
                      Sem resposta
                    </p>
                  )}

                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => toggleCorrect(field.id, true)}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border",
                        state.correct === true
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600"
                      )}
                    >
                      <Check size={12} weight="bold" /> Correto
                    </button>
                    <button
                      onClick={() => toggleCorrect(field.id, false)}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border",
                        state.correct === false
                          ? "bg-red-500 text-white border-red-500"
                          : "bg-white text-slate-500 border-slate-200 hover:border-red-300 hover:text-red-500"
                      )}
                    >
                      <X size={12} weight="bold" /> Incorreto
                    </button>
                  </div>

                  <input
                    type="text"
                    value={state.feedback}
                    onChange={(e) => setFeedback(field.id, e.target.value)}
                    placeholder="Feedback opcional..."
                    className="ui-input text-xs"
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Save footer */}
        <div className="px-5 py-4 border-t border-slate-100 shrink-0">
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "ui-btn ui-btn-md w-full gap-1.5 transition-all",
              saved ? "ui-btn-success" : "ui-btn-primary"
            )}
          >
            {saving ? (
              <span className="ui-spinner w-3.5 h-3.5 border-2 text-white" />
            ) : (
              <FloppyDisk size={14} weight="bold" />
            )}
            {saved ? "Salvo!" : saving ? "Salvando..." : "Salvar correção"}
          </button>
          {saved && (
            <p className="text-[11px] text-center text-emerald-600 mt-2 font-medium">
              Correção salva · status atualizado para &ldquo;corrigido&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
