import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { serverFetch } from "@/lib/api";
import {
  ChartBar,
  Lightning,
  Flame,
  CheckCircle,
  Warning,
  PencilLine,
  Chalkboard,
  ArrowRight,
  Circle,
} from "@phosphor-icons/react/dist/ssr";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";

interface StudentReport {
  id: string;
  name: string;
  email: string;
  plan: { level: string; objective: string } | null;
  xp: number;
  level: number;
  streak: number;
  lastActiveAt: string | null;
  activityStatus: "active" | "at_risk" | "inactive";
  lessonsCompleted: number;
  lessonsTotal: number;
  exCompleted: number;
  exTotal: number;
  avgGrade: number | null;
}

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000];

function xpPct(level: number, xp: number) {
  const curr = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const next =
    LEVEL_THRESHOLDS[level] ??
    LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  if (xp >= next) return 100;
  return Math.round(((xp - curr) / (next - curr)) * 100);
}

function fmtRelative(date: string | null) {
  if (!date) return "Nunca";
  const days = Math.floor(
    (Date.now() - new Date(date).getTime()) / 86_400_000
  );
  if (days === 0) return "Hoje";
  if (days === 1) return "Ontem";
  if (days < 7) return `${days}d atrás`;
  if (days < 30) return `${Math.floor(days / 7)}sem atrás`;
  return `${Math.floor(days / 30)}m atrás`;
}

function gradeLabel(avg: number | null) {
  if (avg === null) return null;
  if (avg >= 9) return "A";
  if (avg >= 7) return "B";
  if (avg >= 6) return "C";
  if (avg >= 5) return "D";
  return "F";
}

const ACTIVITY_CONFIG = {
  active: {
    label: "Ativo",
    icon: <Circle size={8} weight="fill" className="text-emerald-500" />,
    cls: "text-emerald-600",
  },
  at_risk: {
    label: "Em risco",
    icon: <Warning size={12} weight="fill" className="text-amber-500" />,
    cls: "text-amber-600",
  },
  inactive: {
    label: "Inativo",
    icon: <Circle size={8} weight="fill" className="text-slate-300" />,
    cls: "text-slate-400",
  },
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default async function ReportsPage() {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/dashboard");

  const report = await serverFetch<StudentReport[]>("/api/reports");

  const active = report.filter((s) => s.activityStatus === "active").length;
  const atRisk = report.filter((s) => s.activityStatus === "at_risk").length;
  const inactive = report.filter((s) => s.activityStatus === "inactive").length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 h-[60px] flex items-center gap-3 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
          <ChartBar size={14} weight="bold" color="white" />
        </div>
        <h1 className="font-extrabold text-[15px] text-slate-900 tracking-[-0.3px]">
          Relatórios
        </h1>
        <span className="text-xs text-slate-400 font-medium">
          {report.length} aluno{report.length !== 1 ? "s" : ""}
        </span>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 animate-fadeUp flex flex-col gap-8">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Ativos",
              value: active,
              color: "text-emerald-600",
              bg: "bg-emerald-50 border-emerald-200",
              sub: "últimos 7 dias",
            },
            {
              label: "Em risco",
              value: atRisk,
              color: "text-amber-600",
              bg: "bg-amber-50 border-amber-200",
              sub: "8–14 dias sem atividade",
            },
            {
              label: "Inativos",
              value: inactive,
              color: "text-slate-500",
              bg: "bg-slate-50 border-slate-200",
              sub: "mais de 14 dias",
            },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.bg}`}>
              <p className={`text-2xl font-extrabold tabular-nums ${s.color}`}>
                {s.value}
              </p>
              <p className="text-xs font-semibold text-slate-600">{s.label}</p>
              <p className="text-[11px] text-slate-400">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Student table */}
        {report.length === 0 ? (
          <EmptyState
            className="py-16"
            icon={<ChartBar size={32} />}
            title="Nenhum aluno cadastrado ainda."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {report.map((s) => {
              const activity = ACTIVITY_CONFIG[s.activityStatus];
              const pct = xpPct(s.level, s.xp);
              const grade = gradeLabel(s.avgGrade);

              return (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all px-5 py-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar + status dot */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[12px]">
                        {initials(s.name)}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5">
                        {activity.icon}
                      </span>
                    </div>

                    {/* Name + plan */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-slate-800">
                          {s.name}
                        </p>
                        {s.plan && (
                          <span className="ui-badge ui-badge-sm ui-badge-brand">
                            {s.plan.level}
                          </span>
                        )}
                        <span
                          className={cn(
                            "text-[11px] font-semibold flex items-center gap-1",
                            activity.cls
                          )}
                        >
                          {activity.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {s.email}
                        {s.plan?.objective && (
                          <> · {s.plan.objective}</>
                        )}
                      </p>
                    </div>

                    {/* Last activity + link */}
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400">
                        {fmtRelative(s.lastActiveAt)}
                      </p>
                      <Link
                        href={`/dashboard/students/${s.id}`}
                        className="text-[11px] text-brand font-semibold flex items-center gap-0.5 justify-end mt-0.5 hover:underline"
                      >
                        Ver perfil <ArrowRight size={10} />
                      </Link>
                    </div>
                  </div>

                  {/* Metrics row */}
                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {/* XP + level */}
                    <div className="col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <Lightning size={10} weight="fill" className="text-brand" />
                          Nível {s.level}
                        </span>
                        <span className="text-[11px] text-slate-400 tabular-nums">
                          {s.xp.toLocaleString("pt-BR")} XP
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Aulas */}
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <Chalkboard size={10} /> Aulas
                      </p>
                      <p className="text-sm font-bold text-slate-700 tabular-nums">
                        {s.lessonsCompleted}
                        <span className="text-slate-300 font-normal">
                          /{s.lessonsTotal}
                        </span>
                      </p>
                    </div>

                    {/* Exercícios + nota */}
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <PencilLine size={10} /> Exercícios
                      </p>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-slate-700 tabular-nums">
                          {s.exCompleted}
                          <span className="text-slate-300 font-normal">
                            /{s.exTotal}
                          </span>
                        </p>
                        {grade && (
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded px-1 py-0.5">
                            {grade}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Streak */}
                  {s.streak > 0 && (
                    <div className="mt-2 flex items-center gap-1">
                      <Flame
                        size={12}
                        weight="fill"
                        className="text-amber-500"
                      />
                      <p className="text-[11px] text-amber-600 font-semibold">
                        {s.streak} dias consecutivos
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
