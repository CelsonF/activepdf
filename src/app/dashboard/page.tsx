import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { serverFetch } from "@/lib/api";
import {
  MagnifyingGlass, Bell, Plus, ArrowRight, Lightning, PencilLine,
  Target, Clock, Flame, Trophy, Star, CalendarBlank, ChatCircle,
  Warning, Users, UploadSimple, UserPlus, BookOpen, CheckCircle,
} from "@phosphor-icons/react/dist/ssr";
import { Avatar, ProgressRing } from "@/components/ui";
import { LogoutLink } from "./_components/SidebarNav";
import { cn } from "@/lib/cn";

// ── Constants ────────────────────────────────────────────────────────────────

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000];

function xpPct(level: number, xp: number) {
  const curr = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const next = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  if (xp >= next) return 100;
  return Math.round(((xp - curr) / (next - curr)) * 100);
}

// ── Types ────────────────────────────────────────────────────────────────────

interface GamificationStats {
  xp: number;
  level: number;
  streak: number;
  achievements: Array<{ key: string; label: string; unlockedAt: string }>;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  level: number;
  streak: number;
  rank: number;
}

interface TeacherData {
  professor: {
    id: string;
    name: string;
    students: Array<{
      id: string;
      name: string;
      learningPlan: { level: string } | null;
      lessons: Array<{ id: string; scheduledAt: string; status: string }>;
      _count: { lessons: number };
    }>;
    lessons: Array<{
      id: string;
      scheduledAt: string;
      meetLink: string | null;
      content: string | null;
      student: { id: string; name: string };
      subject: { name: string } | null;
    }>;
  };
  exercises: Array<{
    id: string;
    title: string;
    pdfName: string;
    status: string;
    createdAt: string;
    student: { name: string } | null;
  }>;
  subjectsCount: number;
}

