import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft, CalendarBlank, Plus, VideoCamera,
  CheckCircle, Clock, BookOpen, FilePdf, GraduationCap
} from "@phosphor-icons/react/dist/ssr";

function fmt(date: Date) {
  return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtTime(date: Date) {
  return new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/dashboard");

  const student = await prisma.student.findUnique({
    where: { id: params.id, professorId: session.userId },
    include: {
      learningPlan: true,
      subjects: { include: { subject: true } },
      lessons: {
        orderBy: { scheduledAt: "desc" },
        include: { subject: true, vocabularyEntries: true },
      },
    },
  });

  if (!student) notFound();

  const scheduled = student.lessons.filter((l) => l.status === "SCHEDULED").sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const completed = student.lessons.filter((l) => l.status === "COMPLETED");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
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
        <span className="text-sm font-semibold text-slate-700">{student.name}</span>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeUp">
        {/* Student header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center font-bold text-brand text-lg">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{student.name}</h1>
              <p className="text-sm text-slate-500">{student.email} {student.enrollment && `· ${student.enrollment}`}</p>
            </div>
          </div>
          <Link href={`/dashboard/lessons/new?studentId=${student.id}`} className="ui-btn ui-btn-primary ui-btn-md gap-1.5">
            <Plus size={14} weight="bold" /> Nova aula
          </Link>
        </div>

        {/* Learning plan */}
        {student.learningPlan ? (
          <section className="mb-6 p-5 bg-white rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Plano de aprendizado</h2>
              <Link href={`/dashboard/students/${student.id}/plan`} className="ui-btn ui-btn-ghost ui-btn-xs">Editar</Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] text-slate-400 mb-0.5">Nível</p>
                <p className="text-sm font-semibold text-slate-800">{student.learningPlan.level}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 mb-0.5">Livro de referência</p>
                <p className="text-sm font-semibold text-slate-800">{student.learningPlan.bookRef ?? "—"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[11px] text-slate-400 mb-0.5">Objetivo</p>
                <p className="text-sm text-slate-700">{student.learningPlan.objective}</p>
              </div>
              {student.learningPlan.notes && (
                <div className="col-span-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-[11px] font-semibold text-amber-700 mb-0.5">Notas da professora</p>
                  <p className="text-sm text-amber-900">{student.learningPlan.notes}</p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
              {student.subjects.map(({ subject }) => (
                <span key={subject.id} className="ui-badge ui-badge-brand ui-badge-sm">{subject.name}</span>
              ))}
            </div>
          </section>
        ) : (
          <Link href={`/dashboard/students/${student.id}/plan`} className="block mb-6 p-4 bg-white rounded-2xl border border-dashed border-slate-300 text-center hover:border-brand transition-colors">
            <BookOpen size={22} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Nenhum plano criado. <span className="text-brand font-semibold">Criar plano</span></p>
          </Link>
        )}

        {/* Upcoming lessons */}
        {scheduled.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Próximas aulas</h2>
            <div className="flex flex-col gap-2">
              {scheduled.map((lesson) => (
                <div key={lesson.id} className="flex items-center gap-3 p-4 bg-brand-light border border-[#c7d2fe] rounded-xl">
                  <Clock size={16} weight="bold" className="text-brand shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brand">{fmt(lesson.scheduledAt)} às {fmtTime(lesson.scheduledAt)}</p>
                    {lesson.subject && <p className="text-xs text-indigo-600">{lesson.subject.name}</p>}
                    {lesson.content && <p className="text-xs text-slate-600 truncate mt-0.5">{lesson.content}</p>}
                  </div>
                  {lesson.meetLink && (
                    <a href={lesson.meetLink} target="_blank" rel="noopener" className="ui-btn ui-btn-primary ui-btn-xs gap-1 shrink-0">
                      <VideoCamera size={11} /> Meet
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Completed lessons */}
        {completed.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Aulas realizadas ({completed.length})
            </h2>
            <div className="flex flex-col gap-2">
              {completed.map((lesson) => (
                <div key={lesson.id} className="p-4 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={14} weight="fill" className="text-emerald-500 shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">{fmt(lesson.scheduledAt)}</span>
                    {lesson.subject && <span className="text-xs text-slate-400">· {lesson.subject.name}</span>}
                  </div>
                  {lesson.content && <p className="text-sm text-slate-600 pl-5">{lesson.content}</p>}
                  {lesson.homework && (
                    <div className="mt-2 pl-5">
                      <span className="text-[11px] font-semibold text-slate-500">Tarefa: </span>
                      <span className="text-xs text-slate-600">{lesson.homework}</span>
                    </div>
                  )}
                  {lesson.notes && (
                    <div className="mt-2 pl-5 p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                      <p className="text-[11px] font-semibold text-amber-700 mb-0.5">Notas privadas</p>
                      <p className="text-xs text-amber-900">{lesson.notes}</p>
                    </div>
                  )}
                  {lesson.vocabularyEntries.length > 0 && (
                    <div className="mt-2 pl-5">
                      <p className="text-[11px] text-slate-400 mb-1.5">Vocabulário desta aula</p>
                      <div className="flex flex-wrap gap-1.5">
                        {lesson.vocabularyEntries.map((v) => (
                          <span key={v.id} title={v.definition ?? ""} className="ui-badge ui-badge-neutral ui-badge-sm cursor-help">{v.word}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {student.lessons.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <CalendarBlank size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-3">Nenhuma aula criada para este aluno.</p>
            <Link href={`/dashboard/lessons/new?studentId=${student.id}`} className="ui-btn ui-btn-primary ui-btn-sm inline-flex gap-1">
              <Plus size={13} /> Criar primeira aula
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
