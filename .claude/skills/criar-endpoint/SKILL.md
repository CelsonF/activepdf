---
name: criar-endpoint
description: >
  Passo a passo para criar ou alterar QUALQUER operação de back-end do Grifo
  (activepdf) — que agora são server functions do TanStack Start
  (createServerFn + Zod + Prisma), não mais rotas Hono. Use sempre que a tarefa
  for criar uma operação, adicionar um método a um domínio existente, validar um
  input novo ou expor dados do Prisma — garante schema Zod via .inputValidator,
  ownership por ownerId, sessão via requireSession() e o contrato de erro
  (Response lançada com { error }).
---

# Criar / alterar uma server function (Grifo — TanStack Start)

> **Não existe mais backend Hono separado.** Toda a lógica de servidor roda no
> mesmo processo do TanStack Start (porta 3000) como **server functions**
> (`createServerFn`). Não há `app.route(...)`, nem `index.ts` de registro, nem
> `openapi.ts`. Uma função exportada já é o "endpoint": o cliente a chama direto.

Siga este fluxo toda vez que criar ou alterar uma operação. O objetivo é que
**toda server function saia idêntica em forma às existentes** —
`web_v2/src/lib/api/documents.functions.ts` é o exemplo canônico de CRUD com
sessão; `auth.functions.ts` é o canônico de fluxo público + cookie.

## 0. Antes de escrever

- O domínio já tem arquivo em `web_v2/src/lib/api/`? Adicione a função lá, não
  crie arquivo novo. Um arquivo por domínio: `auth.functions.ts`,
  `documents.functions.ts`, …
- Helpers de servidor (sessão, prisma, jwt) já existem em `web_v2/src/lib/*.server.ts`.
  Nunca releia cookie nem instancie Prisma na mão.
- Quem pode chamar? Operação pública (register/login) ou autenticada
  (`requireSession()` no topo do handler).

## 1. Anatomia de uma server function

Arquivo: `web_v2/src/lib/api/<dominio>.functions.ts`. Uma função exportada por
operação.

```ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "../prisma.server";
import { requireSession } from "../session.server";

// 1) Schema Zod do input — mensagens em pt-BR, trim() em nomes/títulos.
const createCoisaSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório"),
  notesJson: z.record(z.string(), z.string()).optional(),
});

// 2) GET para leitura, POST para mutação (create/update/delete também são POST).
export const createCoisa = createServerFn({ method: "POST" })
  .inputValidator(createCoisaSchema)        // validação SÓ via Zod
  .handler(async ({ data }) => {            // `data` já vem tipado pelo schema
    const session = await requireSession();  // 401 automático se não houver sessão
    const coisa = await prisma.coisa.create({
      data: { ownerId: session.userId, title: data.title },
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });
    return coisa;                            // sucesso = retorno serializável
  });
```

Pontos não negociáveis (copie do código real, não invente):

- **`createServerFn({ method })`** — `"GET"` para leitura, `"POST"` para qualquer
  mutação. Não há PATCH/PUT/DELETE: create, update e delete são todos `POST`.
- **`.inputValidator(schema)`** antes de `.handler` quando há input. Sem input
  (ex.: `logout`, `me`, `listDocuments`) não use `.inputValidator`.
- **`data` é o input já validado/tipado** — nunca assuma o shape sem schema, nunca
  `any`.
- **Retorno é o sucesso**: objeto/array serializável. Deleção retorna `{ ok: true }`.

## 2. Sessão e ownership

```ts
const session = await requireSession();   // de "../session.server"
```

- `requireSession()` lança `Response` 401 (`{ error: "Não autorizado" }`) se não
  houver cookie de sessão válido. Use no **topo** de todo handler autenticado.
- Para ler sessão sem obrigar (ex.: `me`), use `getSession()` e trate `null`.
- **Ownership em TODA query de dado de usuário**: nunca `findUnique` solto por id.
  Sempre `findFirst({ where: { id, ownerId: session.userId } })`. No update/delete,
  busque primeiro com `findFirst`, valide existência, e só então `update`/`delete`
  pelo id já verificado:

```ts
const existing = await prisma.document.findFirst({
  where: { id: data.id, ownerId: session.userId },
});
if (!existing) {
  throw new Response(JSON.stringify({ error: "Documento não encontrado" }), {
    status: 404,
    headers: { "content-type": "application/json" },
  });
}
await prisma.document.update({ where: { id: existing.id }, data: { /* ... */ } });
```

## 3. Contrato de erro — `Response` lançada com `{ error }`

O padrão real do projeto é **lançar uma `Response`** (não usar try/catch, não usar
o `Result<T>` de `result.ts` — esse tipo existe mas está sem uso). Forma exata:

```ts
throw new Response(JSON.stringify({ error: "Mensagem em pt-BR" }), {
  status: 404,                                   // status semântico
  headers: { "content-type": "application/json" },
});
```

| Situação | Status | Texto (pt-BR) |
|---|---|---|
| Input inválido | 400 | o Zod já devolve a mensagem do schema |
| Sem sessão | 401 | `requireSession()` já devolve `{ error: "Não autorizado" }` |
| Registro não é do usuário **ou** não existe | 404 | `"<Recurso> não encontrado"` — mesmo texto para os dois casos |
| Conflito / único duplicado | 409 | `"Este email já está cadastrado"` (ver `auth.functions.ts`) |

## 4. Senha e dados sensíveis

- O client Prisma (`web_v2/src/lib/prisma.server.ts`) já tem
  `omit: { user: { password: true } }` global — o hash de senha **nunca** sai em
  query. Só o `login` reabilita com `omit: { password: false }` para comparar o
  bcrypt.
- Modelo novo com campo sensível → adicione ao `omit` global em `prisma.server.ts`
  (veja a skill `alterar-modelo`).

## 5. Como a função é "registrada"

Não há registro central. **Exportar a função já basta** — o cliente importa de
`web_v2/src/lib/api/<dominio>.functions.ts` e a chama (veja a skill
`consumir-api` para o lado do cliente). Sem `index.ts`, sem `openapi.ts`.

## 6. Antes de entregar

1. `npx tsc --noEmit` (dentro de `web_v2/`) passa — sem `any`, sem erro de tipo?
2. Input validado por Zod via `.inputValidator(schema)` (mensagens pt-BR)?
3. Operação autenticada começa com `requireSession()`?
4. Toda query de dado de usuário escopada por `ownerId: session.userId`
   (`findFirst`, nunca `findUnique` solto)?
5. Erros são `Response` lançada com `{ error }` e status semântico (400/401/404/409)?
6. Módulo só importa `*.server.ts` (prisma/session) — nada de `.server.ts` vazando
   para componente de UI.
