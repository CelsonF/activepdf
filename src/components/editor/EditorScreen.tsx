"use client";
import { Toolbar } from "./Toolbar";
import { PdfCanvas } from "./PdfCanvas";
import { FieldsPanel } from "./panels/FieldsPanel";
import { PropertiesPanel } from "./panels/PropertiesPanel";
import { OcrDrawer } from "./OcrDrawer";
import { Toast } from "./Toast";

export function EditorScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f8fafc" }}>
      <Toolbar />
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