interface StudentData {
  student: {
    id: string;
    name: string;
    professor: { name: string } | null;
    learningPlan: { level: string; objective: string; bookRef: string | null } | null;
    subjects: Array<{ subject: { id: string; name: string } }>;
    lessons: Array<{
      id: string;
      scheduledAt: string;
      status: string;
      content: string | null;
      homework: string | null;
      meetLink: string | null;
      subject: { name: string } | null;
    }>;
  };
  exercises: Array<{
    id: string;
    title: string;
    pdfName: string;
    status: string;
    createdAt: string;
  }>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function fmtTime(date: string) {
  return new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-base">🥇</span>;
  if (rank === 2) return <span className="text-base">🥈</span>;
  if (rank === 3) return <span className="text-base">🥉</span>;
  return <span className="text-[12px] font-bold text-slate-400 w-5 text-center">{rank}</span>;
}

const STATUS_LABEL: Record<string, string> = {
  assigned: "Atribuído",
  in_progress: "Em andamento",
  completed: "Concluído",
};

const STATUS_COLOR: Record<string, string> = {
  assigned: "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-brand-light text-brand border-[#c7d2fe]",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

// ── Student Dashboard ────────────────────────────────────────────────────────

function StudentDashboard({ name, data, gamif }: { name: string; data: StudentData | null; gamif: GamificationStats | null }) {
  const firstName = name.split(" ")[0];
  const student = data?.student;
  const exercises = data?.exercises ?? [];

  const upcoming = student?.lessons
    .filter((l) => l.status === "SCHEDULED" && new Date(l.scheduledAt) >= new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    ?? [];

  const pendingExercises = exercises.filter((e) => e.status !== "completed");
  const completedExercises = exercises.filter((e) => e.status === "completed");

  return (
    <div className="p-6 animate-fadeUp">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Bem-vinda de volta</p>
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Olá, {firstName} 👋</h1>
          {student?.professor && (
            <p className="text-[13px] text-slate-500 mt-0.5">Professora: {student.professor.name}</p>
          )}
        </div>
        <Link href="/dashboard/exercises" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white text-[13px] font-semibold hover:bg-brand-dark transition-colors shadow-sm">
          <UploadSimple size={15} weight="bold" /> Exercícios
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_288px] gap-6">
        {/* ── Left column ── */}
        <div className="flex flex-col gap-5">
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: <PencilLine size={16} weight="bold" className="text-indigo-500" />, bg: "bg-indigo-50", value: exercises.length, label: "Total de exercícios" },
              { icon: <CheckCircle size={16} weight="bold" className="text-emerald-500" />, bg: "bg-emerald-50", value: completedExercises.length, label: "Concluídos" },
              { icon: <Target size={16} weight="bold" className="text-amber-500" />, bg: "bg-amber-50", value: pendingExercises.length, label: "Pendentes" },
              { icon: <CalendarBlank size={16} weight="bold" className="text-blue-500" />, bg: "bg-blue-50", value: upcoming.length, label: "Próximas aulas" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", s.bg)}>{s.icon}</div>
                </div>
                <p className="text-[22px] font-bold text-slate-900 leading-none tabular-nums">{s.value}</p>
                <p className="text-[11px] text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Próxima aula */}
          {upcoming.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-[13px] font-bold text-slate-700 mb-3">Próximas aulas</h2>
              <div className="flex flex-col gap-2">
                {upcoming.slice(0, 3).map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-brand-light border border-[#c7d2fe] hover:border-brand transition-all duration-150"
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
          )}

          {/* Exercícios pendentes */}
          {pendingExercises.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[13px] font-bold text-slate-700">Para fazer</h2>
                <Link href="/dashboard/exercises" className="text-[12px] text-brand font-semibold hover:underline flex items-center gap-1">
                  Todos <ArrowRight size={11} />
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                {pendingExercises.slice(0, 5).map((ex) => (
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
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0", STATUS_COLOR[ex.status] ?? "bg-slate-50 text-slate-500 border-slate-200")}>
                      {STATUS_LABEL[ex.status] ?? ex.status}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {exercises.length === 0 && upcoming.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
              <BookOpen size={36} className="text-slate-300 mb-3" />
              <p className="text-sm text-slate-500 mb-1">Nenhum exercício atribuído ainda.</p>
              <p className="text-xs text-slate-400">Sua professora irá enviar exercícios em breve.</p>
            </div>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-5">
          {/* Plano de aprendizado */}
          {student?.learningPlan && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-[13px] font-bold text-slate-700 mb-3">Meu plano</h2>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-brand-light text-brand text-sm font-bold">
                  {student.learningPlan.level}
                </span>
                {student.learningPlan.bookRef && (
                  <span className="text-xs text-slate-500">{student.learningPlan.bookRef}</span>
                )}
              </div>
              <p className="text-[12.5px] text-slate-600 leading-snug">{student.learningPlan.objective}</p>
              {student.subjects.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
                  {student.subjects.map(({ subject }) => (
                    <span key={subject.id} className="ui-badge ui-badge-brand ui-badge-sm">{subject.name}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Progresso de exercícios */}
          {exercises.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-[13px] font-bold text-slate-700 mb-4">Progresso geral</h2>
              <div className="flex items-center gap-4">
                <ProgressRing
                  size={72}
                  value={Math.round((completedExercises.length / exercises.length) * 100)}
                  stroke={6}
                  color="#4f46e5"
                >
                  <span className="text-[14px] font-bold text-slate-900">
                    {Math.round((completedExercises.length / exercises.length) * 100)}%
                  </span>
                </ProgressRing>
                <div>
                  <p className="text-[14px] font-bold text-slate-800">{completedExercises.length} de {exercises.length}</p>
                  <p className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">exercícios concluídos</p>
                </div>
              </div>
            </div>
          )}

          {/* Gamificação */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={16} weight="fill" className="text-amber-400" />
              <h2 className="text-[13px] font-bold text-slate-700">Progresso</h2>
              {gamif && gamif.streak > 0 && (
                <span className="ml-auto flex items-center gap-1 text-[12px] font-bold text-amber-600">
                  <Flame size={14} weight="fill" /> {gamif.streak}d
                </span>
              )}
            </div>

            {gamif ? (
              <>
                {/* Level + XP bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-bold text-slate-600 flex items-center gap-1">
                      <Lightning size={11} weight="fill" className="text-brand" />
                      Nível {gamif.level}
                    </span>
                    <span className="text-[11px] text-slate-400 tabular-nums">
                      {gamif.xp.toLocaleString("pt-BR")} XP
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full"
                      style={{ width: `${xpPct(gamif.level, gamif.xp)}%` }}
                    />
                  </div>
                  {LEVEL_THRESHOLDS[gamif.level] != null && (
                    <p className="text-[10px] text-slate-400 mt-1 text-right">
                      {LEVEL_THRESHOLDS[gamif.level]!.toLocaleString("pt-BR")} XP para nível {gamif.level + 1}
                    </p>
                  )}
                </div>

                {/* Achievements */}
                {gamif.achievements.length > 0 && (
                  <div className="flex items-center gap-2 py-2 px-3 bg-amber-50 rounded-xl border border-amber-100 mb-3">
                    <Star size={14} weight="fill" className="text-amber-400 shrink-0" />
                    <p className="text-[12px] font-semibold text-amber-700">
                      {gamif.achievements.length} conquista{gamif.achievements.length !== 1 ? "s" : ""} desbloqueada{gamif.achievements.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}

                {/* Quick links */}
                <div className="flex gap-2">
                  <Link
                    href="/dashboard/achievements"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-[12px] font-semibold text-slate-600 hover:border-brand hover:text-brand transition-colors"
                  >
                    <Star size={12} weight="bold" /> Conquistas
                  </Link>
                  <Link
                    href="/dashboard/ranking"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-[12px] font-semibold text-slate-600 hover:border-brand hover:text-brand transition-colors"
                  >
                    <Trophy size={12} weight="bold" /> Ranking
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-[12px] text-slate-400">Complete exercícios para ganhar XP.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Teacher Dashboard ────────────────────────────────────────────────────────

function TeacherDashboard({ name, data, leaderboard }: { name: string; data: TeacherData | null; leaderboard: LeaderboardEntry[] }) {
  const firstName = name.split(" ")[0];
  const professor = data?.professor;
  const exercises = data?.exercises ?? [];
  const studentsTotal = professor?.students.length ?? 0;
  const corrections = exercises.filter((e) => e.status !== "completed").length;
  const upcomingLessons = professor?.lessons ?? [];

  return (
    <div className="p-6 animate-fadeUp">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Área do Professor</p>
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Olá, prof. {firstName} 👋</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            {studentsTotal} alunos · {data?.subjectsCount ?? 0} matérias · {corrections} para corrigir
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/dashboard/students/new" className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 hover:border-brand hover:text-brand transition-colors">
            <UserPlus size={14} weight="bold" /> Novo aluno
          </Link>
          <Link href="/dashboard/lessons/new" className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-brand text-white text-[13px] font-semibold hover:bg-brand-dark transition-colors shadow-sm">
            <Plus size={14} weight="bold" /> Nova aula
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_288px] gap-6">
        {/* ── Left column ── */}
        <div className="flex flex-col gap-5">
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: <Users size={16} weight="bold" className="text-violet-500" />, bg: "bg-violet-50", value: studentsTotal, label: "Alunos ativos" },
              { icon: <PencilLine size={16} weight="bold" className="text-amber-500" />, bg: "bg-amber-50", value: corrections, label: "Para corrigir" },
              { icon: <CalendarBlank size={16} weight="bold" className="text-blue-500" />, bg: "bg-blue-50", value: upcomingLessons.length, label: "Próximas aulas" },
              { icon: <BookOpen size={16} weight="bold" className="text-emerald-500" />, bg: "bg-emerald-50", value: data?.subjectsCount ?? 0, label: "Matérias" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", s.bg)}>{s.icon}</div>
                </div>
                <p className="text-[22px] font-bold text-slate-900 leading-none tabular-nums">{s.value}</p>
                <p className="text-[11px] text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Próximas aulas */}
          {upcomingLessons.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[13px] font-bold text-slate-700">Próximas aulas agendadas</h2>
                <Link href="/dashboard/lessons" className="text-[12px] text-brand font-semibold hover:underline flex items-center gap-1">
                  Ver todas <ArrowRight size={11} />
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                {upcomingLessons.map((lesson) => (
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
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
              <CalendarBlank size={32} className="text-slate-300 mb-3" />
              <p className="text-sm text-slate-500 mb-3">Nenhuma aula agendada.</p>
              <Link href="/dashboard/lessons/new" className="ui-btn ui-btn-primary ui-btn-sm inline-flex gap-1">
                <Plus size={13} /> Agendar aula
              </Link>
            </div>
          )}

          {/* Exercícios recentes */}
          {exercises.length > 0 && (
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
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0", STATUS_COLOR[ex.status] ?? "bg-slate-50 text-slate-500 border-slate-200")}>
                      {STATUS_LABEL[ex.status] ?? ex.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-5">
          {/* Alunos */}
          {(professor?.students ?? []).length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[13px] font-bold text-slate-700">Alunos</h2>
                <Link href="/dashboard/students" className="text-[12px] text-brand font-semibold hover:underline">
                  Ver todos
                </Link>
              </div>
              <div className="flex flex-col gap-1.5">
                {(professor?.students ?? []).slice(0, 6).map((s) => (
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
              {studentsTotal > 6 && (
                <Link href="/dashboard/students" className="flex items-center justify-center gap-1 mt-3 pt-3 border-t border-slate-100 text-[12px] text-brand font-semibold hover:underline">
                  +{studentsTotal - 6} alunos <ArrowRight size={11} />
                </Link>
              )}
            </div>
          )}

          {/* Ranking de alunos */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy size={16} weight="fill" className="text-amber-400" />
                <h2 className="text-[13px] font-bold text-slate-700">Ranking XP</h2>
              </div>
              {leaderboard.length > 0 && (
                <Link href="/dashboard/reports" className="text-[12px] text-brand font-semibold hover:underline">
                  Relatórios
                </Link>
              )}
            </div>

            {leaderboard.length === 0 ? (
              <p className="text-[12px] text-slate-400 text-center py-2">
                Nenhum aluno cadastrado ainda.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {leaderboard.slice(0, 5).map((entry) => {
                  const pct = xpPct(entry.level, entry.xp);
                  return (
                    <div key={entry.id} className="flex items-center gap-2">
                      <span className="w-5 text-center shrink-0">
                        <RankBadge rank={entry.rank} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/dashboard/students/${entry.id}`}
                          className="text-[12px] font-semibold text-slate-700 truncate hover:text-brand hover:underline block"
                        >
                          {entry.name}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 tabular-nums shrink-0">
                            {entry.xp} XP
                          </span>
                        </div>
                      </div>
                      <span className="ui-badge ui-badge-sm ui-badge-brand shrink-0 tabular-nums">
                        Nv.{entry.level}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────────

function Topbar({ name, role, initials }: { name: string; role: string; initials: string }) {
  return (
    <header className="h-[64px] bg-white/90 backdrop-blur border-b border-slate-200 flex items-center gap-3 px-6 sticky top-0 z-20">
      <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 max-w-[280px] flex-1">
        <MagnifyingGlass size={14} className="text-slate-400 shrink-0" />
        <input
          readOnly
          placeholder="Buscar alunos, aulas..."
          className="bg-transparent outline-none text-[13px] text-slate-500 placeholder:text-slate-400 w-full cursor-default"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          <button className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-white text-slate-800 shadow-sm">PT</button>
          <button className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 hover:text-slate-700">EN</button>
        </div>
        <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <Bell size={17} weight="bold" />
        </button>
        <Avatar name={initials} size={34} />
      </div>
    </header>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  let teacherData: TeacherData | null = null;
  let studentData: StudentData | null = null;
  let gamifStats: GamificationStats | null = null;
  let leaderboard: LeaderboardEntry[] = [];

  if (session.role === "teacher") {
    const [td, lb] = await Promise.allSettled([
      serverFetch<TeacherData>("/api/dashboard/teacher"),
      serverFetch<LeaderboardEntry[]>("/api/gamification/leaderboard"),
    ]);
    if (td.status === "fulfilled") teacherData = td.value;
    if (lb.status === "fulfilled") leaderboard = lb.value;
  } else {
    const [sd, gs] = await Promise.allSettled([
      serverFetch<StudentData>("/api/dashboard/student"),
      serverFetch<GamificationStats>("/api/gamification/stats"),
    ]);
    if (sd.status === "fulfilled") studentData = sd.value;
    if (gs.status === "fulfilled") gamifStats = gs.value;
  }

  return (
    <>
      <Topbar name={session.name ?? "User"} role={session.role} initials={session.name ?? "U"} />
      {session.role === "teacher"
        ? <TeacherDashboard name={session.name ?? "Professor"} data={teacherData} leaderboard={leaderboard} />
        : <StudentDashboard name={session.name ?? "Aluno"} data={studentData} gamif={gamifStats} />}
    </>
  );
}
