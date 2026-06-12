import { randomUUID } from "node:crypto";
import type {
  BillingGateway,
  CreateSubscriptionInput,
  CreatedSubscription,
  GatewaySubscription,
} from "./gateway.js";

/**
 * Gateway de desenvolvimento — usado quando MP_ACCESS_TOKEN não está
 * configurado. Autoriza na hora (sem checkout externo) para permitir o
 * ciclo assinar → PRO → cancelar → FREE localmente. Nunca ativo se houver
 * token; createGateway() também o bloqueia em produção.
 */
export function createFakeGateway(): BillingGateway {
  return {
    kind: "fake",

    async createSubscription(input: CreateSubscriptionInput): Promise<CreatedSubscription> {
      return {
        gatewayId: `fake_${randomUUID()}`,
        checkoutUrl: input.backUrl,
        status: "AUTHORIZED",
      };
    },

    async getSubscription(): Promise<GatewaySubscription> {
      // O banco já é a fonte da verdade no modo fake; o service não
      // sobrescreve o status quando kind === "fake".
      return { status: "AUTHORIZED", currentPeriodEnd: null };
    },

    async cancelSubscription(): Promise<void> {
      // nada a fazer — o service marca CANCELLED no banco
    },
  };
}
