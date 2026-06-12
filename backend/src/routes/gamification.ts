import { Hono } from "hono";
import { requireAuth, requireTeacher, type AuthEnv } from "../middleware/auth.js";
import { jsonValidator } from "../lib/validate.js";
import { findOwnedStudent } from "../lib/ownership.js";
import { awardXpSchema } from "../schemas/misc.js";
import { parsePagination } from "../lib/pagination.js";
import { prisma } from "../lib/prisma.js";
import * as gamification from "../services/gamification.service.js";
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

  return c.json(await gamification.getStudentStats(resolved.targetId));
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

  const { take, skip } = parsePagination(c);
  return c.json(await gamification.getLeaderboard(professorId, take, skip));
});

gamificationRoutes.post("/award", requireTeacher, jsonValidator(awardXpSchema), async (c) => {
  const session = c.get("session");
  const { studentId, points, reason } = c.req.valid("json");

  const result = await gamification.awardFromTeacher(session.userId, studentId, points, reason);
  if (!result.ok) return c.json({ error: result.error }, result.status);
  return c.json(result.data, 201);
});

gamificationRoutes.get("/achievements", requireAuth, async (c) => {
  const session = c.get("session");

  const resolved = await resolveTargetStudent(c, session);
  if ("error" in resolved) return resolved.error;

  return c.json(await gamification.listAchievements(resolved.targetId));
});
