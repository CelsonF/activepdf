import Link from "next/link";
import { ArrowRight, BookOpen } from "@phosphor-icons/react/dist/ssr";
import { StatusBadge } from "./StatusBadge";
import type { StudentData } from "./dashboard-shared";

interface PendingExercisesListProps {
  exercises: StudentData["exercises"];
}

export function PendingExercisesList({ exercises }: PendingExercisesListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-bold text-slate-700">Para fazer</h2>
        <Link href="/dashboard/exercises" className="text-[12px] text-brand font-semibold hover:underline flex items-center gap-1">
          Todos <ArrowRight size={11} />
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {exercises.slice(0, 5).map((ex) => (
          <Link
            key={ex.id}
            href={`/dashboard/exercises/${ex.id}`}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-brand hover:shadow-sm transition-all duration-150 group"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center shrink-0">
              <BookOpen size={16} weight="bold" className="text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-800 group-hover:text-brand transition-colors truncate">{ex.title}</p>
              <p className="text-[11px] text-slate-400">{ex.pdfName}</p>
            </div>
            <StatusBadge status={ex.status} />
          </Link>
        ))}
      </div>
    </div>
  );
}
