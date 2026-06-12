import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { serverFetch } from "@/lib/api";
import { Chalkboard, UsersThree, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClassesPageClient, DeleteClassButton } from "./_components";

interface ClassItem {
  id: string;
  name: string;
  description: string | null;
  studentCount: number;
  createdAt: string;
  students: { id: string; name: string }[];
}

interface StudentBasic {
  id: string;
  name: string;
  email: string;
}

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export default async function ClassesPage() {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/dashboard");

  const [classes, students] = await Promise.all([
    serverFetch<ClassItem[]>("/api/classes"),
    serverFetch<StudentBasic[]>("/api/students"),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 h-[60px] flex items-center gap-3 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
          <Chalkboard size={14} weight="bold" color="white" />
        </div>
        <h1 className="font-extrabold text-[15px] text-slate-900 tracking-[-0.3px]">
          Turmas
        </h1>
        <span className="text-xs text-slate-400 font-medium">
          {classes.length} turma{classes.length !== 1 ? "s" : ""}
        </span>

        <div className="ml-auto">
          <ClassesPageClient students={students} />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeUp">
        {classes.length === 0 ? (
          <EmptyState
            className="py-20"
            icon={
              <span className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Chalkboard size={28} className="text-blue-400" />
              </span>
            }
            title="Nenhuma turma ainda"
            description="Organize seus alunos em turmas para facilitar o acompanhamento."
            action={<ClassesPageClient students={students} />}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all flex flex-col"
              >
                {/* Card header */}
                <div className="px-5 pt-5 pb-4 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <Chalkboard size={18} weight="fill" className="text-blue-600" />
                    </div>
                    <DeleteClassButton id={cls.id} />
                  </div>

                  <p className="text-sm font-bold text-slate-800 mb-0.5">
                    {cls.name}
                  </p>
                  {cls.description && (
                    <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                      {cls.description}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <UsersThree size={11} />
                    {cls.studentCount} aluno{cls.studentCount !== 1 ? "s" : ""}
                    <span>·</span>
                    {fmtDate(cls.createdAt)}
                  </div>

                  {/* Student avatars */}
                  {cls.students.length > 0 && (
                    <div className="flex items-center mt-3 -space-x-1.5">
                      {cls.students.slice(0, 5).map((s) => (
                        <div
                          key={s.id}
                          title={s.name}
                          className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-blue-700 shrink-0"
                        >
                          {initials(s.name)}
                        </div>
                      ))}
                      {cls.studentCount > 5 && (
                        <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-500 shrink-0">
                          +{cls.studentCount - 5}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div className="px-5 py-3 border-t border-slate-100">
                  <Link
                    href={`/dashboard/classes/${cls.id}`}
                    className="ui-btn ui-btn-secondary ui-btn-sm gap-1 w-full justify-center"
                  >
                    Ver turma <ArrowRight size={12} weight="bold" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
