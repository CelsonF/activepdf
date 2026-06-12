import { prisma } from "../lib/prisma.js";
import { createGateway } from "./billing/index.js";
import { GatewayRejectionError } from "./billing/mercadopago.js";
import { ok, err, type Result } from "./result.js";
import type { Subscription } from "../generated/prisma/client.js";

export const PRO_PRICE_CENTS = Number(process.env.PRO_PRICE_CENTS ?? 3900);
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const BACK_URL = `${APP_URL}/dashboard/settings/billing?from=checkout`;

/** Shape público da assinatura (nunca expõe ids do gateway ao client). */
export function toPublicSubscription(sub: Subscription | null) {
  if (!sub) return null;
  return {
    status: sub.status,
    gateway: sub.gateway,
    amountCents: sub.amountCents,
    currentPeriodEnd: sub.currentPeriodEnd,
    updatedAt: sub.updatedAt,
  };
}

export async function startCheckout(professorId: string): Promise<Result<{ checkoutUrl: string }>> {
  const professor = await prisma.professor.findUnique({ where: { id: professorId } });
  if (!professor) return err(404, "Professor não encontrado");

  const existing = await prisma.subscription.findUnique({ where: { professorId } });
  if (existing?.status === "AUTHORIZED") {
    return err(409, "Você já tem uma assinatura ativa");
  }

  const gateway = createGateway();
  const created = await gateway.createSubscription({
    professorId,
    payerEmail: professor.email,
    amountCents: PRO_PRICE_CENTS,
    backUrl: BACK_URL,
  });
  // No modo redirect o gateway sempre devolve a URL (lança se faltar)
  const checkoutUrl = created.checkoutUrl ?? BACK_URL;

  await prisma.subscription.upsert({
    where: { professorId },
    create: {
      professorId,
      gateway: gateway.kind,
      gatewayId: created.gatewayId,
      status: created.status,
      amountCents: PRO_PRICE_CENTS,
    },
    update: {
      gateway: gateway.kind,
      gatewayId: created.gatewayId,
      status: created.status,
      amountCents: PRO_PRICE_CENTS,
    },
  });

  return ok({ checkoutUrl });
}

/**
 * Checkout transparente: o cartão foi tokenizado no navegador
 * (MercadoPago.js) e a assinatura nasce autorizada — sem redirect.
 */
export async function subscribeWithCard(
  professorId: string,
  cardTokenId: string
): Promise<Result<Subscription>> {
  const professor = await prisma.professor.findUnique({ where: { id: professorId } });
  if (!professor) return err(404, "Professor não encontrado");

  const existing = await prisma.subscription.findUnique({ where: { professorId } });
  if (existing?.status === "AUTHORIZED") {
    return err(409, "Você já tem uma assinatura ativa");
  }

  const gateway = createGateway();
  let created;
  try {
    created = await gateway.createSubscription({
      professorId,
      payerEmail: professor.email,
      amountCents: PRO_PRICE_CENTS,
      backUrl: BACK_URL,
      cardTokenId,
    });
  } catch (e: unknown) {
    // Recusa de pagamento é erro de negócio (400); falha de infra segue pro onError
    if (e instanceof GatewayRejectionError) return err(400, e.message);
    throw e;
  }

  const sub = await prisma.subscription.upsert({
    where: { professorId },
    create: {
      professorId,
      gateway: gateway.kind,
      gatewayId: created.gatewayId,
      status: created.status,
      amountCents: PRO_PRICE_CENTS,
    },
    update: {
      gateway: gateway.kind,
      gatewayId: created.gatewayId,
      status: created.status,
      amountCents: PRO_PRICE_CENTS,
    },
  });
  return ok(sub);
}

/**
 * Sincroniza o status local a partir do gateway — chamado pelo webhook
 * (fonte da verdade) e pelo retorno do checkout. Notificação de assinatura
 * desconhecida é ignorada em silêncio.
 */
export async function syncByGatewayId(gatewayId: string): Promise<void> {
  const sub = await prisma.subscription.findUnique({ where: { gatewayId } });
  if (!sub) return;
  await syncSubscription(sub);
}

export async function syncForProfessor(professorId: string): Promise<Subscription | null> {
  const sub = await prisma.subscription.findUnique({ where: { professorId } });
  if (!sub) return null;
  return syncSubscription(sub);
}

async function syncSubscription(sub: Subscription): Promise<Subscription> {
  // Assinatura criada no modo fake nunca vai ao gateway real — o banco
  // já é a fonte da verdade dela (guard pelo gateway GRAVADO na linha).
  if (sub.gateway === "fake" || !sub.gatewayId) return sub;

  const gateway = createGateway();
  const remote = await gateway.getSubscription(sub.gatewayId);
  return prisma.subscription.update({
    where: { id: sub.id },
    data: { status: remote.status, currentPeriodEnd: remote.currentPeriodEnd },
  });
}

export async function getForProfessor(professorId: string): Promise<Subscription | null> {
  return prisma.subscription.findUnique({ where: { professorId } });
}

export async function cancel(professorId: string): Promise<Result<Subscription>> {
  const sub = await prisma.subscription.findUnique({ where: { professorId } });
  if (!sub) return err(404, "Assinatura não encontrada");
  if (sub.status === "CANCELLED") return err(409, "A assinatura já está cancelada");

  if (sub.gateway !== "fake" && sub.gatewayId) {
    await createGateway().cancelSubscription(sub.gatewayId);
  }

  const updated = await prisma.subscription.update({
    where: { id: sub.id },
    data: { status: "CANCELLED" },
  });
  return ok(updated);
}
