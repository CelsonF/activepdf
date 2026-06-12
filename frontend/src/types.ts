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

export type ExportMode = "interactive" | "watermark" | "answers";

export type AppMode = "design" | "fill";

export interface PageViewSize {
  width: number;
  height: number;
}
