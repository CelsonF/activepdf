import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "../prisma.server";
import { requireSession } from "../session.server";

const createDocumentSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório"),
  pdfName: z.string().min(1, "PDF é obrigatório"),
  pdfData: z.string().min(1, "PDF é obrigatório"), // base64
  fieldsJson: z.array(z.unknown()).optional(),
  notesJson: z.record(z.string(), z.string()).optional(),
});

const updateDocumentSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).optional(),
  fieldsJson: z.array(z.unknown()).optional(),
  notesJson: z.record(z.string(), z.string()).optional(),
});

const idSchema = z.object({ id: z.string().min(1) });

// Lista os documentos do usuário logado (sem o pdfData, que pode ser grande).
export const listDocuments = createServerFn({ method: "GET" }).handler(async () => {
  const session = await requireSession();
  return prisma.document.findMany({
    where: { ownerId: session.userId },
    select: { id: true, title: true, pdfName: true, createdAt: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
});

export const getDocument = createServerFn({ method: "GET" })
  .inputValidator(idSchema)
  .handler(async ({ data }) => {
    const session = await requireSession();
    const doc = await prisma.document.findFirst({
      where: { id: data.id, ownerId: session.userId },
    });
    if (!doc) {
      throw new Response(JSON.stringify({ error: "Documento não encontrado" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }
    return doc;
  });

export const createDocument = createServerFn({ method: "POST" })
  .inputValidator(createDocumentSchema)
  .handler(async ({ data }) => {
    const session = await requireSession();
    const doc = await prisma.document.create({
      data: {
        ownerId: session.userId,
        title: data.title,
        pdfName: data.pdfName,
        pdfData: data.pdfData,
        fieldsJson: JSON.stringify(data.fieldsJson ?? []),
        notesJson: JSON.stringify(data.notesJson ?? {}),
      },
      select: { id: true, title: true, pdfName: true, createdAt: true, updatedAt: true },
    });
    return doc;
  });

export const updateDocument = createServerFn({ method: "POST" })
  .inputValidator(updateDocumentSchema)
  .handler(async ({ data }) => {
    const session = await requireSession();
    const existing = await prisma.document.findFirst({
      where: { id: data.id, ownerId: session.userId },
    });
    if (!existing) {
      throw new Response(JSON.stringify({ error: "Documento não encontrado" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    const doc = await prisma.document.update({
      where: { id: existing.id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.fieldsJson !== undefined
          ? { fieldsJson: JSON.stringify(data.fieldsJson) }
          : {}),
        ...(data.notesJson !== undefined ? { notesJson: JSON.stringify(data.notesJson) } : {}),
      },
      select: { id: true, title: true, pdfName: true, createdAt: true, updatedAt: true },
    });
    return doc;
  });

export const deleteDocument = createServerFn({ method: "POST" })
  .inputValidator(idSchema)
  .handler(async ({ data }) => {
    const session = await requireSession();
    const existing = await prisma.document.findFirst({
      where: { id: data.id, ownerId: session.userId },
    });
    if (!existing) {
      throw new Response(JSON.stringify({ error: "Documento não encontrado" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }
    await prisma.document.delete({ where: { id: existing.id } });
    return { ok: true };
  });import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "../prisma.server";
import { requireSession } from "../session.server";

const createDocumentSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório"),
  pdfName: z.string().min(1, "PDF é obrigatório"),
  pdfData: z.string().min(1, "PDF é obrigatório"), // base64
  fieldsJson: z.array(z.unknown()).optional(),
  notesJson: z.record(z.string(), z.string()).optional(),
});

const updateDocumentSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).optional(),
  fieldsJson: z.array(z.unknown()).optional(),
  notesJson: z.record(z.string(), z.string()).optional(),
});

const idSchema = z.object({ id: z.string().min(1) });

// Lista os documentos do usuário logado (sem o pdfData, que pode ser grande).
export const listDocuments = createServerFn({ method: "GET" }).handler(async () => {
  const session = await requireSession();
  return prisma.document.findMany({
    where: { ownerId: session.userId },
    select: { id: true, title: true, pdfName: true, createdAt: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
});

export const getDocument = createServerFn({ method: "GET" })
  .inputValidator(idSchema)
  .handler(async ({ data }) => {
    const session = await requireSession();
    const doc = await prisma.document.findFirst({
      where: { id: data.id, ownerId: session.userId },
    });
    if (!doc) {
      throw new Response(JSON.stringify({ error: "Documento não encontrado" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }
    return doc;
  });

export const createDocument = createServerFn({ method: "POST" })
  .inputValidator(createDocumentSchema)
  .handler(async ({ data }) => {
    const session = await requireSession();
    const doc = await prisma.document.create({
      data: {
        ownerId: session.userId,
        title: data.title,
        pdfName: data.pdfName,
        pdfData: data.pdfData,
        fieldsJson: JSON.stringify(data.fieldsJson ?? []),
        notesJson: JSON.stringify(data.notesJson ?? {}),
      },
      select: { id: true, title: true, pdfName: true, createdAt: true, updatedAt: true },
    });
    return doc;
  });

export const updateDocument = createServerFn({ method: "POST" })
  .inputValidator(updateDocumentSchema)
  .handler(async ({ data }) => {
    const session = await requireSession();
    const existing = await prisma.document.findFirst({
      where: { id: data.id, ownerId: session.userId },
    });
    if (!existing) {
      throw new Response(JSON.stringify({ error: "Documento não encontrado" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    const doc = await prisma.document.update({
      where: { id: existing.id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.fieldsJson !== undefined
          ? { fieldsJson: JSON.stringify(data.fieldsJson) }
          : {}),
        ...(data.notesJson !== undefined ? { notesJson: JSON.stringify(data.notesJson) } : {}),
      },
      select: { id: true, title: true, pdfName: true, createdAt: true, updatedAt: true },
    });
    return doc;
  });

export const deleteDocument = createServerFn({ method: "POST" })
  .inputValidator(idSchema)
  .handler(async ({ data }) => {
    const session = await requireSession();
    const existing = await prisma.document.findFirst({
      where: { id: data.id, ownerId: session.userId },
    });
    if (!existing) {
      throw new Response(JSON.stringify({ error: "Documento não encontrado" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }
    await prisma.document.delete({ where: { id: existing.id } });
    return { ok: true };
  });