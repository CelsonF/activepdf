import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { getSession } from "../lib/auth.js";

export const lessonRoutes = new Hono();

lessonRoutes.get("/", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const status = c.req.query("status");
  const studentId = c.req.query("studentId");

  const lessons = await prisma.lesson.findMany({
    where: {
      professorId: session.userId,
      ...(status ? { status: status as "SCHEDULED" | "COMPLETED" } : {}),
      ...(studentId ? { studentId } : {}),
    },
    include: { student: { select: { id: true, name: true } } },
    orderBy: { scheduledAt: "asc" },
  });
  return c.json(lessons);
});

lessonRoutes.post("/", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const { studentId, scheduledAt, meetLink, content, homework, notes } = await c.req.json();

  if (!studentId || !scheduledAt) {
    return c.json({ error: "Aluno e data são obrigatórios" }, 400);
  }

  const student = await prisma.student.findFirst({
    where: { id: studentId, professorId: session.userId },
  });
  if (!student) return c.json({ error: "Aluno não encontrado" }, 404);

  const lesson = await prisma.lesson.create({
    data: {
      studentId,
      professorId: session.userId,
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

lessonRoutes.get("/:id", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const lesson = await prisma.lesson.findFirst({
    where: { id: c.req.param("id"), professorId: session.userId },
    include: {
      student: { select: { id: true, name: true, email: true } },
      subject: true,
      vocabularyEntries: true,
    },
  });

  if (!lesson) return c.json({ error: "Aula não encontrada" }, 404);
  return c.json(lesson);
});

lessonRoutes.patch("/:id", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const existing = await prisma.lesson.findFirst({
    where: { id: c.req.param("id"), professorId: session.userId },
  });
  if (!existing) return c.json({ error: "Aula não encontrada" }, 404);

  const { scheduledAt, meetLink, content, homework, notes, status } = await c.req.json();

  const updated = await prisma.lesson.update({
    where: { id: c.req.param("id") },
    data: {
      ...(scheduledAt !== undefined ? { scheduledAt: new Date(scheduledAt) } : {}),
      ...(meetLink !== undefined ? { meetLink: meetLink?.trim() || null } : {}),
      ...(content !== undefined ? { content: content?.trim() || null } : {}),
      ...(homework !== undefined ? { homework: homework?.trim() || null } : {}),
      ...(notes !== undefined ? { notes: notes?.trim() || null } : {}),
      ...(status !== undefined ? { status } : {}),
    },
  });
  return c.json(updated);
});

lessonRoutes.delete("/:id", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const existing = await prisma.lesson.findFirst({
    where: { id: c.req.param("id"), professorId: session.userId },
  });
  if (!existing) return c.json({ error: "Aula não encontrada" }, 404);

  await prisma.lesson.delete({ where: { id: c.req.param("id") } });
  return c.json({ ok: true });
});
