import Link from "next/link";
import {
  BookOpen, CalendarBlank, CheckCircle, PencilLine, Target, UploadSimple,
} from "@phosphor-icons/react/dist/ssr";
import { EmptyState } from "@/components/ui";
import { StatCard } from "./StatCard";
import { StudentLessonsCard } from "./StudentLessonsCard";
import { PendingExercisesList } from "./PendingExercisesList";
import { LearningPlanCard } from "./LearningPlanCard";
import { ExerciseProgressCard } from "./ExerciseProgressCard";
import { GamificationCard } from "./GamificationCard";
import type { GamificationStats, StudentData } from "./dashboard-shared";

interface StudentDashboardProps {
  name: string;
  data: StudentData | null;
  gamif: GamificationStats | null;
}

export function StudentDashboard({ name, data, gamif }: StudentDashboardProps) {
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
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={<PencilLine size={16} weight="bold" className="text-indigo-500" />} iconBg="bg-indigo-50" value={exercises.length} label="Total de exercícios" />
            <StatCard icon={<CheckCircle size={16} weight="bold" className="text-emerald-500" />} iconBg="bg-emerald-50" value={completedExercises.length} label="Concluídos" />
            <StatCard icon={<Target size={16} weight="bold" className="text-amber-500" />} iconBg="bg-amber-50" value={pendingExercises.length} label="Pendentes" />
            <StatCard icon={<CalendarBlank size={16} weight="bold" className="text-blue-500" />} iconBg="bg-blue-50" value={upcoming.length} label="Próximas aulas" />
          </div>

          {upcoming.length > 0 && <StudentLessonsCard lessons={upcoming} />}
          {pendingExercises.length > 0 && <PendingExercisesList exercises={pendingExercises} />}

          {exercises.length === 0 && upcoming.length === 0 && (
            <EmptyState
              className="py-16"
              icon={<BookOpen size={36} />}
              title="Nenhum exercício atribuído ainda."
              description="Sua professora irá enviar exercícios em breve."
            />
          )}
        </div>

        <div className="flex flex-col gap-5">
          {student?.learningPlan && (
            <LearningPlanCard plan={student.learningPlan} subjects={student.subjects} />
          )}
          {exercises.length > 0 && (
            <ExerciseProgressCard completed={completedExercises.length} total={exercises.length} />
          )}
          <GamificationCard gamif={gamif} />
        </div>
      </div>
    </div>
  );
}
