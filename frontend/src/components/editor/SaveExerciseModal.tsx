"use client";
import { useEffect, useState } from "react";
import { FloppyDisk, BookOpen } from "@phosphor-icons/react";
import { DialogRoot, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/Dialog";
import { Select, SelectItem } from "@/components/ui/Select";
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
      .then((data) => Array.isArray(data) && setStudents(data))
      .catch(() => undefined);
  }, [isOpen, pdfName]);

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
    <DialogRoot open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader
          title="Salvar como exercício"
          icon={<BookOpen size={14} weight="bold" className="text-brand" />}
        />

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
            <Select
              value={studentId}
              onValueChange={setStudentId}
              placeholder="Selecionar aluno..."
            >
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </Select>
            {students.length === 0 && (
              <p className="text-[11px] text-slate-400 mt-1">Nenhum aluno cadastrado ainda.</p>
            )}
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-600">
              <span className="font-semibold">{fields.length}</span>{" "}
              campo{fields.length !== 1 ? "s" : ""} criado{fields.length !== 1 ? "s" : ""} serão salvos para o aluno preencher.
            </p>
          </div>
        </div>

        <DialogFooter>
          <button onClick={onClose} className="ui-btn ui-btn-ghost ui-btn-md">Cancelar</button>
          <button
            onClick={handleSave}
            disabled={loading || !title.trim()}
            className="ui-btn ui-btn-primary ui-btn-md gap-1.5"
          >
            {loading
              ? <span className="ui-spinner w-3.5 h-3.5 border-2 text-white" />
              : <FloppyDisk size={14} weight="bold" />}
            Salvar exercício
          </button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
