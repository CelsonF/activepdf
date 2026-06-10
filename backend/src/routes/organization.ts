import { Hono } from "hono";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { prisma } from "../lib/prisma.js";
import { getSession } from "../lib/auth.js";
import { decodeBase64Payload, detectImage } from "../lib/files.js";

export const organizationRoutes = new Hono();

const MAX_LOGO_BYTES = 2 * 1024 * 1024;

function toSlug(name: string, suffix: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${suffix}`;
}

// GET /api/organization — retorna a org do professor logado
organizationRoutes.get("/", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const org = await prisma.organization.findUnique({
    where: { professorId: session.userId },
  });
  if (!org) return c.json({ error: "Organização não encontrada" }, 404);
  return c.json(org);
});

// PATCH /api/organization — atualiza nome e/ou logo (base64)
organizationRoutes.patch("/", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const org = await prisma.organization.findUnique({
    where: { professorId: session.userId },
  });
  if (!org) return c.json({ error: "Organização não encontrada" }, 404);

  const { name, logoBase64 } = await c.req.json();

  let logoUrl = org.logoUrl;

  if (logoBase64) {
    // formato: "data:image/jpeg;base64,/9j/..."
    if (typeof logoBase64 !== "string" || !/^data:image\/[a-z+.-]+;base64,/.test(logoBase64)) {
      return c.json({ error: "Formato de imagem inválido" }, 400);
    }

    const buffer = decodeBase64Payload(logoBase64);
    if (buffer.byteLength > MAX_LOGO_BYTES) {
      return c.json({ error: "Imagem muito grande (máximo 2MB)" }, 413);
    }

    // Tipo real vem dos magic bytes; SVG fica fora (risco de XSS servido em /uploads)
    const detected = detectImage(buffer);
    if (!detected) {
      return c.json({ error: "Apenas imagens PNG, JPEG ou WebP são aceitas" }, 400);
    }

    const filename = `${org.id}.${detected.ext}`;
    const dir = join(process.cwd(), "uploads", "logos");

    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), buffer);
    logoUrl = `/uploads/logos/${filename}`;
  }

  const updated = await prisma.organization.update({
    where: { id: org.id },
    data: {
      ...(name?.trim() ? { name: name.trim() } : {}),
      logoUrl,
    },
  });

  return c.json(updated);
});
