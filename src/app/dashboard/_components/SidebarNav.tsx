"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  FilePdf,
  Trophy,
  Sparkle,
  Gear,
  Lifebuoy,
  SignOut,
  UploadSimple,
  Flame,
  PencilLine,
  Chalkboard,
  UsersThree,
  Books,
  ClipboardText,
  ChartBar,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

const STUDENT_NAV: NavItem[] = [
  { href: "/dashboard", icon: <SquaresFour size={18} weight="bold" />, label: "Painel" },
  { href: "/dashboard/pdfs", icon: <FilePdf size={18} weight="bold" />, label: "Meus PDFs" },
  { href: "/dashboard/exercises", icon: <PencilLine size={18} weight="bold" />, label: "Exercícios", badge: 3 },
  { href: "/dashboard/ranking", icon: <Trophy size={18} weight="bold" />, label: "Ranking" },
  { href: "/dashboard/achievements", icon: <Sparkle size={18} weight="bold" />, label: "Conquistas" },
];

const TEACHER_NAV: NavItem[] = [
  { href: "/dashboard", icon: <SquaresFour size={18} weight="bold" />, label: "Painel" },
  { href: "/dashboard/classes", icon: <Chalkboard size={18} weight="bold" />, label: "Turmas" },
  { href: "/dashboard/students", icon: <UsersThree size={18} weight="bold" />, label: "Alunos" },
  { href: "/dashboard/library", icon: <Books size={18} weight="bold" />, label: "Biblioteca" },
  { href: "/dashboard/corrections", icon: <ClipboardText size={18} weight="bold" />, label: "Correções", badge: 23 },
  { href: "/dashboard/reports", icon: <ChartBar size={18} weight="bold" />, label: "Relatórios" },
];

const ACCOUNT_NAV: NavItem[] = [
  { href: "/dashboard/settings", icon: <Gear size={18} weight="bold" />, label: "Configurações" },
  { href: "/help", icon: <Lifebuoy size={18} weight="bold" />, label: "Ajuda e suporte" },
];

interface Props {
  role: string;
  streakDays?: number;
  pendingCorrections?: number;
}

export function SidebarNav({ role, streakDays = 12, pendingCorrections = 23 }: Props) {
  const path = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? path === "/dashboard" : path.startsWith(href);

  const renderItem = (item: NavItem) => {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors",
          active && "bg-brand-light text-brand font-semibold hover:bg-brand-light hover:text-brand"
        )}
      >
        <span className={cn("shrink-0", active ? "text-brand" : "text-slate-400")}>{item.icon}</span>
        <span className="flex-1">{item.label}</span>
        {item.badge != null && (
          <span className="ml-auto text-[11px] font-bold bg-brand text-white rounded-full px-1.5 py-0.5 leading-none min-w-[18px] text-center">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  const nav = role === "teacher" ? TEACHER_NAV : STUDENT_NAV;

  return (
    <nav className="flex-1 flex flex-col overflow-y-auto">
      {/* Primary CTA */}
      <div className="px-3 pt-3 pb-2">
        <Link
          href={role === "teacher" ? "/dashboard/corrections" : "/dashboard/pdfs/new"}
          className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl bg-brand text-white text-[13px] font-semibold hover:bg-brand-dark transition-colors"
        >
          <UploadSimple size={16} weight="bold" />
          {role === "teacher" ? "Atribuir PDF" : "Carregar PDF"}
        </Link>
      </div>

      {/* Main nav */}
      <div className="px-3 py-1 flex flex-col gap-0.5">
        {nav.map(renderItem)}
      </div>

      {/* CONTA section */}
      <div className="px-3 mt-auto pt-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-1.5">Conta</p>
        <div className="flex flex-col gap-0.5">
          {ACCOUNT_NAV.map(renderItem)}
        </div>
      </div>

      {/* Bottom alert card */}
      <div className="px-3 pt-3 pb-2">
        {role === "teacher" ? (
          <Link
            href="/dashboard/corrections"
            className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            <ClipboardText size={16} weight="bold" className="text-amber-600 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-[12.5px] font-bold text-amber-700 leading-snug">{pendingCorrections} para corrigir</p>
              <p className="text-[11px] text-amber-600 leading-snug">Abrir a fila de correção</p>
            </div>
          </Link>
        ) : (
          <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
            <Flame size={16} weight="bold" className="text-amber-600 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-[12.5px] font-bold text-amber-700 leading-snug">Streak de {streakDays} dias</p>
              <p className="text-[11px] text-amber-600 leading-snug">Pratique hoje para manter!</p>
            </div>
          </div>
        )}
      </div>

      {/* Sair */}
      <div className="px-3 pb-4">
        <LogoutLink />
      </div>
    </nav>
  );
}

export function LogoutLink() {
  async function handle() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }
  return (
    <button
      onClick={handle}
      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-[13.5px] font-medium text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
    >
      <SignOut size={18} weight="bold" className="shrink-0" />
      <span>Sair</span>
    </button>
  );
}
