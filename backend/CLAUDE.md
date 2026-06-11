# ActivePDF — Regras do Projeto (Back-end)

> Este arquivo é lido automaticamente em toda conversa. São as regras
> **inegociáveis** para escrever código na API.
>
> Skills disponíveis:
> - `criar-endpoint` — criar ou alterar qualquer rota da API
> - `alterar-modelo` — mudanças no schema Prisma (modelo, campo, relação, migration)

## Stack (não trocar sem pedir)

| Camada | Tecnologia |
|---|---|
| HTTP | **Hono 4** + `@hono/node-server` — porta 4000 |
| ORM | **Prisma 7** + SQLite (`better-sqlite3`), client em `src/generated/prisma/` |
| Validação | **Zod 4** via `jsonValidator()` (`src/lib/validate.ts`) |
| Auth | JWT (**jose**) + **bcryptjs**; middlewares em `src/middleware/auth.ts` |
| Docs | OpenAPI manual em `src/openapi.ts` → `/docs` (Scalar) |

TypeScript strict, ESM — imports relativos terminam em `.js`.

## Regras de ouro

1. **Contrato de erro fixo**: `{ error: string }` com status semântico
   (400/401/404/409); o frontend depende desse shape. DELETE ok → `{ ok: true }`.
2. **Ownership em toda query**: `findFirst({ where: { id, professorId: session.userId } })`
   ou helpers de `src/lib/ownership.ts`. Nunca `findUnique` solto por id.
3. **Auth só via middleware** (`requireAuth` / `requireTeacher` / `requireStudent`)
   e router tipado `new Hono<AuthEnv>()`.
4. **Validação só via schema Zod** em `src/schemas/` + `jsonValidator(schema)`;
   leia com `c.req.valid("json")` — nada de `await c.req.json()` cru.
5. **Senha nunca sai**: omit global em `src/lib/prisma.ts`; só o login usa
   `omit: { password: false }`.
6. **Listas grandes**: `parsePagination(c)` (`src/lib/pagination.ts`) —
   resposta continua array puro.
7. Endpoint novo = registrar em `src/index.ts` **e** documentar em `src/openapi.ts`.
8. Mensagens de erro em **pt-BR**, genéricas e seguras (sem stack/SQL).

## Não fazer

- Editar `src/generated/prisma/` à mão (use `npm run db:generate`).
- Editar migrations já commitadas (crie uma nova).
- try/catch vazio ou decorativo — o `onError` global já cobre o 500.
- Confiar no `mimeType` enviado pelo client (tipo real vem dos magic bytes).
- `any` em dados de request; `console.log` com PII.

## Antes de entregar

1. `npm run build` (tsc) passa?
2. Toda query escopada pela sessão?
3. Erros no contrato `{ error }` com status correto?
4. `index.ts` + `openapi.ts` atualizados se houve endpoint novo?
