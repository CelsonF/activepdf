import { Hono } from "hono";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Context } from "hono";
import { requireTeacher, type AuthEnv } from "../middleware/auth.js";
import { jsonValidator } from "../lib/validate.js";
import { planForSession } from "../lib/entitlements.js";
import { mpWebhookSchema, subscribeSchema } from "../schemas/billing.js";
import * as billing from "../services/billing.service.js";

export const billingRoutes = new Hono<AuthEnv>();

/** Inicia o checkout do plano Professor; o client redireciona para checkoutUrl. */
billingRoutes.post("/checkout", requireTeacher, async (c) => {
  const session = c.get("session");
  const result = await billing.startCheckout(session.userId);
  if (!result.ok) return c.json({ error: result.error }, result.status);
  return c.json(result.data, 201);
});

/**
 * Checkout transparente: recebe o card_token gerado no navegador e cria
 * a assinatura já autorizada — o cartão nunca passa por aqui.
 */
billingRoutes.post("/subscribe", requireTeacher, jsonValidator(subscribeSchema), async (c) => {
  const session = c.get("session");
  const { cardTokenId } = c.req.valid("json");
  const result = await billing.subscribeWithCard(session.userId, cardTokenId);
  if (!result.ok) return c.json({ error: result.error }, result.status);
  const plan = await planForSession(session);
  return c.json({ plan, subscription: billing.toPublicSubscription(result.data) }, 201);
});

/** Plano efetivo + assinatura (sem ids do gateway). */
billingRoutes.get("/subscription", requireTeacher, async (c) => {
  const session = c.get("session");
  const [plan, sub] = await Promise.all([
    planForSession(session),
    billing.getForProfessor(session.userId),
  ]);
  return c.json({
    plan,
    priceCents: billing.PRO_PRICE_CENTS,
    subscription: billing.toPublicSubscription(sub),
  });
});

/** Ressincroniza com o gateway — usado no retorno do checkout. */
billingRoutes.post("/sync", requireTeacher, async (c) => {
  const session = c.get("session");
  const sub = await billing.syncForProfessor(session.userId);
  const plan = await planForSession(session);
  return c.json({ plan, subscription: billing.toPublicSubscription(sub) });
});

billingRoutes.post("/cancel", requireTeacher, async (c) => {
  const session = c.get("session");
  const result = await billing.cancel(session.userId);
  if (!result.ok) return c.json({ error: result.error }, result.status);
  return c.json({ ok: true });
});

/**
 * Valida o header x-signature do Mercado Pago (HMAC-SHA256 sobre o
 * manifest `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`).
 * Sem MP_WEBHOOK_SECRET configurado, a validação é desligada (dev).
 */
function hasValidSignature(c: Context, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true;

  const xSignature = c.req.header("x-signature") ?? "";
  const xRequestId = c.req.header("x-request-id") ?? "";
  const parts = new Map(
    xSignature.split(",").map((part) => {
      const [key, ...rest] = part.split("=");
      return [key?.trim(), rest.join("=").trim()] as const;
    })
  );
  const ts = parts.get("ts");
  const v1 = parts.get("v1");
  if (!ts || !v1) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  if (expected.length !== v1.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
}

/**
 * Webhook do gateway — público (sem sessão) e fonte da verdade do status.
 * Sempre 200 para notificação irrelevante; o MP reenvia em caso de erro.
 */
billingRoutes.post("/webhook", async (c) => {
  const raw: unknown = await c.req.json().catch(() => ({}));
  const parsed = mpWebhookSchema.safeParse(raw);
  const body = parsed.success ? parsed.data : {};

  // O MP manda o id na query (`data.id`) e/ou no body
  const dataId = c.req.query("data.id") ?? body.data?.id;
  const type = c.req.query("type") ?? body.type ?? body.topic ?? "";

  if (!dataId || !type.includes("preapproval")) return c.json({ ok: true });
  if (!hasValidSignature(c, dataId)) {
    return c.json({ error: "Assinatura do webhook inválida" }, 401);
  }

  await billing.syncByGatewayId(dataId);
  return c.json({ ok: true });
});
