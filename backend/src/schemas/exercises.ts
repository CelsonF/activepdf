import { z } from "zod";

export const createExerciseSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório"),
  pdfName: z.string().min(1, "PDF é obrigatório"),
  pdfData: z.string().min(1, "PDF é obrigatório"),
  studentId: z.string().nullish(),
  lessonId: z.string().nullish(),
  fieldsJson: z.array(z.unknown()).optional(),
});

export const updateExerciseSchema = z.object({
  answersJson: z.string().optional(),
  status: z.enum(["assigned", "in_progress", "completed"]).optional(),
});

export const reviewExerciseSchema = z.object({
  grade: z.string().nullish(),
  comment: z.string().nullish(),
  items: z
    .record(
      z.string(),
      z.object({ correct: z.boolean(), feedback: z.string().nullish() })
    )
    .optional(),
});
