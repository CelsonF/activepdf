import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { requireTeacher, type AuthEnv } from "../middleware/auth.js";
import { jsonValidator } from "../lib/validate.js";
import { parsePagination } from "../lib/pagination.js";
import { createLibraryPdfSchema, updateLibraryPdfSchema } from "../schemas/library.js";

export const libraryRoutes = new Hono<AuthEnv>();

libraryRoutes.use("*", requireTeacher);

// GET /api/library — list all PDFs for the logged-in professor
libraryRoutes.get("/", async (c) => {
  const session = c.get("session");
  const q = c.req.query("q")?.trim();
  const { take, skip } = parsePagination(c);

  const pdfs = await prisma.libraryPdf.findMany({
    where: {
      professorId: session.userId,
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { description: { contains: q } },
              { tags: { contains: q } },
            ],
          }
        : {}),
    },
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
    take,
    skip,
  });

  return c.json(pdfs);
});

// GET /api/library/:id — fetch a single PDF (includes pdfData)
libraryRoutes.get("/:id", async (c) => {
  const session = c.get("session");

  const pdf = await prisma.libraryPdf.findUnique({
    where: { id: c.req.param("id") },
  });
  if (!pdf) return c.json({ error: "Não encontrado" }, 404);
  if (pdf.professorId !== session.userId)
    return c.json({ error: "Acesso negado" }, 403);

  return c.json(pdf);
});

// POST /api/library — upload a new PDF
libraryRoutes.post("/", jsonValidator(createLibraryPdfSchema), async (c) => {
  const session = c.get("session");
  const { name, description, tags, pdfData, pageCount, fileSize } = c.req.valid("json");

  const tagsJson = JSON.stringify((tags ?? []).map((t) => t.trim()).filter(Boolean));

  const pdf = await prisma.libraryPdf.create({
    data: {
      professorId: session.userId,
      name,
      description: description?.trim() || null,
      tags: tagsJson,
      pdfData,
      pageCount: pageCount ?? null,
      fileSize: fileSize ?? null,
    },
    select: { id: true, name: true, createdAt: true },
  });

  return c.json(pdf, 201);
});

// PATCH /api/library/:id — update name / description / tags
libraryRoutes.patch("/:id", jsonValidator(updateLibraryPdfSchema), async (c) => {
  const session = c.get("session");

  const pdf = await prisma.libraryPdf.findUnique({
    where: { id: c.req.param("id") },
  });
  if (!pdf) return c.json({ error: "Não encontrado" }, 404);
  if (pdf.professorId !== session.userId)
    return c.json({ error: "Acesso negado" }, 403);

  const { name, description, tags } = c.req.valid("json");

  const tagsJson =
    tags !== undefined
      ? JSON.stringify(tags.map((t) => t.trim()).filter(Boolean))
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
  const session = c.get("session");

  const pdf = await prisma.libraryPdf.findUnique({
    where: { id: c.req.param("id") },
  });
  if (!pdf) return c.json({ error: "Não encontrado" }, 404);
  if (pdf.professorId !== session.userId)
    return c.json({ error: "Acesso negado" }, 403);

  await prisma.libraryPdf.delete({ where: { id: pdf.id } });
  return c.json({ ok: true });
});
