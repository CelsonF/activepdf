"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FilePdf } from "@phosphor-icons/react";
import {
  EditorPersistenceProvider,
  EditorScreen,
  createDocumentsPersistence,
  loadPdfDocument,
  useEditor,
} from "@/features/editor";

interface Props {
  id: string;
  name: string;
}

export function DocumentLoader({ id, name }: Props) {
  const { loadPdf, loadExerciseFields, resetPdf } = useEditor();
  const pdfDoc = useEditor((s) => s.pdfDoc);
  const persistence = useMemo(() => createDocumentsPersistence(), []);

  const [savedAnswersJson, setSavedAnswersJson] = useState("{}");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    resetPdf();

    persistence
      .loadExercise(id)
      .then(async (doc) => {
        const pdf = await loadPdfDocument(doc.pdfBytes);
        loadPdf(pdf, doc.pdfBytes, doc.pdfName, pdf.numPages);

        const answers = JSON.parse(doc.answersJson) as Record<string, string>;
        setSavedAnswersJson(doc.answersJson);
        setTimeout(() => loadExerciseFields(doc.fields, answers), 50);
      })
      .catch(() => setError("Erro ao carregar o documento."))
      .finally(() => setLoading(false));

    return () => { resetPdf(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="ui-spinner" />
          <p className="text-sm text-slate-500">Carregando documento...</p>
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
          <Link href="/dashboard/documents" className="ui-btn ui-btn-primary ui-btn-sm gap-1">
            <ArrowLeft size={13} /> Voltar aos documentos
          </Link>
        </div>
      </div>
    );
  }

  if (!pdfDoc) return null;

  return (
    <EditorPersistenceProvider persistence={persistence}>
      <EditorScreen
        session={{ role: "student", name }}
        canDesign
        exerciseId={id}
        savedAnswersJson={savedAnswersJson}
      />
    </EditorPersistenceProvider>
  );
}
