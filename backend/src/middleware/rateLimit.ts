import { createMiddleware } from "hono/factory";
import { getConnInfo } from "@hono/node-server/conninfo";

interface Window {
  count: number;
  resetAt: number;
}

/**
 * Rate limit fixed-window em memória, por IP. Suficiente para deploy
 * single-instance (SQLite); em multi-instância, trocar por store compartilhado.
 */
export function rateLimit(opts: { max: number; windowMs: number }) {
  const windows = new Map<string, Window>();

  return createMiddleware(async (c, next) => {
    const now = Date.now();

    // lazy-expire: limpa janelas vencidas para o Map não crescer sem limite
    if (windows.size > 10_000) {
      for (const [key, w] of windows) {
        if (w.resetAt <= now) windows.delete(key);
      }
    }

    const forwarded = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
    const ip = forwarded || getConnInfo(c).remote.address || "unknown";

    const current = windows.get(ip);
    if (!current || current.resetAt <= now) {
      windows.set(ip, { count: 1, resetAt: now + opts.windowMs });
      return next();
    }

    current.count += 1;
    if (current.count > opts.max) {
      const retryAfter = Math.ceil((current.resetAt - now) / 1000);
      c.header("Retry-After", String(retryAfter));
      return c.json({ error: "Muitas tentativas. Tente novamente em alguns minutos." }, 429);
    }

    return next();
  });
}
