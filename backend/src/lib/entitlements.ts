import { prisma } from "./prisma.js";
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
 * Plano efetivo da sessão. PRO = professor com assinatura AUTHORIZED
 * (a Subscription sincronizada pelo webhook é a fonte da verdade).
 */
export async function planForSession(
  session: Pick<SessionPayload, "role" | "userId">
): Promise<Plan> {
  if (session.role !== "teacher") return "FREE";
  const sub = await prisma.subscription.findUnique({
    where: { professorId: session.userId },
    select: { status: true },
  });
  return sub?.status === "AUTHORIZED" ? "PRO" : "FREE";
}

export function savedDocumentsLimit(plan: Plan): number | null {
  return PLAN_LIMITS[plan].savedDocuments;
}
