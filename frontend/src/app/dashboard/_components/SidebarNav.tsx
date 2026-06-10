"use client";
import { useState, useEffect } from "react";
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
  Building,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

interface OrgInfo {
  name: string;
  logoUrl: string | null;
}

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

const STUDENT_NAV: NavItem[] = [
  { href: "/dashboard", icon: <SquaresFour size={18} weight="bold" />, label: "Painel" },
  { href: "/dashboard/pdfs", icon: <FilePdf size={18} weight="bold" />, label: "Meus PDFs" },
  { href: "/dashboard/exercises", icon: <PencilLine size={18} weight="bold" />, label: "Exercícios" },
  { href: "/dashboard/ranking", icon: <Trophy size={18} weight="bold" />, label: "Ranking" },
  { href: "/dashboard/achievements", icon: <Sparkle size={18} weight="bold" />, label: "Conquistas" },
];

const TEACHER_NAV: NavItem[] = [
  { href: "/dashboard", icon: <SquaresFour size={18} weight="bold" />, label: "Painel" },
  { href: "/dashboard/classes", icon: <Chalkboard size={18} weight="bold" />, label: "Turmas" },
  { href: "/dashboard/students", icon: <UsersThree size={18} weight="bold" />, label: "Alunos" },
  { href: "/dashboard/library", icon: <Books size={18} weight="bold" />, label: "Biblioteca" },
  { href: "/dashboard/corrections", icon: <ClipboardText size={18} weight="bold" />, label: "Correções" },
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

export function SidebarNav({ role, streakDays = 0, pendingCorrections = 0 }: Props) {
  const path = usePathname();
  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [badgeCount, setBadgeCount] = useState(0);
  const [streakCount, setStreakCount] = useState(streakDays);
  const backendBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  useEffect(() => {
    if (role !== "teacher") return;
    fetch("/api/organization")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: OrgInfo | null) => { if (data) setOrg(data); })
      .catch(() => undefined);
  }, [role]);

  useEffect(() => {
    fetch("/api/exercises")
      .then((r) => (r.ok ? r.json() : []))
      .then((exs: Array<{ status: string }>) => {
        if (role === "teacher") {
          setBadgeCount(exs.filter((e) => e.status === "completed").length);
        } else {
          setBadgeCount(exs.filter((e) => e.status === "assigned" || e.status === "in_progress").length);
        }
      })
      .catch(() => undefined);
  }, [role]);

  useEffect(() => {
    if (role !== "student") return;
    fetch("/api/gamification/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { streak?: number } | null) => {
        if (data?.streak != null) setStreakCount(data.streak);
      })
      .catch(() => undefined);
  }, [role]);

  const badgeHref = role === "teacher" ? "/dashboard/corrections" : "/dashboard/exercises";

  const isActive = (href: string) =>
    href === "/dashboard" ? path === "/dashboard" : path.startsWith(href);

  const renderItem = (item: NavItem) => {
    const active = isActive(item.href);
    const dynamicBadge = item.href === badgeHref && badgeCount > 0 ? badgeCount : (item.badge ?? null);
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
        {dynamicBadge != null && (
          <span className="ml-auto text-[11px] font-bold bg-brand text-white rounded-full px-1.5 py-0.5 leading-none min-w-[18px] text-center">
            {dynamicBadge}
          </span>
        )}
      </Link>
    );
  };

  const nav = role === "teacher" ? TEACHER_NAV : STUDENT_NAV;

  return (
    <nav className="flex-1 flex flex-col overflow-y-auto">

      {/* ── Org branding (teacher only) ── */}
      {role === "teacher" && (
        <div className="px-3 pt-3 pb-2">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-brand/40 hover:bg-brand-light transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
              {org?.logoUrl ? (
                <img
                  src={`${backendBase}${org.logoUrl}`}
                  alt={org.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building size={14} className="text-slate-400" weight="bold" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-slate-800 truncate leading-tight group-hover:text-brand">
                {org?.name ?? "Minha escola"}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">Configurações</p>
            </div>
          </Link>
        </div>
      )}

      {/* Primary CTA */}
      <div className="px-3 pt-3 pb-2">
        <Link
          href={role === "teacher" ? "/dashboard/exercises/new" : "/dashboard/pdfs/new"}
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
              <p className="text-[12.5px] font-bold text-amber-700 leading-snug">
                {badgeCount > 0 ? `${badgeCount} para corrigir` : "Fila de correção"}
              </p>
              <p className="text-[11px] text-amber-600 leading-snug">Abrir a fila de correção</p>
            </div>
          </Link>
        ) : (
          <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
            <Flame size={16} weight="bold" className="text-amber-600 mt-0.5 shrink-0" />
            <div className="min-w-0">
              {streakCount > 0 ? (
                <>
                  <p className="text-[12.5px] font-bold text-amber-700 leading-snug">Streak de {streakCount} dias</p>
                  <p className="text-[11px] text-amber-600 leading-snug">Pratique hoje para manter!</p>
                </>
              ) : (
                <>
                  <p className="text-[12.5px] font-bold text-amber-700 leading-snug">Comece hoje!</p>
                  <p className="text-[11px] text-amber-600 leading-snug">Faça um exercício para ganhar XP</p>
                </>
              )}
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
      className="ui-menu-item"
      data-danger="true"
    >
      <SignOut size={18} weight="bold" className="shrink-0" />
      <span>Sair</span>
    </button>
  );
}
