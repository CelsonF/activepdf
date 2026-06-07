"use client";
import { useEffect, useState } from "react";
import { useEditor } from "@/store";
import { UploadScreen } from "@/components/upload/UploadScreen";
import { EditorScreen } from "@/components/editor/EditorScreen";

export function AppShell() {
  const pdfDoc = useEditor((s) => s.pdfDoc);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return pdfDoc ? <EditorScreen /> : <UploadScreen />;
}
