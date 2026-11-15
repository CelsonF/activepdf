export const TOOL_LOCALES = ["pt", "en", "es"] as const;
export type ToolLocale = (typeof TOOL_LOCALES)[number];

export const TOOL_LOCALE_LABEL: Record<ToolLocale, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
};

export interface ToolDict {
  noPdf: string;
  edit: string;
  editFields: string;
  fill: string;
  save: string;
  saved: string;
  openMenu: string;
  menuLabel: string;
  exportFilled: string;
  exportTemplate: string;
  exportPagePng: string;
  exportRange: string;
  pageStart: string;
  pageEnd: string;
  to: string;
  exportBtn: string;
  export: string;
  changePdf: string;
  dropHere: string;
  dropHint: string;
  fitWidth: string;
  currentPage: string;
  fieldsOnPage: string;
  noFieldsOnPage: string;
  emptyValue: string;
  shortcuts: string;
  kbdDelete: string;
  kbdDeselect: string;
  kbdNudge: string;
  kbdSave: string;
  uploadPdf: string;
  tools: string;
  text: string;
  checkbox: string;
  date: string;
  number: string;
  toolsHint: string;
  documents: string;
  search: string;
  noDocs: string;
  deleteDoc: (n: string) => string;
  properties: string;
  label: string;
  width: string;
  height: string;
  fontSize: string;
  type: string;
  page: string;
  removeField: string;
  selectField: string;
  notes: string;
  notesPlaceholder: string;
  prevPage: string;
  nextPage: string;
  zoomOut: string;
  zoomIn: string;
  emptyTitle: string;
  emptyDesc: string;
  selectPdf: string;
  srTitle: string;
  bold: string;
  italic: string;
  list: string;
  language: string;
}

const pt: ToolDict = {
  noPdf: "Nenhum PDF carregado",
  edit: "Editar",
  editFields: "Editar campos",
  fill: "Preencher",
  save: "Salvar",
  saved: "Salvo!",
  openMenu: "Abrir menu de exportação",
  menuLabel: "Opções de exportação",
  exportFilled: "Exportar PDF preenchido",
  exportTemplate: "Exportar com campos para preencher",
  exportPagePng: "Exportar página atual (PNG)",
  exportRange: "Exportar range do PDF",
  pageStart: "Página inicial",
  pageEnd: "Página final",
  to: "até",
  exportBtn: "Exportar",
  export: "Exportar",
  changePdf: "Trocar PDF",
  dropHere: "Solte o PDF para abrir",
  dropHint: "ou arraste um arquivo PDF para esta área",
  fitWidth: "Ajustar à largura",
  currentPage: "Página atual",
  fieldsOnPage: "Campos nesta página",
  noFieldsOnPage: "Nenhum campo nesta página ainda. Escolha uma ferramenta e arraste sobre o PDF.",
  emptyValue: "vazio",
  shortcuts: "Atalhos",
  kbdDelete: "remover campo",
  kbdDeselect: "desmarcar",
  kbdNudge: "mover 1px (⇧ 10px)",
  kbdSave: "salvar",
  uploadPdf: "Carregar PDF",
  tools: "Ferramentas",
  text: "Texto",
  checkbox: "Caixa",
  date: "Data",
  number: "Número",
  toolsHint: "Arraste sobre o PDF para criar. Selecione um campo para mover ou redimensionar.",
  documents: "Documentos",
  search: "Buscar...",
  noDocs: "Nenhum documento salvo.",
  deleteDoc: (n) => `Excluir documento ${n}`,
  properties: "Propriedades",
  label: "Rótulo",
  width: "Largura",
  height: "Altura",
  fontSize: "Tamanho da fonte",
  type: "Tipo",
  page: "Página",
  removeField: "Remover campo",
  selectField: "Selecione um campo no PDF.",
  notes: "Notas — pág.",
  notesPlaceholder: "Escreva suas anotações sobre esta página…",
  prevPage: "Página anterior",
  nextPage: "Próxima página",
  zoomOut: "Diminuir zoom",
  zoomIn: "Aumentar zoom",
  emptyTitle: "Carregue um PDF para começar",
  emptyDesc:
    "Adicione campos arrastáveis, escreva anotações ao lado e exporte como PDF preenchido ou imagem.",
  selectPdf: "Selecionar PDF",
  srTitle: "Editor de Práticas em PDF",
  bold: "Negrito",
  italic: "Itálico",
  list: "Lista",
  language: "Idioma",
};

