import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { getSession } from "../lib/auth.js";
import { awardXp, ACHIEVEMENT_META } from "../lib/gamification.js";

export const gamificationRoutes = new Hono();

gamificationRoutes.get("/stats", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "Não autorizado" }, 401);

  let targetId: string;

  if (session.role === "teacher") {
    const studentId = c.req.query("studentId");
    if (!studentId) return c.json({ error: "studentId é obrigatório" }, 400);
    const owns = await prisma.student.findFirst({
      where: { id: studentId, professorId: session.userId },
    });
    if (!owns) return c.json({ error: "Aluno não encontrado" }, 404);
    targetId = studentId;
  } else {
    targetId = session.userId;
  }

  const [stats, achievements, recentEvents] = await Promise.all([
    prisma.userStats.findUnique({ where: { studentId: targetId } }),
    prisma.achievement.findMany({
      where: { studentId: targetId },
      orderBy: { unlockedAt: "asc" },
    }),
    prisma.xpEvent.findMany({
      where: { studentId: targetId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return c.json({
    xp: stats?.xp ?? 0,
    level: stats?.level ?? 1,
    streak: stats?.streak ?? 0,
    lastActiveAt: stats?.lastActiveAt ?? null,
    achievements: achievements.map((a) => ({
      key: a.key,
      label: ACHIEVEMENT_META[a.key] ?? a.key,
      unlockedAt: a.unlockedAt,
    })),
    recentEvents,
  });
});

gamificationRoutes.get("/leaderboard", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "Não autorizado" }, 401);

  let professorId: string;

  if (session.role === "teacher") {
    professorId = session.userId;
  } else {
    const student = await prisma.student.findUnique({
      where: { id: session.userId },
      select: { professorId: true },
    });
    if (!student?.professorId) return c.json([]);
    professorId = student.professorId;
  }

  const students = await prisma.student.findMany({
    where: { professorId },
    select: {
      id: true,
      name: true,
      userStats: { select: { xp: true, level: true, streak: true } },
    },
  });

  const ranked = students
    .map((s) => ({
      id: s.id,
      name: s.name,
      xp: s.userStats?.xp ?? 0,
      level: s.userStats?.level ?? 1,
      streak: s.userStats?.streak ?? 0,
    }))
    .sort((a, b) => b.xp - a.xp)
    .map((s, i) => ({ ...s, rank: i + 1 }));

  return c.json(ranked);
});

gamificationRoutes.post("/award", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const { studentId, points, reason } = await c.req.json();

  if (!studentId || !points || !reason?.trim()) {
    return c.json({ error: "studentId, points e reason são obrigatórios" }, 400);
  }
  if (typeof points !== "number" || points <= 0 || points > 500) {
    return c.json({ error: "points deve ser entre 1 e 500" }, 400);
  }

  const student = await prisma.student.findFirst({
    where: { id: studentId, professorId: session.userId },
  });
  if (!student) return c.json({ error: "Aluno não encontrado" }, 404);

  const result = await awardXp(studentId, points, `teacher_award:${reason.trim()}`);
  return c.json(result, 201);
});

gamificationRoutes.get("/achievements", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "Não autorizado" }, 401);

  let targetId: string;

  if (session.role === "teacher") {
    const studentId = c.req.query("studentId");
    if (!studentId) return c.json({ error: "studentId é obrigatório" }, 400);
    const owns = await prisma.student.findFirst({
      where: { id: studentId, professorId: session.userId },
    });
    if (!owns) return c.json({ error: "Aluno não encontrado" }, 404);
    targetId = studentId;
  } else {
    targetId = session.userId;
  }

  const unlocked = await prisma.achievement.findMany({
    where: { studentId: targetId },
    orderBy: { unlockedAt: "asc" },
  });

  const unlockedKeys = new Set(unlocked.map((a) => a.key));

  const all = Object.entries(ACHIEVEMENT_META).map(([key, label]) => ({
    key,
    label,
    unlocked: unlockedKeys.has(key),
    unlockedAt: unlocked.find((a) => a.key === key)?.unlockedAt ?? null,
  }));

  return c.json(all);
});
