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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f8fafc" }}>
      <Toolbar role={role} name={name} exerciseId={exerciseId ?? null} savedAnswersJson={savedAnswersJson ?? "{}"} />
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minWidth: 0 }}>
        <FieldsPanel />
        <PdfCanvas />
        <PropertiesPanel />
      </div>
      <OcrDrawer />
      <Toast />
    </div>
  );
}
