import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { serverFetch } from "@/lib/api";
import { FilePdf, ArrowLeft, Books, Plus, Pencil } from "@phosphor-icons/react/dist/ssr";
import { DeleteSubjectButton } from "./_components";

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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 h-[52px] flex items-center gap-3 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
          <FilePdf size={14} weight="bold" color="white" />
        </div>
        <span className="font-extrabold text-[15px] text-slate-900 tracking-[-0.3px]">ActivePDF</span>
        <div className="ui-divider" />
        <Link href="/dashboard" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={14} /> Dashboard
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-semibold text-slate-700">Matérias</span>
      </header>

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
          <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-slate-300">
            <Books size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-4">Nenhuma matéria cadastrada ainda.</p>
            <Link href="/dashboard/subjects/new" className="ui-btn ui-btn-primary ui-btn-sm inline-flex gap-1.5">
              <Plus size={13} weight="bold" /> Criar primeira matéria
            </Link>
          </div>
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
    </div>
  );
}
