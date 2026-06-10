"use client";
import { useState } from "react";
import { SaveExerciseModal } from "./SaveExerciseModal";
import { useEditor } from "@/store";
import { toast } from "./Toast";
import { Header } from "@/components/ui/Header";
import { Brand } from "./toolbar/Brand";
import { UserChip } from "./toolbar/UserChip";
import { ToolbarLeft } from "./toolbar/ToolbarLeft";
import { DesignActions } from "./toolbar/DesignActions";
import { FillActions } from "./toolbar/FillActions";
import type { SessionRole } from "@/types";

interface Props {
  role: SessionRole;
  name: string;
  exerciseId: string | null;
  savedAnswersJson?: string;
}

export function Toolbar({ role, name, exerciseId, savedAnswersJson }: Props) {
  const { pdfBytes, pdfName, fields, appMode } = useEditor();

  const isTeacher = role === "teacher";
  const isFill = appMode === "fill";
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  return (
    <>
      <Header
        brand={<Brand />}
        left={<ToolbarLeft isTeacher={isTeacher} />}
        right={
          <>
            {isTeacher && !isFill && <DesignActions onSaveExercise={() => setSaveModalOpen(true)} />}
            {isFill && (
              <FillActions isTeacher={isTeacher} exerciseId={exerciseId} savedAnswersJson={savedAnswersJson} />
            )}
            <UserChip role={role} name={name} />
          </>
        }
      />
      <SaveExerciseModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        pdfName={pdfName}
        pdfBytes={pdfBytes}
        fields={fields}
        onSaved={(id) => {
          toast(`Exercício salvo! ID: ${id}`, "success");
          setSaveModalOpen(false);
        }}
      />
    </>
  );
}
