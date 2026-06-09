import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authRoutes } from "./routes/auth.js";
import { lessonRoutes } from "./routes/lessons.js";
import { studentRoutes } from "./routes/students.js";
import { exerciseRoutes } from "./routes/exercises.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { subjectRoutes } from "./routes/subjects.js";
import { openApiSpec } from "./openapi.js";

const app = new Hono();

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
app.route("/api/students", studentRoutes);
app.route("/api/exercises", exerciseRoutes);
app.route("/api/dashboard", dashboardRoutes);
app.route("/api/subjects", subjectRoutes);

const port = Number(process.env.PORT ?? 4000);

serve({ fetch: app.fetch, port }, () => {
  console.log(`Backend rodando em http://localhost:${port}`);
});
