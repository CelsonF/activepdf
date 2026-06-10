import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { requireTeacher, type AuthEnv } from "../middleware/auth.js";

export const reportsRoutes = new Hono<AuthEnv>();

reportsRoutes.use("*", requireTeacher);

// GET /api/reports — per-student summary for the professor
reportsRoutes.get("/", async (c) => {
  const session = c.get("session");

  const students = await prisma.student.findMany({
    where: { professorId: session.userId },
    orderBy: { name: "asc" },
    include: {
      learningPlan: { select: { level: true, objective: true } },
      userStats: {
        select: { xp: true, level: true, streak: true, lastActiveAt: true },
      },
      lessons: {
        select: { status: true, scheduledAt: true },
      },
      exercises: {
        select: { status: true, correctionJson: true },
      },
    },
  });

  const report = students.map((s) => {
    const lessonsCompleted = s.lessons.filter(
      (l) => l.status === "COMPLETED"
    ).length;
    const lessonsTotal = s.lessons.length;

    const exCompleted = s.exercises.filter(
      (e) => e.status === "completed" || e.status === "corrected"
    ).length;
    const exCorrected = s.exercises.filter(
      (e) => e.status === "corrected"
    );
    const exTotal = s.exercises.length;

    // Compute average grade from corrected exercises
    const gradeMap: Record<string, number> = {
      "A+": 10, A: 9, "B+": 8, B: 7, C: 6, D: 5, F: 0,
    };
    const gradedExercises = exCorrected.filter((e) => {
      try {
        const c = JSON.parse(e.correctionJson ?? "{}") as { grade?: string };
        return c.grade != null;
      } catch {
        return false;
      }
    });
    const avgGrade =
      gradedExercises.length > 0
        ? gradedExercises.reduce((sum, e) => {
            try {
              const parsed = JSON.parse(e.correctionJson ?? "{}") as {
                grade?: string;
              };
              return sum + (gradeMap[parsed.grade ?? ""] ?? 0);
            } catch {
              return sum;
            }
          }, 0) / gradedExercises.length
        : null;

    // Activity status
    const last = s.userStats?.lastActiveAt ?? null;
    let activityStatus: "active" | "at_risk" | "inactive" = "inactive";
    if (last) {
      const daysSince = Math.floor(
        (Date.now() - new Date(last).getTime()) / 86_400_000
      );
      if (daysSince <= 7) activityStatus = "active";
      else if (daysSince <= 14) activityStatus = "at_risk";
    }

    return {
      id: s.id,
      name: s.name,
      email: s.email,
      plan: s.learningPlan
        ? { level: s.learningPlan.level, objective: s.learningPlan.objective }
        : null,
      xp: s.userStats?.xp ?? 0,
      level: s.userStats?.level ?? 1,
      streak: s.userStats?.streak ?? 0,
      lastActiveAt: last,
      activityStatus,
      lessonsCompleted,
      lessonsTotal,
      exCompleted,
      exTotal,
      avgGrade,
    };
  });

  return c.json(report);
});

// GET /api/reports/:studentId — detailed timeline for one student
reportsRoutes.get("/:studentId", async (c) => {
  const session = c.get("session");

  const student = await prisma.student.findFirst({
    where: { id: c.req.param("studentId"), professorId: session.userId },
    include: {
      learningPlan: true,
      userStats: true,
      lessons: {
        orderBy: { scheduledAt: "desc" },
        select: {
          id: true,
          scheduledAt: true,
          status: true,
          subject: { select: { name: true } },
          content: true,
        },
      },
      exercises: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          correctionJson: true,
          createdAt: true,
        },
      },
      xpEvents: {
        orderBy: { createdAt: "desc" },
        take: 30,
        select: { points: true, reason: true, createdAt: true },
      },
      achievements: {
        orderBy: { unlockedAt: "asc" },
        select: { key: true, unlockedAt: true },
      },
    },
  });

  if (!student) return c.json({ error: "Aluno não encontrado" }, 404);
  return c.json(student);
});
