"use client";
import { useState } from "react";
import { useEditor } from "../store";
import { loadPdfDocument } from "../lib/loadPdfDocument";
import { draftFingerprint, readLocalDraft } from "../persistence/local";

interface Options {
  /** Modo anônimo: reenviar o mesmo arquivo restaura o rascunho local. */
  restoreLocalDraft?: boolean;
}

/** Carrega um arquivo PDF no store do editor (validação + pdf.js). */
export function useLoadPdfFile({ restoreLocalDraft = false }: Options = {}) {
  const { loadPdf, loadExerciseFields, setAppMode } = useEditor();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadFile(file: File): Promise<boolean> {
    if (file.type !== "application/pdf") {
      setError("Por favor, envie um arquivo PDF.");
      return false;
    }
    setLoading(true);
    setError("");
    try {
      const bytes = await file.arrayBuffer();
      const doc = await loadPdfDocument(bytes);
      const name = file.name.replace(/\.pdf$/i, "");
      loadPdf(doc, bytes, name, doc.numPages);

      if (restoreLocalDraft) {
        const draft = readLocalDraft(draftFingerprint(name, bytes.byteLength));
        if (draft) {
          loadExerciseFields(draft.fields, draft.answers);
          setAppMode("design");
        }
      }
      return true;
    } catch (e: unknown) {
      setError("Erro ao carregar PDF: " + (e instanceof Error ? e.message : String(e)));
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { loadFile, loading, error };
}
