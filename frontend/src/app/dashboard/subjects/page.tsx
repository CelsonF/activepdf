import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { serverFetch } from "@/lib/api";
import { Books, Plus, Pencil } from "@phosphor-icons/react/dist/ssr";
import { DeleteSubjectButton } from "./_components";
import { PageShell } from "@/components/ui/PageShell";
import { EmptyState } from "@/components/ui/EmptyState";

interface Subject {
  id: string;
  name: string;
  description: string | null;
  _count: { students: number };
}

export default async function SubjectsPage() {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/dashboard");

  const subjects = await serverFetch<Subject[]>("/api/subjects");

  return (
    <PageShell breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Matérias" }]}>

      <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeUp">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Matérias</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {subjects.length} matéria{subjects.length !== 1 ? "s" : ""} cadastrada{subjects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/dashboard/subjects/new" className="ui-btn ui-btn-primary ui-btn-md gap-1.5">
            <Plus size={14} weight="bold" /> Nova matéria
          </Link>
        </div>

        {subjects.length === 0 ? (
          <EmptyState
            icon={<Books size={32} />}
            title="Nenhuma matéria cadastrada ainda."
            action={
              <Link href="/dashboard/subjects/new" className="ui-btn ui-btn-primary ui-btn-sm inline-flex gap-1.5">
                <Plus size={13} weight="bold" /> Criar primeira matéria
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                  <Books size={16} weight="bold" className="text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{subject.name}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {subject.description ?? "Sem descrição"} · {subject._count.students} aluno{subject._count.students !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href={`/dashboard/subjects/${subject.id}/edit`}
                    className="ui-btn ui-btn-ghost ui-btn-xs gap-1"
                  >
                    <Pencil size={12} /> Editar
                  </Link>
                  <DeleteSubjectButton id={subject.id} name={subject.name} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
