import type { PdfField } from "@/types";

export type PersistenceMode = "local" | "api";
export type AnswerStatus = "in_progress" | "completed";

export interface LoadedExercise {
  pdfBytes: ArrayBuffer;
  pdfName: string;
  fields: PdfField[];
  answersJson: string;
}

export interface SaveExerciseInput {
  title: string;
  studentId: string | null;
  pdfName: string;
  pdfBytes: ArrayBuffer;
  fields: PdfField[];
}

export interface StudentOption {
  id: string;
  name: string;
}

/**
 * Contrato de persistência do editor. O editor nunca fala com a API
 * diretamente — tudo passa por aqui, para que o mesmo componente rode
 * logado (Api) ou 100% no navegador (Local).
 * Erros são lançados como `Error` com mensagem pt-BR pronta para exibir.
 */
export interface EditorPersistence {
  readonly mode: PersistenceMode;
  loadExercise(id: string): Promise<LoadedExercise>;
  saveExercise(input: SaveExerciseInput): Promise<{ id: string }>;
  saveAnswers(exerciseId: string, answersJson: string, status: AnswerStatus): Promise<void>;
  listStudents(): Promise<StudentOption[]>;
}
