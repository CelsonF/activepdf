import type { PDFDocumentProxy } from "pdfjs-dist";

const WORKER_SRC =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";

/** Abre o documento no pdf.js sem consumir o buffer original (data é transferido). */
export async function loadPdfDocument(bytes: ArrayBuffer): Promise<PDFDocumentProxy> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_SRC;
  return pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
}
