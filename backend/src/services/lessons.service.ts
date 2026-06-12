import { prisma } from "../lib/prisma.js";
import { findOwnedStudent } from "../lib/ownership.js";
import { awardXp } from "./gamification.service.js";
import { ok, err, type Result } from "./result.js";
import type { LessonStatus } from "../generated/prisma/enums.js";

interface Page {
  take?: number;
  skip?: number;
}

export function listForStudent(
  studentId: string,
  opts: Page & { status?: LessonStatus }
) {
  return prisma.lesson.findMany({
    where: {
      studentId,
      ...(opts.status ? { status: opts.status } : {}),
    },
    select: {
      id: true,
      scheduledAt: true,
      status: true,
      meetLink: true,
      content: true,
      homework: true,
      subject: { select: { id: true, name: true } },
    },
    orderBy: { scheduledAt: "asc" },
    take: opts.take,
    skip: opts.skip,
  });
}

export function listForTeacher(
  professorId: string,
  opts: Page & { status?: LessonStatus; studentId?: string }
) {
  return prisma.lesson.findMany({
    where: {
      professorId,
      ...(opts.status ? { status: opts.status } : {}),
      ...(opts.studentId ? { studentId: opts.studentId } : {}),
    },
    include: { student: { select: { id: true, name: true } } },
    orderBy: { scheduledAt: "asc" },
    take: opts.take,
    skip: opts.skip,
  });
}

interface CreateInput {
  studentId: string;
  subjectId?: string | null;
  scheduledAt: string;
  meetLink?: string | null;
  content?: string | null;
  homework?: string | null;
  notes?: string | null;
}

export async function create(
  professorId: string,
  input: CreateInput
): Promise<Result<{ id: string }>> {
  const student = await findOwnedStudent(professorId, input.studentId);
  if (!student) return err(404, "Aluno não encontrado");

  const lesson = await prisma.lesson.create({
    data: {
      studentId: input.studentId,
      professorId,
      subjectId: input.subjectId || null,
      scheduledAt: new Date(input.scheduledAt),
      meetLink: input.meetLink?.trim() || null,
      content: input.content?.trim() || null,
      homework: input.homework?.trim() || null,
      notes: input.notes?.trim() || null,
      status: "SCHEDULED",
    },
  });
  return ok({ id: lesson.id });
}

export async function getForStudent(studentId: string, lessonId: string) {
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, studentId },
    select: {
      id: true,
      scheduledAt: true,
      status: true,
      meetLink: true,
      content: true,
      homework: true,
      subject: true,
      vocabularyEntries: {
        where: { studentId },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!lesson) return err(404, "Aula não encontrada");
  return ok(lesson);
}

export async function getForTeacher(professorId: string, lessonId: string) {
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, professorId },
    include: {
      student: { select: { id: true, name: true, email: true } },
      subject: true,
      vocabularyEntries: true,
    },
  });
  if (!lesson) return err(404, "Aula não encontrada");
  return ok(lesson);
}

interface UpdateInput {
  subjectId?: string | null;
  scheduledAt?: string;
  meetLink?: string | null;
  content?: string | null;
  homework?: string | null;
  notes?: string | null;
  status?: LessonStatus;
}

/** Atualiza a aula do professor; concluir a aula premia o aluno com XP (uma vez). */
export async function update(professorId: string, lessonId: string, input: UpdateInput) {
  const existing = await prisma.lesson.findFirst({
    where: { id: lessonId, professorId },
  });
  if (!existing) return err(404, "Aula não encontrada");

  const wasCompleted = existing.status !== "COMPLETED" && input.status === "COMPLETED";

  const updated = await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      ...(input.subjectId !== undefined ? { subjectId: input.subjectId || null } : {}),
      ...(input.scheduledAt !== undefined ? { scheduledAt: new Date(input.scheduledAt) } : {}),
      ...(input.meetLink !== undefined ? { meetLink: input.meetLink?.trim() || null } : {}),
      ...(input.content !== undefined ? { content: input.content?.trim() || null } : {}),
      ...(input.homework !== undefined ? { homework: input.homework?.trim() || null } : {}),
      ...(input.notes !== undefined ? { notes: input.notes?.trim() || null } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    },
  });

  if (wasCompleted && existing.studentId) {
    await awardXp(existing.studentId, 15, "lesson_attended", existing.id);
  }

  return ok(updated);
}

export async function remove(
  professorId: string,
  lessonId: string
): Promise<Result<{ ok: true }>> {
  const existing = await prisma.lesson.findFirst({
    where: { id: lessonId, professorId },
  });
  if (!existing) return err(404, "Aula não encontrada");

  await prisma.lesson.delete({ where: { id: lessonId } });
  return ok({ ok: true });
}
