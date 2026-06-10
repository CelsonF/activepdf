import type { PDFDocumentProxy } from "pdfjs-dist";
import type { PdfField, ExportMode } from "@/types";

function uid() { return Math.random().toString(36).slice(2, 9); }

function uniqueName(base: string, used: Set<string>): string {
  let n = base.replace(/[^A-Za-z0-9_]/g, "_") || "field";
  let name = n, i = 1;
  while (used.has(name)) name = n + "_" + i++;
  used.add(name);
  return name;
}

function downloadBytes(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  requestAnimationFrame(() => URL.revokeObjectURL(url));
}

function dataURLToBytes(dataURL: string): Uint8Array {
  const base64 = dataURL.split(",")[1];
  const bin = atob(base64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function addTextField(form: any, page: any, f: PdfField, name: string, opts: {
  borderWidth: number; borderColor: any; backgroundColor: any; font: any;
}) {
  const tf = form.createTextField(name);
  tf.addToPage(page, {
    x: f.pdfX, y: f.pdfY, width: f.pdfW, height: f.pdfH,
    borderWidth: opts.borderWidth,
    borderColor: opts.borderColor,
    backgroundColor: opts.backgroundColor,
  });
  tf.setFontSize(f.fontSize || 11);
  if (f.multiline) tf.enableMultiline();
  return tf;
}

export async function exportPDF(
  mode: ExportMode,
  pdfBytes: ArrayBuffer,
  pdfDoc: PDFDocumentProxy,
  fields: PdfField[],
  pdfName: string,
  onStatus: (msg: string) => void
) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");

  if (mode === "interactive") {
    onStatus("Gerando PDF interativo...");
    const doc = await PDFDocument.load(pdfBytes);
    const helv = await doc.embedFont(StandardFonts.Helvetica);
    const pages = doc.getPages();
    const form = doc.getForm();
    const used = new Set<string>();
    for (const f of fields) {
      const page = pages[f.page - 1];
      if (!page) continue;
      const name = uniqueName(f.name || `q${uid()}`, used);
      addTextField(form, page, f, name, { borderWidth: 0.5, borderColor: rgb(0.5, 0.5, 0.6), backgroundColor: rgb(1, 1, 1), font: helv });
    }
    form.updateFieldAppearances(helv);
    downloadBytes(await doc.save(), `${pdfName}_interativo.pdf`);
    return `PDF interativo exportado (${fields.length} campos)! 🎉`;
  }

  if (mode === "watermark") {
    onStatus("Renderizando páginas como marca d'água...");
    const doc = await PDFDocument.load(pdfBytes);
    const helv = await doc.embedFont(StandardFonts.Helvetica);
    const pages = doc.getPages();
    const form = doc.getForm();
    const used = new Set<string>();
    const pagesWithFields = Array.from(new Set(fields.map((f) => f.page)));

    for (const pNum of pagesWithFields) {
      const pageIndex = pNum - 1;
      const pageObj = await pdfDoc.getPage(pNum);
      const viewport = pageObj.getViewport({ scale: 1.0 });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext("2d")!;
      await pageObj.render({ canvasContext: ctx, viewport }).promise;
      const pngBytes = dataURLToBytes(canvas.toDataURL("image/png"));
      const img = await doc.embedPng(pngBytes);
      const { width, height } = pages[pageIndex].getSize();
      pages[pageIndex].drawImage(img, { x: 0, y: 0, width, height, opacity: 0.18 });
    }
    for (const f of fields) {
      const page = pages[f.page - 1]; if (!page) continue;
      const name = uniqueName(f.name || `q${uid()}`, used);
      addTextField(form, page, f, name, { borderWidth: 1, borderColor: rgb(0.31, 0.27, 0.9), backgroundColor: rgb(1, 1, 1), font: helv });
    }
    form.updateFieldAppearances(helv);
    downloadBytes(await doc.save(), `${pdfName}_marca_dagua.pdf`);
    return `PDF com marca d'água exportado! 💧`;
  }

  if (mode === "answers") {
    onStatus("Montando folha de respostas...");
    const doc = await PDFDocument.create();
    const helv = await doc.embedFont(StandardFonts.Helvetica);
    const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const PAGE_W = 595.28, PAGE_H = 841.89, MARGIN = 50;
    let page = doc.addPage([PAGE_W, PAGE_H]);
    const form = doc.getForm();
    let y = PAGE_H - MARGIN;
    const accent = rgb(0.31, 0.27, 0.9);
    const dark = rgb(0.06, 0.09, 0.16);
    const slate = rgb(0.45, 0.5, 0.6);

    page.drawRectangle({ x: 0, y: PAGE_H - 50, width: PAGE_W, height: 50, color: accent });
    page.drawText("Folha de Respostas", { x: MARGIN, y: PAGE_H - 32, size: 18, font: helvBold, color: rgb(1, 1, 1) });
    page.drawText(pdfName, { x: PAGE_W - MARGIN - 200, y: PAGE_H - 32, size: 11, font: helv, color: rgb(1, 1, 1) });
    y = PAGE_H - 80;

    page.drawText("Nome:", { x: MARGIN, y: y - 14, size: 10, font: helvBold, color: dark });
    const nameF = form.createTextField("aluno.nome");
    nameF.addToPage(page, { x: MARGIN + 38, y: y - 22, width: 280, height: 18, borderWidth: 0 });
    page.drawText("Data:", { x: MARGIN + 330, y: y - 14, size: 10, font: helvBold, color: dark });
    const dateF = form.createTextField("aluno.data");
    dateF.addToPage(page, { x: MARGIN + 365, y: y - 22, width: 130, height: 18, borderWidth: 0 });
    y -= 50;
    page.drawText("Instruções: preencha os campos abaixo com suas respostas.", { x: MARGIN, y, size: 10, font: helv, color: slate });
    y -= 30;

    const used = new Set<string>();
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      const label = f.label || f.name || `Resposta ${i + 1}`;
      const fieldH = f.multiline ? 70 : 22;
      if (y - fieldH - 50 < MARGIN + 20) { page = doc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN; }
      page.drawRectangle({ x: MARGIN, y: y - 22, width: 4, height: 22, color: accent });
      page.drawText(`${i + 1}. ${label}`, { x: MARGIN + 12, y: y - 14, size: 11, font: helvBold, color: dark });
      y -= 28;
      const name = uniqueName(f.name || `q${i + 1}`, used);
      const tf = form.createTextField(name);
      tf.addToPage(page, { x: MARGIN, y: y - fieldH, width: PAGE_W - 2 * MARGIN, height: fieldH, borderWidth: 0 });
      tf.setFontSize(f.fontSize || 11);
      if (f.multiline) tf.enableMultiline();
      y -= fieldH + 18;
    }
    form.updateFieldAppearances(helv);
    downloadBytes(await doc.save(), `${pdfName}_respostas.pdf`);
    return `Folha de respostas exportada! 📝`;
  }

  throw new Error("Modo desconhecido");
}

