import { createMercadoPagoGateway } from "./mercadopago.js";
import { createFakeGateway } from "./fake.js";
import type { BillingGateway } from "./gateway.js";

export type { BillingGateway } from "./gateway.js";

let gateway: BillingGateway | null = null;

/** Gateway ativo: Mercado Pago com MP_ACCESS_TOKEN; sem token, fake (só dev). */
export function createGateway(): BillingGateway {
  if (gateway) return gateway;

  const token = process.env.MP_ACCESS_TOKEN;
  if (token) {
    gateway = createMercadoPagoGateway(token);
    return gateway;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("MP_ACCESS_TOKEN é obrigatório em produção");
  }
  gateway = createFakeGateway();
  return gateway;
}
