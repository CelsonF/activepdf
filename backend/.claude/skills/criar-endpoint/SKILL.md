---
name: criar-endpoint
description: >
  Passo a passo para criar ou alterar QUALQUER endpoint da API do ActivePDF
  (Hono 4 + Prisma 7 + Zod 4). Use sempre que a tarefa for criar uma rota,
  adicionar um método a um recurso existente, validar um body novo ou expor
  dados do Prisma — garante schema Zod em src/schemas, ownership por
  professorId/studentId, contrato de erro { error }, registro em index.ts e
  documentação em openapi.ts.
---

# Criar endpoint — Hono + Prisma + Zod (ActivePDF)

Siga este fluxo toda vez que criar ou alterar um endpoint. O objetivo é que
**toda rota saia idêntica em forma às existentes** — `src/routes/subjects.ts`
é o exemplo canônico; em caso de dúvida, copie dele.

## 0. Antes de escrever

- O recurso já tem arquivo em `src/routes/`? Adicione o método lá, não crie
  arquivo novo.
- A query já existe como helper? Confira `src/lib/ownership.ts`,
  `src/lib/gamification.ts`, `src/lib/files.ts`.
- Quem pode chamar? Professor (`requireTeacher`), aluno (`requireStudent`) ou
  ambos (`requireAuth` + checagem de `session.role` dentro da rota).

## 1. Schema Zod em `src/schemas/`

Todo body validado vive em `src/schemas/<dominio>.ts` (recursos pequenos
ficam em `misc.ts`). Mensagens em pt-BR, `trim()` em strings de nome/título:

```ts
export const createCoisaSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório"),
  description: z.string().nullish(),
});

// update: tudo opcional, mas sem aceitar string vazia onde não pode
export const updateCoisaSchema = z.object({
  title: z.string().trim().min(1, "Título não pode ser vazio").optional(),
  description: z.string().nullish(),
});
```

## 2. A rota em `src/routes/`

```ts
import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";          // imports ESM com .js
import { requireTeacher, type AuthEnv } from "../middleware/auth.js";
import { jsonValidator } from "../lib/validate.js";
import { createCoisaSchema } from "../schemas/misc.js";

export const coisaRoutes = new Hono<AuthEnv>();
coisaRoutes.use("*", requireTeacher);

coisaRoutes.get("/", async (c) => {
  const session = c.get("session");
  const items = await prisma.coisa.findMany({
    where: { professorId: session.userId },   // SEMPRE escopado
    orderBy: { createdAt: "desc" },
  });
  return c.json(items);                       // lista = array puro
});

coisaRoutes.post("/", jsonValidator(createCoisaSchema), async (c) => {
  const session = c.get("session");
  const { title, description } = c.req.valid("json"); // já tipado, sem any
  const created = await prisma.coisa.create({
    data: { title, description: description?.trim() || null, professorId: session.userId },
  });
  return c.json(created, 201);
});
```

Checklist obrigatório por método:

| Situação | Resposta |
|---|---|
| Body inválido | o `jsonValidator` já devolve `{ error }` 400 |
| Sem sessão / papel errado | middleware já devolve `{ error: "Não autorizado" }` 401 |
| Registro não é do usuário ou não existe | `{ error: "<Recurso> não encontrad(o/a)" }` 404 — mesmo texto para os dois casos |
| Nome/único duplicado | `{ error: "Já existe ..." }` 409 |
| Criação | `c.json(objeto, 201)` |
| Deleção | `c.json({ ok: true })` |

Regras que não se negociam:

- **Ownership**: nunca `findUnique({ where: { id } })` solto. Sempre
  `findFirst({ where: { id, professorId: session.userId } })` (ou
  `studentId`), ou um helper de `src/lib/ownership.ts`. No PATCH/DELETE,
  busque primeiro, valide, e só então `update`/`delete` pelo `id` verificado.
- **Senha**: o client Prisma já omite `password` globalmente — não use
  `omit: { password: false }` fora do fluxo de login.
- **Listas potencialmente grandes**: `parsePagination(c)` de
  `src/lib/pagination.ts` e passe `take`/`skip` ao `findMany`.
- **Sem try/catch decorativo**: o `onError` global cobre o 500.

## 3. Registrar e documentar

1. Em `src/index.ts`: `app.route("/api/coisas", coisaRoutes);` (rotas
   aninhadas seguem o padrão `"/api/lessons/:lessonId/vocabulary"`).
2. Em `src/openapi.ts`: adicione o path/operação na spec — `/docs` é a
   documentação viva da API; endpoint sem doc é endpoint que não existe.

## 4. Antes de entregar

1. `npm run build` passa (tsc strict, sem `any`)?
2. Toda query escopada por `session.userId`?
3. Erros seguem `{ error: string }` com status semântico e texto em pt-BR?
4. Rota registrada em `index.ts` **e** documentada em `openapi.ts`?
5. Teste manual rápido: `npm run dev` e um `curl` no endpoint novo
   (token via `POST /api/auth/login`).
