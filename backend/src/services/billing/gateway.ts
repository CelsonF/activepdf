// Contrato de gateway de pagamento — interface-first: o resto do app só
// conhece este shape; trocar Mercado Pago por outro gateway é trocar a
// implementação em createGateway() (./index.ts).

/** Status normalizado (espelha o enum SubscriptionStatus do Prisma). */
export type GatewaySubscriptionStatus = "PENDING" | "AUTHORIZED" | "PAUSED" | "CANCELLED";

export interface CreateSubscriptionInput {
  professorId: string;
  payerEmail: string;
  amountCents: number;
  /** URL para onde o pagador volta depois do checkout (modo redirect). */
  backUrl: string;
  /**
   * Checkout transparente: token de cartão gerado no navegador pelo
   * MercadoPago.js. Com token, a assinatura nasce autorizada — sem
   * redirect; o cartão nunca passa pelo nosso servidor.
   */
  cardTokenId?: string;
}

export interface CreatedSubscription {
  gatewayId: string;
  /** Presente só no modo redirect (sem cardTokenId). */
  checkoutUrl: string | null;
  status: GatewaySubscriptionStatus;
}

export interface GatewaySubscription {
  status: GatewaySubscriptionStatus;
  /** Próxima cobrança = fim do período corrente (quando o gateway informa). */
  currentPeriodEnd: Date | null;
}

export interface BillingGateway {
  readonly kind: "mercadopago" | "fake";
  createSubscription(input: CreateSubscriptionInput): Promise<CreatedSubscription>;
  getSubscription(gatewayId: string): Promise<GatewaySubscription>;
  cancelSubscription(gatewayId: string): Promise<void>;
}
