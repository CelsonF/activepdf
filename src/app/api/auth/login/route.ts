import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signSession, sessionCookieOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
  }

  const professor = await prisma.professor.findUnique({ where: { email } });
  const student = await prisma.student.findUnique({ where: { email } });
  const user = professor ?? student;

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: "Email ou senha incorretos" }, { status: 401 });
  }

  const role = professor ? "teacher" : "student";
  const token = await signSession({ userId: user.id, role, name: user.name });

  const res = NextResponse.json({ ok: true, role, name: user.name });
  res.cookies.set(sessionCookieOptions(token));
  return res;
}
