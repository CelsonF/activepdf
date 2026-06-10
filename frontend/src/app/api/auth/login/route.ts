import { NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
const COOKIE = "activepdf_session";

export async function POST(req: Request) {
  const body = await req.text();
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });

  const response = NextResponse.json({ ok: true, role: data.role, name: data.name });
  response.cookies.set({
    name: COOKIE,
    value: data.token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