export async function exportFilledPDF(
  pdfBytes: ArrayBuffer,
  fields: PdfField[],
  fieldValues: Record<string, string>,
  pdfName: string,
  onStatus: (msg: string) => void
) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  onStatus("Gerando PDF preenchido...");

  const doc = await PDFDocument.load(pdfBytes);
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  let writtenCount = 0;

  for (const f of fields) {
    const value = fieldValues[f.id];
    if (!value?.trim()) continue;

    const page = pages[f.page - 1];
    if (!page) continue;

    const fontSize = f.fontSize || 11;
    const lineHeight = fontSize * 1.35;

    // pdfY is bottom-left in PDF space; draw text starting near top of field
    const textStartY = f.pdfY + f.pdfH - fontSize - 1;
    const maxX = f.pdfX + f.pdfW - 4;
    const lines = value.split("\n");
    let currentY = textStartY;

    for (const rawLine of lines) {
      if (currentY < f.pdfY) break;
      // Simple word-wrap within field width
      const words = rawLine === "" ? [""] : rawLine.split(" ");
      let currentLine = "";
      for (const word of words) {
        const test = currentLine ? currentLine + " " + word : word;
        let testWidth = 0;
        try {
          testWidth = helv.widthOfTextAtSize(test, fontSize);
        } catch {
          testWidth = test.length * fontSize * 0.5;
        }
        if (testWidth > f.pdfW - 6 && currentLine) {
          if (currentY >= f.pdfY) {
            page.drawText(currentLine, { x: f.pdfX + 3, y: currentY, size: fontSize, font: helv, color: rgb(0, 0, 0) });
          }
          currentY -= lineHeight;
          currentLine = word;
        } else {
          currentLine = test;
        }
      }
      if (currentLine && currentY >= f.pdfY) {
        page.drawText(currentLine, { x: f.pdfX + 3, y: currentY, size: fontSize, font: helv, color: rgb(0, 0, 0) });
      }
      currentY -= lineHeight;
    }
    writtenCount++;
  }

  downloadBytes(await doc.save(), `${pdfName}_preenchido.pdf`);
  return `PDF preenchido exportado com ${writtenCount} campo${writtenCount !== 1 ? "s" : ""}!`;
}
