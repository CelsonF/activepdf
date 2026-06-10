import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthEnv } from "../middleware/auth.js";
import { jsonValidator } from "../lib/validate.js";
import { findOwnedLesson, findOwnedStudent } from "../lib/ownership.js";
import { createVocabularySchema } from "../schemas/misc.js";

export const vocabularyRoutes = new Hono<AuthEnv>();

vocabularyRoutes.use("*", requireAuth);

vocabularyRoutes.get("/", async (c) => {
  const session = c.get("session");

  const lessonId = c.req.param("lessonId") as string;
  const lesson = await findOwnedLesson(lessonId, session);
  if (!lesson) return c.json({ error: "Aula não encontrada" }, 404);

  // Aluno só vê as próprias entradas; professor só filtra por aluno que é seu
  let studentId = c.req.query("studentId");
  if (session.role === "student") {
    studentId = session.userId;
  } else if (studentId) {
    const owns = await findOwnedStudent(session.userId, studentId);
    if (!owns) return c.json({ error: "Aluno não encontrado" }, 404);
  }

  const entries = await prisma.vocabularyEntry.findMany({
    where: {
      lessonId,
      ...(studentId ? { studentId } : {}),
    },
    orderBy: { createdAt: "asc" },
  });
  return c.json(entries);
});

vocabularyRoutes.post("/", jsonValidator(createVocabularySchema), async (c) => {
  const session = c.get("session");

  const lessonId = c.req.param("lessonId") as string;
  const lesson = await findOwnedLesson(lessonId, session);
  if (!lesson) return c.json({ error: "Aula não encontrada" }, 404);

  const { word, definition, example, note, studentId: bodyStudentId } = c.req.valid("json");

  const targetStudentId =
    session.role === "teacher" ? bodyStudentId ?? lesson.studentId : session.userId;

  if (session.role === "teacher") {
    const owns = await findOwnedStudent(session.userId, targetStudentId);
    if (!owns) return c.json({ error: "Aluno não encontrado" }, 404);
  } else if (targetStudentId !== session.userId) {
    return c.json({ error: "Não autorizado" }, 401);
  }

  const entry = await prisma.vocabularyEntry.create({
    data: {
      lessonId,
      studentId: targetStudentId,
      word,
      definition: definition?.trim() || null,
      example: example?.trim() || null,
      note: note?.trim() || null,
    },
  });
  return c.json(entry, 201);
});

vocabularyRoutes.delete("/:wordId", async (c) => {
  const session = c.get("session");

  const lessonId = c.req.param("lessonId") as string;
  const wordId = c.req.param("wordId");

  const entry = await prisma.vocabularyEntry.findUnique({ where: { id: wordId } });
  if (!entry || entry.lessonId !== lessonId) return c.json({ error: "Entrada não encontrada" }, 404);

  if (session.role === "teacher") {
    const lesson = await findOwnedLesson(lessonId, session);
    if (!lesson) return c.json({ error: "Não autorizado" }, 401);
  } else if (entry.studentId !== session.userId) {
    return c.json({ error: "Não autorizado" }, 401);
  }

  await prisma.vocabularyEntry.delete({ where: { id: wordId } });
  return c.json({ ok: true });
});
