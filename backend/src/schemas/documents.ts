import { z } from "zod";

export const createSavedDocumentSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório"),
  pdfName: z.string().min(1, "PDF é obrigatório"),
  pdfData: z.string().min(1, "PDF é obrigatório"),
  fieldsJson: z.array(z.unknown()).optional(),
});

export const updateSavedDocumentSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório").optional(),
  fieldsJson: z.array(z.unknown()).optional(),
  answersJson: z.string().optional(),
});
