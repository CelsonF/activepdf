import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireStudent, requireTeacher, type AuthEnv } from "../middleware/auth.js";
import { jsonValidator } from "../lib/validate.js";
import { findOwnedLesson } from "../lib/ownership.js";
import { decodeBase64Payload, detectAudio } from "../lib/files.js";
import { createAudioSchema } from "../schemas/misc.js";

export const audioRoutes = new Hono<AuthEnv>();

const XP_AUDIO_LISTEN = 10;
const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

audioRoutes.get("/", requireAuth, async (c) => {
  const session = c.get("session");

  const lessonId = c.req.param("lessonId") as string;
  const lesson = await findOwnedLesson(lessonId, session);
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

audioRoutes.get("/:audioId/file", requireAuth, async (c) => {
  const session = c.get("session");

  const lessonId = c.req.param("lessonId") as string;
  const audioId = c.req.param("audioId");

  const lesson = await findOwnedLesson(lessonId, session);
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

audioRoutes.post("/", requireTeacher, jsonValidator(createAudioSchema), async (c) => {
  const session = c.get("session");

  const lessonId = c.req.param("lessonId") as string;
  const lesson = await findOwnedLesson(lessonId, session);
  if (!lesson) return c.json({ error: "Aula não encontrada" }, 404);

  const { title, fileData, durationSecs, transcript } = c.req.valid("json");

  const buffer = decodeBase64Payload(fileData);
  if (buffer.byteLength > MAX_AUDIO_BYTES) {
    return c.json({ error: "Áudio muito grande (máximo 15MB)" }, 413);
  }

  // MIME real vem dos magic bytes; o enviado pelo client é ignorado
  const detected = detectAudio(buffer);
  if (!detected) return c.json({ error: "Formato de áudio não suportado" }, 400);

  const material = await prisma.audioMaterial.create({
    data: {
      lessonId,
      title,
      fileData,
      mimeType: detected.mime,
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

audioRoutes.delete("/:audioId", requireTeacher, async (c) => {
  const session = c.get("session");

  const lessonId = c.req.param("lessonId") as string;
  const audioId = c.req.param("audioId");

  const lesson = await findOwnedLesson(lessonId, session);
  if (!lesson) return c.json({ error: "Aula não encontrada" }, 404);

  const material = await prisma.audioMaterial.findFirst({ where: { id: audioId, lessonId } });
  if (!material) return c.json({ error: "Áudio não encontrado" }, 404);

  await prisma.audioMaterial.delete({ where: { id: audioId } });
  return c.json({ ok: true });
});

audioRoutes.post("/:audioId/listened", requireStudent, async (c) => {
  const session = c.get("session");

  const lessonId = c.req.param("lessonId") as string;
  const audioId = c.req.param("audioId");

  const lesson = await findOwnedLesson(lessonId, session);
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
