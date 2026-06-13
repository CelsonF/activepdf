import { FileDown, ImageDown, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { ToolDoc, ToolField } from '@/lib/tool-storage'

interface Props {
  doc: ToolDoc | null
  field: ToolField | null
  exporting: boolean
  onFieldChange: (field: ToolField) => void
  onFieldDelete: (id: string) => void
  onNotesChange: (notes: string) => void
  onExportPdf: () => void
  onExportImage: () => void
}

export function PropertiesPanel({
  doc,
  field,
  exporting,
  onFieldChange,
  onFieldDelete,
  onNotesChange,
  onExportPdf,
  onExportImage,
}: Props) {
  return (
    <aside className="flex w-72 shrink-0 flex-col gap-5 overflow-y-auto border-l border-border bg-surface p-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Propriedades
        </p>
        {field ? (
          <div className="mt-2 flex flex-col gap-3">
            <Labeled label="Rótulo">
              <input
                className="w-full rounded-lg border border-input bg-card px-2.5 py-1.5 text-sm outline-none focus:border-ring"
                value={field.label}
                placeholder="ex.: Nome do aluno"
                onChange={(e) => onFieldChange({ ...field, label: e.target.value })}
              />
            </Labeled>
            {field.type !== 'check' && (
              <Labeled label="Valor">
                <input
                  className="w-full rounded-lg border border-input bg-card px-2.5 py-1.5 font-mono text-sm outline-none focus:border-ring"
                  value={field.value}
                  onChange={(e) => onFieldChange({ ...field, value: e.target.value })}
                />
              </Labeled>
            )}
            <Labeled label={`Tamanho da fonte — ${field.fontSize}px`}>
              <input
                type="range"
                min={8}
                max={48}
                value={field.fontSize}
                onChange={(e) =>
                  onFieldChange({ ...field, fontSize: Number(e.target.value) })
                }
                className="w-full accent-[var(--color-primary)]"
              />
            </Labeled>
            <Labeled label={`Largura — ${Math.round((field.w ?? 0.18) * 100)}% da página`}>
              <input
                type="range"
                min={4}
                max={90}
                value={Math.round((field.w ?? 0.18) * 100)}
                onChange={(e) =>
                  onFieldChange({ ...field, w: Number(e.target.value) / 100 })
                }
                className="w-full accent-[var(--color-primary)]"
              />
            </Labeled>
            <Labeled label={`Altura — ${Math.round((field.h ?? 0.05) * 100)}% da página`}>
              <input
                type="range"
                min={2}
                max={30}
                value={Math.round((field.h ?? 0.05) * 100)}
                onChange={(e) =>
                  onFieldChange({ ...field, h: Number(e.target.value) / 100 })
                }
                className="w-full accent-[var(--color-primary)]"
              />
            </Labeled>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-destructive hover:text-destructive"
              onClick={() => onFieldDelete(field.id)}
            >
              <Trash2 /> Remover campo
            </Button>
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            Selecione um campo sobre a folha para editar rótulo, valor e fonte.
          </p>
        )}
      </div>

      <div className="flex min-h-32 flex-1 flex-col">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Anotações
        </p>
        <textarea
          className="mt-2 w-full flex-1 resize-none rounded-lg border border-input bg-card px-2.5 py-2 text-sm outline-none focus:border-ring"
          placeholder="Notas sobre esta folha..."
          value={doc?.notes ?? ''}
          disabled={!doc}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Button onClick={onExportPdf} disabled={!doc || exporting}>
          <FileDown /> Exportar PDF preenchido
        </Button>
        <Button variant="highlight" onClick={onExportImage} disabled={!doc || exporting}>
          <ImageDown /> Exportar página como PNG
        </Button>
      </div>
    </aside>
  )
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold">{label}</span>
      {children}
    </label>
  )
}
