import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { awardXp } from "../lib/gamification.js";
import { requireAuth, requireTeacher, type AuthEnv } from "../middleware/auth.js";
import { jsonValidator } from "../lib/validate.js";
import { findOwnedStudent } from "../lib/ownership.js";
import { createLessonSchema, updateLessonSchema } from "../schemas/lessons.js";

export const lessonRoutes = new Hono<AuthEnv>();

lessonRoutes.get("/", requireAuth, async (c) => {
  const session = c.get("session");
  const status = c.req.query("status");

  if (session.role === "student") {
    const lessons = await prisma.lesson.findMany({
      where: {
        studentId: session.userId,
        ...(status ? { status } : {}),
      },
      select: {
        id: true,
        scheduledAt: true,
        status: true,
        meetLink: true,
        content: true,
        homework: true,
        subject: { select: { id: true, name: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });
    return c.json(lessons);
  }

  const studentId = c.req.query("studentId");
  const lessons = await prisma.lesson.findMany({
    where: {
      professorId: session.userId,
      ...(status ? { status } : {}),
      ...(studentId ? { studentId } : {}),
    },
    include: { student: { select: { id: true, name: true } } },
    orderBy: { scheduledAt: "asc" },
  });
  return c.json(lessons);
});

lessonRoutes.post("/", requireTeacher, jsonValidator(createLessonSchema), async (c) => {
  const session = c.get("session");
  const { studentId, subjectId, scheduledAt, meetLink, content, homework, notes } =
    c.req.valid("json");

  const student = await findOwnedStudent(session.userId, studentId);
  if (!student) return c.json({ error: "Aluno não encontrado" }, 404);

  const lesson = await prisma.lesson.create({
    data: {
      studentId,
      professorId: session.userId,
      subjectId: subjectId || null,
      scheduledAt: new Date(scheduledAt),
      meetLink: meetLink?.trim() || null,
      content: content?.trim() || null,
      homework: homework?.trim() || null,
      notes: notes?.trim() || null,
      status: "SCHEDULED",
    },
  });
  return c.json({ id: lesson.id }, 201);
});

lessonRoutes.get("/:id", requireAuth, async (c) => {
  const session = c.get("session");
  const lessonId = c.req.param("id");

  if (session.role === "student") {
    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, studentId: session.userId },
      select: {
        id: true,
        scheduledAt: true,
        status: true,
        meetLink: true,
        content: true,
        homework: true,
        subject: true,
        vocabularyEntries: {
          where: { studentId: session.userId },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!lesson) return c.json({ error: "Aula não encontrada" }, 404);
    return c.json(lesson);
  }

  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, professorId: session.userId },
    include: {
      student: { select: { id: true, name: true, email: true } },
      subject: true,
      vocabularyEntries: true,
    },
  });

  if (!lesson) return c.json({ error: "Aula não encontrada" }, 404);
  return c.json(lesson);
});

lessonRoutes.patch("/:id", requireTeacher, jsonValidator(updateLessonSchema), async (c) => {
  const session = c.get("session");

  const existing = await prisma.lesson.findFirst({
    where: { id: c.req.param("id"), professorId: session.userId },
  });
  if (!existing) return c.json({ error: "Aula não encontrada" }, 404);

  const { subjectId, scheduledAt, meetLink, content, homework, notes, status } =
    c.req.valid("json");

  const wasCompleted = existing.status !== "COMPLETED" && status === "COMPLETED";

  const updated = await prisma.lesson.update({
    where: { id: c.req.param("id") },
    data: {
      ...(subjectId !== undefined ? { subjectId: subjectId || null } : {}),
      ...(scheduledAt !== undefined ? { scheduledAt: new Date(scheduledAt) } : {}),
      ...(meetLink !== undefined ? { meetLink: meetLink?.trim() || null } : {}),
      ...(content !== undefined ? { content: content?.trim() || null } : {}),
      ...(homework !== undefined ? { homework: homework?.trim() || null } : {}),
      ...(notes !== undefined ? { notes: notes?.trim() || null } : {}),
      ...(status !== undefined ? { status } : {}),
    },
  });

  if (wasCompleted && existing.studentId) {
    await awardXp(existing.studentId, 15, "lesson_attended", existing.id);
  }

  return c.json(updated);
});

lessonRoutes.delete("/:id", requireTeacher, async (c) => {
  const session = c.get("session");

  const existing = await prisma.lesson.findFirst({
    where: { id: c.req.param("id"), professorId: session.userId },
  });
  if (!existing) return c.json({ error: "Aula não encontrada" }, 404);

  await prisma.lesson.delete({ where: { id: c.req.param("id") } });
  return c.json({ ok: true });
});
