import type { PdfField } from "@/types";
import type {
  AnswerStatus,
  EditorPersistence,
  LoadedExercise,
  SaveExerciseInput,
  StudentOption,
} from "./types";

const PREFIX = "grifo.editor.draft:";

export interface LocalDraft {
  title: string;
  fields: PdfField[];
  answers: Record<string, string>;
  savedAt: string;
}

/** Identifica o documento sem guardar os bytes: nome + tamanho do arquivo. */
export function draftFingerprint(pdfName: string, byteLength: number): string {
  return `${pdfName}:${byteLength}`;
}

export function readLocalDraft(fingerprint: string): LocalDraft | null {
  try {
    const raw = localStorage.getItem(PREFIX + fingerprint);
    return raw ? (JSON.parse(raw) as LocalDraft) : null;
  } catch {
    return null;
  }
}

function writeLocalDraft(fingerprint: string, draft: LocalDraft): void {
  try {
    localStorage.setItem(PREFIX + fingerprint, JSON.stringify(draft));
  } catch {
    throw new Error("Sem espaço no navegador para salvar o rascunho.");
  }
}

/**
 * Persistência 100% no navegador (modo anônimo). Guarda só campos e
 * respostas — os bytes do PDF nunca saem da memória; reenviar o mesmo
 * arquivo restaura o rascunho pelo fingerprint.
 */
export function createLocalPersistence(): EditorPersistence {
  return {
    mode: "local",

    async loadExercise(): Promise<LoadedExercise> {
      throw new Error("Rascunho local: reenvie o mesmo PDF para restaurar seus campos.");
    },

    async saveExercise(input: SaveExerciseInput): Promise<{ id: string }> {
      const id = draftFingerprint(input.pdfName, input.pdfBytes.byteLength);
      const existing = readLocalDraft(id);
      writeLocalDraft(id, {
        title: input.title,
        fields: input.fields,
        answers: existing?.answers ?? {},
        savedAt: new Date().toISOString(),
      });
      return { id };
    },

    async saveAnswers(exerciseId: string, answersJson: string, _status: AnswerStatus): Promise<void> {
      const existing = readLocalDraft(exerciseId);
      if (!existing) throw new Error("Rascunho não encontrado neste navegador.");
      writeLocalDraft(exerciseId, {
        ...existing,
        answers: JSON.parse(answersJson) as Record<string, string>,
        savedAt: new Date().toISOString(),
      });
    },

    async listStudents(): Promise<StudentOption[]> {
      return [];
    },
  };
}
