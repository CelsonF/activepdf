import { MagnifyingGlass, Bell } from "@phosphor-icons/react/dist/ssr";
import { Avatar } from "@/components/ui";

interface TopbarProps {
  initials: string;
}

export function Topbar({ initials }: TopbarProps) {
  return (
    <header className="h-[64px] bg-white/90 backdrop-blur border-b border-slate-200 flex items-center gap-3 px-6 sticky top-0 z-20">
      <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 max-w-[280px] flex-1">
        <MagnifyingGlass size={14} className="text-slate-400 shrink-0" />
        <input
          readOnly
          placeholder="Buscar alunos, aulas..."
          className="bg-transparent outline-none text-[13px] text-slate-500 placeholder:text-slate-400 w-full cursor-default"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          <button className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-white text-slate-800 shadow-sm">PT</button>
          <button className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 hover:text-slate-700">EN</button>
        </div>
        <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <Bell size={17} weight="bold" />
        </button>
        <Avatar name={initials} size={34} />
      </div>
    </header>
  );
}
