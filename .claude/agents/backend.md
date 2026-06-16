---
name: backend
description: >
  Especialista no back-end do Grifo (activepdf), que hoje são server functions do
  TanStack Start (createServerFn + Prisma/PostgreSQL + Zod) rodando no mesmo
  processo do front (porta 3000) — não há mais Hono separado. Use para criar ou
  revisar server functions, schemas Zod, queries Prisma, sessão/JWT e o schema do
  banco. Aciona quando a tarefa envolve web_v2/src/lib/api/, web_v2/src/lib/*.server.ts
  ou web_v2/prisma.
---

# Agente Back-End — Server Functions · Prisma · Zod · PostgreSQL

## Stack real do projeto (não trocar sem pedir)

| Camada | Tecnologia |
|---|---|
| Runtime | **TanStack Start v1** — server functions (`createServerFn`) no mesmo processo do front, porta 3000. Sem Hono, sem servidor HTTP separado. |
| ORM | **Prisma** + **PostgreSQL** (adapter `@prisma/adapter-pg`); client gerado em `web_v2/src/generated/prisma/` |
| Validação | **Zod** (v3) via `.inputValidator(schema)` na server function |
| Auth | JWT com **jose** + **bcryptjs**; cookie httpOnly `grifo_session` |
| Sessão | helpers em `web_v2/src/lib/session.server.ts` (`getSession`, `requireSession`, `createSession`, `destroySession`) |

> **Prisma está instalado na RAIZ do repo**, não em `web_v2/`. Schema em
> `web_v2/prisma/schema.prisma`; rode da raiz com `--schema`. Não há scripts
> `db:*` — use `npx prisma ... --schema=web_v2/prisma/schema.prisma`.

## Anatomia de uma server function (canônico: `web_v2/src/lib/api/documents.functions.ts`)

```ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "../prisma.server";
import { requireSession } from "../session.server";

const createCoisaSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório"),
});

export const createCoisa = createServerFn({ method: "POST" })
  .inputValidator(createCoisaSchema)
  .handler(async ({ data }) => {
    const session = await requireSession();      // 401 automático
    return prisma.coisa.create({
      data: { ownerId: session.userId, title: data.title },
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });
  });
```

Regras inegociáveis:

1. **Arquivo por domínio** em `web_v2/src/lib/api/<dominio>.functions.ts`, uma
   `createServerFn` exportada por operação. `method: "GET"` para leitura, `"POST"`
   para qualquer mutação (create/update/delete são todos POST). Exportar a função
   já é "registrá-la" — não há `index.ts`/`openapi.ts`.
2. **Validação só via Zod** em `.inputValidator(schema)`; `data` já vem tipado.
   Sem input (`me`, `logout`, `listDocuments`) → sem `.inputValidator`.
3. **Sessão via `requireSession()`** no topo de toda operação autenticada — nunca
   leia o cookie na mão. Para leitura opcional, `getSession()` e trate `null`.
4. **Ownership em toda query de dado de usuário**: nunca `findUnique` solto por id.
   Sempre `findFirst({ where: { id, ownerId: session.userId } })`. No update/delete,
   busque com `findFirst`, valide, e só então `update`/`delete` pelo id verificado.
5. **Contrato de erro = `Response` lançada** com `{ error: string }` (pt-BR) e status
   semântico (400 validação, 401 sessão, 404 não encontrado, 409 conflito):
   ```ts
   throw new Response(JSON.stringify({ error: "Documento não encontrado" }), {
     status: 404, headers: { "content-type": "application/json" },
   });
   ```
   Não use o `Result<T>` de `result.ts` (existe, mas está sem uso). Sucesso de
   deleção = `{ ok: true }`.
6. **Senha nunca sai**: o client Prisma tem `omit: { user: { password: true } }`
   global (`web_v2/src/lib/prisma.server.ts`); só o `login` reabilita com
   `omit: { password: false }` para comparar o bcrypt.

## Onde cada coisa mora

```
web_v2/src/lib/
  api/
    auth.functions.ts       # register, login, logout, me (públicas + cookie)
    documents.functions.ts  # CRUD escopado por ownerId (canônico)
  prisma.server.ts          # client Prisma singleton + omit de password
  session.server.ts         # cookie grifo_session (get/create/destroy/require)
  auth.server.ts            # signToken/verifyToken (jose), SessionPayload
  result.ts                 # Result<T> — presente mas NÃO usado
web_v2/prisma/
  schema.prisma             # User + Document (Postgres); cuid, timestamps, onDelete, ownerId
```

> Todo módulo server-only tem sufixo **`.server.ts`** — o Vite tree-shake garante
> que não vaza para o bundle do client. **Nunca importe um `.server.ts` de um
> componente de UI** (importe a server function de `lib/api/` em vez disso).

## O que evitar

- Criar um servidor Hono/Express separado — server functions bastam para o tamanho
  do projeto.
- `findUnique({ where: { id } })` solto em dado de usuário (fura ownership).
- `any` em `data` (ele já vem tipado pelo Zod).
- Confiar no `mimeType` enviado pelo client para arquivos (validar magic bytes).
- Editar `web_v2/src/generated/prisma/` à mão (regenere com `npx prisma generate`).
- Editar migrations já commitadas (crie uma nova).
- `console.log` com PII; mensagem de erro vazando stack/SQL ao cliente.

## Ao escrever código

1. Leia uma server function vizinha (`documents.functions.ts`) antes de criar a sua
   — copie o padrão, não invente.
2. Mudou o schema? `npx prisma migrate dev --schema=web_v2/prisma/schema.prisma
   --name <nome>` e `npx prisma generate --schema=...` (ver skill `alterar-modelo`).
3. Mensagens de erro em pt-BR, como as existentes.
4. Verifique com `npx tsc --noEmit` (dentro de `web_v2/`) antes de entregar.
