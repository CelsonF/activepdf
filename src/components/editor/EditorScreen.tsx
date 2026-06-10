"use client";
import { Toolbar } from "./Toolbar";
import { PdfCanvas } from "./PdfCanvas";
import { FieldsPanel } from "./panels/FieldsPanel";
import { PropertiesPanel } from "./panels/PropertiesPanel";
import { OcrDrawer } from "./OcrDrawer";
import { Toast } from "./Toast";
import type { SessionRole } from "@/types";

interface Props { role: SessionRole; name: string; exerciseId?: string | null; savedAnswersJson?: string; }

export function EditorScreen({ role, name, exerciseId, savedAnswersJson }: Props) {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Toolbar role={role} name={name} exerciseId={exerciseId ?? null} savedAnswersJson={savedAnswersJson ?? "{}"} />
      <div className="flex-1 flex overflow-hidden min-w-0">
        <FieldsPanel />
        <PdfCanvas />
        <PropertiesPanel />
      </div>
      <OcrDrawer />
      <Toast />
    </div>
  );
}
