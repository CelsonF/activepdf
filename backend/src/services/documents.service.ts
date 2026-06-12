import { prisma } from "../lib/prisma.js";
import { planForSession, savedDocumentsLimit, type Plan } from "../lib/entitlements.js";
import { ok, err, type Result } from "./result.js";
import type { SavedDocument } from "../generated/prisma/client.js";

interface Page {
  take?: number;
  skip?: number;
}

export function listForStudent(studentId: string, { take, skip }: Page) {
  return prisma.savedDocument.findMany({
    where: { studentId },
    select: { id: true, title: true, pdfName: true, createdAt: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take,
    skip,
  });
}

/** Uso atual × limite do plano — alimenta o medidor de "Meus documentos". */
export async function usageForStudent(studentId: string, plan: Plan) {
  const used = await prisma.savedDocument.count({ where: { studentId } });
  return { used, limit: savedDocumentsLimit(plan) };
}

interface CreateInput {
  title: string;
  pdfName: string;
  pdfData: string;
  fieldsJson?: unknown[];
}

export async function create(
  session: { userId: string; role: "teacher" | "student" },
  input: CreateInput
): Promise<Result<SavedDocument>> {
  const limit = savedDocumentsLimit(await planForSession(session));
  if (limit !== null) {
    const used = await prisma.savedDocument.count({ where: { studentId: session.userId } });
    if (used >= limit) {
      return err(
        409,
        `Limite de ${limit} documentos do plano gratuito atingido. Exclua um documento ou conheça o plano Professor.`
      );
    }
  }

  const doc = await prisma.savedDocument.create({
    data: {
      studentId: session.userId,
      title: input.title,
      pdfName: input.pdfName,
      pdfData: input.pdfData,
      fieldsJson: JSON.stringify(input.fieldsJson ?? []),
    },
  });
  return ok(doc);
}

export async function getForStudent(
  studentId: string,
  id: string
): Promise<Result<SavedDocument>> {
  const doc = await prisma.savedDocument.findFirst({ where: { id, studentId } });
  if (!doc) return err(404, "Documento não encontrado");
  return ok(doc);
}

interface UpdateInput {
  title?: string;
  fieldsJson?: unknown[];
  answersJson?: string;
}

export async function update(
  studentId: string,
  id: string,
  input: UpdateInput
): Promise<Result<SavedDocument>> {
  const existing = await prisma.savedDocument.findFirst({ where: { id, studentId } });
  if (!existing) return err(404, "Documento não encontrado");

  const doc = await prisma.savedDocument.update({
    where: { id: existing.id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.fieldsJson !== undefined ? { fieldsJson: JSON.stringify(input.fieldsJson) } : {}),
      ...(input.answersJson !== undefined ? { answersJson: input.answersJson } : {}),
    },
  });
  return ok(doc);
}

export async function remove(studentId: string, id: string): Promise<Result<{ ok: true }>> {
  const existing = await prisma.savedDocument.findFirst({ where: { id, studentId } });
  if (!existing) return err(404, "Documento não encontrado");
  await prisma.savedDocument.delete({ where: { id: existing.id } });
  return ok({ ok: true });
}
