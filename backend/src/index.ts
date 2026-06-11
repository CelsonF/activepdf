import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { HTTPException } from "hono/http-exception";
import { mkdirSync } from "fs";
import { authRoutes } from "./routes/auth.js";
import { lessonRoutes } from "./routes/lessons.js";
import { studentRoutes } from "./routes/students.js";
import { exerciseRoutes } from "./routes/exercises.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { subjectRoutes } from "./routes/subjects.js";
import { vocabularyRoutes } from "./routes/vocabulary.js";
import { audioRoutes } from "./routes/audio.js";
import { gamificationRoutes } from "./routes/gamification.js";
import { organizationRoutes } from "./routes/organization.js";
import { libraryRoutes } from "./routes/library.js";
import { reportsRoutes } from "./routes/reports.js";
import { classRoutes } from "./routes/classes.js";
import { profileRoutes } from "./routes/profile.js";
import { openApiSpec } from "./openapi.js";

mkdirSync("uploads/logos", { recursive: true });

const app = new Hono();

app.onError((err, c) => {
  if (err instanceof HTTPException) return err.getResponse();
  // JSON malformado no body é erro do client, não do servidor
  if (err instanceof SyntaxError) {
    return c.json({ error: "Corpo da requisição inválido" }, 400);
  }
  console.error(err);
  return c.json({ error: "Erro interno" }, 500);
});

app.notFound((c) => c.json({ error: "Rota não encontrada" }, 404));

app.use(logger());

app.use(
  "/*",
  cors({
    origin: (process.env.FRONTEND_URL ?? "http://localhost:3000").split(","),
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("/uploads/*", serveStatic({ root: "./" }));

app.get("/health", (c) => c.json({ ok: true }));

app.get("/docs/openapi.json", (c) => c.json(openApiSpec));

app.get("/docs", (c) =>
  c.html(`<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ActivePDF — API Docs</title>
    <style>body { margin: 0; }</style>
  </head>
  <body>
    <script
      id="api-reference"
      data-url="/docs/openapi.json"
      data-configuration='{"theme":"purple","layout":"sidebar","defaultHttpClient":{"targetKey":"javascript","clientKey":"fetch"}}'
    ></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`)
);

app.route("/api/auth", authRoutes);
app.route("/api/lessons", lessonRoutes);
app.route("/api/lessons/:lessonId/vocabulary", vocabularyRoutes);
app.route("/api/lessons/:lessonId/audio", audioRoutes);
app.route("/api/students", studentRoutes);
app.route("/api/exercises", exerciseRoutes);
app.route("/api/dashboard", dashboardRoutes);
app.route("/api/subjects", subjectRoutes);
app.route("/api/gamification", gamificationRoutes);
app.route("/api/organization", organizationRoutes);
app.route("/api/library", libraryRoutes);
app.route("/api/reports", reportsRoutes);
app.route("/api/classes", classRoutes);
app.route("/api/profile", profileRoutes);

const port = Number(process.env.PORT ?? 4000);

serve({ fetch: app.fetch, port }, () => {
  console.log(`Backend rodando em http://localhost:${port}`);
});
