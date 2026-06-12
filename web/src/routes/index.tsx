import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  MousePointerClick,
  Upload,
} from 'lucide-react'

import { Logo } from '@/components/logo'

export const Route = createFileRoute('/')({ component: Landing })

const FEATURES = [
  {
    icon: Upload,
    pen: 'var(--color-pen-blue)',
    title: 'Envie qualquer folha',
    description:
      'Solte um PDF — prova, lista de exercícios, formulário — e ele vira a sua área de trabalho na hora.',
  },
  {
    icon: MousePointerClick,
    pen: 'var(--color-pen-orange)',
    title: 'Marque os campos',
    description:
      'Texto, marcação, data ou número: clique sobre o documento e a lacuna nasce ali, como numa prova de verdade.',
  },
  {
    icon: ClipboardCheck,
    pen: 'var(--color-pen-green)',
    title: 'Pratique e exporte',
    description:
      'Responda direto no navegador e exporte o PDF preenchido. Tudo fica salvo no seu dispositivo.',
  },
] as const

const CHECKLIST = [
  'Grátis para começar',
  'Sem cartão de crédito',
  'Funciona no navegador',
] as const

function Landing() {
  return (
    <div className="flex h-screen flex-col bg-highlight/40 text-ink">
      <nav className="flex items-center justify-between px-6 py-4 md:px-10">
        <Logo />
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="hidden rounded-xl px-4 py-2 text-sm font-semibold hover:bg-highlight sm:block"
          >
            Painel
          </Link>
          <Link
            to="/tool"
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-highlight transition-transform hover:scale-[1.02]"
          >
            Abrir o editor
          </Link>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto">
        <section className="mx-auto flex max-w-5xl flex-col items-start gap-8 px-6 py-16 md:px-10 md:py-24">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Marque, pratique, aprenda
          </p>
          <h1 className="font-display text-[clamp(3rem,8vw,7rem)] text-ink">
            Qualquer PDF vira
            <br />
            prática que <span className="text-highlight-mark">engaja.</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            O Grifo transforma a folha que você já tem em exercício interativo.
            Envie um PDF, marque as lacunas e responda direto no navegador —
            sem cadastro, sem instalação.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/tool"
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-base font-semibold text-highlight shadow-lg shadow-ink/20 transition-transform hover:scale-[1.02]"
            >
              <Upload className="h-5 w-5" /> Enviar um PDF agora
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-highlight px-6 py-3.5 text-base font-semibold text-ink transition-transform hover:scale-[1.02]"
            >
              Ver meu painel <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <CheckCircle2
                  className="h-4 w-4"
                  style={{ color: 'var(--color-pen-green)' }}
                />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-20 md:px-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Como funciona
          </p>
          <h2 className="font-display mt-3 text-4xl text-ink md:text-5xl">
            Três passos. Zero atrito.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, pen, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-lg"
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: pen }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold leading-tight">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <footer className="border-t border-border bg-card">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 md:px-10">
            <Logo />
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Grifo — marque, pratique, aprenda.
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
