import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { requireTeacher, type AuthEnv } from "../middleware/auth.js";
import { jsonValidator } from "../lib/validate.js";
import { createSubjectSchema, updateSubjectSchema } from "../schemas/misc.js";

export const subjectRoutes = new Hono<AuthEnv>();

subjectRoutes.use("*", requireTeacher);

subjectRoutes.get("/", async (c) => {
  const session = c.get("session");

  const subjects = await prisma.subject.findMany({
    where: { professorId: session.userId },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { students: true } },
    },
  });
  return c.json(subjects);
});

subjectRoutes.post("/", jsonValidator(createSubjectSchema), async (c) => {
  const session = c.get("session");
  const { name, description } = c.req.valid("json");

  const existing = await prisma.subject.findFirst({
    where: { name, professorId: session.userId },
  });
  if (existing) return c.json({ error: "Já existe uma disciplina com este nome" }, 409);

  const subject = await prisma.subject.create({
    data: {
      name,
      description: description?.trim() || null,
      professorId: session.userId,
    },
  });
  return c.json(subject, 201);
});

subjectRoutes.get("/:id", async (c) => {
  const session = c.get("session");

  const subject = await prisma.subject.findFirst({
    where: { id: c.req.param("id"), professorId: session.userId },
    include: {
      lessons: { orderBy: { scheduledAt: "desc" } },
      _count: { select: { students: true } },
    },
  });

  if (!subject) return c.json({ error: "Disciplina não encontrada" }, 404);
  return c.json(subject);
});

subjectRoutes.patch("/:id", jsonValidator(updateSubjectSchema), async (c) => {
  const session = c.get("session");

  const subject = await prisma.subject.findFirst({
    where: { id: c.req.param("id"), professorId: session.userId },
  });
  if (!subject) return c.json({ error: "Disciplina não encontrada" }, 404);

  const { name, description } = c.req.valid("json");

  if (name) {
    const conflict = await prisma.subject.findFirst({
      where: { name, professorId: session.userId, id: { not: subject.id } },
    });
    if (conflict) return c.json({ error: "Já existe uma disciplina com este nome" }, 409);
  }

  const updated = await prisma.subject.update({
    where: { id: subject.id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description: description?.trim() || null }),
    },
  });
  return c.json(updated);
});

subjectRoutes.delete("/:id", async (c) => {
  const session = c.get("session");

  const subject = await prisma.subject.findFirst({
    where: { id: c.req.param("id"), professorId: session.userId },
  });
  if (!subject) return c.json({ error: "Disciplina não encontrada" }, 404);

  await prisma.subject.delete({ where: { id: subject.id } });
  return c.json({ ok: true });
});
