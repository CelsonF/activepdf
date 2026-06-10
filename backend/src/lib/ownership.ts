import { prisma } from "./prisma.js";
import type { SessionPayload } from "./auth.js";

/** Aluno pertencente ao professor, ou null. */
export function findOwnedStudent(professorId: string, studentId: string) {
  return prisma.student.findFirst({ where: { id: studentId, professorId } });
}

/** Aula visível para a sessão: professor dono ou aluno da aula. */
export function findOwnedLesson(lessonId: string | undefined, session: SessionPayload) {
  if (!lessonId) return null;
  if (session.role === "teacher") {
    return prisma.lesson.findFirst({ where: { id: lessonId, professorId: session.userId } });
  }
  return prisma.lesson.findFirst({ where: { id: lessonId, studentId: session.userId } });
}
