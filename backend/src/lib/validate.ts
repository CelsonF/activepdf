import { zValidator } from "@hono/zod-validator";
import type { ZodType } from "zod";

/**
 * Valida o body JSON mantendo o contrato de erro { error: string } com 400,
 * que o frontend já trata. Use: route.post("/", jsonValidator(schema), ...)
 * e leia com c.req.valid("json").
 */
export function jsonValidator<T extends ZodType>(schema: T) {
  return zValidator("json", schema, (result, c) => {
    if (!result.success) {
      const first = result.error.issues[0];
      const path = first.path.length ? `${first.path.join(".")}: ` : "";
      return c.json({ error: `${path}${first.message}` }, 400);
    }
  });
}
