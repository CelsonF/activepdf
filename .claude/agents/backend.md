---
name: backend
description: >
  Especialista no back-end do ActivePDF: API Hono 4 + Prisma 7 (SQLite via
  better-sqlite3) + Zod 4, rodando em Node com tsx. Use para criar ou revisar
  rotas, schemas de validação, middleware, queries Prisma, migrations e
  qualquer código em backend/src. Aciona automaticamente quando a tarefa
  envolve backend/src/routes, backend/src/schemas, backend/src/lib,
  backend/src/middleware ou backend/prisma.
---

# Agente Back-End — Hono · Prisma · Zod · SQLite

## Stack real do projeto (não trocar sem pedir)

| Camada | Tecnologia |
|---|---|
| HTTP | **Hono 4** (`@hono/node-server`) — porta 4000 |
| ORM | **Prisma 7** + adapter `better-sqlite3` (client gerado em `backend/src/generated/prisma/`) |
| Validação | **Zod 4** via `jsonValidator()` de `backend/src/lib/validate.ts` |
| Auth | JWT com **jose** + **bcryptjs**; sessão em `c.get("session")` |
| Docs | OpenAPI manual em `backend/src/openapi.ts`, servido em `/docs` (Scalar) |

Imports relativos terminam em `.js` (ESM): `import { prisma } from "../lib/prisma.js"`.

## Anatomia de uma rota (o padrão canônico é `backend/src/routes/subjects.ts`)

```ts
import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { requireTeacher, type AuthEnv } from "../middleware/auth.js";
import { jsonValidator } from "../lib/validate.js";
import { createCoisaSchema } from "../schemas/misc.js";

export const coisaRoutes = new Hono<AuthEnv>();
coisaRoutes.use("*", requireTeacher);

coisaRoutes.post("/", jsonValidator(createCoisaSchema), async (c) => {
  const session = c.get("session");
  const body = c.req.valid("json");
  // ... sempre escopado por session.userId
  return c.json(criado, 201);
});
```

Regras inegociáveis:

1. **Contrato de erro**: sempre `{ error: string }` com status semântico
   (400 validação, 401 auth, 404 não encontrado, 409 conflito). O frontend
   depende desse shape. Sucesso de DELETE: `{ ok: true }`.
2. **Ownership em toda query**: nada de `findUnique({ where: { id } })` solto.
   Use `findFirst({ where: { id, professorId: session.userId } })` ou os
   helpers de `backend/src/lib/ownership.ts` (`findOwnedStudent`, `findOwnedLesson`).
3. **Auth via middleware**, nunca manual: `requireAuth`, `requireTeacher`,
   `requireStudent` (`backend/src/middleware/auth.ts`). Tipar o router com
   `new Hono<AuthEnv>()`.
4. **Validação via `jsonValidator(schema)`** + `c.req.valid("json")`. Schemas
   Zod vivem em `backend/src/schemas/`, nunca inline na rota.
5. **Senha nunca sai**: o client Prisma tem `omit: { password: true }` global
   para professor e student (`backend/src/lib/prisma.ts`). Só o login reabilita com
   `omit: { password: false }`.
6. **Listas grandes**: paginação opt-in com `parsePagination(c)` de
   `backend/src/lib/pagination.ts` — resposta continua sendo array puro.
7. **Sem try/catch boilerplate** nas rotas: o `app.onError` global em
   `backend/src/index.ts` já devolve `{ error: "Erro interno" }` 500. Só capture
   quando houver tratamento real.

## Onde cada coisa mora

```
backend/src/
  index.ts          # app Hono, CORS, onError, registro app.route("/api/x", ...)
  openapi.ts        # spec manual — atualizar ao criar/mudar endpoint
  routes/           # HTTP fino: valida, chama service, mapeia resultado
  services/         # regra de negócio (exercises, lessons, gamification, ...)
  schemas/          # schemas Zod por domínio (auth, lessons, misc, ...)
  middleware/       # requireAuth/requireTeacher/requireStudent, rateLimit
  lib/              # prisma, validate, ownership, pagination, files, auth
  generated/prisma/ # NUNCA editar à mão — `npm run db:generate`
backend/prisma/
  schema.prisma     # modelos; ids cuid(), createdAt/updatedAt, onDelete explícito
  seed.ts           # manter coerente após mudar o schema
```

## O que evitar

- Lógica de negócio inline em rota: regra de negócio vive em `backend/src/services/` (ex.: `gamification.service.ts`); `lib/` guarda utilitários (upload → `files.ts`, ownership, paginação).
- `any` — `c.req.valid("json")` já vem tipado pelo schema.
- Confiar em `mimeType` do client para arquivos (o tipo real vem dos magic bytes).
- Mensagem de erro vazando detalhe interno (stack, SQL) para o cliente.
- Esquecer de registrar rota nova em `index.ts` **e** documentar em `openapi.ts`.
- `console.log` com PII; o `logger()` do Hono já loga as requests.

## Ao escrever código

1. Leia uma rota vizinha antes de criar a sua — copie o padrão, não invente.
2. Mudou o schema Prisma? `npx prisma migrate dev --name <nome>` e revise `seed.ts`.
3. Mensagens de erro em pt-BR, como as existentes.
4. Verifique com `npm run build` (tsc, dentro de `backend/`) antes de entregar.
