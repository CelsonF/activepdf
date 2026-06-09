import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { serverFetch } from "@/lib/api";
import { FilePdf, ArrowLeft, GraduationCap, Plus, ArrowRight } from "@phosphor-icons/react/dist/ssr";

interface Student {
  id: string;
  name: string;
  email: string;
}

export default async function StudentsPage() {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/dashboard");

  const students = await serverFetch<Student[]>("/api/students");

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
        <span className="text-sm font-semibold text-slate-700">Alunos</span>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeUp">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Alunos</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {students.length} aluno{students.length !== 1 ? "s" : ""} cadastrado{students.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/dashboard/students/new" className="ui-btn ui-btn-primary ui-btn-md gap-1.5">
            <Plus size={14} weight="bold" /> Novo aluno
          </Link>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-slate-300">
            <GraduationCap size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-4">Nenhum aluno cadastrado ainda.</p>
            <Link href="/dashboard/students/new" className="ui-btn ui-btn-primary ui-btn-sm inline-flex gap-1.5">
              <Plus size={13} weight="bold" /> Adicionar primeiro aluno
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {students.map((student) => (
              <Link
                key={student.id}
                href={`/dashboard/students/${student.id}`}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-brand hover:shadow-sm transition-all duration-150"
              >
                <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center shrink-0 font-bold text-violet-600 text-sm">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{student.name}</p>
                  <p className="text-xs text-slate-400 truncate">{student.email}</p>
                </div>
                <ArrowRight size={14} className="text-slate-300 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
