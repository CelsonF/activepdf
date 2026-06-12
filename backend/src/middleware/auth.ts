import { createMiddleware } from "hono/factory";
import { getSession, type SessionPayload } from "../lib/auth.js";
import { planForSession, type Plan } from "../lib/entitlements.js";

export type AuthEnv = { Variables: { session: SessionPayload } };

const UNAUTHORIZED = { error: "Não autorizado" } as const;

/** Exige sessão válida (qualquer papel); disponibiliza em c.get("session"). */
export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const session = await getSession(c);
  if (!session) return c.json(UNAUTHORIZED, 401);
  c.set("session", session);
  return next();
});

export const requireTeacher = createMiddleware<AuthEnv>(async (c, next) => {
  const session = await getSession(c);
  if (!session || session.role !== "teacher") return c.json(UNAUTHORIZED, 401);
  c.set("session", session);
  return next();
});

export const requireStudent = createMiddleware<AuthEnv>(async (c, next) => {
  const session = await getSession(c);
  if (!session || session.role !== "student") return c.json(UNAUTHORIZED, 401);
  c.set("session", session);
  return next();
});

/** Exige sessão com o plano dado (gate de recurso Pro). */
export const requirePlan = (plan: Plan) =>
  createMiddleware<AuthEnv>(async (c, next) => {
    const session = await getSession(c);
    if (!session) return c.json(UNAUTHORIZED, 401);
    if (planForSession(session) !== plan) {
      return c.json({ error: "Recurso disponível apenas no plano Professor" }, 403);
    }
    c.set("session", session);
    return next();
  });
