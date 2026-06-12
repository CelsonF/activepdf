"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor } from "@/store";
import { UploadScreen } from "@/components/upload/UploadScreen";
import { EditorScreen } from "@/components/editor/EditorScreen";
import type { SessionRole } from "@/types";

interface Props { role: SessionRole; name: string; canDesign?: boolean; }

export function AppShell({ role, name, canDesign = role === "teacher" }: Props) {
  const pdfDoc = useEditor((s) => s.pdfDoc);
  const { loadPdf, loadExerciseFields } = useEditor();
  const [mounted, setMounted] = useState(false);
  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [savedAnswersJson, setSavedAnswersJson] = useState<string>("{}");
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  // Load exercise from ?exerciseId= URL param
  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams(window.location.search);
    const exId = params.get("exerciseId");

    // Student without editor access and no exercise to open → send to dashboard
    if (!exId && role === "student" && !canDesign) {
      router.replace("/dashboard");
      return;
    }
    if (!exId) return;

    fetch(`/api/exercises/${exId}`)
      .then((r) => r.json())
      .then(async (exercise) => {
        if (exercise.error) return;

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
        setExerciseId(exId);
        setSavedAnswersJson(rawAnswers);
        setTimeout(() => loadExerciseFields(fields, answers), 50);
      })
      .catch(() => {});
  }, [mounted]);

  if (!mounted) return null;
  return pdfDoc
    ? <EditorScreen role={role} name={name} canDesign={canDesign} exerciseId={exerciseId} savedAnswersJson={savedAnswersJson} />
    : <UploadScreen role={role} name={name} />;
}
