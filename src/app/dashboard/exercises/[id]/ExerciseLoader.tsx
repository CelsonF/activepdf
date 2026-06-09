"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FilePdf } from "@phosphor-icons/react";
import { useEditor } from "@/store";
import { EditorScreen } from "@/components/editor/EditorScreen";
import type { SessionRole } from "@/types";

interface Props {
  id: string;
  role: SessionRole;
  name: string;
}

export function ExerciseLoader({ id, role, name }: Props) {
  const { loadPdf, loadExerciseFields, resetPdf } = useEditor();
  const pdfDoc = useEditor((s) => s.pdfDoc);

  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [savedAnswersJson, setSavedAnswersJson] = useState("{}");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    resetPdf();

    fetch(`/api/exercises/${id}`)
      .then((r) => r.json())
      .then(async (exercise) => {
        if (exercise.error) { setError("Exercício não encontrado."); return; }

        const binary = atob(exercise.pdfData);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const buf = bytes.buffer;

        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";
        const doc = await pdfjsLib.getDocument({ data: buf.slice(0) }).promise;

        loadPdf(doc, buf, exercise.pdfName, doc.numPages);

        const fields = JSON.parse(exercise.fieldsJson ?? "[]");
        const rawAnswers = exercise.answersJson ?? "{}";
        const answers = JSON.parse(rawAnswers);

        setExerciseId(id);
        setSavedAnswersJson(rawAnswers);
        setTimeout(() => loadExerciseFields(fields, answers), 50);
      })
      .catch(() => setError("Erro ao carregar o exercício."))
      .finally(() => setLoading(false));

    return () => { resetPdf(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="ui-spinner" />
          <p className="text-sm text-slate-500">Carregando exercício...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <FilePdf size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <Link href="/dashboard/exercises" className="ui-btn ui-btn-primary ui-btn-sm gap-1">
            <ArrowLeft size={13} /> Voltar aos exercícios
          </Link>
        </div>
      </div>
    );
  }

  if (!pdfDoc) return null;

  return (
    <EditorScreen
      role={role}
      name={name}
      exerciseId={exerciseId}
      savedAnswersJson={savedAnswersJson}
    />
  );
}
