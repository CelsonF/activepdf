"use client";
import { useState } from "react";
import { PdfViewerPanel } from "./_components/PdfViewerPanel";
import { CorrectionPanel } from "./_components/CorrectionPanel";
import type { CorrectionState, FieldItem } from "./_components/correction-types";

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
  const [corrections, setCorrections] = useState<Record<string, CorrectionState>>(() =>
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

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <PdfViewerPanel pdfData={pdfData} pdfName={pdfName} title={title} studentName={studentName} />
      <CorrectionPanel
        items={initialItems}
        corrections={corrections}
        grade={grade}
        comment={comment}
        saving={saving}
        saved={saved}
        onGrade={(g) => { setGrade(g); setSaved(false); }}
        onComment={(v) => { setComment(v); setSaved(false); }}
        onToggleCorrect={toggleCorrect}
        onFeedback={setFeedback}
        onSave={handleSave}
      />
    </div>
  );
}
