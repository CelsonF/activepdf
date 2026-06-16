import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma.server";
import { createSession, destroySession, getSession } from "../session.server";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "Email é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const register = createServerFn({ method: "POST" })
  .inputValidator(registerSchema)
  .handler(async ({ data }) => {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new Response(JSON.stringify({ error: "Este email já está cadastrado" }), {
        status: 409,
        headers: { "content-type": "application/json" },
      });
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, password: hashed },
    });

    await createSession({ userId: user.id, name: user.name });
    return { id: user.id, name: user.name, email: user.email };
  });

export const login = createServerFn({ method: "POST" })
  .inputValidator(loginSchema)
  .handler(async ({ data }) => {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      omit: { password: false },
    });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new Response(JSON.stringify({ error: "Email ou senha incorretos" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }

    await createSession({ userId: user.id, name: user.name });
    return { id: user.id, name: user.name, email: user.email };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  destroySession();
  return { ok: true };
});

export const me = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return null;

  return { id: user.id, name: user.name, email: user.email };
});