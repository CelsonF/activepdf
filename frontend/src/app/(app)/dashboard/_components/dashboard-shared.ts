// Tipos e helpers compartilhados pelos dashboards de professor e aluno.

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000];

export function xpPct(level: number, xp: number) {
  const curr = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const next = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  if (xp >= next) return 100;
  return Math.round(((xp - curr) / (next - curr)) * 100);
}

export function fmt(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function fmtTime(date: string) {
  return new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export const STATUS_LABEL: Record<string, string> = {
  assigned: "Atribuído",
  in_progress: "Em andamento",
  completed: "Concluído",
};

export const STATUS_COLOR: Record<string, string> = {
  assigned: "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-brand-light text-brand border-indigo-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export interface GamificationStats {
  xp: number;
  level: number;
  streak: number;
  achievements: Array<{ key: string; label: string; unlockedAt: string }>;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  level: number;
  streak: number;
  rank: number;
}

export interface TeacherData {
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

export interface StudentData {
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
