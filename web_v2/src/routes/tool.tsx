import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BASE_URL } from "@/lib/i18n";
import { ogImageMeta, ogImageUrl } from "@/lib/route-heads";
import {
  TOOL_LOCALES,
  TOOL_LOCALE_LABEL,
  TOOL_DICTS,
  detectBrowserLocale,
  loadStoredLocale,
  persistLocale,
  type ToolLocale,
} from "@/lib/tool-i18n";
import {
  Upload,
  Type,
  CheckSquare,
  Calendar,
  Hash,
  PenLine,
  StickyNote,
  Download,
  FileImage,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Save,
  Search,
  Highlighter,
  Bold,
  Italic,
  List,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  FileText,
  SquarePen,
  Globe,
} from "lucide-react";

export const Route = createFileRoute("/tool")({
  head: () => ({
    meta: [
      { title: "Grifo — Editor de PDF" },
      {
        name: "description",
        content:
          "Carregue um PDF, adicione campos de entrada, escreva anotações ao lado e exporte como PDF preenchido ou imagem.",
      },
      { property: "og:title", content: "Editor de PDF — Grifo" },
      {
        property: "og:description",
        content:
          "Editor interativo de PDFs no navegador: adicione campos, anotações e exporte preenchido — sem cadastro.",
      },
      { property: "og:url", content: `${BASE_URL}/tool` },
      ...ogImageMeta(
        ogImageUrl({
          eyebrow: "Grifo · Editor de PDF",
          title: "Editor interativo de PDF no navegador",
          desc: "Adicione campos, escreva anotações e exporte preenchido — sem cadastro.",
        }),
        "Editor de PDF — Grifo",
      ),
    ],
    links: [{ rel: "canonical", href: `${BASE_URL}/tool` }],
  }),
  ssr: false,
  component: ToolPage,
});

type FieldType = "text" | "checkbox" | "date" | "number";

type Field = {
  id: string;
  page: number;
  type: FieldType;
  // normalized 0..1 coords relative to the rendered page
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  value: string;
  fontSize: number;
};

type SavedDoc = {
  name: string;
  fields: Field[];
  notes: Record<number, string>; // page -> html
  updatedAt: number;
};

const STORAGE_KEY = "grifo:tool:docs";

