"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor } from "../store";
import { UploadScreen } from "./UploadScreen";
import { EditorScreen } from "./EditorScreen";
import { EditorPersistenceProvider } from "../persistence/context";
import { createApiPersistence } from "../persistence/api";
import { createLocalPersistence } from "../persistence/local";
import { loadPdfDocument } from "../lib/loadPdfDocument";
import type { EditorSession } from "@/types";

interface Props {
  /** `null` = modo anônimo: persistência local, sem chamadas à API. */
  session: EditorSession | null;
  canDesign?: boolean;
}

export function EditorShell({ session, canDesign }: Props) {
  const pdfDoc = useEditor((s) => s.pdfDoc);
  const { loadPdf, loadExerciseFields } = useEditor();
  const [mounted, setMounted] = useState(false);
  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [savedAnswersJson, setSavedAnswersJson] = useState<string>("{}");
  const router = useRouter();

  const design = canDesign ?? (session ? session.role === "teacher" : true);
  const mode = session ? "api" : "local";
  const persistence = useMemo(
    () => (mode === "api" ? createApiPersistence() : createLocalPersistence()),
    [mode]
  );

  useEffect(() => { setMounted(true); }, []);

  // Load exercise from ?exerciseId= URL param
  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams(window.location.search);
    const exId = params.get("exerciseId");

    // Student without editor access and no exercise to open → send to dashboard
    if (!exId && session?.role === "student" && !design) {
      router.replace("/dashboard");
      return;
    }
    if (!exId) return;

    persistence
      .loadExercise(exId)
      .then(async (exercise) => {
        const doc = await loadPdfDocument(exercise.pdfBytes);
        loadPdf(doc, exercise.pdfBytes, exercise.pdfName, doc.numPages);
        setExerciseId(exId);
        setSavedAnswersJson(exercise.answersJson);
        const answers = JSON.parse(exercise.answersJson) as Record<string, string>;
        setTimeout(() => loadExerciseFields(exercise.fields, answers), 50);
      })
      .catch(() => {});
  }, [mounted]);

  if (!mounted) return null;
  return (
    <EditorPersistenceProvider persistence={persistence}>
      {pdfDoc ? (
        <EditorScreen
          session={session}
          canDesign={design}
          exerciseId={exerciseId}
          savedAnswersJson={savedAnswersJson}
        />
      ) : (
        <UploadScreen session={session} />
      )}
    </EditorPersistenceProvider>
  );
}
