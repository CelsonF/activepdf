import type {
  BillingGateway,
  CreateSubscriptionInput,
  CreatedSubscription,
  GatewaySubscription,
  GatewaySubscriptionStatus,
} from "./gateway.js";

const MP_API = "https://api.mercadopago.com";

// Status do preapproval do MP → status normalizado
const STATUS_MAP: Record<string, GatewaySubscriptionStatus> = {
  pending: "PENDING",
  authorized: "AUTHORIZED",
  paused: "PAUSED",
  cancelled: "CANCELLED",
};

interface PreapprovalResponse {
  id: string;
  init_point?: string;
  status: string;
  auto_recurring?: { end_date?: string };
  next_payment_date?: string;
}

/** Erro de negócio do gateway (cartão recusado etc.) — mensagem segura pt-BR. */
export class GatewayRejectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GatewayRejectionError";
  }
}

async function mpFetch(accessToken: string, path: string, init?: RequestInit): Promise<PreapprovalResponse> {
  const res = await fetch(`${MP_API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
  });
  const data = (await res.json()) as PreapprovalResponse & { message?: string };
  if (!res.ok) {
    // log sem PII: path, status e a mensagem de erro da API (nunca dados de cartão)
    console.error(`[billing] Mercado Pago ${path} -> ${res.status}: ${data.message ?? "sem mensagem"}`);
    // 4xx em criação com cartão = recusa de pagamento, não falha de infra
    if (res.status >= 400 && res.status < 500) {
      throw new GatewayRejectionError(
        "Pagamento recusado. Confira os dados do cartão e tente novamente."
      );
    }
    throw new Error("Falha na comunicação com o gateway de pagamento");
  }
  return data;
}

function normalizeStatus(status: string): GatewaySubscriptionStatus {
  return STATUS_MAP[status] ?? "PENDING";
}

/** Assinatura recorrente via preapproval do Mercado Pago. */
export function createMercadoPagoGateway(accessToken: string): BillingGateway {
  return {
    kind: "mercadopago",

    async createSubscription(input: CreateSubscriptionInput): Promise<CreatedSubscription> {
      const transparent = Boolean(input.cardTokenId);
      const data = await mpFetch(accessToken, "/preapproval", {
        method: "POST",
        body: JSON.stringify({
          reason: "Grifo — Plano Professor",
          external_reference: input.professorId,
          payer_email: input.payerEmail,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: input.amountCents / 100,
            currency_id: "BRL",
          },
          // O MP exige back_url válida (https pública) em ambos os modos.
          back_url: input.backUrl,
          // Transparente: token do cartão + nasce autorizada, sem redirect.
          // Redirect: pending, pagador conclui no MP.
          ...(transparent
            ? { card_token_id: input.cardTokenId, status: "authorized" }
            : { status: "pending" }),
        }),
      });
      if (!transparent && !data.init_point) {
        throw new Error("Falha na comunicação com o gateway de pagamento");
      }
      return {
        gatewayId: data.id,
        checkoutUrl: data.init_point ?? null,
        status: normalizeStatus(data.status),
      };
    },

    async getSubscription(gatewayId: string): Promise<GatewaySubscription> {
      const data = await mpFetch(accessToken, `/preapproval/${gatewayId}`);
      return {
        status: normalizeStatus(data.status),
        currentPeriodEnd: data.next_payment_date ? new Date(data.next_payment_date) : null,
      };
    },

    async cancelSubscription(gatewayId: string): Promise<void> {
      await mpFetch(accessToken, `/preapproval/${gatewayId}`, {
        method: "PUT",
        body: JSON.stringify({ status: "cancelled" }),
      });
    },
  };
}
