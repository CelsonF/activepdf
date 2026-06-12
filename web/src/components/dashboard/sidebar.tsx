import { Link } from '@tanstack/react-router'
import { FileText, LayoutDashboard, Settings, Sparkles } from 'lucide-react'

import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'

const MENU = [
  { label: 'Painel', icon: LayoutDashboard, to: '/dashboard', active: true },
  { label: 'Editor', icon: FileText, to: '/tool', active: false },
  { label: 'Configurações', icon: Settings, to: '/dashboard', active: false },
] as const

export function Sidebar() {
  return (
    <aside className="hidden flex-col gap-6 border-r border-border bg-surface p-5 lg:flex">
      <Logo />

      <nav className="flex flex-col gap-1">
        {MENU.map(({ label, icon: Icon, to, active }) => (
          <Link
            key={label}
            to={to}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
              active
                ? 'bg-ink text-highlight'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border-2 border-ink bg-highlight p-4">
        <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
          <Sparkles className="h-4 w-4" /> Grifo Pro
        </p>
        <p className="mt-1.5 text-xs text-ink/80">
          Turmas, correção e relatórios para professores. Em breve.
        </p>
        <Link
          to="/tool"
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-ink px-3 py-2 text-xs font-semibold text-highlight transition-transform hover:scale-[1.02]"
        >
          Continuar grátis
        </Link>
      </div>
    </aside>
  )
}
