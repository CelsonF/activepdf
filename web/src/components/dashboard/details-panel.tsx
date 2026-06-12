import { Link } from '@tanstack/react-router'
import { Flame, Upload } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import type { ToolDoc } from '@/lib/tool-storage'

function activeDays(docs: ToolDoc[]): number {
  return new Set(docs.map((d) => d.updatedAt.slice(0, 10))).size
}

interface Props {
  docs: ToolDoc[] | undefined
  loading: boolean
}

export function DetailsPanel({ docs, loading }: Props) {
  if (loading || !docs) return <DetailsPanelSkeleton />

  const fields = docs.reduce((sum, d) => sum + d.fields.length, 0)
  const filled = docs.reduce(
    (sum, d) => sum + d.fields.filter((f) => f.value !== '').length,
    0,
  )

  return (
    <aside className="hidden flex-col gap-4 overflow-y-auto border-l border-border bg-surface p-5 xl:flex">
      <div className="rounded-2xl bg-background p-3">
        <div className="flex items-center gap-3 rounded-xl bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink font-mono text-sm font-bold text-highlight">
            VG
          </div>
          <div>
            <p className="text-sm font-semibold">Visitante</p>
            <p className="text-xs text-muted-foreground">
              Folhas salvas neste dispositivo
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-background p-3">
        <div className="flex items-center gap-3 rounded-xl bg-card p-4">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: 'var(--color-pen-orange)' }}
          >
            <Flame className="h-5 w-5" />
          </span>
          <div>
            <p className="font-mono text-xl font-bold">{activeDays(docs)}</p>
            <p className="text-xs text-muted-foreground">dias de prática</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-background p-3">
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-card p-4 text-center">
          <Stat value={docs.length} label="folhas" />
          <Stat value={fields} label="campos" />
          <Stat value={filled} label="respostas" />
        </div>
      </div>

      <Link
        to="/tool"
        className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink bg-highlight px-4 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
      >
        <Upload className="h-4 w-4" /> Soltar novo PDF
      </Link>
    </aside>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="font-mono text-xl font-bold">{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
    </div>
  )
}

function DetailsPanelSkeleton() {
  return (
    <aside className="hidden flex-col gap-4 border-l border-border bg-surface p-5 xl:flex">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-2xl bg-background p-3">
          <div className="flex items-center gap-3 rounded-xl bg-card p-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex-1">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </aside>
  )
}
