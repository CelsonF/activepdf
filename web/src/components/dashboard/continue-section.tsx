import { Link } from '@tanstack/react-router'
import { FileText, Upload } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import type { ToolDoc } from '@/lib/tool-storage'

const PENS = [
  'var(--color-pen-blue)',
  'var(--color-pen-green)',
  'var(--color-pen-orange)',
  'var(--color-pen-red)',
] as const

function progressOf(doc: ToolDoc): number {
  if (doc.fields.length === 0) return 0
  const filled = doc.fields.filter((f) => f.value !== '').length
  return Math.round((filled / doc.fields.length) * 100)
}

interface Props {
  docs: ToolDoc[] | undefined
  loading: boolean
}

export function ContinueSection({ docs, loading }: Props) {
  return (
    <section>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Continue de onde parou
      </p>

      {loading && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ContinueCardSkeleton />
          <ContinueCardSkeleton />
        </div>
      )}

      {!loading && docs && docs.length === 0 && (
        <Link
          to="/tool"
          className="mt-4 flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center transition-colors hover:border-ink"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-highlight">
            <Upload className="h-5 w-5" />
          </span>
          <p className="text-base font-semibold">Nenhuma folha por aqui ainda</p>
          <p className="text-sm text-muted-foreground">
            Envie seu primeiro PDF e ele aparece nesta lista.
          </p>
        </Link>
      )}

      {!loading && docs && docs.length > 0 && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {docs.map((doc, i) => {
            const pen = PENS[i % PENS.length]
            const progress = progressOf(doc)
            return (
              <Link
                key={doc.id}
                to="/tool"
                search={{ doc: doc.id }}
                className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: pen }}
                  >
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold leading-tight">
                      {doc.name}
                    </h3>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {doc.pageCount} pág · {doc.fields.length} campos
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-secondary">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${progress}%`, backgroundColor: pen }}
                  />
                </div>
                <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                  {progress}% preenchido
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}

export function ContinueCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="mt-4 h-2 w-full rounded-full" />
      <Skeleton className="mt-2 h-3 w-16" />
    </div>
  )
}
