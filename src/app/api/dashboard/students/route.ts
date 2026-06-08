import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "teacher") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const students = await prisma.student.findMany({
    where: { professorId: session.userId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(students);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "teacher") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { name, email, password, level, objective, bookRef, notes } = await req.json();

  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 });
  }

  const existing = await prisma.student.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Este email já está em uso" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 10);
  const student = await prisma.student.create({
    data: {
      name: name.trim(),
      email,
      password: hashed,
      professorId: session.userId,
    },
  });

  if (level?.trim() && objective?.trim()) {
    await prisma.learningPlan.create({
      data: {
        studentId: student.id,
        professorId: session.userId,
        level: level.trim(),
        objective: objective.trim(),
        bookRef: bookRef?.trim() || null,
        notes: notes?.trim() || null,
      },
    });
  }

  return NextResponse.json({ id: student.id }, { status: 201 });
}
