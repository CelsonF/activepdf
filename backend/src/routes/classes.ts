import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { requireTeacher, type AuthEnv } from "../middleware/auth.js";
import { jsonValidator } from "../lib/validate.js";
import { findOwnedStudent } from "../lib/ownership.js";
import {
  addClassStudentSchema,
  createClassSchema,
  updateClassSchema,
} from "../schemas/misc.js";

export const classRoutes = new Hono<AuthEnv>();

classRoutes.use("*", requireTeacher);

// GET /api/classes
classRoutes.get("/", async (c) => {
  const session = c.get("session");

  const classes = await prisma.class.findMany({
    where: { professorId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      students: {
        include: {
          student: { select: { id: true, name: true } },
        },
      },
    },
  });

  return c.json(
    classes.map((cls) => ({
      id: cls.id,
      name: cls.name,
      description: cls.description,
      createdAt: cls.createdAt,
      studentCount: cls.students.length,
      students: cls.students.map((cs) => cs.student),
    }))
  );
});

// POST /api/classes
classRoutes.post("/", jsonValidator(createClassSchema), async (c) => {
  const session = c.get("session");
  const { name, description, studentIds } = c.req.valid("json");

  const cls = await prisma.class.create({
    data: {
      professorId: session.userId,
      name,
      description: description?.trim() || null,
    },
  });

  if (studentIds && studentIds.length > 0) {
    const owned = await prisma.student.findMany({
      where: { id: { in: studentIds }, professorId: session.userId },
      select: { id: true },
    });
    // skipDuplicates não é suportado no SQLite; a classe é nova e owned não tem repetidos
    await prisma.classStudent.createMany({
      data: owned.map((s) => ({ classId: cls.id, studentId: s.id })),
    });
  }

  return c.json({ id: cls.id }, 201);
});

// GET /api/classes/:id
classRoutes.get("/:id", async (c) => {
  const session = c.get("session");

  const cls = await prisma.class.findUnique({
    where: { id: c.req.param("id") },
    include: {
      students: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              userStats: { select: { xp: true, level: true, streak: true } },
            },
          },
        },
      },
    },
  });

  if (!cls) return c.json({ error: "Turma não encontrada" }, 404);
  if (cls.professorId !== session.userId)
    return c.json({ error: "Acesso negado" }, 403);

  return c.json({
    id: cls.id,
    name: cls.name,
    description: cls.description,
    createdAt: cls.createdAt,
    students: cls.students.map((cs) => ({
      ...cs.student,
      addedAt: cs.addedAt,
    })),
  });
});

// PATCH /api/classes/:id — rename / redescribe
classRoutes.patch("/:id", jsonValidator(updateClassSchema), async (c) => {
  const session = c.get("session");

  const cls = await prisma.class.findUnique({ where: { id: c.req.param("id") } });
  if (!cls) return c.json({ error: "Turma não encontrada" }, 404);
  if (cls.professorId !== session.userId)
    return c.json({ error: "Acesso negado" }, 403);

  const { name, description } = c.req.valid("json");

  await prisma.class.update({
    where: { id: cls.id },
    data: {
      ...(name?.trim() && { name: name.trim() }),
      ...(description !== undefined && {
        description: description?.trim() || null,
      }),
    },
  });

  return c.json({ ok: true });
});

// DELETE /api/classes/:id
classRoutes.delete("/:id", async (c) => {
  const session = c.get("session");

  const cls = await prisma.class.findUnique({ where: { id: c.req.param("id") } });
  if (!cls) return c.json({ error: "Turma não encontrada" }, 404);
  if (cls.professorId !== session.userId)
    return c.json({ error: "Acesso negado" }, 403);

  await prisma.class.delete({ where: { id: cls.id } });
  return c.json({ ok: true });
});

// POST /api/classes/:id/students — add student(s)
classRoutes.post("/:id/students", jsonValidator(addClassStudentSchema), async (c) => {
  const session = c.get("session");

  const cls = await prisma.class.findUnique({ where: { id: c.req.param("id") } });
  if (!cls) return c.json({ error: "Turma não encontrada" }, 404);
  if (cls.professorId !== session.userId)
    return c.json({ error: "Acesso negado" }, 403);

  const { studentId } = c.req.valid("json");

  const student = await findOwnedStudent(session.userId, studentId);
  if (!student) return c.json({ error: "Aluno não encontrado" }, 404);

  await prisma.classStudent.upsert({
    where: { classId_studentId: { classId: cls.id, studentId } },
    create: { classId: cls.id, studentId },
    update: {},
  });

  return c.json({ ok: true }, 201);
});

// DELETE /api/classes/:id/students/:studentId — remove student
classRoutes.delete("/:id/students/:studentId", async (c) => {
  const session = c.get("session");

  const cls = await prisma.class.findUnique({ where: { id: c.req.param("id") } });
  if (!cls) return c.json({ error: "Turma não encontrada" }, 404);
  if (cls.professorId !== session.userId)
    return c.json({ error: "Acesso negado" }, 403);

  await prisma.classStudent.deleteMany({
    where: { classId: cls.id, studentId: c.req.param("studentId") },
  });

  return c.json({ ok: true });
});
