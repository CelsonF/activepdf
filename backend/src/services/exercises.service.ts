import { prisma } from "../lib/prisma.js";
import { findOwnedStudent } from "../lib/ownership.js";
import { awardXp } from "./gamification.service.js";
import { ok, err, type Result } from "./result.js";
import type { ExerciseStatus } from "../generated/prisma/enums.js";
import type { Exercise } from "../generated/prisma/client.js";

interface Page {
  take?: number;
  skip?: number;
}

export function listForTeacher(
  professorId: string,
  opts: Page & { studentId?: string; status?: ExerciseStatus }
) {
  return prisma.exercise.findMany({
    where: {
      professorId,
      ...(opts.studentId ? { studentId: opts.studentId } : {}),
      ...(opts.status ? { status: opts.status } : {}),
    },
    select: {
      id: true, title: true, pdfName: true, status: true,
      studentId: true, createdAt: true,
      student: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: opts.take,
    skip: opts.skip,
  });
}

export function listForStudent(studentId: string, { take, skip }: Page) {
  return prisma.exercise.findMany({
    where: { studentId },
    select: {
      id: true, title: true, pdfName: true, status: true, createdAt: true,
      professor: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take,
    skip,
  });
}

interface CreateInput {
  title: string;
  pdfName: string;
  pdfData: string;
  studentId?: string | null;
  lessonId?: string | null;
  fieldsJson?: unknown[];
}

/**
 * Aluno (autodidata ou não) envia o próprio PDF: exercício sem professor,
 * sempre vinculado a ele mesmo — ignora studentId/lessonId do body.
 * Campos interativos só são persistidos para autodidatas (donos do editor).
 */
export async function createAsStudent(
  studentId: string,
  input: CreateInput
): Promise<Result<{ id: string }>> {
  const me = await prisma.student.findUnique({
    where: { id: studentId },
    select: { isAutodidact: true },
  });
  if (!me) return err(404, "Conta não encontrada");

  const exercise = await prisma.exercise.create({
    data: {
      title: input.title,
      studentId,
      pdfName: input.pdfName,
      pdfData: input.pdfData,
      fieldsJson: JSON.stringify(me.isAutodidact ? input.fieldsJson ?? [] : []),
    },
  });
  return ok({ id: exercise.id });
}

export async function createAsTeacher(
  professorId: string,
  input: CreateInput
): Promise<Result<{ id: string }>> {
  if (input.studentId) {
    const student = await findOwnedStudent(professorId, input.studentId);
    if (!student) return err(404, "Aluno não encontrado");
  }

  const exercise = await prisma.exercise.create({
    data: {
      title: input.title,
      professorId,
      studentId: input.studentId || null,
      lessonId: input.lessonId || null,
      pdfName: input.pdfName,
      pdfData: input.pdfData,
      fieldsJson: JSON.stringify(input.fieldsJson ?? []),
    },
  });
  return ok({ id: exercise.id });
}

/** Busca + checagem de acesso (professor dono ou aluno destinatário). */
async function findAccessible(
  id: string,
  who: { role: string; userId: string }
): Promise<Result<Exercise>> {
  const exercise = await prisma.exercise.findUnique({ where: { id } });
  if (!exercise) return err(404, "Exercício não encontrado");

  const canAccess =
    (who.role === "teacher" && exercise.professorId === who.userId) ||
    (who.role === "student" && exercise.studentId === who.userId);
  if (!canAccess) return err(403, "Acesso negado");

  return ok(exercise);
}

export function getForSession(who: { role: string; userId: string }, id: string) {
  return findAccessible(id, who);
}

export async function submitAnswers(
  studentId: string,
  id: string,
  input: { answersJson?: string; status?: ExerciseStatus }
): Promise<Result<{ ok: true; status: ExerciseStatus }>> {
  const found = await findAccessible(id, { role: "student", userId: studentId });
  if (!found.ok) return found;
  const exercise = found.data;

  const wasCompleted = exercise.status !== "completed" && input.status === "completed";

  const updated = await prisma.exercise.update({
    where: { id },
    data: {
      ...(typeof input.answersJson === "string" && { answersJson: input.answersJson }),
      ...(input.status !== undefined && { status: input.status }),
    },
  });

  if (wasCompleted) {
    await awardXp(studentId, 20, "exercise_completed", exercise.id);
  }

  return ok({ ok: true, status: updated.status });
}

/** Visão de correção: campos + resposta do aluno + feedback, item a item. */
export async function buildReview(professorId: string, id: string) {
  const exercise = await prisma.exercise.findUnique({
    where: { id },
    include: { student: { select: { id: true, name: true } } },
  });
  if (!exercise) return err(404, "Exercício não encontrado");
  if (exercise.professorId !== professorId) return err(403, "Acesso negado");

  const fields: Array<Record<string, unknown>> = JSON.parse(exercise.fieldsJson ?? "[]");
  const answers: Record<string, unknown> = JSON.parse(exercise.answersJson ?? "{}");
  const correction: {
    grade?: string;
    comment?: string;
    items?: Record<string, { correct: boolean; feedback?: string }>;
  } = JSON.parse(exercise.correctionJson ?? "{}");

  const items = fields.map((field) => {
    const fieldId = field.id as string;
    return {
      ...field,
      studentAnswer: answers[fieldId] ?? null,
      correct: correction.items?.[fieldId]?.correct ?? null,
      feedback: correction.items?.[fieldId]?.feedback ?? null,
    };
  });

  return ok({
    id: exercise.id,
    title: exercise.title,
    pdfName: exercise.pdfName,
    status: exercise.status,
    student: exercise.student,
    createdAt: exercise.createdAt,
    updatedAt: exercise.updatedAt,
    grade: correction.grade ?? null,
    comment: correction.comment ?? null,
    items,
  });
}

export async function applyReview(
  professorId: string,
  id: string,
  input: {
    grade?: string | null;
    comment?: string | null;
    items?: Record<string, { correct: boolean; feedback?: string | null }>;
  }
): Promise<Result<{ ok: true }>> {
  const found = await findAccessible(id, { role: "teacher", userId: professorId });
  if (!found.ok) return found;

  const correctionJson = JSON.stringify({
    grade: input.grade?.trim() || null,
    comment: input.comment?.trim() || null,
    items: input.items ?? {},
  });

  await prisma.exercise.update({
    where: { id },
    data: { correctionJson, status: "corrected" },
  });

  return ok({ ok: true });
}

export async function removeOwned(
  professorId: string,
  id: string
): Promise<Result<{ ok: true }>> {
  const found = await findAccessible(id, { role: "teacher", userId: professorId });
  if (!found.ok) return found;

  await prisma.exercise.delete({ where: { id } });
  return ok({ ok: true });
}
