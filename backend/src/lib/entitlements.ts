import type { SessionPayload } from "./auth.js";

export type Plan = "FREE" | "PRO";

/**
 * Limites por plano — fonte única, versionada. `null` = ilimitado.
 * Mudou um limite? É aqui, nunca hardcoded em rota ou service.
 */
export const PLAN_LIMITS = {
  FREE: { savedDocuments: 3 },
  PRO: { savedDocuments: null },
} as const satisfies Record<Plan, { savedDocuments: number | null }>;

/**
 * Plano efetivo da sessão. Até a sprint de billing (Subscription via
 * Mercado Pago), professor é PRO e aluno é FREE.
 */
export function planForSession(session: Pick<SessionPayload, "role">): Plan {
  return session.role === "teacher" ? "PRO" : "FREE";
}

export function savedDocumentsLimit(plan: Plan): number | null {
  return PLAN_LIMITS[plan].savedDocuments;
}
