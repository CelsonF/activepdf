import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { requireTeacher, type AuthEnv } from "../middleware/auth.js";
import { jsonValidator } from "../lib/validate.js";
import { findOwnedStudent } from "../lib/ownership.js";
import {
  addSubjectSchema,
  createStudentSchema,
  learningPlanSchema,
  updateStudentSchema,
} from "../schemas/students.js";

export const studentRoutes = new Hono<AuthEnv>();

studentRoutes.use("*", requireTeacher);

studentRoutes.get("/", async (c) => {
  const session = c.get("session");

  const students = await prisma.student.findMany({
    where: { professorId: session.userId },
    select: { id: true, name: true, email: true, isAutodidact: true },
    orderBy: { name: "asc" },
  });
  return c.json(students);
});

studentRoutes.post("/", jsonValidator(createStudentSchema), async (c) => {
  const session = c.get("session");
  const { name, email, password, level, objective, bookRef, notes } = c.req.valid("json");

  const existing = await prisma.student.findUnique({ where: { email } });
  if (existing) return c.json({ error: "Este email já está em uso" }, 409);

  const hashed = await bcrypt.hash(password, 10);
  const student = await prisma.student.create({
    data: { name, email, password: hashed, professorId: session.userId },
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
  const session = c.get("session");

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

studentRoutes.patch("/:id", jsonValidator(updateStudentSchema), async (c) => {
  const session = c.get("session");

  const student = await findOwnedStudent(session.userId, c.req.param("id"));
  if (!student) return c.json({ error: "Aluno não encontrado" }, 404);

  const { name, email, enrollment, isAutodidact } = c.req.valid("json");

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
      ...(isAutodidact !== undefined && { isAutodidact }),
    },
  });
  return c.json({ id: updated.id });
});

studentRoutes.patch("/:id/plan", jsonValidator(learningPlanSchema), async (c) => {
  const session = c.get("session");

  const student = await findOwnedStudent(session.userId, c.req.param("id"));
  if (!student) return c.json({ error: "Aluno não encontrado" }, 404);

  const { level, objective, bookRef, notes } = c.req.valid("json");

  const planData = {
    level,
    objective,
    bookRef: bookRef?.trim() || null,
    notes: notes?.trim() || null,
  };

  const plan = await prisma.learningPlan.upsert({
    where: { studentId: student.id },
    create: { studentId: student.id, professorId: session.userId, ...planData },
    update: planData,
  });
  return c.json({ id: plan.id });
});

studentRoutes.post("/:id/subjects", jsonValidator(addSubjectSchema), async (c) => {
  const session = c.get("session");

  const student = await findOwnedStudent(session.userId, c.req.param("id"));
  if (!student) return c.json({ error: "Aluno não encontrado" }, 404);

  const { subjectId } = c.req.valid("json");

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
  const session = c.get("session");

  const student = await findOwnedStudent(session.userId, c.req.param("id"));
  if (!student) return c.json({ error: "Aluno não encontrado" }, 404);

  const subjectId = c.req.param("subjectId");

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
  const session = c.get("session");

  const student = await findOwnedStudent(session.userId, c.req.param("id"));
  if (!student) return c.json({ error: "Aluno não encontrado" }, 404);

  await prisma.student.delete({ where: { id: student.id } });
  return c.json({ ok: true });
});
