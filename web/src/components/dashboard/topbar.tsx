import { Bell, Search } from 'lucide-react'

export function Topbar() {
  return (
    <header className="flex items-center gap-4 border-b border-border bg-surface px-6 py-4">
      <h1 className="text-lg font-bold sm:text-xl">Seu painel</h1>

      <label className="ml-auto hidden max-w-xs flex-1 items-center gap-2 rounded-xl border border-input bg-card px-3 py-2 sm:flex">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Buscar folha..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </label>

      <button
        type="button"
        aria-label="Notificações"
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
      </button>

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink font-mono text-sm font-bold text-highlight">
        VG
      </div>
    </header>
  )
}
