import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { serverFetch } from "@/lib/api";
import {
  CalendarBlank, Plus, VideoCamera,
  Clock, CheckCircle, Pencil
} from "@phosphor-icons/react/dist/ssr";
import { PageShell } from "@/components/ui/PageShell";
import { EmptyState } from "@/components/ui/EmptyState";

interface LessonSummary {
  id: string;
  status: string;
  scheduledAt: string;
  content?: string | null;
  meetLink?: string | null;
  student: { name: string };
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtTime(date: string) {
  return new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default async function LessonsPage() {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/dashboard");

  const [scheduled, completed] = await Promise.all([
    serverFetch<LessonSummary[]>("/api/lessons?status=SCHEDULED"),
    serverFetch<LessonSummary[]>("/api/lessons?status=COMPLETED"),
  ]);

  return (
    <PageShell breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Aulas" }]}>

      <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeUp">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Aulas</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {scheduled.length} agendada{scheduled.length !== 1 ? "s" : ""} · {completed.length} concluída{completed.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/dashboard/lessons/new" className="ui-btn ui-btn-primary ui-btn-md gap-1.5">
            <Plus size={14} weight="bold" /> Nova aula
          </Link>
        </div>

        <section className="mb-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Agendadas</h2>
          {scheduled.length === 0 ? (
            <EmptyState
              className="py-10"
              icon={<CalendarBlank size={28} />}
              title="Nenhuma aula agendada."
              action={
                <Link href="/dashboard/lessons/new" className="ui-btn ui-btn-primary ui-btn-sm inline-flex gap-1">
                  <Plus size={13} /> Agendar aula
                </Link>
              }
            />
          ) : (
            <div className="flex flex-col gap-2">
              {scheduled.map((lesson) => (
                <div key={lesson.id} className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/lessons/${lesson.id}`}
                    className="flex-1 flex items-center gap-3 px-4 py-3 bg-brand-light border border-indigo-200 rounded-xl hover:border-brand transition-all duration-150 min-w-0"
                  >
                    <Clock size={16} weight="bold" className="text-brand shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{lesson.student.name}</p>
                      <p className="text-xs text-slate-500 truncate">{lesson.content ?? "Aula agendada"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-slate-700">{fmt(lesson.scheduledAt)}</p>
                      <p className="text-xs text-slate-400">{fmtTime(lesson.scheduledAt)}</p>
                    </div>
                  </Link>
                  <div className="flex gap-1 shrink-0">
                    {lesson.meetLink && (
                      <a href={lesson.meetLink} target="_blank" rel="noopener" className="ui-btn ui-btn-outline ui-btn-xs gap-1">
                        <VideoCamera size={11} /> Meet
                      </a>
                    )}
                    <Link href={`/dashboard/lessons/${lesson.id}/edit`} className="ui-btn ui-btn-ghost ui-btn-xs">
                      <Pencil size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {completed.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Concluídas</h2>
            <div className="flex flex-col gap-2">
              {completed.map((lesson) => (
                <div key={lesson.id} className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/lessons/${lesson.id}`}
                    className="flex-1 flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all duration-150 min-w-0"
                  >
                    <CheckCircle size={16} weight="fill" className="text-emerald-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{lesson.student.name}</p>
                      <p className="text-xs text-slate-500 truncate">{lesson.content ?? "Aula concluída"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-slate-700">{fmt(lesson.scheduledAt)}</p>
                      <p className="text-xs text-slate-400">{fmtTime(lesson.scheduledAt)}</p>
                    </div>
                  </Link>
                  <Link href={`/dashboard/lessons/${lesson.id}/edit`} className="ui-btn ui-btn-ghost ui-btn-xs shrink-0">
                    <Pencil size={12} />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
}
