import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react'

import { FieldBox } from '@/components/tool/field-box'
import { Skeleton } from '@/components/ui/skeleton'
import type { ToolDoc, ToolField } from '@/lib/tool-storage'

interface Props {
  doc: ToolDoc | null
  page: number
  scale: number
  rendering: boolean
  hasAdderTool: boolean
  selectedFieldId: string | null
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  onCanvasClick: (x: number, y: number) => void
  onFieldChange: (field: ToolField) => void
  onFieldMove: (id: string, x: number, y: number) => void
  onFieldSelect: (id: string | null) => void
  onPageChange: (page: number) => void
  onScaleChange: (scale: number) => void
}

export function CanvasArea({
  doc,
  page,
  scale,
  rendering,
  hasAdderTool,
  selectedFieldId,
  canvasRef,
  onCanvasClick,
  onFieldChange,
  onFieldMove,
  onFieldSelect,
  onPageChange,
  onScaleChange,
}: Props) {
  const fields = doc?.fields.filter((f) => f.page === page) ?? []

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-muted">
      <div className="flex flex-1 items-start justify-center overflow-auto p-6">
        {doc ? (
          <div
            className={hasAdderTool ? 'relative cursor-crosshair' : 'relative'}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              if (!hasAdderTool) {
                onFieldSelect(null)
                return
              }
              onCanvasClick(
                (e.clientX - rect.left) / rect.width,
                (e.clientY - rect.top) / rect.height,
              )
            }}
          >
            {/* O canvas nunca sai do DOM: o pdf.js desenha nele entre páginas */}
            <canvas ref={canvasRef} className="rounded-sm bg-white shadow-lg" />
            {fields.map((field) => (
              <FieldBox
                key={field.id}
                field={field}
                scale={scale}
                selected={field.id === selectedFieldId}
                onSelect={() => onFieldSelect(field.id)}
                onChange={onFieldChange}
                onMove={(x, y) => onFieldMove(field.id, x, y)}
              />
            ))}
            {rendering && <Skeleton className="absolute inset-0 rounded-sm" />}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="max-w-xs text-center text-sm text-muted-foreground">
              Envie um PDF na coluna ao lado para começar a marcar campos.
            </p>
          </div>
        )}
      </div>

      {doc && (
        <div className="flex items-center justify-between border-t border-border bg-surface px-4 py-2">
          <div className="flex items-center gap-1">
            <ZoomButton label="Diminuir zoom" onClick={() => onScaleChange(scale - 0.1)}>
              <Minus className="h-4 w-4" />
            </ZoomButton>
            <span className="w-14 text-center font-mono text-xs">
              {Math.round(scale * 100)}%
            </span>
            <ZoomButton label="Aumentar zoom" onClick={() => onScaleChange(scale + 0.1)}>
              <Plus className="h-4 w-4" />
            </ZoomButton>
          </div>

          <div className="flex items-center gap-1">
            <ZoomButton label="Página anterior" onClick={() => onPageChange(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </ZoomButton>
            <span className="w-16 text-center font-mono text-xs">
              {page} / {doc.pageCount}
            </span>
            <ZoomButton label="Próxima página" onClick={() => onPageChange(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </ZoomButton>
          </div>
        </div>
      )}
    </div>
  )
}

function ZoomButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
    </button>
  )
}
