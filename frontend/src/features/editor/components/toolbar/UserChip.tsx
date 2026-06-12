"use client";
import { BookOpen, GraduationCap, SignOut, SquaresFour } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { useEditor } from "../../store";
import type { EditorSession } from "@/types";

interface UserChipProps {
  session: EditorSession | null;
}

export function UserChip({ session }: UserChipProps) {
  const resetPdf = useEditor((s) => s.resetPdf);

  async function handleLogout() {
    if (!confirm("Sair da sessão?")) return;
    resetPdf();
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
        <a href="/login" className="ui-btn ui-btn-ghost ui-btn-xs">Entrar</a>
        <a href="/register" className="ui-btn ui-btn-primary ui-btn-xs">Criar conta grátis</a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
      <Tooltip content="Ir para o painel">
        <a href="/dashboard" className="ui-btn ui-btn-ghost ui-btn-xs gap-1">
          <SquaresFour size={12} /> Painel
        </a>
      </Tooltip>
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200">
        {session.role === "teacher"
          ? <GraduationCap size={12} weight="bold" className="text-brand" />
          : <BookOpen size={12} weight="bold" className="text-emerald-600" />}
        <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate">{session.name}</span>
      </div>
      <Tooltip content="Sair">
        <Button variant="ghost" size="xs" icon={<SignOut size={12} />} onClick={handleLogout} />
      </Tooltip>
    </div>
  );
}
