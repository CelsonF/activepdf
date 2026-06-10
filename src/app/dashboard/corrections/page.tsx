import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { serverFetch } from "@/lib/api";
import {
  ClipboardText,
  ArrowRight,
  CheckCircle,
  Clock,
  Warning,
  Student,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";

interface Exercise {
  id: string;
  title: string;
  pdfName: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  student: { id: string; name: string } | null;
}

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusBadge(status: string) {
  switch (status) {
    case "corrected":
      return { label: "Corrigido", cls: "ui-badge-success" };
    case "completed":
      return { label: "Aguardando correção", cls: "ui-badge-warning" };
    case "in_progress":
      return { label: "Em andamento", cls: "ui-badge-brand" };
    default:
      return { label: "Aguardando", cls: "ui-badge-neutral" };
  }
}

function ExerciseRow({ ex, isPending }: { ex: Exercise; isPending: boolean }) {
  const badge = statusBadge(ex.status);
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
      <div
        className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
          isPending ? "bg-amber-50" : "bg-emerald-50"
        )}
      >
        {isPending ? (
          <ClipboardText
            size={16}
            weight="bold"
            className="text-amber-600"
          />
        ) : (
          <CheckCircle
            size={16}
            weight="bold"
            className="text-emerald-600"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {ex.title}
        </p>
        <p className="text-xs text-slate-400 truncate flex items-center gap-1">
          <Student size={11} />
          {ex.student?.name ?? "Sem aluno"} · {ex.pdfName} ·{" "}
          {fmtDate(ex.createdAt)}
        </p>
      </div>

      <span className={`ui-badge ui-badge-sm ${badge.cls} shrink-0`}>
        {badge.label}
      </span>

      <Link
        href={`/dashboard/corrections/${ex.id}`}
        className={cn(
          "ui-btn ui-btn-sm gap-1 shrink-0",
          isPending ? "ui-btn-primary" : "ui-btn-secondary"
        )}
      >
        {isPending ? "Corrigir" : "Ver"}{" "}
        <ArrowRight size={12} weight="bold" />
      </Link>
    </div>
  );
}

export default async function CorrectionsPage() {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/dashboard");

  const all = await serverFetch<Exercise[]>("/api/exercises");

  const pending = all.filter((e) => e.status === "completed");
  const corrected = all.filter((e) => e.status === "corrected");
  const inProgress = all.filter(
    (e) => e.status === "assigned" || e.status === "in_progress"
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 h-[60px] flex items-center gap-3 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
          <ClipboardText size={14} weight="bold" color="white" />
        </div>
        <h1 className="font-extrabold text-[15px] text-slate-900 tracking-[-0.3px]">
          Correções
        </h1>

        <div className="ml-auto flex items-center gap-3">
          {pending.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
              <Warning size={12} weight="bold" />
              {pending.length} pendente{pending.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeUp flex flex-col gap-8">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Para corrigir",
              value: pending.length,
              color: "text-amber-600",
              bg: "bg-amber-50 border-amber-200",
            },
            {
              label: "Corrigidos",
              value: corrected.length,
              color: "text-emerald-600",
              bg: "bg-emerald-50 border-emerald-200",
            },
            {
              label: "Em andamento",
              value: inProgress.length,
              color: "text-brand",
              bg: "bg-brand-light border-indigo-200",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`rounded-xl border px-4 py-3 ${s.bg}`}
            >
              <p className={`text-2xl font-extrabold tabular-nums ${s.color}`}>
                {s.value}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Pending section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={15} weight="bold" className="text-amber-500" />
            <h2 className="text-sm font-bold text-slate-700">
              Aguardando correção
            </h2>
            {pending.length > 0 && (
              <span className="ml-auto text-[11px] font-bold bg-amber-500 text-white rounded-full px-1.5 py-0.5 leading-none min-w-[18px] text-center">
                {pending.length}
              </span>
            )}
          </div>

          {pending.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300">
              <CheckCircle size={28} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                Nenhum exercício aguardando correção.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {pending.map((ex) => (
                <ExerciseRow key={ex.id} ex={ex} isPending={true} />
              ))}
            </div>
          )}
        </section>

        {/* Corrected section */}
        {corrected.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle
                size={15}
                weight="bold"
                className="text-emerald-500"
              />
              <h2 className="text-sm font-bold text-slate-700">Corrigidos</h2>
              <span className="ml-auto text-[11px] font-semibold text-slate-400">
                {corrected.length} exercício{corrected.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {corrected.map((ex) => (
                <ExerciseRow key={ex.id} ex={ex} isPending={false} />
              ))}
            </div>
          </section>
        )}

        {all.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <ClipboardText size={36} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500 mb-1">
              Nenhum exercício ainda
            </p>
            <p className="text-xs text-slate-400">
              Atribua exercícios aos seus alunos para vê-los aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
