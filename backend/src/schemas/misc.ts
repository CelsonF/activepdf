import { z } from "zod";

// organization
export const updateOrganizationSchema = z.object({
  name: z.string().nullish(),
  logoBase64: z.string().nullish(),
});

// audio (mimeType do client é ignorado — o tipo real vem dos magic bytes)
export const createAudioSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório"),
  fileData: z.string().min(1, "Arquivo é obrigatório"),
  durationSecs: z.number().nonnegative().nullish(),
  transcript: z.string().nullish(),
});

// vocabulary
export const createVocabularySchema = z.object({
  word: z.string().trim().min(1, "Palavra é obrigatória"),
  definition: z.string().nullish(),
  example: z.string().nullish(),
  note: z.string().nullish(),
  studentId: z.string().nullish(),
});

// subjects
export const createSubjectSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  description: z.string().nullish(),
});

export const updateSubjectSchema = z.object({
  name: z.string().trim().min(1, "Nome não pode ser vazio").optional(),
  description: z.string().nullish(),
});

// classes
export const createClassSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  description: z.string().nullish(),
  studentIds: z.array(z.string()).optional(),
});

export const updateClassSchema = z.object({
  name: z.string().nullish(),
  description: z.string().nullish(),
});

export const addClassStudentSchema = z.object({
  studentId: z.string().min(1, "studentId é obrigatório"),
});

// gamification
export const awardXpSchema = z.object({
  studentId: z.string().min(1, "studentId é obrigatório"),
  points: z
    .number({ message: "points deve ser entre 1 e 500" })
    .int()
    .min(1, "points deve ser entre 1 e 500")
    .max(500, "points deve ser entre 1 e 500"),
  reason: z.string().trim().min(1, "reason é obrigatório"),
});
