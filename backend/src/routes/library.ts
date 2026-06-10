import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { getSession } from "../lib/auth.js";

export const libraryRoutes = new Hono();

// GET /api/library — list all PDFs for the logged-in professor
libraryRoutes.get("/", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher")
    return c.json({ error: "Não autorizado" }, 401);

  const q = c.req.query("q")?.trim().toLowerCase();

  const pdfs = await prisma.libraryPdf.findMany({
    where: { professorId: session.userId },
    select: {
      id: true,
      name: true,
      description: true,
      tags: true,
      pageCount: true,
      fileSize: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const result = q
    ? pdfs.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q) ||
          p.tags.toLowerCase().includes(q)
      )
    : pdfs;

  return c.json(result);
});

// GET /api/library/:id — fetch a single PDF (includes pdfData)
libraryRoutes.get("/:id", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher")
    return c.json({ error: "Não autorizado" }, 401);

  const pdf = await prisma.libraryPdf.findUnique({
    where: { id: c.req.param("id") },
  });
  if (!pdf) return c.json({ error: "Não encontrado" }, 404);
  if (pdf.professorId !== session.userId)
    return c.json({ error: "Acesso negado" }, 403);

  return c.json(pdf);
});

// POST /api/library — upload a new PDF
libraryRoutes.post("/", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher")
    return c.json({ error: "Não autorizado" }, 401);

  const { name, description, tags, pdfData, pageCount, fileSize } =
    await c.req.json();

  if (!name?.trim() || !pdfData) {
    return c.json({ error: "Nome e PDF são obrigatórios" }, 400);
  }

  const tagsJson = Array.isArray(tags)
    ? JSON.stringify(tags.map((t: string) => t.trim()).filter(Boolean))
    : "[]";

  const pdf = await prisma.libraryPdf.create({
    data: {
      professorId: session.userId,
      name: name.trim(),
      description: description?.trim() || null,
      tags: tagsJson,
      pdfData,
      pageCount: typeof pageCount === "number" ? pageCount : null,
      fileSize: typeof fileSize === "number" ? fileSize : null,
    },
    select: { id: true, name: true, createdAt: true },
  });

  return c.json(pdf, 201);
});

// PATCH /api/library/:id — update name / description / tags
libraryRoutes.patch("/:id", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher")
    return c.json({ error: "Não autorizado" }, 401);

  const pdf = await prisma.libraryPdf.findUnique({
    where: { id: c.req.param("id") },
  });
  if (!pdf) return c.json({ error: "Não encontrado" }, 404);
  if (pdf.professorId !== session.userId)
    return c.json({ error: "Acesso negado" }, 403);

  const { name, description, tags } = await c.req.json();

  const tagsJson =
    tags !== undefined
      ? Array.isArray(tags)
        ? JSON.stringify(tags.map((t: string) => t.trim()).filter(Boolean))
        : "[]"
      : undefined;

  await prisma.libraryPdf.update({
    where: { id: pdf.id },
    data: {
      ...(name?.trim() && { name: name.trim() }),
      ...(description !== undefined && {
        description: description?.trim() || null,
      }),
      ...(tagsJson !== undefined && { tags: tagsJson }),
    },
  });

  return c.json({ ok: true });
});

// DELETE /api/library/:id
libraryRoutes.delete("/:id", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher")
    return c.json({ error: "Não autorizado" }, 401);

  const pdf = await prisma.libraryPdf.findUnique({
    where: { id: c.req.param("id") },
  });
  if (!pdf) return c.json({ error: "Não encontrado" }, 404);
  if (pdf.professorId !== session.userId)
    return c.json({ error: "Acesso negado" }, 403);

  await prisma.libraryPdf.delete({ where: { id: pdf.id } });
  return c.json({ ok: true });
});
