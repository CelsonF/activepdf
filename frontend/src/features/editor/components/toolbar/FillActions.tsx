"use client";
import { useEffect, useRef, useState } from "react";
import {
  CheckCircle, Circle, CloudArrowUp, DownloadSimple, Trash,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { useEditor } from "../../store";
import { useEditorPersistence } from "../../persistence/context";
import { exportFilledPDF } from "../../lib/export";
import { track } from "@/lib/analytics";
import { toast } from "../Toast";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface FillActionsProps {
  isTeacher: boolean;
  exerciseId: string | null;
  savedAnswersJson?: string;
}

export function FillActions({ isTeacher, exerciseId, savedAnswersJson }: FillActionsProps) {
  const { pdfBytes, pdfName, fields, fieldValues, clearFieldValues } = useEditor();
  const persistence = useEditorPersistence();

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const lastSavedRef = useRef<string>(savedAnswersJson ?? "{}");
  const [hasUnsaved, setHasUnsaved] = useState(false);

  // Track whether current answers differ from last saved
  useEffect(() => {
    if (!exerciseId || isTeacher) return;
    setHasUnsaved(JSON.stringify(fieldValues) !== lastSavedRef.current);
  }, [fieldValues, exerciseId, isTeacher]);

  async function handleSaveProgress(markComplete = false) {
    if (!exerciseId) return;
    setSaveStatus("saving");
    try {
      const answersJson = JSON.stringify(fieldValues);
      const status = markComplete ? "completed" : "in_progress";
      await persistence.saveAnswers(exerciseId, answersJson, status);
      lastSavedRef.current = answersJson;
      setHasUnsaved(false);
      setSaveStatus("saved");
      if (markComplete) toast("Exercício concluído!", "success");
      else toast("Progresso salvo!", "success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      toast("Erro ao salvar. Tente novamente.", "error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }

  async function handleExportFilled() {
    if (!fields.length) { toast("Não há campos definidos para exportar", "error"); return; }
    if (!pdfBytes) { toast("PDF não disponível. Carregue novamente.", "error"); return; }
    const filledCount = fields.filter((f) => fieldValues[f.id]?.trim()).length;
    if (!filledCount) { toast("Preencha pelo menos um campo antes de exportar", "error"); return; }
    try {
      const msg = await exportFilledPDF(pdfBytes, fields, fieldValues, pdfName, (s) => toast(s));
      track("editor_exported", { kind: "fill" });
      toast(msg, "success");
    } catch (e: unknown) {
      toast("Erro ao exportar: " + (e instanceof Error ? e.message : String(e)), "error");
    }
  }

  return (
    <>
      <Tooltip content="Limpar todas as respostas">
        <Button variant="ghost" size="sm" icon={<Trash size={13} />}
          onClick={() => { if (confirm("Limpar todas as respostas?")) clearFieldValues(); }}
        >Limpar</Button>
      </Tooltip>
      <Button variant="success" size="sm" icon={<DownloadSimple size={13} weight="bold" />} onClick={handleExportFilled}>
        Exportar
      </Button>
      {!isTeacher && exerciseId && (
        <>
          {saveStatus === "saved" && !hasUnsaved && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <CheckCircle size={12} weight="fill" /> Salvo
            </span>
          )}
          {hasUnsaved && saveStatus !== "saving" && (
            <span className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
              <Circle size={8} weight="fill" /> Não salvo
            </span>
          )}
          <Tooltip content="Salvar progresso">
            <Button
              variant="outline"
              size="sm"
              icon={<CloudArrowUp size={13} weight="bold" />}
              onClick={() => handleSaveProgress(false)}
              disabled={saveStatus === "saving" || !hasUnsaved}
            >
              {saveStatus === "saving" ? "Salvando..." : "Salvar"}
            </Button>
          </Tooltip>
          <Tooltip content="Marcar como concluído e salvar">
            <Button
              variant="primary"
              size="sm"
              icon={<CheckCircle size={13} weight="bold" />}
              onClick={() => handleSaveProgress(true)}
              disabled={saveStatus === "saving"}
            >
              Concluir
            </Button>
          </Tooltip>
        </>
      )}
    </>
  );
}
