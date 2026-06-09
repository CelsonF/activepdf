"use client";
import { useEffect, useState } from "react";
import { X, FloppyDisk, BookOpen } from "@phosphor-icons/react";
import type { PdfField } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pdfName: string;
  pdfBytes: ArrayBuffer | null;
  fields: PdfField[];
  onSaved: (exerciseId: string) => void;
}

interface Student { id: string; name: string; }

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const CHUNK = 8192;
  for (let i = 0; i < bytes.byteLength; i += CHUNK) {
    binary += String.fromCharCode(...Array.from(bytes.subarray(i, i + CHUNK)));
  }
  return btoa(binary);
}

export function SaveExerciseModal({ isOpen, onClose, pdfName, pdfBytes, fields, onSaved }: Props) {
  const [title, setTitle] = useState(pdfName);
  const [studentId, setStudentId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setTitle(pdfName);
    setError("");
    fetch("/api/dashboard/students")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setStudents(data));
  }, [isOpen, pdfName]);

  if (!isOpen) return null;

  async function handleSave() {
    if (!title.trim()) { setError("Informe um título para o exercício"); return; }
    if (!pdfBytes) { setError("PDF não carregado"); return; }
    setError("");
    setLoading(true);
    try {
      const pdfData = arrayBufferToBase64(pdfBytes);
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          studentId: studentId || null,
          pdfName,
          pdfData,
          fieldsJson: fields,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      onSaved(data.id);
      onClose();
    } catch {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fadeUp">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-light flex items-center justify-center">
              <BookOpen size={14} weight="bold" className="text-brand" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Salvar como exercício</h2>
          </div>
          <button onClick={onClose} className="ui-btn ui-btn-ghost ui-btn-xs p-1">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Título do exercício <span className="text-red-500">*</span>
            </label>
            <input
              className="ui-input text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Gramática — Verbos Modais, Unidade 5"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Atribuir ao aluno <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <select
              className="ui-input text-sm"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">Selecionar aluno...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {students.length === 0 && (
              <p className="text-[11px] text-slate-400 mt-1">Nenhum aluno cadastrado ainda.</p>
            )}
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-600">
              <span className="font-semibold">{fields.length}</span> campo{fields.length !== 1 ? "s" : ""} criado{fields.length !== 1 ? "s" : ""} serão salvos para o aluno preencher.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100">
          <button onClick={onClose} className="ui-btn ui-btn-ghost ui-btn-md">Cancelar</button>
          <button
            onClick={handleSave}
            disabled={loading || !title.trim()}
            className="ui-btn ui-btn-primary ui-btn-md gap-1.5"
          >
            {loading
              ? <div className="ui-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
              : <FloppyDisk size={14} weight="bold" />}
            Salvar exercício
          </button>
        </div>
      </div>
    </div>
  );
}
