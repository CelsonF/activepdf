import Link from "next/link";
import { CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import { fmt, fmtTime, type StudentData } from "./dashboard-shared";

interface StudentLessonsCardProps {
  lessons: StudentData["student"]["lessons"];
}

export function StudentLessonsCard({ lessons }: StudentLessonsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h2 className="text-[13px] font-bold text-slate-700 mb-3">Próximas aulas</h2>
      <div className="flex flex-col gap-2">
        {lessons.slice(0, 3).map((lesson) => (
          <div
            key={lesson.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-brand-light border border-indigo-200 hover:border-brand transition-all duration-150"
          >
            <CalendarBlank size={16} weight="bold" className="text-brand shrink-0" />
            <Link href={`/dashboard/lessons/${lesson.id}`} className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-brand">{fmt(lesson.scheduledAt)} às {fmtTime(lesson.scheduledAt)}</p>
              {lesson.subject && <p className="text-xs text-indigo-600">{lesson.subject.name}</p>}
              {lesson.content && <p className="text-xs text-slate-600 truncate">{lesson.content}</p>}
            </Link>
            {lesson.meetLink && (
              <a href={lesson.meetLink} target="_blank" rel="noopener noreferrer" className="ui-btn ui-btn-primary ui-btn-xs shrink-0">
                Meet
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
