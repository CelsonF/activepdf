import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { awardXp, ACHIEVEMENT_META } from "../lib/gamification.js";
import { requireAuth, requireTeacher, type AuthEnv } from "../middleware/auth.js";
import { jsonValidator } from "../lib/validate.js";
import { findOwnedStudent } from "../lib/ownership.js";
import { awardXpSchema } from "../schemas/misc.js";
import type { SessionPayload } from "../lib/auth.js";
import type { Context } from "hono";

export const gamificationRoutes = new Hono<AuthEnv>();

/** Professor consulta um aluno seu via ?studentId=; aluno consulta a si mesmo. */
async function resolveTargetStudent(
  c: Context,
  session: SessionPayload
): Promise<{ targetId: string } | { error: Response }> {
  if (session.role !== "teacher") return { targetId: session.userId };

  const studentId = c.req.query("studentId");
  if (!studentId) {
    return { error: c.json({ error: "studentId é obrigatório" }, 400) };
  }
  const owns = await findOwnedStudent(session.userId, studentId);
  if (!owns) return { error: c.json({ error: "Aluno não encontrado" }, 404) };
  return { targetId: studentId };
}

gamificationRoutes.get("/stats", requireAuth, async (c) => {
  const session = c.get("session");

  const resolved = await resolveTargetStudent(c, session);
  if ("error" in resolved) return resolved.error;
  const targetId = resolved.targetId;

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

gamificationRoutes.get("/leaderboard", requireAuth, async (c) => {
  const session = c.get("session");

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

gamificationRoutes.post("/award", requireTeacher, jsonValidator(awardXpSchema), async (c) => {
  const session = c.get("session");
  const { studentId, points, reason } = c.req.valid("json");

  const student = await findOwnedStudent(session.userId, studentId);
  if (!student) return c.json({ error: "Aluno não encontrado" }, 404);

  const result = await awardXp(studentId, points, `teacher_award:${reason}`);
  return c.json(result, 201);
});

gamificationRoutes.get("/achievements", requireAuth, async (c) => {
  const session = c.get("session");

  const resolved = await resolveTargetStudent(c, session);
  if ("error" in resolved) return resolved.error;
  const targetId = resolved.targetId;

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
