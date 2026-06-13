import { useEffect, useRef, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import type { PDFDocumentProxy } from 'pdfjs-dist'

import { Logo } from '@/components/logo'
import { ToolRail } from '@/components/tool/tool-rail'
import { CanvasArea } from '@/components/tool/canvas-area'
import { PropertiesPanel } from '@/components/tool/properties-panel'
import {
  bytesToBase64,
  downloadBytes,
  exportFilledPdf,
  loadPdf,
  renderPage,
} from '@/lib/pdf'
import {
  listDocs,
  newDocId,
  saveAllDocs,
  type FieldType,
  type ToolDoc,
  type ToolField,
} from '@/lib/tool-storage'

interface ToolSearch {
  doc?: string
}

// pdf.js só roda no navegador
export const Route = createFileRoute('/tool')({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): ToolSearch => ({
    doc: typeof search.doc === 'string' ? search.doc : undefined,
  }),
  component: ToolScreen,
})

function clamp(min: number, max: number, value: number): number {
  return Math.min(max, Math.max(min, value))
}

function ToolScreen() {
  const { doc: docFromSearch } = Route.useSearch()

  const [docs, setDocs] = useState<ToolDoc[]>(() => listDocs())
  const [activeDocId, setActiveDocId] = useState<string | null>(
    () => docFromSearch ?? listDocs()[0]?.id ?? null,
  )
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [page, setPage] = useState(1)
  const [scale, setScale] = useState(1)
  const [rendering, setRendering] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [activeTool, setActiveTool] = useState<FieldType | null>(null)
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  // Serializa os renders: o pdf.js não aceita dois render() no mesmo canvas
  const renderChain = useRef<Promise<void>>(Promise.resolve())

  const activeDoc = docs.find((d) => d.id === activeDocId) ?? null
  const selectedField =
    activeDoc?.fields.find((f) => f.id === selectedFieldId) ?? null

  // Persistência com debounce — o base64 do PDF torna cada write caro
  useEffect(() => {
    const t = window.setTimeout(() => saveAllDocs(docs), 400)
    return () => window.clearTimeout(t)
  }, [docs])

  useEffect(() => {
    if (!activeDoc) {
      setPdf(null)
      return
    }
    let cancelled = false
    loadPdf(activeDoc.pdfBase64).then((loaded) => {
      if (!cancelled) {
        setPdf(loaded)
        setPage(1)
        setSelectedFieldId(null)
      }
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDocId])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!pdf || !canvas) return
    setRendering(true)
    renderChain.current = renderChain.current
      .then(() => renderPage(pdf, page, scale, canvas))
      .finally(() => setRendering(false))
  }, [pdf, page, scale])

  function updateActiveDoc(mutate: (doc: ToolDoc) => ToolDoc): void {
    setDocs((all) =>
      all.map((d) =>
        d.id === activeDocId
          ? { ...mutate(d), updatedAt: new Date().toISOString() }
          : d,
      ),
    )
  }

  async function handleUpload(file: File): Promise<void> {
    const base64 = bytesToBase64(new Uint8Array(await file.arrayBuffer()))
    const loaded = await loadPdf(base64)
    const doc: ToolDoc = {
      id: newDocId(),
      name: file.name.replace(/\.pdf$/i, ''),
      pdfBase64: base64,
      pageCount: loaded.numPages,
      fields: [],
      notes: '',
      updatedAt: new Date().toISOString(),
    }
    setDocs((all) => [doc, ...all])
    setActiveDocId(doc.id)
  }

  function handleCanvasClick(x: number, y: number): void {
    if (!activeDoc) return
    // Clique sobre um campo existente seleciona — nunca empilha um novo em cima
    const hit = activeDoc.fields.find(
      (f) =>
        f.page === page &&
        x >= f.x &&
        x <= f.x + (f.w ?? 0.15) &&
        y >= f.y &&
        y <= f.y + (f.h ?? 0.05),
    )
    if (hit) {
      setSelectedFieldId(hit.id)
      return
    }
    if (!activeTool) return
    const canvas = canvasRef.current
    const h = canvas
      ? clamp(0.02, 0.3, (14 * scale + 18) / canvas.height)
      : 0.05
    const field: ToolField = {
      id: newDocId(),
      type: activeTool,
      page,
      x,
      y,
      w: activeTool === 'check' && canvas ? h * (canvas.height / canvas.width) + 0.03 : 0.18,
      h,
      fontSize: 14,
      label: '',
      value: '',
    }
    updateActiveDoc((d) => ({ ...d, fields: [...d.fields, field] }))
    setSelectedFieldId(field.id)
    // Desarma a ferramenta: o próximo clique edita em vez de criar outro campo
    setActiveTool(null)
  }

  function handleFieldChange(field: ToolField): void {
    updateActiveDoc((d) => ({
      ...d,
      fields: d.fields.map((f) => (f.id === field.id ? field : f)),
    }))
  }

  function handleDeleteDoc(id: string): void {
    setDocs((all) => all.filter((d) => d.id !== id))
    if (id === activeDocId) {
      setActiveDocId(docs.find((d) => d.id !== id)?.id ?? null)
    }
  }

  async function handleExportPdf(): Promise<void> {
    if (!activeDoc) return
    setExporting(true)
    try {
      const bytes = await exportFilledPdf(activeDoc)
      downloadBytes(bytes, `${activeDoc.name}-preenchido.pdf`, 'application/pdf')
    } finally {
      setExporting(false)
    }
  }

  async function handleExportImage(): Promise<void> {
    if (!pdf || !activeDoc) return
    setExporting(true)
    try {
      // Render limpo e fora da tela: nada de borda de campo nem zoom da UI no PNG
      const exportScale = 2
      const out = document.createElement('canvas')
      await renderPage(pdf, page, exportScale, out)
      const ctx = out.getContext('2d')
      if (!ctx) return
      const ink = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-ink')
        .trim()
      ctx.fillStyle = ink || '#181c28'
      for (const field of activeDoc.fields.filter((f) => f.page === page)) {
        const text = field.type === 'check' ? (field.value ? 'X' : '') : field.value
        if (!text) continue
        const px = field.fontSize * exportScale
        ctx.font = `${px}px "JetBrains Mono", monospace`
        ctx.fillText(text, field.x * out.width + px * 0.15, field.y * out.height + px)
      }
      const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve))
      if (!blob) return
      downloadBytes(
        new Uint8Array(await blob.arrayBuffer()),
        `${activeDoc.name}-p${page}.png`,
        'image/png',
      )
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5">
        <Logo />
        <div className="flex items-center gap-3">
          {activeDoc && (
            <span className="hidden font-mono text-xs text-muted-foreground sm:block">
              {activeDoc.name}.pdf
            </span>
          )}
          <Link
            to="/dashboard"
            className="rounded-xl border-2 border-ink bg-highlight px-3 py-1.5 text-xs font-semibold text-ink transition-transform hover:scale-[1.02]"
          >
            Meu painel
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <ToolRail
          docs={docs}
          activeDocId={activeDocId}
          activeTool={activeTool}
          onToolChange={setActiveTool}
          onSelectDoc={setActiveDocId}
          onDeleteDoc={handleDeleteDoc}
          onUpload={handleUpload}
        />

        <CanvasArea
          doc={activeDoc}
          page={page}
          scale={scale}
          rendering={rendering}
          hasAdderTool={activeTool !== null}
          selectedFieldId={selectedFieldId}
          canvasRef={canvasRef}
          onCanvasClick={handleCanvasClick}
          onFieldChange={handleFieldChange}
          onFieldMove={(id, x, y) => {
            const field = activeDoc?.fields.find((f) => f.id === id)
            if (field) handleFieldChange({ ...field, x, y })
          }}
          onFieldSelect={setSelectedFieldId}
          onPageChange={(p) => setPage(clamp(1, activeDoc?.pageCount ?? 1, p))}
          onScaleChange={(s) => setScale(clamp(0.3, 3, Number(s.toFixed(1))))}
        />

        <PropertiesPanel
          doc={activeDoc}
          field={selectedField}
          exporting={exporting}
          onFieldChange={handleFieldChange}
          onFieldDelete={(id) => {
            updateActiveDoc((d) => ({
              ...d,
              fields: d.fields.filter((f) => f.id !== id),
            }))
            setSelectedFieldId(null)
          }}
          onNotesChange={(notes) => updateActiveDoc((d) => ({ ...d, notes }))}
          onExportPdf={handleExportPdf}
          onExportImage={handleExportImage}
        />
      </div>
    </div>
  )
}
