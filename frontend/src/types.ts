export type FieldType = "input" | "question";

export type UserRole = "teacher" | "student";
export type SessionRole = "teacher" | "student";

export interface AuthUser {
  name: string;
  role: UserRole;
}

/** Sessão mínima que o editor precisa; `null` = visitante anônimo. */
export interface EditorSession {
  role: SessionRole;
  name: string;
}

export interface PdfField {
  id: string;
  name: string;
  label: string;
  fieldType: FieldType;
  page: number;
  // Canvas (pixel) coords
  px: number;
  py: number;
  pw: number;
  ph: number;
  // PDF (point) coords
  pdfX: number;
  pdfY: number;
  pdfW: number;
  pdfH: number;
  multiline: boolean;
  fontSize: number;
}

/** Metadados de SavedDocument (lista de "Meus documentos" — sem pdfData). */
export interface SavedDocumentMeta {
  id: string;
  title: string;
  pdfName: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentsUsage {
  used: number;
  /** `null` = ilimitado (plano Professor). */
  limit: number | null;
}

export type ExportMode = "interactive" | "watermark" | "answers";

export type AppMode = "design" | "fill";

export interface PageViewSize {
  width: number;
  height: number;
}
