import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { getSession } from "../lib/auth.js";
import { decodeBase64Payload, detectAudio } from "../lib/files.js";

export const audioRoutes = new Hono();

const XP_AUDIO_LISTEN = 10;
const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

async function resolveLesson(lessonId: string | undefined, session: { userId: string; role: string }) {
  if (!lessonId) return null;
  if (session.role === "teacher") {
    return prisma.lesson.findFirst({ where: { id: lessonId, professorId: session.userId } });
  }
  return prisma.lesson.findFirst({ where: { id: lessonId, studentId: session.userId } });
}

audioRoutes.get("/", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "Não autorizado" }, 401);

  const lessonId = c.req.param("lessonId") as string;
  const lesson = await resolveLesson(lessonId, session);
  if (!lesson) return c.json({ error: "Aula não encontrada" }, 404);

  const materials = await prisma.audioMaterial.findMany({
    where: { lessonId },
    select: {
      id: true,
      lessonId: true,
      title: true,
      mimeType: true,
      durationSecs: true,
      transcript: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
  return c.json(materials);
});

audioRoutes.get("/:audioId/file", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "Não autorizado" }, 401);

  const lessonId = c.req.param("lessonId") as string;
  const audioId = c.req.param("audioId") as string;

  const lesson = await resolveLesson(lessonId, session);
  if (!lesson) return c.json({ error: "Aula não encontrada" }, 404);

  const material = await prisma.audioMaterial.findFirst({
    where: { id: audioId, lessonId },
  });
  if (!material) return c.json({ error: "Áudio não encontrado" }, 404);

  const binary = Buffer.from(material.fileData, "base64");
  return new Response(binary, {
    headers: {
      "Content-Type": material.mimeType,
      "Content-Length": String(binary.byteLength),
      "Cache-Control": "private, max-age=3600",
    },
  });
});

audioRoutes.post("/", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const lessonId = c.req.param("lessonId") as string;
  const lesson = await resolveLesson(lessonId, session);
  if (!lesson) return c.json({ error: "Aula não encontrada" }, 404);

  const { title, fileData, durationSecs, transcript } = await c.req.json();

  if (!title?.trim()) return c.json({ error: "Título é obrigatório" }, 400);
  if (!fileData || typeof fileData !== "string") {
    return c.json({ error: "Arquivo é obrigatório" }, 400);
  }

  const buffer = decodeBase64Payload(fileData);
  if (buffer.byteLength > MAX_AUDIO_BYTES) {
    return c.json({ error: "Áudio muito grande (máximo 15MB)" }, 413);
  }

  // MIME real vem dos magic bytes; o enviado pelo client é ignorado
  const detected = detectAudio(buffer);
  if (!detected) return c.json({ error: "Formato de áudio não suportado" }, 400);
  const mime = detected.mime;

  const material = await prisma.audioMaterial.create({
    data: {
      lessonId,
      title: title.trim(),
      fileData,
      mimeType: mime,
      durationSecs: durationSecs ?? null,
      transcript: transcript?.trim() || null,
    },
    select: {
      id: true,
      lessonId: true,
      title: true,
      mimeType: true,
      durationSecs: true,
      transcript: true,
      createdAt: true,
    },
  });
  return c.json(material, 201);
});

audioRoutes.delete("/:audioId", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const lessonId = c.req.param("lessonId") as string;
  const audioId = c.req.param("audioId") as string;

  const lesson = await resolveLesson(lessonId, session);
  if (!lesson) return c.json({ error: "Aula não encontrada" }, 404);

  const material = await prisma.audioMaterial.findFirst({ where: { id: audioId, lessonId } });
  if (!material) return c.json({ error: "Áudio não encontrado" }, 404);

  await prisma.audioMaterial.delete({ where: { id: audioId } });
  return c.json({ ok: true });
});

audioRoutes.post("/:audioId/listened", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "student") return c.json({ error: "Não autorizado" }, 401);

  const lessonId = c.req.param("lessonId") as string;
  const audioId = c.req.param("audioId") as string;

  const lesson = await resolveLesson(lessonId, session);
  if (!lesson) return c.json({ error: "Aula não encontrada" }, 404);

  const material = await prisma.audioMaterial.findFirst({ where: { id: audioId, lessonId } });
  if (!material) return c.json({ error: "Áudio não encontrado" }, 404);

  const alreadyRewarded = await prisma.xpEvent.findFirst({
    where: { studentId: session.userId, referenceId: audioId, reason: "audio_listened" },
  });
  if (alreadyRewarded) return c.json({ xpAwarded: 0, alreadyCounted: true });

  await prisma.$transaction([
    prisma.xpEvent.create({
      data: {
        studentId: session.userId,
        points: XP_AUDIO_LISTEN,
        reason: "audio_listened",
        referenceId: audioId,
      },
    }),
    prisma.userStats.upsert({
      where: { studentId: session.userId },
      create: { studentId: session.userId, xp: XP_AUDIO_LISTEN },
      update: { xp: { increment: XP_AUDIO_LISTEN } },
    }),
  ]);

  return c.json({ xpAwarded: XP_AUDIO_LISTEN, alreadyCounted: false });
});
