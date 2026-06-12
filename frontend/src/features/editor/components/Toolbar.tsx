"use client";
import { useState } from "react";
import { SaveExerciseModal } from "./SaveExerciseModal";
import { useEditor } from "../store";
import { useEditorPersistence } from "../persistence/context";
import { toast } from "./Toast";
import { Header } from "@/components/ui/Header";
import { Brand } from "./toolbar/Brand";
import { UserChip } from "./toolbar/UserChip";
import { ToolbarLeft } from "./toolbar/ToolbarLeft";
import { DesignActions } from "./toolbar/DesignActions";
import { FillActions } from "./toolbar/FillActions";
import type { EditorSession } from "@/types";

interface Props {
  session: EditorSession | null;
  canDesign?: boolean;
  exerciseId: string | null;
  savedAnswersJson?: string;
}

export function Toolbar({ session, canDesign, exerciseId, savedAnswersJson }: Props) {
  const { pdfBytes, pdfName, fields, appMode } = useEditor();
  const persistence = useEditorPersistence();

  const isTeacher = session?.role === "teacher";
  // Aluno autodidata e visitante anônimo também criam campos;
  // só o professor atribui a outros alunos.
  const design = canDesign ?? (session ? isTeacher : true);
  const isFill = appMode === "fill";
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  // No modo local, salvar um rascunho habilita o "Salvar" do modo preencher
  const [savedDraftId, setSavedDraftId] = useState<string | null>(null);

  return (
    <>
      <Header
        brand={<Brand />}
        left={<ToolbarLeft isTeacher={design} />}
        right={
          <>
            {design && !isFill && <DesignActions onSaveExercise={() => setSaveModalOpen(true)} />}
            {isFill && (
              <FillActions
                isTeacher={isTeacher}
                exerciseId={exerciseId ?? savedDraftId}
                savedAnswersJson={savedAnswersJson}
              />
            )}
            <UserChip session={session} />
          </>
        }
      />
      <SaveExerciseModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        showStudentSelect={isTeacher && persistence.mode === "api"}
        pdfName={pdfName}
        pdfBytes={pdfBytes}
        fields={fields}
        onSaved={(id) => {
          setSavedDraftId(id);
          toast(
            persistence.mode === "local"
              ? "Rascunho salvo neste navegador!"
              : `Exercício salvo! ID: ${id}`,
            "success"
          );
          setSaveModalOpen(false);
        }}
      />
    </>
  );
}
