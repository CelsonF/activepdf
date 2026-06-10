import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { serverFetch } from "@/lib/api";
import {
  FilePdf,
  ArrowRight,
  ClipboardText,
  CheckCircle,
  Clock,
  Star,
  PencilLine,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";

interface Exercise {
  id: string;
  title: string;
  pdfName: string;
  status: string;
  createdAt: string;
  professor: { name: string } | null;
}

interface ExerciseWithCorrection extends Exercise {
  correctionJson?: string;
}

const STATUS_MAP: Record<
  string,
  { label: string; badge: string; icon: React.ReactNode; cta: string }
> = {
  assigned: {
    label: "Não iniciado",
    badge: "ui-badge-brand",
    icon: <Clock size={14} className="text-brand" />,
    cta: "Iniciar",
  },
  in_progress: {
    label: "Em andamento",
    badge: "ui-badge-warning",
    icon: <PencilLine size={14} className="text-amber-600" />,
    cta: "Continuar",
  },
  completed: {
    label: "Enviado",
    badge: "ui-badge-neutral",
    icon: <ClipboardText size={14} className="text-slate-500" />,
    cta: "Ver",
  },
  corrected: {
    label: "Corrigido",
    badge: "ui-badge-success",
    icon: <CheckCircle size={14} className="text-emerald-600" />,
    cta: "Ver correção",
  },
};

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function PdfsPage() {
  const session = await getSession();
  if (!session || session.role !== "student") redirect("/dashboard");

  const exercises = await serverFetch<ExerciseWithCorrection[]>(
    "/api/exercises"
  );

  const pending = exercises.filter(
    (e) => e.status === "assigned" || e.status === "in_progress"
  );
  const done = exercises.filter(
    (e) => e.status === "completed" || e.status === "corrected"
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 h-[60px] flex items-center gap-3 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
          <FilePdf size={14} weight="bold" color="white" />
        </div>
        <h1 className="font-extrabold text-[15px] text-slate-900 tracking-[-0.3px]">
          Meus PDFs
        </h1>
        <span className="text-xs text-slate-400 font-medium">
          {exercises.length} exercício{exercises.length !== 1 ? "s" : ""}
        </span>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeUp flex flex-col gap-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Para fazer",
              value: pending.length,
              color: "text-brand",
              bg: "bg-brand-light border-[#c7d2fe]",
            },
            {
              label: "Enviados",
              value: done.filter((e) => e.status === "completed").length,
              color: "text-slate-600",
              bg: "bg-slate-50 border-slate-200",
            },
            {
              label: "Corrigidos",
              value: done.filter((e) => e.status === "corrected").length,
              color: "text-emerald-600",
              bg: "bg-emerald-50 border-emerald-200",
            },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.bg}`}>
              <p className={`text-2xl font-extrabold tabular-nums ${s.color}`}>
                {s.value}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Pending */}
        {pending.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} weight="bold" className="text-brand" />
              <h2 className="text-sm font-bold text-slate-700">Para fazer</h2>
              <span className="ml-auto text-[11px] font-bold bg-brand text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {pending.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {pending.map((ex) => (
                <ExerciseCard key={ex.id} ex={ex} />
              ))}
            </div>
          </section>
        )}

        {/* Done */}
        {done.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={14} weight="bold" className="text-emerald-500" />
              <h2 className="text-sm font-bold text-slate-700">Concluídos</h2>
            </div>
            <div className="flex flex-col gap-2">
              {done.map((ex) => (
                <ExerciseCard key={ex.id} ex={ex} />
              ))}
            </div>
          </section>
        )}

        {exercises.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <FilePdf size={36} className="text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-500 mb-1">
              Nenhum exercício ainda
            </p>
            <p className="text-xs text-slate-400">
              Seu professor ainda não enviou exercícios para você.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ExerciseCard({ ex }: { ex: ExerciseWithCorrection }) {
  const meta = STATUS_MAP[ex.status] ?? STATUS_MAP.assigned;
  const isCorrected = ex.status === "corrected";

  let grade: string | null = null;
  if (isCorrected && ex.correctionJson) {
    try {
      const c = JSON.parse(ex.correctionJson) as { grade?: string };
      grade = c.grade ?? null;
    } catch {
      //
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 bg-white rounded-xl border transition-colors",
        isCorrected
          ? "border-emerald-200 hover:border-emerald-300"
          : "border-slate-200 hover:border-slate-300"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          isCorrected ? "bg-emerald-50" : "bg-brand-light"
        )}
      >
        <FilePdf
          size={18}
          weight="fill"
          className={isCorrected ? "text-emerald-600" : "text-brand"}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {ex.title}
          </p>
          {grade && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 shrink-0">
              <Star size={10} weight="fill" /> {grade}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 truncate">
          {ex.professor?.name ?? "Professor"} · {ex.pdfName} ·{" "}
          {fmtDate(ex.createdAt)}
        </p>
      </div>

      <span className={`ui-badge ui-badge-sm ${meta.badge} shrink-0`}>
        {meta.label}
      </span>

      <Link
        href={`/dashboard/exercises/${ex.id}`}
        className={cn(
          "ui-btn ui-btn-sm gap-1 shrink-0",
          isCorrected ? "ui-btn-secondary" : "ui-btn-primary"
        )}
      >
        {meta.cta} <ArrowRight size={12} weight="bold" />
      </Link>
    </div>
  );
}
