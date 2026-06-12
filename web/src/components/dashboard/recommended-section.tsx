import { Link } from '@tanstack/react-router'
import { BookOpenCheck, ListChecks, PencilLine } from 'lucide-react'

const TEMPLATES = [
  {
    icon: PencilLine,
    pen: 'var(--color-pen-blue)',
    title: 'Ditado / lacunas',
    description: 'Campos de texto sobre frases incompletas.',
  },
  {
    icon: ListChecks,
    pen: 'var(--color-pen-green)',
    title: 'Múltipla escolha',
    description: 'Marcações de certo/errado sobre a folha.',
  },
  {
    icon: BookOpenCheck,
    pen: 'var(--color-pen-orange)',
    title: 'Prova com data e nota',
    description: 'Cabeçalho com data, número e identificação.',
  },
] as const

export function RecommendedSection() {
  return (
    <section>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Sugestões para começar
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {TEMPLATES.map(({ icon: Icon, pen, title, description }) => (
          <Link
            key={title}
            to="/tool"
            className="rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-lg"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: pen }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <h3 className="mt-3 text-sm font-semibold leading-tight">{title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
