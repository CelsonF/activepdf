import { CalendarDays, CheckSquare, FileText, Hash, Trash2, Type, Upload } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { FieldType, ToolDoc } from '@/lib/tool-storage'

const TOOLS: ReadonlyArray<{
  type: FieldType
  label: string
  icon: typeof Type
}> = [
  { type: 'text', label: 'Texto', icon: Type },
  { type: 'check', label: 'Marcação', icon: CheckSquare },
  { type: 'date', label: 'Data', icon: CalendarDays },
  { type: 'number', label: 'Número', icon: Hash },
]

interface Props {
  docs: ToolDoc[]
  activeDocId: string | null
  activeTool: FieldType | null
  onToolChange: (tool: FieldType | null) => void
  onSelectDoc: (id: string) => void
  onDeleteDoc: (id: string) => void
  onUpload: (file: File) => void
}

export function ToolRail({
  docs,
  activeDocId,
  activeTool,
  onToolChange,
  onSelectDoc,
  onDeleteDoc,
  onUpload,
}: Props) {
  return (
    <aside className="flex w-56 shrink-0 flex-col gap-5 overflow-y-auto border-r border-border bg-surface p-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Campos
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {TOOLS.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => onToolChange(activeTool === type ? null : type)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-colors',
                activeTool === type
                  ? 'border-ink bg-ink text-highlight'
                  : 'border-border bg-card text-muted-foreground hover:border-ink hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {activeTool
            ? 'Clique sobre a folha para criar o campo.'
            : 'Escolha um campo e clique sobre a folha.'}
        </p>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Documentos
        </p>
        <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card px-3 py-2.5 text-xs font-semibold transition-colors hover:border-ink">
          <Upload className="h-4 w-4" /> Enviar PDF
          <input
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onUpload(file)
              e.target.value = ''
            }}
          />
        </label>

        <ul className="mt-2 flex flex-col gap-1">
          {docs.map((doc) => (
            <li key={doc.id} className="group flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSelectDoc(doc.id)}
                className={cn(
                  'flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-medium transition-colors',
                  doc.id === activeDocId
                    ? 'bg-ink text-highlight'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate font-mono">{doc.name}</span>
              </button>
              <button
                type="button"
                aria-label={`Excluir ${doc.name}`}
                onClick={() => onDeleteDoc(doc.id)}
                className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-destructive group-hover:flex"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
