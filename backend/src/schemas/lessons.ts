import { z } from "zod";

const isoDate = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), "Data inválida");

const LESSON_STATUS = ["SCHEDULED", "COMPLETED", "CANCELLED"] as const;

export const createLessonSchema = z.object({
  studentId: z.string().min(1, "Aluno é obrigatório"),
  scheduledAt: isoDate,
  subjectId: z.string().nullish(),
  meetLink: z.string().nullish(),
  content: z.string().nullish(),
  homework: z.string().nullish(),
  notes: z.string().nullish(),
});

export const updateLessonSchema = z.object({
  subjectId: z.string().nullish(),
  scheduledAt: isoDate.optional(),
  meetLink: z.string().nullish(),
  content: z.string().nullish(),
  homework: z.string().nullish(),
  notes: z.string().nullish(),
  status: z.enum(LESSON_STATUS).optional(),
});
