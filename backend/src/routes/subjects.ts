import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { getSession } from "../lib/auth.js";

export const subjectRoutes = new Hono();

subjectRoutes.get("/", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { students: true } },
    },
  });
  return c.json(subjects);
});

subjectRoutes.post("/", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const { name, description } = await c.req.json();

  if (!name?.trim()) return c.json({ error: "Nome é obrigatório" }, 400);

  const existing = await prisma.subject.findFirst({ where: { name: name.trim() } });
  if (existing) return c.json({ error: "Já existe uma disciplina com este nome" }, 409);

  const subject = await prisma.subject.create({
    data: { name: name.trim(), description: description?.trim() || null },
  });
  return c.json(subject, 201);
});

subjectRoutes.get("/:id", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const subject = await prisma.subject.findUnique({
    where: { id: c.req.param("id") },
    include: {
      lessons: { orderBy: { scheduledAt: "desc" } },
      _count: { select: { students: true } },
    },
  });

  if (!subject) return c.json({ error: "Disciplina não encontrada" }, 404);
  return c.json(subject);
});

subjectRoutes.patch("/:id", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const subject = await prisma.subject.findUnique({ where: { id: c.req.param("id") } });
  if (!subject) return c.json({ error: "Disciplina não encontrada" }, 404);

  const { name, description } = await c.req.json();

  if (name !== undefined && !name.trim()) return c.json({ error: "Nome não pode ser vazio" }, 400);

  if (name?.trim()) {
    const conflict = await prisma.subject.findFirst({
      where: { name: name.trim(), id: { not: subject.id } },
    });
    if (conflict) return c.json({ error: "Já existe uma disciplina com este nome" }, 409);
  }

  const updated = await prisma.subject.update({
    where: { id: subject.id },
    data: {
      ...(name?.trim() && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
    },
  });
  return c.json(updated);
});

subjectRoutes.delete("/:id", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const subject = await prisma.subject.findUnique({ where: { id: c.req.param("id") } });
  if (!subject) return c.json({ error: "Disciplina não encontrada" }, 404);

  await prisma.subject.delete({ where: { id: subject.id } });
  return c.json({ ok: true });
});
