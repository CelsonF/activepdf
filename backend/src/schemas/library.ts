import { z } from "zod";

// ~30MB de PDF em base64 (≈40M chars)
const MAX_PDF_BASE64_CHARS = 40_000_000;

export const createLibraryPdfSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  pdfData: z.string().min(1, "PDF é obrigatório").max(MAX_PDF_BASE64_CHARS, "PDF muito grande"),
  description: z.string().nullish(),
  tags: z.array(z.string()).optional(),
  pageCount: z.number().int().nonnegative().nullish(),
  fileSize: z.number().int().nonnegative().nullish(),
});

export const updateLibraryPdfSchema = z.object({
  name: z.string().nullish(),
  description: z.string().nullish(),
  tags: z.array(z.string()).optional(),
});
