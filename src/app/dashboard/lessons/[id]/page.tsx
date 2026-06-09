import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { serverFetch } from "@/lib/api";
import {
  FilePdf, ArrowLeft, VideoCamera,
  CheckCircle, Clock, Pencil, BookOpen, NoteBlank
} from "@phosphor-icons/react/dist/ssr";
import { DeleteLessonButton, MarkCompleteButton } from "./_components";

function fmt(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}
function fmtTime(date: string) {
  return new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default async function LessonDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/dashboard");

  let lesson: any;
  try {
    lesson = await serverFetch(`/api/lessons/${params.id}`);
  } catch {
    notFound();
  }

  const isScheduled = lesson.status === "SCHEDULED";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 h-[52px] flex items-center gap-3 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
          <FilePdf size={14} weight="bold" color="white" />
        </div>
        <span className="font-extrabold text-[15px] text-slate-900 tracking-[-0.3px]">ActivePDF</span>
        <div className="ui-divider" />
        <Link href="/dashboard/lessons" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={14} /> Aulas
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-semibold text-slate-700 truncate max-w-[200px]">
          {lesson.student.name}
        </span>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 animate-fadeUp">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isScheduled
                ? <span className="ui-badge ui-badge-brand ui-badge-sm flex items-center gap-1"><Clock size={10} weight="bold" /> Agendada</span>
                : <span className="ui-badge ui-badge-success ui-badge-sm flex items-center gap-1"><CheckCircle size={10} weight="fill" /> Concluída</span>
              }
            </div>
            <h1 className="text-xl font-bold text-slate-900">{fmt(lesson.scheduledAt)}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{fmtTime(lesson.scheduledAt)}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/lessons/${lesson.id}/edit`} className="ui-btn ui-btn-outline ui-btn-md gap-1.5">
              <Pencil size={13} /> Editar
            </Link>
            <DeleteLessonButton lessonId={lesson.id} studentId={lesson.studentId} />
          </div>
        </div>

        <Link
          href={`/dashboard/students/${lesson.student.id}`}
          className="flex items-center gap-3 p-4 mb-5 bg-white rounded-xl border border-slate-200 hover:border-brand transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center font-bold text-brand">
            {lesson.student.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800">{lesson.student.name}</p>
            <p className="text-xs text-slate-400">{lesson.student.email}</p>
          </div>
          <ArrowLeft size={14} className="text-slate-300 rotate-180" />
        </Link>

        <div className="flex flex-col gap-4">
          {lesson.meetLink && (
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
              <VideoCamera size={16} weight="bold" className="text-brand shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 mb-0.5">Link do Meet</p>
                <p className="text-sm text-slate-700 truncate">{lesson.meetLink}</p>
              </div>
              <a href={lesson.meetLink} target="_blank" rel="noopener" className="ui-btn ui-btn-primary ui-btn-sm gap-1 shrink-0">
                <VideoCamera size={12} /> Entrar
              </a>
            </div>
          )}

          {lesson.content && (
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={14} weight="bold" className="text-slate-400" />
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Conteúdo da aula</p>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{lesson.content}</p>
            </div>
          )}

          {lesson.homework && (
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <NoteBlank size={14} weight="bold" className="text-slate-400" />
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Lição de casa</p>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{lesson.homework}</p>
            </div>
          )}

          {lesson.notes && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-[11px] font-semibold text-amber-700 mb-1.5 uppercase tracking-wide">Notas privadas</p>
              <p className="text-sm text-amber-900 whitespace-pre-wrap">{lesson.notes}</p>
            </div>
          )}

          {lesson.vocabularyEntries.length > 0 && (
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Vocabulário ({lesson.vocabularyEntries.length})
              </p>
              <div className="flex flex-col gap-2">
                {lesson.vocabularyEntries.map((v: any) => (
                  <div key={v.id} className="flex gap-3 py-2 border-b border-slate-100 last:border-0">
                    <span className="text-sm font-semibold text-slate-800 w-32 shrink-0">{v.word}</span>
                    <div className="flex-1 min-w-0">
                      {v.definition && <p className="text-sm text-slate-600">{v.definition}</p>}
                      {v.example && <p className="text-xs text-slate-400 italic mt-0.5">"{v.example}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {isScheduled && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <MarkCompleteButton lessonId={lesson.id} />
          </div>
        )}
      </div>
    </div>
  );
}
