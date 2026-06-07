import type { PDFDocumentProxy } from "pdfjs-dist";

export interface OcrProgress {
  status: string;
  progress: number; // 0–1
}

async function renderPageToCanvas(
  pdfDoc: PDFDocumentProxy,
  pageNumber: number,
  scale = 2.5,
): Promise<HTMLCanvasElement> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const task = page.render({ canvasContext: canvas.getContext("2d")!, viewport });
  await task.promise;
  return canvas;
}

const STATUS_LABELS: Record<string, string> = {
  "loading tesseract core": "Carregando motor OCR...",
  "loading language traineddata": "Baixando dados do idioma...",
  "initializing tesseract": "Inicializando...",
  "initializing api": "Inicializando...",
  "recognizing text": "Reconhecendo texto...",
};

export async function extractPageText(
  pdfDoc: PDFDocumentProxy,
  pageNumber: number,
  onProgress?: (p: OcrProgress) => void,
): Promise<string> {
  const { createWorker } = await import("tesseract.js");

  const canvas = await renderPageToCanvas(pdfDoc, pageNumber);

  const worker = await createWorker("por", 1, {
    logger: (m: { status: string; progress: number }) => {
      const label = STATUS_LABELS[m.status] ?? m.status;
      onProgress?.({ status: label, progress: m.progress });
    },
  });

  const { data } = await worker.recognize(canvas);
  await worker.terminate();

  return data.text.trim();
}

export async function extractAllPagesText(
  pdfDoc: PDFDocumentProxy,
  totalPages: number,
  onProgress?: (page: number, p: OcrProgress) => void,
): Promise<Record<number, string>> {
  const { createWorker } = await import("tesseract.js");

  // Reutiliza um único worker para todas as páginas (mais eficiente)
  const worker = await createWorker("por", 1, {
    logger: (m: { status: string; progress: number }) => {
      // progress global é emitido fora — não há página atual aqui
    },
  });

  const results: Record<number, string> = {};

  for (let p = 1; p <= totalPages; p++) {
    onProgress?.(p, { status: `Página ${p} de ${totalPages}...`, progress: (p - 1) / totalPages });
    const canvas = await renderPageToCanvas(pdfDoc, p);
    const { data } = await worker.recognize(canvas);
    results[p] = data.text.trim();
  }

  await worker.terminate();
  return results;
}
