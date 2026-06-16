import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { signToken, verifyToken, type SessionPayload } from "./auth.server";

// Server-only: leitura/escrita do cookie de sessão dentro de uma server function.

const COOKIE_NAME = "grifo_session";

export async function getSession(): Promise<SessionPayload | null> {
  const token = getCookie(COOKIE_NAME);
  if (!token) return null;
  return verifyToken(token);
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await signToken(payload);
  setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });
}

export function destroySession(): void {
  deleteCookie(COOKIE_NAME, { path: "/" });
}

/** Lança erro 401 se não houver sessão; use no topo do handler de rotas protegidas. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Response(JSON.stringify({ error: "Não autorizado" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  return session;
}