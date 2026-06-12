import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthEnv } from "../middleware/auth.js";
import { jsonValidator } from "../lib/validate.js";
import { changePasswordSchema, updateProfileSchema } from "../schemas/auth.js";

export const profileRoutes = new Hono<AuthEnv>();

profileRoutes.use("*", requireAuth);

// GET /api/profile — dados da conta logada (sem hash de senha, garantido pelo omit global)
profileRoutes.get("/", async (c) => {
  const session = c.get("session");

  if (session.role === "teacher") {
    const professor = await prisma.professor.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, bio: true },
    });
    if (!professor) return c.json({ error: "Conta não encontrada" }, 404);
    return c.json({ ...professor, role: "teacher" });
  }

  const student = await prisma.student.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, isAutodidact: true },
  });
  if (!student) return c.json({ error: "Conta não encontrada" }, 404);
  return c.json({ ...student, bio: null, role: "student" });
});

// PATCH /api/profile — nome (ambos) e bio (professor)
profileRoutes.patch("/", jsonValidator(updateProfileSchema), async (c) => {
  const session = c.get("session");
  const { name, bio } = c.req.valid("json");

  if (session.role === "teacher") {
    const updated = await prisma.professor.update({
      where: { id: session.userId },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio: bio?.trim() || null }),
      },
      select: { name: true, email: true, bio: true },
    });
    return c.json({ ...updated, role: "teacher" });
  }

  const updated = await prisma.student.update({
    where: { id: session.userId },
    data: { ...(name && { name }) },
    select: { name: true, email: true },
  });
  return c.json({ ...updated, bio: null, role: "student" });
});

// PATCH /api/profile/password — troca de senha verificando a atual
profileRoutes.patch("/password", jsonValidator(changePasswordSchema), async (c) => {
  const session = c.get("session");
  const { currentPassword, newPassword } = c.req.valid("json");

  const account =
    session.role === "teacher"
      ? await prisma.professor.findUnique({
          where: { id: session.userId },
          omit: { password: false },
        })
      : await prisma.student.findUnique({
          where: { id: session.userId },
          omit: { password: false },
        });

  if (!account) return c.json({ error: "Conta não encontrada" }, 404);
  if (!(await bcrypt.compare(currentPassword, account.password))) {
    return c.json({ error: "Senha atual incorreta" }, 401);
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  if (session.role === "teacher") {
    await prisma.professor.update({ where: { id: session.userId }, data: { password: hashed } });
  } else {
    await prisma.student.update({ where: { id: session.userId }, data: { password: hashed } });
  }

  return c.json({ ok: true });
});

// DELETE /api/profile — exclui a conta logada (cascata via schema)
profileRoutes.delete("/", async (c) => {
  const session = c.get("session");

  if (session.role === "teacher") {
    await prisma.professor.delete({ where: { id: session.userId } });
  } else {
    await prisma.student.delete({ where: { id: session.userId } });
  }

  return c.json({ ok: true });
});
