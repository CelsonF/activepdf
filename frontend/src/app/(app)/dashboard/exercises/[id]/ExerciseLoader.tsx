"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FilePdf } from "@phosphor-icons/react";
import {
  EditorPersistenceProvider,
  EditorScreen,
  createApiPersistence,
  loadPdfDocument,
  useEditor,
} from "@/features/editor";
import type { SessionRole } from "@/types";

interface Props {
  id: string;
  role: SessionRole;
  name: string;
}

export function ExerciseLoader({ id, role, name }: Props) {
  const { loadPdf, loadExerciseFields, resetPdf } = useEditor();
  const pdfDoc = useEditor((s) => s.pdfDoc);
  const persistence = useMemo(() => createApiPersistence(), []);

  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [savedAnswersJson, setSavedAnswersJson] = useState("{}");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    resetPdf();

    persistence
      .loadExercise(id)
      .then(async (exercise) => {
        const doc = await loadPdfDocument(exercise.pdfBytes);
        loadPdf(doc, exercise.pdfBytes, exercise.pdfName, doc.numPages);

        const answers = JSON.parse(exercise.answersJson) as Record<string, string>;
        setExerciseId(id);
        setSavedAnswersJson(exercise.answersJson);
        setTimeout(() => loadExerciseFields(exercise.fields, answers), 50);
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
    <EditorPersistenceProvider persistence={persistence}>
      <EditorScreen
        session={{ role, name }}
        exerciseId={exerciseId}
        savedAnswersJson={savedAnswersJson}
      />
    </EditorPersistenceProvider>
  );
}
