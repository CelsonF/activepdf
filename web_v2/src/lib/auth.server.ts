import { SignJWT, jwtVerify } from "jose";

// Server-only: assinatura/verificação do token de sessão.

export interface SessionPayload {
  userId: string;
  name: string;
}

const rawSecret = process.env.JWT_SECRET;
if (!rawSecret && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET é obrigatório em produção (mínimo 32 bytes)");
}
const secretKey = new TextEncoder().encode(
  rawSecret ?? "grifo-dev-secret-change-in-production",
);

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}