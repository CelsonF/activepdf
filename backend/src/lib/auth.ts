import { SignJWT, jwtVerify } from "jose";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";

export interface SessionPayload {
  userId: string;
  role: "teacher" | "student";
  name: string;
}

const rawSecret = process.env.JWT_SECRET;
if (!rawSecret && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET é obrigatório em produção (mínimo 32 bytes)");
}
const secretKey = new TextEncoder().encode(
  rawSecret ?? "activepdf-dev-secret-change-in-production"
);
const secret = () => secretKey;

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function getSession(c: Context): Promise<SessionPayload | null> {
  const authHeader = c.req.header("Authorization");
  const token =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : getCookie(c, "activepdf_session");

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
