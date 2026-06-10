import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { serverFetch } from "@/lib/api";
import { FilePdf, Plus } from "@phosphor-icons/react/dist/ssr";
import { DeleteExerciseButton } from "./_components";
import { PageShell } from "@/components/ui/PageShell";

interface Exercise {
  id: string;
  title: string;
  pdfName: string;
  status: string;
  createdAt: string;
  student: { name: string } | null;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function statusBadge(status: string) {
  if (status === "completed") return { label: "Concluído", cls: "ui-badge-success" };
  if (status === "in_progress") return { label: "Em andamento", cls: "ui-badge-warning" };
  return { label: "Aguardando", cls: "ui-badge-brand" };
}

export default async function ExercisesPage() {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/dashboard");

  const exercises = await serverFetch<Exercise[]>("/api/exercises");

  return (
    <PageShell breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Exercícios" }]}>

      <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeUp">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Exercícios</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {exercises.length} exercício{exercises.length !== 1 ? "s" : ""} criado{exercises.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/dashboard/exercises/new" className="ui-btn ui-btn-primary ui-btn-md gap-1.5">
            <Plus size={14} weight="bold" /> Criar exercício
          </Link>
        </div>

        {exercises.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-slate-300">
            <FilePdf size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-4">Nenhum exercício criado ainda.</p>
            <Link href="/dashboard/exercises/new" className="ui-btn ui-btn-primary ui-btn-sm inline-flex gap-1.5">
              <Plus size={13} weight="bold" /> Criar primeiro exercício
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {exercises.map((ex) => {
              const badge = statusBadge(ex.status);
              return (
                <div
                  key={ex.id}
                  className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <FilePdf size={16} weight="bold" className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{ex.title}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {ex.pdfName}
                      {ex.student ? ` · ${ex.student.name}` : " · Sem aluno"}
                      {" · "}{formatDate(ex.createdAt)}
                    </p>
                  </div>
                  <span className={`ui-badge ui-badge-sm ${badge.cls} shrink-0`}>{badge.label}</span>
                  <DeleteExerciseButton id={ex.id} title={ex.title} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
