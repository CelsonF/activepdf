import { z } from "zod";

export const createStudentSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
  level: z.string().nullish(),
  objective: z.string().nullish(),
  bookRef: z.string().nullish(),
  notes: z.string().nullish(),
});

export const updateStudentSchema = z.object({
  name: z.string().nullish(),
  email: z.string().trim().email("Email inválido").optional(),
  enrollment: z.string().nullish(),
});

export const learningPlanSchema = z.object({
  level: z.string().trim().min(1, "Nível é obrigatório"),
  objective: z.string().trim().min(1, "Objetivo é obrigatório"),
  bookRef: z.string().nullish(),
  notes: z.string().nullish(),
});

export const addSubjectSchema = z.object({
  subjectId: z.string().min(1, "subjectId é obrigatório"),
});
