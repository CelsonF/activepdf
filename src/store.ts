import { create } from "zustand";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { PdfField, ExportMode, PageViewSize, AppMode } from "@/types";

interface Viewport { width: number; height: number; }

export interface EditorState {
  // PDF
  pdfDoc: PDFDocumentProxy | null;
  pdfBytes: ArrayBuffer | null;
  pdfName: string;
  currentPage: number;
  totalPages: number;
  scale: number;
  pageViewport: Viewport | null;
  pageViewSize: PageViewSize | null;

  // Fields
  fields: PdfField[];
  selectedFieldId: string | null;
  fieldCounter: number;

  // Fill mode
  appMode: AppMode;
  fieldValues: Record<string, string>;

  // Export
  exportMode: ExportMode;

  // OCR
  ocrOpen: boolean;
  ocrResults: Record<number, string>;

  // Actions
  loadPdf: (doc: PDFDocumentProxy, bytes: ArrayBuffer, name: string, pages: number) => void;
  resetPdf: () => void;
  setPage: (n: number) => void;
  setViewport: (vp: Viewport, vs: PageViewSize) => void;
  addField: (f: PdfField) => void;
  updateField: (id: string, patch: Partial<PdfField>) => void;
  deleteField: (id: string) => void;
  clearPageFields: (page: number) => void;
  selectField: (id: string | null) => void;
  setExportMode: (mode: ExportMode) => void;
  incrementCounter: () => number;
  setAppMode: (mode: AppMode) => void;
  setFieldValue: (id: string, value: string) => void;
  clearFieldValues: () => void;
  setOcrOpen: (open: boolean) => void;
  setOcrResult: (page: number, text: string) => void;
  setOcrResults: (results: Record<number, string>) => void;
}

export const useEditor = create<EditorState>((set, get) => ({
  pdfDoc: null,
  pdfBytes: null,
  pdfName: "documento",
  currentPage: 1,
  totalPages: 0,
  scale: 1.4,
  pageViewport: null,
  pageViewSize: null,
  fields: [],
  selectedFieldId: null,
  fieldCounter: 0,
  appMode: "design",
  fieldValues: {},
  exportMode: "interactive",
  ocrOpen: false,
  ocrResults: {},

  loadPdf: (doc, bytes, name, pages) =>
    set({ pdfDoc: doc, pdfBytes: bytes, pdfName: name, totalPages: pages, currentPage: 1, fields: [], fieldCounter: 0, selectedFieldId: null, appMode: "design", fieldValues: {}, ocrResults: {} }),

  resetPdf: () =>
    set({ pdfDoc: null, pdfBytes: null, pdfName: "documento", currentPage: 1, totalPages: 0, fields: [], fieldCounter: 0, selectedFieldId: null, pageViewport: null, pageViewSize: null, appMode: "design", fieldValues: {}, ocrOpen: false, ocrResults: {} }),

  setPage: (n) => set({ currentPage: n, selectedFieldId: null }),

  setViewport: (vp, vs) => set({ pageViewport: vp, pageViewSize: vs }),

  addField: (f) => set((s) => ({ fields: [...s.fields, f], selectedFieldId: f.id })),

  updateField: (id, patch) =>
    set((s) => ({ fields: s.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)) })),

  deleteField: (id) =>
    set((s) => ({
      fields: s.fields.filter((f) => f.id !== id),
      selectedFieldId: s.selectedFieldId === id ? null : s.selectedFieldId,
    })),

  clearPageFields: (page) =>
    set((s) => ({ fields: s.fields.filter((f) => f.page !== page), selectedFieldId: null })),

  selectField: (id) => set({ selectedFieldId: id }),

  setExportMode: (mode) => set({ exportMode: mode }),

  incrementCounter: () => {
    const n = get().fieldCounter + 1;
    set({ fieldCounter: n });
    return n;
  },

  setAppMode: (mode) => set({ appMode: mode, selectedFieldId: null }),

  setFieldValue: (id, value) =>
    set((s) => ({ fieldValues: { ...s.fieldValues, [id]: value } })),

  clearFieldValues: () => set({ fieldValues: {} }),

  setOcrOpen: (open) => set({ ocrOpen: open }),
  setOcrResult: (page, text) => set((s) => ({ ocrResults: { ...s.ocrResults, [page]: text } })),
  setOcrResults: (results) => set({ ocrResults: results }),
}));
