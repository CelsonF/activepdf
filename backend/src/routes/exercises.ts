import { Hono } from "hono";
import { requireAuth, requireStudent, requireTeacher, type AuthEnv } from "../middleware/auth.js";
import { jsonValidator } from "../lib/validate.js";
import {
  createExerciseSchema,
  EXERCISE_STATUS,
  reviewExerciseSchema,
  updateExerciseSchema,
} from "../schemas/exercises.js";
import { parsePagination } from "../lib/pagination.js";
import * as exercises from "../services/exercises.service.js";

export const exerciseRoutes = new Hono<AuthEnv>();

exerciseRoutes.get("/", requireAuth, async (c) => {
  const session = c.get("session");
  const studentId = c.req.query("studentId");
  const { take, skip } = parsePagination(c);

  if (session.role === "teacher") {
    const statusParam = c.req.query("status");
    // narrowing via find: PG agora recusa valor fora do enum
    const status = EXERCISE_STATUS.find((s) => s === statusParam);
    if (statusParam && !status) {
      return c.json({ error: "Status inválido" }, 400);
    }
    return c.json(
      await exercises.listForTeacher(session.userId, { studentId, status, take, skip })
    );
  }

  return c.json(await exercises.listForStudent(session.userId, { take, skip }));
});

exerciseRoutes.post("/", requireAuth, jsonValidator(createExerciseSchema), async (c) => {
  const session = c.get("session");
  const body = c.req.valid("json");

  const result =
    session.role === "student"
      ? await exercises.createAsStudent(session.userId, body)
      : await exercises.createAsTeacher(session.userId, body);

  if (!result.ok) return c.json({ error: result.error }, result.status);
  return c.json(result.data, 201);
});

exerciseRoutes.get("/:id", requireAuth, async (c) => {
  const session = c.get("session");
  const result = await exercises.getForSession(session, c.req.param("id"));
  if (!result.ok) return c.json({ error: result.error }, result.status);
  return c.json(result.data);
});

exerciseRoutes.patch("/:id", requireStudent, jsonValidator(updateExerciseSchema), async (c) => {
  const session = c.get("session");
  const result = await exercises.submitAnswers(
    session.userId,
    c.req.param("id"),
    c.req.valid("json")
  );
  if (!result.ok) return c.json({ error: result.error }, result.status);
  return c.json(result.data);
});

exerciseRoutes.get("/:id/review", requireTeacher, async (c) => {
  const session = c.get("session");
  const result = await exercises.buildReview(session.userId, c.req.param("id"));
  if (!result.ok) return c.json({ error: result.error }, result.status);
  return c.json(result.data);
});

exerciseRoutes.patch("/:id/review", requireTeacher, jsonValidator(reviewExerciseSchema), async (c) => {
  const session = c.get("session");
  const result = await exercises.applyReview(
    session.userId,
    c.req.param("id"),
    c.req.valid("json")
  );
  if (!result.ok) return c.json({ error: result.error }, result.status);
  return c.json(result.data);
});

exerciseRoutes.delete("/:id", requireTeacher, async (c) => {
  const session = c.get("session");
  const result = await exercises.removeOwned(session.userId, c.req.param("id"));
  if (!result.ok) return c.json({ error: result.error }, result.status);
  return c.json(result.data);
});
