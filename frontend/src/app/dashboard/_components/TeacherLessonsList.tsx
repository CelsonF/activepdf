import Link from "next/link";
import { ArrowRight, CalendarBlank, Plus } from "@phosphor-icons/react/dist/ssr";
import { EmptyState } from "@/components/ui";
import { fmt, fmtTime, type TeacherData } from "./dashboard-shared";

interface TeacherLessonsListProps {
  lessons: TeacherData["professor"]["lessons"];
}

export function TeacherLessonsList({ lessons }: TeacherLessonsListProps) {
  if (lessons.length === 0) {
    return (
      <EmptyState
        className="py-12"
        icon={<CalendarBlank size={32} />}
        title="Nenhuma aula agendada."
        action={
          <Link href="/dashboard/lessons/new" className="ui-btn ui-btn-primary ui-btn-sm inline-flex gap-1">
            <Plus size={13} /> Agendar aula
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-bold text-slate-700">Próximas aulas agendadas</h2>
        <Link href="/dashboard/lessons" className="text-[12px] text-brand font-semibold hover:underline flex items-center gap-1">
          Ver todas <ArrowRight size={11} />
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-brand hover:shadow-sm transition-all duration-150 group"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center shrink-0">
              <CalendarBlank size={18} weight="bold" className="text-brand" />
            </div>
            <Link href={`/dashboard/lessons/${lesson.id}`} className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-semibold text-slate-800 group-hover:text-brand transition-colors truncate">
                  {lesson.student.name}
                </p>
                {lesson.subject && (
                  <span className="ui-badge ui-badge-brand ui-badge-sm shrink-0">{lesson.subject.name}</span>
                )}
              </div>
              <p className="text-[12px] text-slate-500">{fmt(lesson.scheduledAt)} às {fmtTime(lesson.scheduledAt)}</p>
              {lesson.content && <p className="text-[11px] text-slate-400 truncate mt-0.5">{lesson.content}</p>}
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
