import { arrayBufferToBase64, base64ToArrayBuffer } from "../lib/base64";
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

async function readJson<T>(res: Response, fallback: string): Promise<T> {
  const data = (await res.json()) as T & ApiError;
  if (!res.ok || data.error) throw new Error(data.error ?? fallback);
  return data;
}

/** Persistência via API do Grifo (sessão logada, proxy /api). */
export function createApiPersistence(): EditorPersistence {
  return {
    mode: "api",

    async loadExercise(id: string): Promise<LoadedExercise> {
      const res = await fetch(`/api/exercises/${id}`);
      const data = await readJson<{
        pdfData: string;
        pdfName: string;
        fieldsJson?: string;
        answersJson?: string;
      }>(res, "Erro ao carregar o exercício.");
      return {
        pdfBytes: base64ToArrayBuffer(data.pdfData),
        pdfName: data.pdfName,
        fields: JSON.parse(data.fieldsJson ?? "[]"),
        answersJson: data.answersJson ?? "{}",
      };
    },

    async saveExercise(input: SaveExerciseInput): Promise<{ id: string }> {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: input.title,
          studentId: input.studentId,
          pdfName: input.pdfName,
          pdfData: arrayBufferToBase64(input.pdfBytes),
          fieldsJson: input.fields,
        }),
      });
      const data = await readJson<{ id: string }>(res, "Erro ao salvar. Tente novamente.");
      return { id: data.id };
    },

    async saveAnswers(exerciseId: string, answersJson: string, status: AnswerStatus): Promise<void> {
      const res = await fetch(`/api/exercises/${exerciseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answersJson, status }),
      });
      await readJson<unknown>(res, "Erro ao salvar. Tente novamente.");
    },

    async listStudents(): Promise<StudentOption[]> {
      const res = await fetch("/api/dashboard/students");
      const data: unknown = await res.json();
      return Array.isArray(data) ? (data as StudentOption[]) : [];
    },
  };
}
