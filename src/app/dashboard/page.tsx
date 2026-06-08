import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GraduationCap, BookOpen, FilePdf, CalendarBlank, Plus, ArrowRight, VideoCamera, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { LogoutButton } from "./_components/LogoutButton";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

async function TeacherDashboard({ professorId }: { professorId: string }) {
  const [professor, exercises] = await Promise.all([
    prisma.professor.findUnique({
      where: { id: professorId },
      include: {
        students: {
          include: {
            learningPlan: true,
            lessons: { orderBy: { scheduledAt: "asc" }, take: 1, where: { status: "SCHEDULED" } },
            _count: { select: { lessons: true } },
          },
        },
        lessons: {
          where: { status: "SCHEDULED", scheduledAt: { gte: new Date() } },
          orderBy: { scheduledAt: "asc" },
          take: 5,
          include: { student: true, subject: true },
        },
      },
    }),
    prisma.exercise.findMany({
      where: { professorId },
      select: {
        id: true, title: true, pdfName: true, status: true, createdAt: true,
        student: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  if (!professor) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeUp">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Olá, {professor.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-slate-500 mt-0.5">{professor.subject ?? "Professora"} · {professor.students.length} aluno{professor.students.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="ui-btn ui-btn-outline ui-btn-md gap-1.5">
            <FilePdf size={14} weight="bold" /> Criar exercício
          </Link>
          <Link href="/dashboard/students/new" className="ui-btn ui-btn-primary ui-btn-md gap-1.5">
            <Plus size={14} weight="bold" /> Novo aluno
          </Link>
        </div>
      </div>

      {/* Exercises created by teacher */}
      {exercises.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Exercícios criados</h2>
          <div className="flex flex-col gap-2">
            {exercises.map((ex: any) => (
              <div key={ex.id} className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200">
                <div className="w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
                  <FilePdf size={16} weight="bold" className="text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{ex.title}</p>
                  <p className="text-xs text-slate-400">{ex.pdfName}{ex.student ? ` · ${ex.student.name}` : " · Sem aluno"}</p>
                </div>
                <span className={`ui-badge ui-badge-sm ${ex.status === "completed" ? "ui-badge-success" : ex.status === "in_progress" ? "ui-badge-warning" : "ui-badge-brand"}`}>
                  {ex.status === "completed" ? "Concluído" : ex.status === "in_progress" ? "Em andamento" : "Aguardando"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming lessons */}
      {professor.lessons.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Próximas aulas</h2>
          <div className="flex flex-col gap-2">
            {professor.lessons.map((lesson: any) => (
              <div key={lesson.id} className="flex items-center gap-2">
                <Link
                  href={`/dashboard/students/${lesson.studentId}`}
                  className="flex-1 flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200 hover:border-brand hover:bg-brand-light transition-all duration-150 min-w-0"
                >
                  <div className="w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
                    <CalendarBlank size={16} weight="bold" className="text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{lesson.student.name}</p>
                    <p className="text-xs text-slate-500 truncate">{lesson.content ?? "Aula agendada"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-slate-700">{formatDate(lesson.scheduledAt)}</p>
                    <p className="text-xs text-slate-400">{formatTime(lesson.scheduledAt)}</p>
                  </div>
                </Link>
                {lesson.meetLink && (
                  <a href={lesson.meetLink} target="_blank" rel="noopener" className="ui-btn ui-btn-outline ui-btn-xs gap-1 shrink-0">
                    <VideoCamera size={11} /> Meet
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Students */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Meus alunos</h2>
        {professor.students.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <GraduationCap size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Nenhum aluno ainda.</p>
            <Link href="/dashboard/students/new" className="ui-btn ui-btn-primary ui-btn-sm mt-4 inline-flex">
              <Plus size={13} /> Adicionar primeiro aluno
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {professor.students.map((student: any) => {
              const nextLesson = student.lessons[0];
              return (
                <Link
                  key={student.id}
                  href={`/dashboard/students/${student.id}`}
                  className="flex flex-col gap-2 p-4 bg-white rounded-xl border border-slate-200 hover:border-brand hover:shadow-sm transition-all duration-150"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center shrink-0 font-bold text-brand text-sm">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{student.name}</p>
                      <p className="text-xs text-slate-500">{student.learningPlan?.level ?? "Sem plano"}</p>
                    </div>
                    <ArrowRight size={14} className="text-slate-300" />
                  </div>
                  {student.learningPlan && (
                    <p className="text-xs text-slate-500 truncate pl-12">{student.learningPlan.objective}</p>
                  )}
                  <div className="flex items-center gap-3 pl-12 pt-1 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">{student._count.lessons} aula{student._count.lessons !== 1 ? "s" : ""}</span>
                    {nextLesson && (
                      <span className="text-[11px] text-brand font-medium">
                        Próxima: {formatDate(nextLesson.scheduledAt)}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

async function StudentDashboard({ studentId }: { studentId: string }) {
  const [student, exercises] = await Promise.all([
    prisma.student.findUnique({
      where: { id: studentId },
      include: {
        professor: true,
        learningPlan: true,
        subjects: { include: { subject: true } },
        lessons: {
          orderBy: { scheduledAt: "desc" },
          take: 6,
          include: { subject: true, vocabularyEntries: true },
        },
      },
    }),
    prisma.exercise.findMany({
      where: { studentId },
      select: { id: true, title: true, pdfName: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!student) return null;

  const upcoming = student.lessons.filter((l) => l.status === "SCHEDULED").sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const past = student.lessons.filter((l) => l.status === "COMPLETED");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeUp">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Olá, {student.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {student.professor ? `Professor(a): ${student.professor.name}` : "Sem professor vinculado"}
          </p>
        </div>
      </div>

      {/* Exercises assigned by teacher */}
      {exercises.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Exercícios</h2>
          <div className="flex flex-col gap-2">
            {exercises.map((ex) => (
              <Link
                key={ex.id}
                href={`/?exerciseId=${ex.id}`}
                className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200 hover:border-brand hover:bg-brand-light transition-all duration-150"
              >
                <div className="w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
                  <FilePdf size={16} weight="bold" className="text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{ex.title}</p>
                  <p className="text-xs text-slate-400">{ex.pdfName}</p>
                </div>
                <span className={`ui-badge ui-badge-sm ${ex.status === "completed" ? "ui-badge-success" : ex.status === "in_progress" ? "ui-badge-warning" : "ui-badge-brand"}`}>
                  {ex.status === "completed" ? "Concluído" : ex.status === "in_progress" ? "Em andamento" : "Preencher"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Learning plan */}
      {student.learningPlan && (
        <section className="mb-6 p-5 bg-white rounded-2xl border border-slate-200">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Plano de aprendizado</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] text-slate-400 mb-0.5">Nível</p>
              <p className="text-sm font-semibold text-slate-800">{student.learningPlan.level}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 mb-0.5">Livro</p>
              <p className="text-sm font-semibold text-slate-800">{student.learningPlan.bookRef ?? "—"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[11px] text-slate-400 mb-0.5">Objetivo</p>
              <p className="text-sm text-slate-700">{student.learningPlan.objective}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
            {student.subjects.map(({ subject }) => (
              <span key={subject.id} className="ui-badge ui-badge-brand ui-badge-sm">{subject.name}</span>
            ))}
          </div>
        </section>
      )}

      {/* Next lesson */}
      {upcoming[0] && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Próxima aula</h2>
          <div className="p-5 bg-brand-light border border-[#c7d2fe] rounded-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-bold text-brand">
                  {formatDate(upcoming[0].scheduledAt)} às {formatTime(upcoming[0].scheduledAt)}
                </p>
                {upcoming[0].subject && <p className="text-xs text-indigo-600 font-medium mt-0.5">{upcoming[0].subject.name}</p>}
                {upcoming[0].content && <p className="text-sm text-slate-700 mt-2">{upcoming[0].content}</p>}
                {upcoming[0].homework && (
                  <div className="mt-3 p-2.5 bg-white/70 rounded-lg">
                    <p className="text-[11px] font-semibold text-slate-500 mb-0.5">Lição de casa</p>
                    <p className="text-sm text-slate-700">{upcoming[0].homework}</p>
                  </div>
                )}
              </div>
              {upcoming[0].meetLink && (
                <a href={upcoming[0].meetLink} target="_blank" rel="noopener" className="ui-btn ui-btn-primary ui-btn-sm shrink-0 gap-1">
                  <VideoCamera size={13} /> Entrar
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Past lessons */}
      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Aulas anteriores</h2>
          <div className="flex flex-col gap-2">
            {past.map((lesson) => (
              <div key={lesson.id} className="p-4 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={14} weight="fill" className="text-emerald-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700">{formatDate(lesson.scheduledAt)}</span>
                  {lesson.subject && <span className="text-xs text-slate-400">· {lesson.subject.name}</span>}
                </div>
                {lesson.content && <p className="text-sm text-slate-600 truncate pl-5">{lesson.content}</p>}
                {lesson.vocabularyEntries.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 pl-5">
                    {lesson.vocabularyEntries.slice(0, 4).map((v) => (
                      <span key={v.id} className="ui-badge ui-badge-neutral ui-badge-sm">{v.word}</span>
                    ))}
                    {lesson.vocabularyEntries.length > 4 && (
                      <span className="ui-badge ui-badge-neutral ui-badge-sm">+{lesson.vocabularyEntries.length - 4}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 px-4 h-[52px] flex items-center justify-between shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
            <FilePdf size={14} weight="bold" color="white" />
          </div>
          <span className="font-extrabold text-[15px] text-slate-900 tracking-[-0.3px]">ActivePDF</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
            {session.role === "teacher"
              ? <GraduationCap size={12} weight="bold" className="text-brand" />
              : <BookOpen size={12} weight="bold" className="text-emerald-600" />}
            <span className="text-xs font-semibold text-slate-700">{session.name}</span>
          </div>
          <LogoutButton />
        </div>
      </header>

      {session.role === "teacher"
        ? <TeacherDashboard professorId={session.userId} />
        : <StudentDashboard studentId={session.userId} />}
    </div>
  );
}
