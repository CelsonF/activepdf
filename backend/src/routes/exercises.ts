import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { getSession } from "../lib/auth.js";
import { awardXp } from "../lib/gamification.js";

export const exerciseRoutes = new Hono();

exerciseRoutes.get("/", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "Não autenticado" }, 401);

  const studentId = c.req.query("studentId");

  if (session.role === "teacher") {
    const statusFilter = c.req.query("status");
    const exercises = await prisma.exercise.findMany({
      where: {
        professorId: session.userId,
        ...(studentId ? { studentId } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      select: {
        id: true, title: true, pdfName: true, status: true,
        studentId: true, createdAt: true,
        student: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return c.json(exercises);
  }

  const exercises = await prisma.exercise.findMany({
    where: { studentId: session.userId },
    select: {
      id: true, title: true, pdfName: true, status: true, createdAt: true,
      professor: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return c.json(exercises);
});

exerciseRoutes.post("/", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const { title, studentId, lessonId, pdfName, pdfData, fieldsJson } = await c.req.json();

  if (!title?.trim() || !pdfData || !pdfName) {
    return c.json({ error: "Título e PDF são obrigatórios" }, 400);
  }

  if (studentId) {
    const student = await prisma.student.findFirst({
      where: { id: studentId, professorId: session.userId },
    });
    if (!student) return c.json({ error: "Aluno não encontrado" }, 404);
  }

  const exercise = await prisma.exercise.create({
    data: {
      title: title.trim(),
      professorId: session.userId,
      studentId: studentId || null,
      lessonId: lessonId || null,
      pdfName,
      pdfData,
      fieldsJson: JSON.stringify(fieldsJson ?? []),
    },
  });
  return c.json({ id: exercise.id }, 201);
});

exerciseRoutes.get("/:id", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "Não autenticado" }, 401);

  const exercise = await prisma.exercise.findUnique({ where: { id: c.req.param("id") } });
  if (!exercise) return c.json({ error: "Exercício não encontrado" }, 404);

  const canAccess =
    (session.role === "teacher" && exercise.professorId === session.userId) ||
    (session.role === "student" && exercise.studentId === session.userId);

  if (!canAccess) return c.json({ error: "Acesso negado" }, 403);
  return c.json(exercise);
});

exerciseRoutes.patch("/:id", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "Não autenticado" }, 401);
  if (session.role !== "student") return c.json({ error: "Acesso negado" }, 403);

  const exercise = await prisma.exercise.findUnique({ where: { id: c.req.param("id") } });
  if (!exercise) return c.json({ error: "Exercício não encontrado" }, 404);
  if (exercise.studentId !== session.userId) return c.json({ error: "Acesso negado" }, 403);

  const VALID = ["assigned", "in_progress", "completed"];
  const { answersJson, status } = await c.req.json();
  if (status !== undefined && !VALID.includes(status)) {
    return c.json({ error: "Status inválido" }, 400);
  }

  const wasCompleted = exercise.status !== "completed" && status === "completed";

  const updated = await prisma.exercise.update({
    where: { id: c.req.param("id") },
    data: {
      ...(typeof answersJson === "string" && { answersJson }),
      ...(status !== undefined && { status }),
    },
  });

  if (wasCompleted) {
    await awardXp(session.userId, 20, "exercise_completed", exercise.id);
  }

  return c.json({ ok: true, status: updated.status });
});

exerciseRoutes.get("/:id/review", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const exercise = await prisma.exercise.findUnique({
    where: { id: c.req.param("id") as string },
    include: { student: { select: { id: true, name: true } } },
  });
  if (!exercise) return c.json({ error: "Exercício não encontrado" }, 404);
  if (exercise.professorId !== session.userId) return c.json({ error: "Acesso negado" }, 403);

  const fields: Array<Record<string, unknown>> = JSON.parse(exercise.fieldsJson ?? "[]");
  const answers: Record<string, unknown> = JSON.parse(exercise.answersJson ?? "{}");
  const correction: {
    grade?: string;
    comment?: string;
    items?: Record<string, { correct: boolean; feedback?: string }>;
  } = JSON.parse(exercise.correctionJson ?? "{}");

  const items = fields.map((field) => {
    const fieldId = field.id as string;
    return {
      ...field,
      studentAnswer: answers[fieldId] ?? null,
      correct: correction.items?.[fieldId]?.correct ?? null,
      feedback: correction.items?.[fieldId]?.feedback ?? null,
    };
  });

  return c.json({
    id: exercise.id,
    title: exercise.title,
    pdfName: exercise.pdfName,
    status: exercise.status,
    student: exercise.student,
    createdAt: exercise.createdAt,
    updatedAt: exercise.updatedAt,
    grade: correction.grade ?? null,
    comment: correction.comment ?? null,
    items,
  });
});

exerciseRoutes.patch("/:id/review", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const exercise = await prisma.exercise.findUnique({ where: { id: c.req.param("id") as string } });
  if (!exercise) return c.json({ error: "Exercício não encontrado" }, 404);
  if (exercise.professorId !== session.userId) return c.json({ error: "Acesso negado" }, 403);

  const { grade, comment, items } = await c.req.json();

  const correctionJson = JSON.stringify({
    grade: grade?.trim() || null,
    comment: comment?.trim() || null,
    items: items ?? {},
  });

  await prisma.exercise.update({
    where: { id: exercise.id },
    data: { correctionJson, status: "corrected" },
  });

  return c.json({ ok: true });
});

exerciseRoutes.delete("/:id", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const exercise = await prisma.exercise.findUnique({ where: { id: c.req.param("id") } });
  if (!exercise) return c.json({ error: "Exercício não encontrado" }, 404);
  if (exercise.professorId !== session.userId) return c.json({ error: "Acesso negado" }, 403);

  await prisma.exercise.delete({ where: { id: exercise.id } });
  return c.json({ ok: true });
});
