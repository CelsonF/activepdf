import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { TeacherData } from "./dashboard-shared";

interface StudentsCardProps {
  students: TeacherData["professor"]["students"];
}

export function StudentsCard({ students }: StudentsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[13px] font-bold text-slate-700">Alunos</h2>
        <Link href="/dashboard/students" className="text-[12px] text-brand font-semibold hover:underline">
          Ver todos
        </Link>
      </div>
      <div className="flex flex-col gap-1.5">
        {students.slice(0, 6).map((s) => (
          <Link key={s.id} href={`/dashboard/students/${s.id}`} className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-violet-600">{s.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-medium text-slate-800 truncate">{s.name}</p>
              {s.learningPlan && (
                <p className="text-[11px] text-slate-400">{s.learningPlan.level}</p>
              )}
            </div>
            <span className="text-[11px] text-slate-400 tabular-nums">{s._count.lessons} aulas</span>
          </Link>
        ))}
      </div>
      {students.length > 6 && (
        <Link href="/dashboard/students" className="flex items-center justify-center gap-1 mt-3 pt-3 border-t border-slate-100 text-[12px] text-brand font-semibold hover:underline">
          +{students.length - 6} alunos <ArrowRight size={11} />
        </Link>
      )}
    </div>
  );
}
