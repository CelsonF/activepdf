import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "teacher") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { studentId, scheduledAt, meetLink, content, homework, notes } = await req.json();

  if (!studentId || !scheduledAt) {
    return NextResponse.json({ error: "Aluno e data são obrigatórios" }, { status: 400 });
  }

  const student = await prisma.student.findFirst({
    where: { id: studentId, professorId: session.userId },
  });
  if (!student) return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });

  const lesson = await prisma.lesson.create({
    data: {
      studentId,
      professorId: session.userId,
      scheduledAt: new Date(scheduledAt),
      meetLink: meetLink?.trim() || null,
      content: content?.trim() || null,
      homework: homework?.trim() || null,
      notes: notes?.trim() || null,
      status: "SCHEDULED",
    },
  });

  return NextResponse.json({ id: lesson.id }, { status: 201 });
}
