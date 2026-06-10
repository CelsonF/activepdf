import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { getSession } from "../lib/auth.js";

export const dashboardRoutes = new Hono();

// Returns everything TeacherDashboard needs in one round-trip
dashboardRoutes.get("/teacher", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json({ error: "Não autorizado" }, 401);

  const [professor, exercises] = await Promise.all([
    prisma.professor.findUnique({
      where: { id: session.userId },
      include: {
        students: {
          include: {
            learningPlan: true,
            lessons: {
              orderBy: { scheduledAt: "asc" },
              take: 1,
              where: { status: "SCHEDULED" },
            },
            _count: { select: { lessons: true } },
          },
        },
        lessons: {
          where: { status: "SCHEDULED", scheduledAt: { gte: new Date() } },
          orderBy: { scheduledAt: "asc" },
          take: 5,
          include: { student: true, subject: true },
        },
      },
    }),
    prisma.exercise.findMany({
      where: { professorId: session.userId },
      select: {
        id: true, title: true, pdfName: true, status: true, createdAt: true,
        student: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  if (!professor) return c.json({ error: "Professor não encontrado" }, 404);

  const subjectsCount = await prisma.subject.count({
    where: { professorId: session.userId },
  });
  return c.json({ professor, exercises, subjectsCount });
});

// Returns everything StudentDashboard needs in one round-trip
dashboardRoutes.get("/student", async (c) => {
  const session = await getSession(c);
  if (!session || session.role !== "student") return c.json({ error: "Não autorizado" }, 401);

  const [student, exercises] = await Promise.all([
    prisma.student.findUnique({
      where: { id: session.userId },
      include: {
        professor: true,
        learningPlan: true,
        subjects: { include: { subject: true } },
        lessons: {
          orderBy: { scheduledAt: "desc" },
          take: 6,
          include: { subject: true, vocabularyEntries: true },
        },
      },
    }),
    prisma.exercise.findMany({
      where: { studentId: session.userId },
      select: { id: true, title: true, pdfName: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!student) return c.json({ error: "Aluno não encontrado" }, 404);
  return c.json({ student, exercises });
});
