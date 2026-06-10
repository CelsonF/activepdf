import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { getSession } from "../lib/auth.js";

export const vocabularyRoutes = new Hono();

async function resolveLesson(lessonId: string | undefined, session: { userId: string; role: string }) {
  if (!lessonId) return null;
  if (session.role === "teacher") {
    return prisma.lesson.findFirst({ where: { id: lessonId, professorId: session.userId } });
  }
  return prisma.lesson.findFirst({ where: { id: lessonId, studentId: session.userId } });
}

vocabularyRoutes.get("/", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "Não autorizado" }, 401);

  const lessonId = c.req.param("lessonId") as string;
  const lesson = await resolveLesson(lessonId, session);
  if (!lesson) return c.json({ error: "Aula não encontrada" }, 404);

  const studentId = c.req.query("studentId");

  const entries = await prisma.vocabularyEntry.findMany({
    where: {
      lessonId,
      ...(studentId ? { studentId } : {}),
    },
    orderBy: { createdAt: "asc" },
  });
  return c.json(entries);
});

vocabularyRoutes.post("/", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "Não autorizado" }, 401);

  const lessonId = c.req.param("lessonId") as string;
  const lesson = await resolveLesson(lessonId, session);
  if (!lesson) return c.json({ error: "Aula não encontrada" }, 404);

  const { word, definition, example, note, studentId: bodyStudentId } = await c.req.json();
  if (!word?.trim()) return c.json({ error: "Palavra é obrigatória" }, 400);

  const targetStudentId =
    session.role === "teacher" ? bodyStudentId ?? lesson.studentId : session.userId;

  if (session.role === "teacher") {
    const owns = await prisma.student.findFirst({
      where: { id: targetStudentId, professorId: session.userId },
    });
    if (!owns) return c.json({ error: "Aluno não encontrado" }, 404);
  } else if (targetStudentId !== session.userId) {
    return c.json({ error: "Não autorizado" }, 401);
  }

  const entry = await prisma.vocabularyEntry.create({
    data: {
      lessonId,
      studentId: targetStudentId,
      word: word.trim(),
      definition: definition?.trim() || null,
      example: example?.trim() || null,
      note: note?.trim() || null,
    },
  });
  return c.json(entry, 201);
});

vocabularyRoutes.delete("/:wordId", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "Não autorizado" }, 401);

  const lessonId = c.req.param("lessonId") as string;
  const wordId = c.req.param("wordId") as string;

  const entry = await prisma.vocabularyEntry.findUnique({ where: { id: wordId } });
  if (!entry || entry.lessonId !== lessonId) return c.json({ error: "Entrada não encontrada" }, 404);

  if (session.role === "teacher") {
    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, professorId: session.userId },
    });
    if (!lesson) return c.json({ error: "Não autorizado" }, 401);
  } else if (entry.studentId !== session.userId) {
    return c.json({ error: "Não autorizado" }, 401);
  }

  await prisma.vocabularyEntry.delete({ where: { id: wordId } });
  return c.json({ ok: true });
});
