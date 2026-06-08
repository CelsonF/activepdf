import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const exercise = await prisma.exercise.findUnique({ where: { id: params.id } });
  if (!exercise) return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 });

  // Teacher can access their own; student can only access exercises assigned to them
  const canAccess =
    (session.role === "teacher" && exercise.professorId === session.userId) ||
    (session.role === "student" && exercise.studentId === session.userId);

  if (!canAccess) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  return NextResponse.json(exercise);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (session.role !== "student") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const exercise = await prisma.exercise.findUnique({ where: { id: params.id } });
  if (!exercise) return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 });
  if (exercise.studentId !== session.userId) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const VALID_STATUSES = ["assigned", "in_progress", "completed"];
  const { answersJson, status } = await req.json();
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }
  const updated = await prisma.exercise.update({
    where: { id: params.id },
    data: {
      ...(typeof answersJson === "string" && { answersJson }),
      ...(status !== undefined && { status }),
    },
  });

  return NextResponse.json({ ok: true, status: updated.status });
}