function loadStore(): Record<string, SavedDoc> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveStore(s: Record<string, SavedDoc>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function ToolPage() {
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pdfName, setPdfName] = useState<string>("");
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [mode, setMode] = useState<"edit" | "fill">("edit");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [tool, setTool] = useState<FieldType>("text");
  const [fields, setFields] = useState<Field[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [docList, setDocList] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);
  const [rangeStart, setRangeStart] = useState<string>("1");
  const [rangeEnd, setRangeEnd] = useState<string>("1");
  const [savedFlash, setSavedFlash] = useState(false);
  const [locale, setLocale] = useState<ToolLocale>("pt");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langMenuRef = useRef<HTMLDivElement | null>(null);
  const t = TOOL_DICTS[locale];

  // Detect/load locale on mount
  useEffect(() => {
    const stored = loadStoredLocale();
    setLocale(stored ?? detectBrowserLocale());
  }, []);

  const changeLocale = (l: ToolLocale) => {
    setLocale(l);
    persistLocale(l);
    setShowLangMenu(false);
  };

  // Close language menu on outside click / Escape
  useEffect(() => {
    if (!showLangMenu) return;
    const onDocClick = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowLangMenu(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [showLangMenu]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const pdfDocRef = useRef<any>(null);
  const pageSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const drawingRef = useRef<{
    startX: number;
    startY: number;
    id: string;
  } | null>(null);

  // Load doc list once
  useEffect(() => {
    setDocList(Object.keys(loadStore()));
  }, []);

  // Set pdfjs worker
  useEffect(() => {
    (async () => {
      const pdfjs = await import("pdfjs-dist");
      // @ts-ignore
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
    })();
  }, []);

  // Close export dropdown when clicking outside
  useEffect(() => {
    if (!showExportMenu) return;
    const onDocClick = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowExportMenu(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [showExportMenu]);

  // Sync range defaults to current document
  useEffect(() => {
    setRangeStart("1");
    setRangeEnd(String(numPages || 1));
  }, [numPages, pdfName]);

  // Open file
  const onFile = async (file: File) => {
    const buf = new Uint8Array(await file.arrayBuffer());
    setPdfBytes(buf);
    setPdfName(file.name);
    setPage(1);
    // Restore saved metadata if present
    const store = loadStore();
    const saved = store[file.name];
    if (saved) {
      setFields(saved.fields.map((f: any) => ({ ...f, fontSize: f.fontSize ?? 14 })));
      setNotes(saved.notes ?? {});
    } else {
      setFields([]);
      setNotes({});
    }
    const pdfjs = await import("pdfjs-dist");
    const doc = await pdfjs.getDocument({ data: buf.slice(0) }).promise;
    pdfDocRef.current = doc;
    setNumPages(doc.numPages);
  };

  // Render page
  useEffect(() => {
    if (!pdfDocRef.current || !canvasRef.current) return;
    setPdfLoading(true);
    let cancelled = false;
    (async () => {
      const pdfPage = await pdfDocRef.current.getPage(page);
      const viewport = pdfPage.getViewport({ scale });
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      pageSizeRef.current = { w: viewport.width, h: viewport.height };
      if (cancelled) return;
      await pdfPage.render({ canvasContext: ctx, viewport, canvas }).promise;
      if (!cancelled) setPdfLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [page, scale, pdfBytes, numPages]);

  // Draw new field with drag
  const onOverlayMouseDown = (e: React.MouseEvent) => {
    if (mode !== "edit" || !overlayRef.current) return;
    if ((e.target as HTMLElement).closest("[data-field]")) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const id = crypto.randomUUID();
    drawingRef.current = { startX: x, startY: y, id };
    const defaultLabel: Record<FieldType, string> = {
      text: "Texto",
      checkbox: "Caixa",
      date: "Data",
      number: "Número",
    };
    setFields((f) => [
      ...f,
      {
        id,
        page,
        type: tool,
        x,
        y,
        w: 0.001,
        h: 0.001,
        label: defaultLabel[tool],
        value: "",
        fontSize: tool === "text" ? 11 : 14,
      },
    ]);
    setSelectedId(id);
  };

  const onOverlayMouseMove = (e: React.MouseEvent) => {
    if (!drawingRef.current || !overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width;
    const cy = (e.clientY - rect.top) / rect.height;
    const { startX, startY, id } = drawingRef.current;
    setFields((f) =>
      f.map((fd) =>
        fd.id === id
          ? {
              ...fd,
              x: Math.min(startX, cx),
              y: Math.min(startY, cy),
              w: Math.abs(cx - startX),
              h: Math.abs(cy - startY),
            }
          : fd,
      ),
    );
  };

  const onOverlayMouseUp = () => {
    if (!drawingRef.current) return;
    const id = drawingRef.current.id;
    drawingRef.current = null;
    setFields((f) =>
      f.map((fd) => {
        if (fd.id !== id) return fd;
        const pw = pageSizeRef.current.w || 1;
        const ph = pageSizeRef.current.h || 1;
        let w: number;
        let h: number;
        if (fd.type === "text") {
          w = Math.max(fd.w, 80 / pw);
          h = Math.max(fd.h, 18 / ph);
        } else {
          w = Math.max(fd.w, fd.type === "checkbox" ? 0.02 : 0.08);
          h = Math.max(fd.h, 0.025);
        }
        return { ...fd, w, h };
      }),
    );
  };

  const updateField = (id: string, patch: Partial<Field>) =>
    setFields((f) => f.map((fd) => (fd.id === id ? { ...fd, ...patch } : fd)));

  const deleteField = (id: string) => {
    setFields((f) => f.filter((fd) => fd.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // Save to localStorage
  const saveDoc = () => {
    if (!pdfName) return;
    const store = loadStore();
    store[pdfName] = {
      name: pdfName,
      fields,
      notes,
      updatedAt: Date.now(),
    };
    saveStore(store);
    setDocList(Object.keys(store));
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1600);
  };

  // Export a page range as PDF with values flattened
  const exportPdfRange = async (startRaw: number, endRaw: number) => {
    if (!pdfBytes || !numPages) return;
    const start = Math.max(1, Math.min(numPages, Math.floor(startRaw)));
    const end = Math.max(start, Math.min(numPages, Math.floor(endRaw)));
    const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
    const src = await PDFDocument.load(pdfBytes.slice(0));
    const out = await PDFDocument.create();
    const indices: number[] = [];
    for (let i = start; i <= end; i++) indices.push(i - 1);
    const copied = await out.copyPages(src, indices);
    copied.forEach((p) => out.addPage(p));
    const font = await out.embedFont(StandardFonts.Helvetica);
    const pages = out.getPages();
    for (const fd of fields) {
      if (fd.page < start || fd.page > end) continue;
      const p = pages[fd.page - start];
      if (!p) continue;
      const { width: pw, height: ph } = p.getSize();
      const x = fd.x * pw;
      const y = ph - (fd.y + fd.h) * ph;
      const w = fd.w * pw;
      const h = fd.h * ph;
      p.drawRectangle({
        x,
        y,
        width: w,
        height: h,
        borderColor: rgb(0.33, 0.45, 0.92),
        borderWidth: 0.8,
      });
      if (fd.type === "checkbox") {
        if (fd.value === "true" || fd.value === "1") {
          p.drawText("X", {
            x: x + w * 0.2,
            y: y + h * 0.2,
            size: Math.min(h, w) * 0.7,
            font,
            color: rgb(0.1, 0.1, 0.15),
          });
        }
      } else if (fd.value) {
        const size = Math.max(8, Math.min(h * 0.6, fd.fontSize ?? 14));
        p.drawText(fd.value, {
          x: x + 2,
          y: y + h * 0.25,
          size,
          font,
          color: rgb(0.05, 0.08, 0.2),
          maxWidth: w - 4,
        });
      }
    }
    const bytes = await out.save();
    downloadBlob(
      new Blob([bytes as BlobPart], { type: "application/pdf" }),
      `${pdfName.replace(/\.pdf$/i, "")}-paginas-${start}-${end}.pdf`,
    );
  };

  // Export PDF with fields flattened as text
  const exportPdf = async () => {
    if (!pdfBytes) return;
    const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
    const doc = await PDFDocument.load(pdfBytes.slice(0));
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const pages = doc.getPages();
    for (const fd of fields) {
      const p = pages[fd.page - 1];
      if (!p) continue;
      const { width: pw, height: ph } = p.getSize();
      const x = fd.x * pw;
      const y = ph - (fd.y + fd.h) * ph;
      const w = fd.w * pw;
      const h = fd.h * ph;
      // Border for field
      p.drawRectangle({
        x,
        y,
        width: w,
        height: h,
        borderColor: rgb(0.33, 0.45, 0.92),
        borderWidth: 0.8,
      });
      if (fd.type === "checkbox") {
        if (fd.value === "true" || fd.value === "1") {
          p.drawText("X", {
            x: x + w * 0.2,
            y: y + h * 0.2,
            size: Math.min(h, w) * 0.7,
            font,
            color: rgb(0.1, 0.1, 0.15),
          });
        }
      } else if (fd.value) {
        const size = Math.max(8, Math.min(h * 0.6, fd.fontSize ?? 14));
        p.drawText(fd.value, {
          x: x + 2,
          y: y + h * 0.25,
          size,
          font,
          color: rgb(0.05, 0.08, 0.2),
          maxWidth: w - 4,
        });
      }
    }
    const bytes = await doc.save();
    downloadBlob(
      new Blob([bytes as BlobPart], { type: "application/pdf" }),
      `${pdfName.replace(/\.pdf$/i, "")}-preenchido.pdf`,
    );
  };

  // Export PDF with empty fields (template)
  const exportPdfTemplate = async () => {
    if (!pdfBytes) return;
    const { PDFDocument, StandardFonts, TextAlignment, rgb, PDFName } = await import("pdf-lib");
    const doc = await PDFDocument.load(pdfBytes.slice(0));
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const pages = doc.getPages();
    const form = doc.getForm();
    const usedNames = new Set<string>();
    type PdfNameObject = ReturnType<typeof PDFName.of>;
    const clearWidgetChrome = (field: {
      acroField: {
        getWidgets: () => Array<{
          dict: { set: (key: PdfNameObject, value: PdfNameObject) => void };
          getAppearanceCharacteristics?: () =>
            | { dict: { delete: (key: PdfNameObject) => void } }
            | undefined;
        }>;
      };
    }) => {
      for (const widget of field.acroField.getWidgets()) {
        widget.dict.set(PDFName.of("H"), PDFName.of("N"));
        widget.getAppearanceCharacteristics?.()?.dict.delete(PDFName.of("BG"));
      }
    };
    const makeName = (base: string, idx: number) => {
      const clean = (base || "campo").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40);
      let name = `${clean}_${idx}`;
      let i = 1;
      while (usedNames.has(name)) {
        name = `${clean}_${idx}_${i++}`;
      }
      usedNames.add(name);
      return name;
    };
    fields.forEach((fd, idx) => {
      const p = pages[fd.page - 1];
      if (!p) return;
      const { width: pw, height: ph } = p.getSize();
      const x = fd.x * pw;
      const y = ph - (fd.y + fd.h) * ph;
      const w = fd.w * pw;
      const h = fd.h * ph;
      const name = makeName(fd.label, idx);
      try {
        if (fd.type === "checkbox") {
          const cb = form.createCheckBox(name);
          cb.addToPage(p, {
            x,
            y,
            width: w,
            height: h,
            textColor: rgb(0, 0, 0),
            backgroundColor: undefined,
            borderColor: rgb(0.33, 0.45, 0.92),
            borderWidth: 0.8,
          });
          clearWidgetChrome(cb);
        } else {
          const tf = form.createTextField(name);
          tf.setAlignment(TextAlignment.Left);
          tf.addToPage(p, {
            x,
            y,
            width: w,
            height: h,
            textColor: rgb(0, 0, 0),
            backgroundColor: undefined,
            borderColor: rgb(0.33, 0.45, 0.92),
            borderWidth: 0.8,
            font,
          });
          tf.setFontSize(fd.fontSize ?? 11);
          tf.updateAppearances(font);
          clearWidgetChrome(tf);
        }
      } catch {
        // fallback: draw a rectangle if field creation fails
        p.drawRectangle({
          x,
          y,
          width: w,
          height: h,
          borderColor: rgb(0.33, 0.45, 0.92),
          borderWidth: 0.8,
        });
      }
    });
    form.acroForm.dict.delete(PDFName.of("NeedAppearances"));
    const bytes = await doc.save({ updateFieldAppearances: false });
    downloadBlob(
      new Blob([bytes as BlobPart], { type: "application/pdf" }),
      `${pdfName.replace(/\.pdf$/i, "")}-campos.pdf`,
    );
  };

  // Export current page as PNG
  const exportPageImage = async () => {
    if (!canvasRef.current || !overlayRef.current) return;
    const base = canvasRef.current;
    const out = document.createElement("canvas");
    out.width = base.width;
    out.height = base.height;
    const ctx = out.getContext("2d")!;
    ctx.drawImage(base, 0, 0);
    // Draw fields
    ctx.textBaseline = "middle";
    for (const fd of fields.filter((f) => f.page === page)) {
      const x = fd.x * base.width;
      const y = fd.y * base.height;
      const w = fd.w * base.width;
      const h = fd.h * base.height;
      ctx.strokeStyle = "rgba(64,90,210,0.9)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = "#101427";
      if (fd.type === "checkbox") {
        if (fd.value === "true" || fd.value === "1") {
          ctx.fillText("✓", x + w * 0.2, y + h / 2);
        }
      } else if (fd.value) {
        ctx.font = `${fd.fontSize ?? 14}px Inter, sans-serif`;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x + 2, y, w - 4, h);
        ctx.clip();
        ctx.fillText(fd.value, x + 4, y + h / 2);
        ctx.restore();
      }
    }
    out.toBlob((blob) => {
      if (!blob) return;
      downloadBlob(blob, `${pdfName.replace(/\.pdf$/i, "")}-pagina-${page}.png`);
    }, "image/png");
  };

  const pageFields = fields.filter((f) => f.page === page);
  const selected = fields.find((f) => f.id === selectedId) ?? null;

  const filteredDocs = docList.filter((n) => n.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex min-h-screen flex-col bg-muted text-ink lg:h-screen">
      {/* Topbar */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b-2 border-ink/10 bg-card px-3 py-2 sm:px-5 lg:h-16 lg:flex-nowrap lg:py-0">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/"
            aria-label="Grifo — voltar para a página inicial"
            className="flex items-center gap-3 rounded-xl transition-opacity hover:opacity-80"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Highlighter className="h-4.5 w-4.5" />
            </span>
            <span className="relative hidden text-lg font-bold tracking-tight sm:inline">
              <span className="relative z-10 px-1">Grifo</span>
              <span className="absolute inset-x-0 bottom-1 h-2 bg-highlight" aria-hidden />
            </span>
          </Link>
          <span className="ml-2 min-w-0 truncate text-xs text-ink/60 sm:text-sm md:max-w-[280px]">
            {pdfName || t.noPdf}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div ref={langMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setShowLangMenu((s) => !s)}
              aria-haspopup="menu"
              aria-expanded={showLangMenu}
              aria-label={t.language}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-ink/10 bg-secondary px-2.5 py-1.5 text-xs font-medium text-ink/80 transition hover:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 sm:text-sm"
            >
              <Globe className="h-3.5 w-3.5" aria-hidden />
              <span className="uppercase">{locale}</span>
              <ChevronDown className="h-3 w-3" aria-hidden />
            </button>
            {showLangMenu && (
              <div
                role="menu"
                aria-label={t.language}
                className="absolute right-0 top-full z-50 mt-1.5 w-40 max-w-[calc(100vw-1.5rem)] rounded-xl border border-border bg-card p-1 shadow-lg"
              >
                {TOOL_LOCALES.map((l) => (
                  <button
                    key={l}
                    role="menuitemradio"
                    aria-checked={l === locale}
                    onClick={() => changeLocale(l)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none ${
                      l === locale ? "bg-secondary text-ink" : "text-ink/80"
                    }`}
                  >
                    <span>{TOOL_LOCALE_LABEL[l]}</span>
                    <span className="font-mono text-[10px] uppercase text-ink/50">{l}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="inline-flex rounded-xl border border-ink/10 bg-secondary p-0.5">
            <button
              onClick={() => setMode("edit")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition sm:px-3 sm:text-sm ${
                mode === "edit" ? "bg-primary text-primary-foreground" : "text-ink/70 hover:bg-ink/5"
              }`}
            >
              <PenLine className="h-3.5 w-3.5" />{" "}
              <span className="hidden sm:inline">{t.editFields}</span>
              <span className="sm:hidden">{t.edit}</span>
            </button>
            <button
              onClick={() => setMode("fill")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition sm:px-3 sm:text-sm ${
                mode === "fill" ? "bg-primary text-primary-foreground" : "text-ink/70 hover:bg-ink/5"
              }`}
            >
              <CheckSquare className="h-3.5 w-3.5" /> {t.fill}
            </button>
          </div>
          <div ref={exportMenuRef} className="relative">
            <button
              onClick={() => setShowExportMenu((s) => !s)}
              disabled={!pdfBytes}
              aria-haspopup="menu"
              aria-expanded={showExportMenu}
              aria-label={t.openMenu}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 disabled:opacity-50 sm:px-3.5 sm:text-sm"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{savedFlash ? t.saved : t.save}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {showExportMenu && (
              <div
                role="menu"
                aria-label={t.menuLabel}
                className="absolute right-0 top-full z-50 mt-1.5 w-[18rem] max-w-[calc(100vw-1.5rem)] rounded-xl border border-border bg-card p-1 shadow-lg"
              >
                <button
                  role="menuitem"
                  onClick={() => {
                    setShowExportMenu(false);
                    saveDoc();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-ink hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none"
                >
                  <Save className="h-4 w-4 text-ink/60" aria-hidden />
                  {t.saveCurrentPage}
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setShowExportMenu(false);
                    exportPdf();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-ink hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none"
                >
                  <FileText className="h-4 w-4 text-ink/60" aria-hidden />
                  {t.exportFilled}
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setShowExportMenu(false);
                    exportPdfTemplate();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-ink hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none"
                >
                  <SquarePen className="h-4 w-4 text-ink/60" aria-hidden />
                  {t.exportTemplate}
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setShowExportMenu(false);
                    exportPageImage();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-ink hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none"
                >
                  <FileImage className="h-4 w-4 text-ink/60" aria-hidden />
                  {t.exportPagePng}
                </button>
                <div className="my-1 h-px bg-border" role="separator" />
                <div className="px-2.5 py-2">
                  <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-ink">
                    <Download className="h-4 w-4 text-ink/60" aria-hidden />
                    {t.exportRange}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="sr-only" htmlFor="range-start">{t.pageStart}</label>
                    <input
                      id="range-start"
                      type="number"
                      min={1}
                      max={numPages || 1}
                      value={rangeStart}
                      onChange={(e) => setRangeStart(e.target.value)}
                      className="w-16 rounded-lg border border-border bg-secondary px-2 py-1 text-center text-xs outline-none focus:border-ink"
                    />
                    <span className="text-xs text-ink/50">{t.to}</span>
                    <label className="sr-only" htmlFor="range-end">{t.pageEnd}</label>
                    <input
                      id="range-end"
                      type="number"
                      min={1}
                      max={numPages || 1}
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(e.target.value)}
                      className="w-16 rounded-lg border border-border bg-secondary px-2 py-1 text-center text-xs outline-none focus:border-ink"
                    />
                    <span className="text-xs text-ink/50">/ {numPages}</span>
                    <button
                      onClick={() => {
                        setShowExportMenu(false);
                        exportPdfRange(Number(rangeStart) || 1, Number(rangeEnd) || 1);
                      }}
                      className="ml-auto inline-flex min-h-8 items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
                    >
                      {t.exportBtn}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
        {/* Left sidebar */}
        <aside className="order-2 flex w-full shrink-0 flex-col border-b border-border bg-card lg:order-1 lg:w-64 lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="border-b border-border p-5">
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                PDF
              </span>
              <div className="mt-3 flex items-center justify-center rounded-2xl border-2 border-dashed border-ink/20 bg-accent p-4 text-center hover:border-ink cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onFile(f);
                  }}
                />
                <div className="flex flex-col items-center gap-1.5 text-xs font-medium text-ink/70">
                  <Upload className="h-5 w-5 text-ink" />
                  {t.uploadPdf}
                </div>
              </div>
            </label>
          </div>

          <div className="border-b border-border p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {t.tools}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { t: "text" as const, icon: Type, label: t.text },
                { t: "checkbox" as const, icon: CheckSquare, label: t.checkbox },
                { t: "date" as const, icon: Calendar, label: t.date },
                { t: "number" as const, icon: Hash, label: t.number },
              ].map(({ t: ttype, icon: Icon, label }) => (
                <button
                  key={ttype}
                  onClick={() => {
                    setTool(ttype);
                    setMode("edit");
                  }}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 text-xs font-medium transition ${
                    tool === ttype && mode === "edit"
                      ? "border-ink bg-primary text-primary-foreground"
                      : "border-border text-ink/70 hover:bg-secondary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-snug text-ink/50">
              {t.toolsHint}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {t.documents}
              </div>
              <span className="text-[11px] text-ink/40">{docList.length}</span>
            </div>
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.search}
                className="w-full rounded-xl border border-border bg-card py-1.5 pl-7 pr-2 text-xs outline-none focus:border-ink"
              />
            </div>
            <ul className="space-y-1">
              {filteredDocs.map((n) => (
                <li
                  key={n}
                  className={`group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium ${
                    n === pdfName ? "bg-primary text-primary-foreground" : "text-ink/70 hover:bg-secondary"
                  }`}
                >
                  <button
                    className="flex-1 truncate text-left"
                    onClick={() => {
                      const s = loadStore()[n];
                      if (s) {
                        setPdfName(n);
                        setFields(s.fields);
                        setNotes(s.notes ?? {});
                      }
                    }}
                    title={n}
                  >
                    {n}
                  </button>
                  <button
                    aria-label={t.deleteDoc(n)}
                    className="opacity-0 group-hover:opacity-100"
                    onClick={() => {
                      const store = loadStore();
                      delete store[n];
                      saveStore(store);
                      setDocList(Object.keys(store));
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-pen-red" />
                  </button>
                </li>
              ))}
              {filteredDocs.length === 0 && (
                <li className="text-[11px] text-ink/40">{t.noDocs}</li>
              )}
            </ul>
          </div>
        </aside>

        {/* PDF Canvas */}
        <main className="order-1 min-h-[60vh] flex-1 overflow-auto bg-muted p-3 sm:p-6 lg:order-2 lg:min-h-0">
          {!pdfBytes ? (
            <EmptyState onPick={onFile} t={t} />
          ) : (
            <div className="mx-auto w-fit">
              <h1 className="sr-only">{t.srTitle}</h1>
              <div className="mb-3 flex items-center justify-center gap-3 rounded-2xl border border-border bg-card px-4 py-2 shadow-sm">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label={t.prevPage}
                  className="rounded-lg p-1.5 hover:bg-secondary disabled:opacity-30"
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="font-mono text-sm">
                  <input
                    type="number"
                    value={page}
                    onChange={(e) =>
                      setPage(Math.min(numPages, Math.max(1, Number(e.target.value) || 1)))
                    }
                    className="w-14 rounded-lg border border-border bg-secondary px-1 py-0.5 text-center font-mono"
                  />
                  <span className="text-ink/50"> / {numPages}</span>
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(numPages, p + 1))}
                  aria-label={t.nextPage}
                  className="rounded-lg p-1.5 hover:bg-secondary disabled:opacity-30"
                  disabled={page >= numPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="relative inline-block overflow-hidden rounded-2xl shadow-xl ring-1 ring-ink/10">
                <canvas ref={canvasRef} className="block bg-white" />
                <div
                  ref={overlayRef}
                  className="absolute inset-0"
                  style={{ cursor: mode === "edit" ? "crosshair" : "default" }}
                  onMouseDown={onOverlayMouseDown}
                  onMouseMove={onOverlayMouseMove}
                  onMouseUp={onOverlayMouseUp}
                  onMouseLeave={onOverlayMouseUp}
                >
                  {pageFields.map((fd) => (
                    <FieldBox
                      key={fd.id}
                      field={fd}
                      mode={mode}
                      selected={selectedId === fd.id}
                      onSelect={() => setSelectedId(fd.id)}
                      onChange={(patch) => updateField(fd.id, patch)}
                    />
                  ))}
                </div>
                {pdfLoading && (
                  <div className="absolute inset-0">
                    <PdfSkeleton />
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center justify-center gap-3 rounded-2xl border border-border bg-card px-4 py-2 shadow-sm">
                <button
                  onClick={() => setScale((s) => Math.max(0.3, +(s - 0.1).toFixed(1)))}
                  aria-label={t.zoomOut}
                  className="rounded-lg p-1.5 hover:bg-secondary disabled:opacity-30"
                  disabled={scale <= 0.3}
                  title={t.zoomOut}
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <div className="min-w-[3rem] text-center font-mono text-sm">
                  {Math.round(scale * 100)}%
                </div>
                <button
                  onClick={() => setScale((s) => Math.min(3, +(s + 0.1).toFixed(1)))}
                  aria-label={t.zoomIn}
                  className="rounded-lg p-1.5 hover:bg-secondary disabled:opacity-30"
                  disabled={scale >= 3}
                  title={t.zoomIn}
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Right panel: properties + notes */}
        <aside className="order-3 flex w-full shrink-0 flex-col border-t border-border bg-card lg:w-80 lg:overflow-y-auto lg:border-l lg:border-t-0">
          <div className="border-b border-border p-5">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {t.properties}
            </div>
            {selected ? (
              <div className="space-y-2 text-sm">
                <label className="block">
                  <span className="text-xs text-ink/60">{t.label}</span>
                  <input
                    value={selected.label}
                    onChange={(e) => updateField(selected.id, { label: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-secondary px-2.5 py-1.5 outline-none focus:border-ink"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    label={t.width}
                    value={Math.round(selected.w * (pageSizeRef.current.w || 1))}
                    suffix="px"
                    onChange={(v) => {
                      const pw = pageSizeRef.current.w || 1;
                      updateField(selected.id, {
                        w: Math.max(0.02, Math.min(1 - selected.x, v / pw)),
                      });
                    }}
                  />
                  <NumberField
                    label={t.height}
                    value={Math.round(selected.h * (pageSizeRef.current.h || 1))}
                    suffix="px"
                    onChange={(v) => {
                      const ph = pageSizeRef.current.h || 1;
                      updateField(selected.id, {
                        h: Math.max(0.015, Math.min(1 - selected.y, v / ph)),
                      });
                    }}
                  />
                </div>
                <NumberField
                  label={t.fontSize}
                  value={selected.fontSize}
                  suffix="px"
                  onChange={(v) =>
                    updateField(selected.id, { fontSize: Math.max(6, Math.min(72, Math.round(v))) })
                  }
                />
                <div className="text-xs text-ink/60">
                  {t.type}: <span className="font-medium text-ink">{selected.type}</span> · {t.page}{" "}
                  {selected.page}
                </div>
                <button
                  onClick={() => deleteField(selected.id)}
                  className="inline-flex items-center gap-1 rounded-xl border border-pen-red/30 px-2.5 py-1.5 text-xs font-medium text-pen-red hover:bg-pen-red/10"
                >
                  <Trash2 className="h-3 w-3" /> {t.removeField}
                </button>
              </div>
            ) : (
              <p className="text-xs text-ink/50">{t.selectField}</p>
            )}
          </div>

          <div className="flex flex-1 flex-col overflow-hidden p-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <StickyNote className="h-3.5 w-3.5" /> {t.notes} {page}
              </div>
            </div>
            <NotesEditor
              key={`notes-${page}`}
              value={notes[page] ?? ""}
              onChange={(html) => setNotes((n) => ({ ...n, [page]: html }))}
              t={t}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function FieldBox({
  field,
  mode,
  selected,
  onSelect,
  onChange,
}: {
  field: Field;
  mode: "edit" | "fill";
  selected: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<Field>) => void;
}) {
  const style: React.CSSProperties = {
    left: `${field.x * 100}%`,
    top: `${field.y * 100}%`,
    width: `${field.w * 100}%`,
    height: `${field.h * 100}%`,
  };

  const border =
    mode === "edit"
      ? selected
        ? "border-primary ring-2 ring-primary/30"
        : "border-primary/60 hover:border-primary"
      : "border-pen-blue/40";

  const startDrag = (
    e: React.PointerEvent,
    op: "move" | "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw",
  ) => {
    if (mode !== "edit") return;
    e.stopPropagation();
    e.preventDefault();
    onSelect();
    const parent = (e.currentTarget as HTMLElement).parentElement!.parentElement as HTMLElement; // overlay
    const rect = parent.getBoundingClientRect();
    const start = { mx: e.clientX, my: e.clientY, x: field.x, y: field.y, w: field.w, h: field.h };
    const onMove = (ev: PointerEvent) => {
      const dx = (ev.clientX - start.mx) / rect.width;
      const dy = (ev.clientY - start.my) / rect.height;
      let { x, y, w, h } = start;
      if (op === "move") {
        x = clamp01(start.x + dx, 1 - start.w);
        y = clamp01(start.y + dy, 1 - start.h);
      } else {
        if (op.includes("e")) w = Math.max(0.02, Math.min(1 - start.x, start.w + dx));
        if (op.includes("s")) h = Math.max(0.015, Math.min(1 - start.y, start.h + dy));
        if (op.includes("w")) {
          const nx = clamp01(start.x + dx, 1);
          const nw = start.w + (start.x - nx);
          if (nw > 0.02) {
            x = nx;
            w = nw;
          }
        }
        if (op.includes("n")) {
          const ny = clamp01(start.y + dy, 1);
          const nh = start.h + (start.y - ny);
          if (nh > 0.015) {
            y = ny;
            h = nh;
          }
        }
      }
      onChange({ x, y, w, h });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div
      data-field
      className={`absolute border bg-transparent ${border}`}
      style={style}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => {
        if (mode === "edit") startDrag(e, "move");
        else onSelect();
      }}
    >
      {field.type === "checkbox" ? (
        <button
          disabled={mode === "edit"}
          onClick={() => onChange({ value: field.value === "true" ? "" : "true" })}
          className="flex h-full w-full items-center justify-center text-xs font-bold text-ink"
        >
          {field.value === "true" ? "✓" : ""}
        </button>
      ) : (
        <div className="relative flex h-full w-full items-center overflow-hidden bg-transparent">
          {!field.value && (
            <span
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center overflow-hidden whitespace-nowrap text-left leading-none text-ink/40"
              style={{ fontSize: field.fontSize }}
            >
              {field.label}
            </span>
          )}
          <input
            type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
            value={field.value}
            onChange={(e) => onChange({ value: e.target.value })}
            readOnly={mode === "edit"}
            aria-label={field.label}
            style={{ fontSize: field.fontSize, lineHeight: "normal" }}
            className={`relative z-10 h-full w-full m-0 border-0 bg-transparent p-0 text-left align-middle text-ink outline-none ${
              mode === "edit" ? "pointer-events-none select-none" : ""
            }`}
          />
        </div>
      )}
      {mode === "edit" && selected && (
        <>
          {(["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const).map((h) => (
            <span
              key={h}
              onPointerDown={(e) => startDrag(e, h)}
              className="absolute z-10 h-2.5 w-2.5 rounded-sm border border-ink bg-highlight shadow-sm"
              style={handleStyle(h)}
            />
          ))}
        </>
      )}
    </div>
  );
}

function clamp01(v: number, max = 1) {
  return Math.max(0, Math.min(max, v));
}

function NumberField({
  label,
  value,
  suffix,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  suffix?: string;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wide text-ink/50">{label}</span>
      <div className="mt-1 flex items-center rounded-xl border border-border bg-secondary px-2 py-1 focus-within:border-ink">
        <input
          type="number"
          value={value}
          step={step}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full bg-transparent text-sm outline-none"
        />
        {suffix && <span className="text-xs text-ink/40">{suffix}</span>}
      </div>
    </label>
  );
}

function handleStyle(h: "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw"): React.CSSProperties {
  const map: Record<string, React.CSSProperties> = {
    nw: { top: -5, left: -5, cursor: "nwse-resize" },
    n: { top: -5, left: "50%", transform: "translateX(-50%)", cursor: "ns-resize" },
    ne: { top: -5, right: -5, cursor: "nesw-resize" },
    e: { top: "50%", right: -5, transform: "translateY(-50%)", cursor: "ew-resize" },
    se: { bottom: -5, right: -5, cursor: "nwse-resize" },
    s: { bottom: -5, left: "50%", transform: "translateX(-50%)", cursor: "ns-resize" },
    sw: { bottom: -5, left: -5, cursor: "nesw-resize" },
    w: { top: "50%", left: -5, transform: "translateY(-50%)", cursor: "ew-resize" },
  };
  return map[h];
}

function NotesEditor({
  value,
  onChange,
  t,
}: {
  value: string;
  onChange: (html: string) => void;
  t: { bold: string; italic: string; list: string; notesPlaceholder: string };
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  const exec = useCallback(
    (cmd: string) => {
      document.execCommand(cmd);
      if (ref.current) onChange(ref.current.innerHTML);
    },
    [onChange],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-md border border-ink/10">
      <div className="flex items-center gap-1 border-b border-ink/10 p-1">
        <button onClick={() => exec("bold")} className="rounded p-1 hover:bg-ink/5" title={t.bold}>
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => exec("italic")}
          className="rounded p-1 hover:bg-ink/5"
          title={t.italic}
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => exec("insertUnorderedList")}
          className="rounded p-1 hover:bg-ink/5"
          title={t.list}
        >
          <List className="h-3.5 w-3.5" />
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        className="flex-1 overflow-y-auto p-3 text-sm leading-relaxed outline-none [&_ul]:ml-4 [&_ul]:list-disc"
        data-placeholder={t.notesPlaceholder}
      />
    </div>
  );
}

function PdfSkeleton() {
  return (
    <div
      className="flex flex-col gap-4 rounded-2xl bg-card p-8 shadow-inner"
      style={{ width: 560, height: 792 }}
    >
      <Skeleton className="h-8 w-3/4 rounded-lg" />
      <div className="mt-4 space-y-3">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-5/6 rounded-md" />
        <Skeleton className="h-4 w-4/6 rounded-md" />
      </div>
      <div className="mt-6 space-y-3">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-5/6 rounded-md" />
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <Skeleton className="h-4 w-2/3 rounded-md" />
      </div>
      <div className="mt-6 flex gap-3">
        <Skeleton className="h-24 w-1/2 rounded-lg" />
        <Skeleton className="h-24 w-1/2 rounded-lg" />
      </div>
      <div className="mt-4 space-y-3">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-5/6 rounded-md" />
        <Skeleton className="h-4 w-4/6 rounded-md" />
      </div>
    </div>
  );
}

function EmptyState({
  onPick,
  t,
}: {
  onPick: (f: File) => void;
  t: { emptyTitle: string; emptyDesc: string; selectPdf: string };
}) {
  return (
    <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Upload className="h-7 w-7" />
      </div>
      <h2 className="font-display text-2xl text-ink">{t.emptyTitle}</h2>
      <p className="mt-2 text-sm text-ink/60">
        {t.emptyDesc}
      </p>
      <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
        <Upload className="h-4 w-4" /> {t.selectPdf}
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPick(f);
          }}
        />
      </label>
    </div>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
