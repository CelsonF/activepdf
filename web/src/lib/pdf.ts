import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

import type { ToolDoc } from './tool-storage'
import type { PDFDocumentProxy } from 'pdfjs-dist'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export async function loadPdf(base64: string): Promise<PDFDocumentProxy> {
  return pdfjs.getDocument({ data: base64ToBytes(base64) }).promise
}

export async function renderPage(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  scale: number,
  canvas: HTMLCanvasElement,
): Promise<void> {
  const page = await pdf.getPage(pageNumber)
  const viewport = page.getViewport({ scale })
  canvas.width = viewport.width
  canvas.height = viewport.height
  const context = canvas.getContext('2d')
  if (!context) return
  // ENABLE_FORMS deixa os widgets de formulário do PDF fora do canvas —
  // sem isso as bordas dos campos nativos aparecem na tela e no PNG exportado
  await page
    .render({
      canvas,
      canvasContext: context,
      viewport,
      annotationMode: pdfjs.AnnotationMode.ENABLE_FORMS,
    })
    .promise
}

/** Grava os campos no PDF e devolve os bytes prontos para download. */
export async function exportFilledPdf(doc: ToolDoc): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(base64ToBytes(doc.pdfBase64))
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const ink = rgb(0.05, 0.09, 0.2)

  for (const field of doc.fields) {
    const page = pdf.getPage(field.page - 1)
    const { width, height } = page.getSize()
    const text = field.type === 'check' ? (field.value ? 'X' : '') : field.value
    if (!text) continue
    page.drawText(text, {
      x: field.x * width,
      y: height - field.y * height - field.fontSize,
      size: field.fontSize,
      font,
      color: ink,
    })
  }
  return pdf.save()
}

export function downloadBytes(
  bytes: Uint8Array,
  filename: string,
  type: string,
): void {
  const blob = new Blob([bytes as BlobPart], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
