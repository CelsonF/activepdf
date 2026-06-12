import { Hono } from "hono";
import { requireAuth, requireTeacher, type AuthEnv } from "../middleware/auth.js";
import { jsonValidator } from "../lib/validate.js";
import { createLessonSchema, LESSON_STATUS, updateLessonSchema } from "../schemas/lessons.js";
import { parsePagination } from "../lib/pagination.js";
import * as lessons from "../services/lessons.service.js";

export const lessonRoutes = new Hono<AuthEnv>();

lessonRoutes.get("/", requireAuth, async (c) => {
  const session = c.get("session");
  const statusParam = c.req.query("status");
  // narrowing via find: PG agora recusa valor fora do enum
  const status = LESSON_STATUS.find((s) => s === statusParam);
  if (statusParam && !status) {
    return c.json({ error: "Status inválido" }, 400);
  }
  const { take, skip } = parsePagination(c);

  if (session.role === "student") {
    return c.json(await lessons.listForStudent(session.userId, { status, take, skip }));
  }

  const studentId = c.req.query("studentId");
  return c.json(
    await lessons.listForTeacher(session.userId, { status, studentId, take, skip })
  );
});

lessonRoutes.post("/", requireTeacher, jsonValidator(createLessonSchema), async (c) => {
  const session = c.get("session");
  const result = await lessons.create(session.userId, c.req.valid("json"));
  if (!result.ok) return c.json({ error: result.error }, result.status);
  return c.json(result.data, 201);
});

lessonRoutes.get("/:id", requireAuth, async (c) => {
  const session = c.get("session");
  const lessonId = c.req.param("id");

  const result =
    session.role === "student"
      ? await lessons.getForStudent(session.userId, lessonId)
      : await lessons.getForTeacher(session.userId, lessonId);

  if (!result.ok) return c.json({ error: result.error }, result.status);
  return c.json(result.data);
});

lessonRoutes.patch("/:id", requireTeacher, jsonValidator(updateLessonSchema), async (c) => {
  const session = c.get("session");
  const result = await lessons.update(session.userId, c.req.param("id"), c.req.valid("json"));
  if (!result.ok) return c.json({ error: result.error }, result.status);
  return c.json(result.data);
});

lessonRoutes.delete("/:id", requireTeacher, async (c) => {
  const session = c.get("session");
  const result = await lessons.remove(session.userId, c.req.param("id"));
  if (!result.ok) return c.json({ error: result.error }, result.status);
  return c.json(result.data);
});
