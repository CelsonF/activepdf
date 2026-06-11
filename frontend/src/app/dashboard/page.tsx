import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { serverFetch } from "@/lib/api";
import { Topbar } from "./_components/Topbar";
import { StudentDashboard } from "./_components/StudentDashboard";
import { TeacherDashboard } from "./_components/TeacherDashboard";
import type {
  GamificationStats,
  LeaderboardEntry,
  StudentData,
  TeacherData,
} from "./_components/dashboard-shared";

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
      <Topbar initials={session.name ?? "U"} role={session.role} />
      {session.role === "teacher"
        ? <TeacherDashboard name={session.name ?? "Professor"} data={teacherData} leaderboard={leaderboard} />
        : <StudentDashboard name={session.name ?? "Aluno"} data={studentData} gamif={gamifStats} />}
    </>
  );
}
