import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";

function toSlug(name: string, suffix: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${suffix}`;
}

export const authRoutes = new Hono();

const authLimiter = rateLimit({ max: 10, windowMs: 15 * 60 * 1000 });
authRoutes.use("/login", authLimiter);
authRoutes.use("/register", authLimiter);

authRoutes.post("/register", async (c) => {
  const { name, email, password, role, teacherEmail, organizationName } = await c.req.json();

  if (!name?.trim() || !email?.trim() || !password || !role) {
    return c.json({ error: "Todos os campos são obrigatórios" }, 400);
  }

  const existingP = await prisma.professor.findUnique({ where: { email } });
  const existingS = await prisma.student.findUnique({ where: { email } });
  if (existingP || existingS) {
    return c.json({ error: "Este email já está cadastrado" }, 409);
  }

  const hashed = await bcrypt.hash(password, 10);

  if (role === "teacher") {
    const professor = await prisma.professor.create({
      data: { name: name.trim(), email, password: hashed },
    });

    const orgName = organizationName?.trim() || `${name.trim()}'s School`;
    const slug = toSlug(orgName, professor.id.slice(0, 6));

    await prisma.organization.create({
      data: { name: orgName, slug, professorId: professor.id },
    });

    const token = await signToken({ userId: professor.id, role: "teacher", name: professor.name });
    return c.json({ token, role: "teacher", name: professor.name }, 201);
  }

  let professorId: string | undefined;
  if (teacherEmail?.trim()) {
    const professor = await prisma.professor.findUnique({ where: { email: teacherEmail.trim() } });
    if (!professor) return c.json({ error: "Professor não encontrado com esse email" }, 404);
    professorId = professor.id;
  }

  const student = await prisma.student.create({
    data: { name: name.trim(), email, password: hashed, professorId },
  });
  const token = await signToken({ userId: student.id, role: "student", name: student.name });
  return c.json({ token, role: "student", name: student.name }, 201);
});

authRoutes.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: "Email e senha são obrigatórios" }, 400);
  }

  const professor = await prisma.professor.findUnique({
    where: { email },
    omit: { password: false },
  });
  const student = await prisma.student.findUnique({
    where: { email },
    omit: { password: false },
  });
  const user = professor ?? student;

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return c.json({ error: "Email ou senha incorretos" }, 401);
  }

  const role = professor ? "teacher" : "student";
  const token = await signToken({ userId: user.id, role, name: user.name });
  return c.json({ token, role, name: user.name });
});
