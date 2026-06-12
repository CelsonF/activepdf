import { z } from "zod";

/** Checkout transparente: token de cartão gerado pelo MercadoPago.js. */
export const subscribeSchema = z.object({
  cardTokenId: z
    .string("Token do cartão é obrigatório")
    .trim()
    .min(1, "Token do cartão é obrigatório"),
});

/**
 * Notificação de webhook do Mercado Pago — payload externo e variável,
 * por isso permissivo: só extraímos o que usamos.
 */
export const mpWebhookSchema = z
  .object({
    type: z.string().optional(),
    topic: z.string().optional(),
    action: z.string().optional(),
    data: z.object({ id: z.string() }).partial().optional(),
  })
  .passthrough();
