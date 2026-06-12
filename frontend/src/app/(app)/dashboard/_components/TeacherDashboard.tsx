import Link from "next/link";
import {
  BookOpen, CalendarBlank, PencilLine, Plus, UserPlus, Users,
} from "@phosphor-icons/react/dist/ssr";
import { StatCard } from "./StatCard";
import { TeacherLessonsList } from "./TeacherLessonsList";
import { RecentExercisesList } from "./RecentExercisesList";
import { StudentsCard } from "./StudentsCard";
import { RankingCard } from "./RankingCard";
import type { LeaderboardEntry, TeacherData } from "./dashboard-shared";

interface TeacherDashboardProps {
  name: string;
  data: TeacherData | null;
  leaderboard: LeaderboardEntry[];
}

export function TeacherDashboard({ name, data, leaderboard }: TeacherDashboardProps) {
  const firstName = name.split(" ")[0];
  const professor = data?.professor;
  const exercises = data?.exercises ?? [];
  const students = professor?.students ?? [];
  const corrections = exercises.filter((e) => e.status !== "completed").length;
  const upcomingLessons = professor?.lessons ?? [];

  return (
    <div className="p-6 animate-fadeUp">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Área do Professor</p>
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Olá, prof. {firstName} 👋</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            {students.length} alunos · {data?.subjectsCount ?? 0} matérias · {corrections} para corrigir
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
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={<Users size={16} weight="bold" className="text-violet-500" />} iconBg="bg-violet-50" value={students.length} label="Alunos ativos" />
            <StatCard icon={<PencilLine size={16} weight="bold" className="text-amber-500" />} iconBg="bg-amber-50" value={corrections} label="Para corrigir" />
            <StatCard icon={<CalendarBlank size={16} weight="bold" className="text-blue-500" />} iconBg="bg-blue-50" value={upcomingLessons.length} label="Próximas aulas" />
            <StatCard icon={<BookOpen size={16} weight="bold" className="text-emerald-500" />} iconBg="bg-emerald-50" value={data?.subjectsCount ?? 0} label="Matérias" />
          </div>

          <TeacherLessonsList lessons={upcomingLessons} />
          {exercises.length > 0 && <RecentExercisesList exercises={exercises} />}
        </div>

        <div className="flex flex-col gap-5">
          {students.length > 0 && <StudentsCard students={students} />}
          <RankingCard leaderboard={leaderboard} />
        </div>
      </div>
    </div>
  );
}
