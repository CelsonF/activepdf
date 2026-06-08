import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signSession, sessionCookieOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const { name, email, password, role, teacherEmail } = await req.json();

  if (!name?.trim() || !email?.trim() || !password || !role) {
    return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 });
  }

  const existingP = await prisma.professor.findUnique({ where: { email } });
  const existingS = await prisma.student.findUnique({ where: { email } });
  if (existingP || existingS) {
    return NextResponse.json({ error: "Este email já está cadastrado" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);

  if (role === "teacher") {
    const professor = await prisma.professor.create({
      data: { name: name.trim(), email, password: hashed },
    });
    const token = await signSession({ userId: professor.id, role: "teacher", name: professor.name });
    const res = NextResponse.json({ ok: true, role: "teacher", name: professor.name });
    res.cookies.set(sessionCookieOptions(token));
    return res;
  }

  // Student — optionally link to professor by email
  let professorId: string | undefined;
  if (teacherEmail?.trim()) {
    const professor = await prisma.professor.findUnique({ where: { email: teacherEmail.trim() } });
    if (!professor) {
      return NextResponse.json({ error: "Professor não encontrado com esse email" }, { status: 404 });
    }
    professorId = professor.id;
  }

  const student = await prisma.student.create({
    data: { name: name.trim(), email, password: hashed, professorId },
  });
  const token = await signSession({ userId: student.id, role: "student", name: student.name });
  const res = NextResponse.json({ ok: true, role: "student", name: student.name });
  res.cookies.set(sessionCookieOptions(token));
  return res;
}
