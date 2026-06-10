import { Hono } from "hono";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { prisma } from "../lib/prisma.js";
import { getSession } from "../lib/auth.js";

export const organizationRoutes = new Hono();

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
    const match = logoBase64.match(/^data:(image\/[a-z]+);base64,(.+)$/);
    if (!match) return c.json({ error: "Formato de imagem inválido" }, 400);

    const [, mimeType, b64data] = match;
    const ext = mimeType.split("/")[1].replace("jpeg", "jpg");
    const filename = `${org.id}.${ext}`;
    const dir = join(process.cwd(), "uploads", "logos");

    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), Buffer.from(b64data, "base64"));
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
