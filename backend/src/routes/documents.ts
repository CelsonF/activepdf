import { Hono } from "hono";
import { requireStudent, type AuthEnv } from "../middleware/auth.js";
import { jsonValidator } from "../lib/validate.js";
import {
  createSavedDocumentSchema,
  updateSavedDocumentSchema,
} from "../schemas/documents.js";
import { parsePagination } from "../lib/pagination.js";
import { planForSession } from "../lib/entitlements.js";
import * as documents from "../services/documents.service.js";

// Documentos salvos da conta gratuita — recurso de aluno; professor usa Exercise.
export const documentRoutes = new Hono<AuthEnv>();

documentRoutes.get("/", requireStudent, async (c) => {
  const session = c.get("session");
  const { take, skip } = parsePagination(c);
  return c.json(await documents.listForStudent(session.userId, { take, skip }));
});

documentRoutes.get("/usage", requireStudent, async (c) => {
  const session = c.get("session");
  return c.json(await documents.usageForStudent(session.userId, planForSession(session)));
});

documentRoutes.post("/", requireStudent, jsonValidator(createSavedDocumentSchema), async (c) => {
  const session = c.get("session");
  const result = await documents.create(session, c.req.valid("json"));
  if (!result.ok) return c.json({ error: result.error }, result.status);
  return c.json(result.data, 201);
});

documentRoutes.get("/:id", requireStudent, async (c) => {
  const session = c.get("session");
  const result = await documents.getForStudent(session.userId, c.req.param("id"));
  if (!result.ok) return c.json({ error: result.error }, result.status);
  return c.json(result.data);
});

documentRoutes.patch("/:id", requireStudent, jsonValidator(updateSavedDocumentSchema), async (c) => {
  const session = c.get("session");
  const result = await documents.update(session.userId, c.req.param("id"), c.req.valid("json"));
  if (!result.ok) return c.json({ error: result.error }, result.status);
  return c.json(result.data);
});

documentRoutes.delete("/:id", requireStudent, async (c) => {
  const session = c.get("session");
  const result = await documents.remove(session.userId, c.req.param("id"));
  if (!result.ok) return c.json({ error: result.error }, result.status);
  return c.json({ ok: true });
});
