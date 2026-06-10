import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { StatusBadge } from "./StatusBadge";
import type { TeacherData } from "./dashboard-shared";

interface RecentExercisesListProps {
  exercises: TeacherData["exercises"];
}

export function RecentExercisesList({ exercises }: RecentExercisesListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-bold text-slate-700">Exercícios recentes</h2>
        <Link href="/dashboard/exercises" className="text-[12px] text-brand font-semibold hover:underline flex items-center gap-1">
          Ver todos <ArrowRight size={11} />
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {exercises.slice(0, 5).map((ex) => (
          <div key={ex.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-800 truncate">{ex.title}</p>
              {ex.student && <p className="text-[11px] text-slate-400">{ex.student.name}</p>}
            </div>
            <StatusBadge status={ex.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
