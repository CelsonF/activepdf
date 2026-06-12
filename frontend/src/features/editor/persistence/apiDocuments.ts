import { arrayBufferToBase64, base64ToArrayBuffer } from "../lib/base64";
import { PlanLimitError } from "./errors";
import type {
  AnswerStatus,
  EditorPersistence,
  LoadedExercise,
  SaveExerciseInput,
  StudentOption,
} from "./types";

interface ApiError {
  error?: string;
}

/**
 * Persistência de SavedDocument (conta gratuita): mesmo contrato do editor,
 * mas contra /api/documents — sem atribuição a aluno e sem status.
 */
export function createDocumentsPersistence(): EditorPersistence {
  return {
    mode: "api",

    async loadExercise(id: string): Promise<LoadedExercise> {
      const res = await fetch(`/api/documents/${id}`);
      const data = (await res.json()) as ApiError & {
        pdfData: string;
        pdfName: string;
        fieldsJson?: string;
        answersJson?: string;
      };
      if (!res.ok || data.error) throw new Error(data.error ?? "Erro ao carregar o documento.");
      return {
        pdfBytes: base64ToArrayBuffer(data.pdfData),
        pdfName: data.pdfName,
        fields: JSON.parse(data.fieldsJson ?? "[]"),
        answersJson: data.answersJson ?? "{}",
      };
    },

    async saveExercise(input: SaveExerciseInput): Promise<{ id: string }> {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: input.title,
          pdfName: input.pdfName,
          pdfData: arrayBufferToBase64(input.pdfBytes),
          fieldsJson: input.fields,
        }),
      });
      const data = (await res.json()) as ApiError & { id: string };
      if (res.status === 409) {
        throw new PlanLimitError(data.error ?? "Limite do plano gratuito atingido.");
      }
      if (!res.ok || data.error) throw new Error(data.error ?? "Erro ao salvar. Tente novamente.");
      return { id: data.id };
    },

    async saveAnswers(documentId: string, answersJson: string, _status: AnswerStatus): Promise<void> {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answersJson }),
      });
      const data = (await res.json()) as ApiError;
      if (!res.ok || data.error) throw new Error(data.error ?? "Erro ao salvar. Tente novamente.");
    },

    async listStudents(): Promise<StudentOption[]> {
      return [];
    },
  };
}
