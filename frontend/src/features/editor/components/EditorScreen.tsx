"use client";
import { Toolbar } from "./Toolbar";
import { PdfCanvas } from "./PdfCanvas";
import { FieldsPanel } from "./panels/FieldsPanel";
import { PropertiesPanel } from "./panels/PropertiesPanel";
import { OcrDrawer } from "./OcrDrawer";
import { Toast } from "./Toast";
import type { EditorSession } from "@/types";

interface Props {
  session: EditorSession | null;
  canDesign?: boolean;
  exerciseId?: string | null;
  savedAnswersJson?: string;
}

export function EditorScreen({ session, canDesign, exerciseId, savedAnswersJson }: Props) {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Toolbar
        session={session}
        canDesign={canDesign}
        exerciseId={exerciseId ?? null}
        savedAnswersJson={savedAnswersJson ?? "{}"}
      />
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
