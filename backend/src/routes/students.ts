import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { getSession } from "../lib/auth.js";

export const studentRoutes = new Hono();

studentRoutes.get("/", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const students = await prisma.student.findMany({
    where: { professorId: session.userId },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
  return c.json(students);
});

studentRoutes.post("/", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const { name, email, password, level, objective, bookRef, notes } = await c.req.json();

  if (!name?.trim() || !email?.trim() || !password) {
    return c.json({ error: "Nome, email e senha são obrigatórios" }, 400);
  }

  const existing = await prisma.student.findUnique({ where: { email } });
  if (existing) return c.json({ error: "Este email já está em uso" }, 409);

  const hashed = await bcrypt.hash(password, 10);
  const student = await prisma.student.create({
    data: { name: name.trim(), email, password: hashed, professorId: session.userId },
  });

  if (level?.trim() && objective?.trim()) {
    await prisma.learningPlan.create({
      data: {
        studentId: student.id,
        professorId: session.userId,
        level: level.trim(),
        objective: objective.trim(),
        bookRef: bookRef?.trim() || null,
        notes: notes?.trim() || null,
      },
    });
  }

  return c.json({ id: student.id }, 201);
});

studentRoutes.get("/:id", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const student = await prisma.student.findUnique({
    where: { id: c.req.param("id"), professorId: session.userId },
    include: {
      learningPlan: true,
      subjects: { include: { subject: true } },
      lessons: {
        orderBy: { scheduledAt: "desc" },
        include: { subject: true, vocabularyEntries: true },
      },
    },
  });

  if (!student) return c.json({ error: "Aluno não encontrado" }, 404);
  return c.json(student);
});

studentRoutes.patch("/:id", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const student = await prisma.student.findFirst({
    where: { id: c.req.param("id"), professorId: session.userId },
  });
  if (!student) return c.json({ error: "Aluno não encontrado" }, 404);

  const { name, email, enrollment } = await c.req.json();

  if (email !== undefined) {
    const conflict = await prisma.student.findFirst({
      where: { email, id: { not: student.id } },
    });
    if (conflict) return c.json({ error: "Este email já está em uso" }, 409);
  }

  const updated = await prisma.student.update({
    where: { id: student.id },
    data: {
      ...(name?.trim() && { name: name.trim() }),
      ...(email?.trim() && { email: email.trim() }),
      ...(enrollment !== undefined && { enrollment }),
    },
  });
  return c.json({ id: updated.id });
});

studentRoutes.patch("/:id/plan", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const student = await prisma.student.findFirst({
    where: { id: c.req.param("id"), professorId: session.userId },
  });
  if (!student) return c.json({ error: "Aluno não encontrado" }, 404);

  const { level, objective, bookRef, notes } = await c.req.json();

  if (!level?.trim() || !objective?.trim()) {
    return c.json({ error: "Nível e objetivo são obrigatórios" }, 400);
  }

  const plan = await prisma.learningPlan.upsert({
    where: { studentId: student.id },
    create: {
      studentId: student.id,
      professorId: session.userId,
      level: level.trim(),
      objective: objective.trim(),
      bookRef: bookRef?.trim() || null,
      notes: notes?.trim() || null,
    },
    update: {
      level: level.trim(),
      objective: objective.trim(),
      bookRef: bookRef?.trim() || null,
      notes: notes?.trim() || null,
    },
  });
  return c.json({ id: plan.id });
});

studentRoutes.post("/:id/subjects", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const student = await prisma.student.findFirst({
    where: { id: c.req.param("id") as string, professorId: session.userId },
  });
  if (!student) return c.json({ error: "Aluno não encontrado" }, 404);

  const { subjectId } = await c.req.json();
  if (!subjectId) return c.json({ error: "subjectId é obrigatório" }, 400);

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, professorId: session.userId },
  });
  if (!subject) return c.json({ error: "Matéria não encontrada" }, 404);

  await prisma.studentSubject.upsert({
    where: { studentId_subjectId: { studentId: student.id, subjectId } },
    create: { studentId: student.id, subjectId },
    update: {},
  });

  return c.json({ ok: true }, 201);
});

studentRoutes.delete("/:id/subjects/:subjectId", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const student = await prisma.student.findFirst({
    where: { id: c.req.param("id") as string, professorId: session.userId },
  });
  if (!student) return c.json({ error: "Aluno não encontrado" }, 404);

  const subjectId = c.req.param("subjectId") as string;

  const enrollment = await prisma.studentSubject.findUnique({
    where: { studentId_subjectId: { studentId: student.id, subjectId } },
  });
  if (!enrollment) return c.json({ error: "Matrícula não encontrada" }, 404);

  await prisma.studentSubject.delete({
    where: { studentId_subjectId: { studentId: student.id, subjectId } },
  });

  return c.json({ ok: true });
});

studentRoutes.delete("/:id", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const student = await prisma.student.findFirst({
    where: { id: c.req.param("id"), professorId: session.userId },
  });
  if (!student) return c.json({ error: "Aluno não encontrado" }, 404);

  await prisma.student.delete({ where: { id: student.id } });
  return c.json({ ok: true });
});
