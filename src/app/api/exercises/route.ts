import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST — teacher saves a new exercise
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "teacher") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { title, studentId, lessonId, pdfName, pdfData, fieldsJson } = await req.json();

  if (!title?.trim() || !pdfData || !pdfName) {
    return NextResponse.json({ error: "Título e PDF são obrigatórios" }, { status: 400 });
  }

  // Verify student belongs to this teacher if provided
  if (studentId) {
    const student = await prisma.student.findFirst({
      where: { id: studentId, professorId: session.userId },
    });
    if (!student) return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
  }

  const exercise = await prisma.exercise.create({
    data: {
      title: title.trim(),
      professorId: session.userId,
      studentId: studentId || null,
      lessonId: lessonId || null,
      pdfName,
      pdfData,
      fieldsJson: JSON.stringify(fieldsJson ?? []),
    },
  });

  return NextResponse.json({ id: exercise.id }, { status: 201 });
}

// GET — list exercises (teacher: all theirs; student: assigned to them)
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const url = new URL(req.url);
  const studentId = url.searchParams.get("studentId");

  if (session.role === "teacher") {
    const where = studentId
      ? { professorId: session.userId, studentId }
      : { professorId: session.userId };

    const exercises = await prisma.exercise.findMany({
      where,
      select: { id: true, title: true, pdfName: true, status: true, studentId: true, createdAt: true, student: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(exercises);
  }

  // Student: only their exercises
  const exercises = await prisma.exercise.findMany({
    where: { studentId: session.userId },
    select: { id: true, title: true, pdfName: true, status: true, createdAt: true, professor: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(exercises);
}