const en: ToolDict = {
  noPdf: "No PDF loaded",
  edit: "Edit",
  editFields: "Edit fields",
  fill: "Fill",
  save: "Save",
  saved: "Saved!",
  openMenu: "Open export menu",
  menuLabel: "Export options",
  exportFilled: "Export filled PDF",
  exportTemplate: "Export with fillable fields",
  exportPagePng: "Export current page (PNG)",
  exportRange: "Export PDF range",
  pageStart: "Start page",
  pageEnd: "End page",
  to: "to",
  exportBtn: "Export",
  export: "Export",
  changePdf: "Change PDF",
  dropHere: "Drop the PDF to open it",
  dropHint: "or drag a PDF file into this area",
  fitWidth: "Fit to width",
  currentPage: "Current page",
  fieldsOnPage: "Fields on this page",
  noFieldsOnPage: "No fields on this page yet. Pick a tool and drag over the PDF.",
  emptyValue: "empty",
  shortcuts: "Shortcuts",
  kbdDelete: "remove field",
  kbdDeselect: "deselect",
  kbdNudge: "nudge 1px (⇧ 10px)",
  kbdSave: "save",
  uploadPdf: "Upload PDF",
  tools: "Tools",
  text: "Text",
  checkbox: "Checkbox",
  date: "Date",
  number: "Number",
  toolsHint: "Drag over the PDF to create. Select a field to move or resize.",
  documents: "Documents",
  search: "Search...",
  noDocs: "No saved documents.",
  deleteDoc: (n) => `Delete document ${n}`,
  properties: "Properties",
  label: "Label",
  width: "Width",
  height: "Height",
  fontSize: "Font size",
  type: "Type",
  page: "Page",
  removeField: "Remove field",
  selectField: "Select a field on the PDF.",
  notes: "Notes — p.",
  notesPlaceholder: "Write your notes about this page…",
  prevPage: "Previous page",
  nextPage: "Next page",
  zoomOut: "Zoom out",
  zoomIn: "Zoom in",
  emptyTitle: "Upload a PDF to get started",
  emptyDesc: "Add draggable fields, write notes beside them and export as a filled PDF or image.",
  selectPdf: "Select PDF",
  srTitle: "PDF Practice Editor",
  bold: "Bold",
  italic: "Italic",
  list: "List",
  language: "Language",
};

const es: ToolDict = {
  noPdf: "Ningún PDF cargado",
  edit: "Editar",
  editFields: "Editar campos",
  fill: "Rellenar",
  save: "Guardar",
  saved: "¡Guardado!",
  openMenu: "Abrir menú de exportación",
  menuLabel: "Opciones de exportación",
  exportFilled: "Exportar PDF rellenado",
  exportTemplate: "Exportar con campos rellenables",
  exportPagePng: "Exportar página actual (PNG)",
  exportRange: "Exportar rango del PDF",
  pageStart: "Página inicial",
  pageEnd: "Página final",
  to: "a",
  exportBtn: "Exportar",
  export: "Exportar",
  changePdf: "Cambiar PDF",
  dropHere: "Suelta el PDF para abrirlo",
  dropHint: "o arrastra un archivo PDF a esta área",
  fitWidth: "Ajustar al ancho",
  currentPage: "Página actual",
  fieldsOnPage: "Campos en esta página",
  noFieldsOnPage:
    "Aún no hay campos en esta página. Elige una herramienta y arrastra sobre el PDF.",
  emptyValue: "vacío",
  shortcuts: "Atajos",
  kbdDelete: "eliminar campo",
  kbdDeselect: "deseleccionar",
  kbdNudge: "mover 1px (⇧ 10px)",
  kbdSave: "guardar",
  uploadPdf: "Cargar PDF",
  tools: "Herramientas",
  text: "Texto",
  checkbox: "Casilla",
  date: "Fecha",
  number: "Número",
  toolsHint: "Arrastra sobre el PDF para crear. Selecciona un campo para mover o redimensionar.",
  documents: "Documentos",
  search: "Buscar...",
  noDocs: "Ningún documento guardado.",
  deleteDoc: (n) => `Eliminar documento ${n}`,
  properties: "Propiedades",
  label: "Etiqueta",
  width: "Ancho",
  height: "Alto",
  fontSize: "Tamaño de fuente",
  type: "Tipo",
  page: "Página",
  removeField: "Eliminar campo",
  selectField: "Selecciona un campo en el PDF.",
  notes: "Notas — pág.",
  notesPlaceholder: "Escribe tus notas sobre esta página…",
  prevPage: "Página anterior",
  nextPage: "Página siguiente",
  zoomOut: "Alejar",
  zoomIn: "Acercar",
  emptyTitle: "Carga un PDF para empezar",
  emptyDesc:
    "Añade campos arrastrables, escribe notas al lado y exporta como PDF rellenado o imagen.",
  selectPdf: "Seleccionar PDF",
  srTitle: "Editor de Prácticas en PDF",
  bold: "Negrita",
  italic: "Cursiva",
  list: "Lista",
  language: "Idioma",
};

export const TOOL_DICTS: Record<ToolLocale, ToolDict> = { pt, en, es };

const STORAGE_KEY = "grifo:tool:locale";

export function detectBrowserLocale(): ToolLocale {
  if (typeof navigator === "undefined") return "pt";
  const langs = [navigator.language, ...(navigator.languages ?? [])];
  for (const raw of langs) {
    if (!raw) continue;
    const code = raw.toLowerCase().split("-")[0];
    if (code === "pt" || code === "en" || code === "es") return code;
  }
  return "pt";
}

export function loadStoredLocale(): ToolLocale | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "pt" || v === "en" || v === "es") return v;
  } catch {}
  return null;
}

export function persistLocale(locale: ToolLocale) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {}
}
