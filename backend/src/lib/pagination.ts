import type { Context } from "hono";

interface PaginationOptions {
  defaultTake?: number;
  maxTake?: number;
}

/**
 * Paginação opt-in via ?take=&skip=. Sem parâmetros, mantém o comportamento
 * de lista completa com um teto generoso de segurança — a resposta continua
 * sendo um array puro, então o contrato com o frontend não muda.
 */
export function parsePagination(
  c: Context,
  { defaultTake = 50, maxTake = 500 }: PaginationOptions = {}
): { take: number; skip: number } {
  const rawTake = c.req.query("take");
  const rawSkip = c.req.query("skip");

  if (rawTake === undefined && rawSkip === undefined) {
    return { take: maxTake, skip: 0 };
  }

  const take = Math.min(Math.max(Number(rawTake) || defaultTake, 1), maxTake);
  const skip = Math.max(Number(rawSkip) || 0, 0);
  return { take, skip };
}
