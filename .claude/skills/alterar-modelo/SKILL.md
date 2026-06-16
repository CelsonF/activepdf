---
name: alterar-modelo
description: >
  Passo a passo para criar ou alterar um modelo no schema Prisma do Grifo
  (activepdf): Prisma + PostgreSQL, schema em web_v2/prisma/schema.prisma e
  client gerado em web_v2/src/generated/prisma. Use sempre que a tarefa envolver
  o schema — novo modelo, novo campo, nova relação, índice ou enum. Garante
  migration nomeada, client regenerado e as convenções do projeto (cuid,
  timestamps, onDelete explícito, ownerId, omit de password).
---

# Alterar modelo Prisma (Grifo — Postgres)

> O banco é **PostgreSQL** (não SQLite). O Prisma está instalado na **RAIZ do
> repositório**, não em `web_v2/`. O schema vive em
> `web_v2/prisma/schema.prisma` e gera o client em
> `web_v2/src/generated/prisma/` — **nunca edite os arquivos gerados à mão**.

## 1. Editar `web_v2/prisma/schema.prisma`

O schema atual tem dois modelos (`User`, `Document`) — siga o estilo deles.
Convenções de todo modelo do projeto:

```prisma
model Coisa {
  id        String   @id @default(cuid())
  ownerId   String
  title     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  owner User @relation(fields: [ownerId], references: [id], onDelete: Cascade)

  @@index([ownerId])
  @@map("coisas")
}
```

- `id String @id @default(cuid())` — nunca autoincrement.
- `createdAt` / `updatedAt` em todo modelo.
- Toda relação com `onDelete` **explícito** (quase sempre `Cascade` para dados que
  pertencem a um usuário).
- Dado de usuário tem `ownerId` + `@@index([ownerId])` — é isso que permite o
  escopo de ownership nas server functions (`findFirst({ where: { id, ownerId } })`).
- `@@map("nome_tabela")` em snake_case plural (como `users`, `documents`).
- Campo opcional = `String?`, e no Zod correspondente `.optional()` / `.nullish()`.
- **Enums**: o Postgres tem enum nativo — declare `enum Papel { ... }` e use direto
  no campo. (O schema atual não usa nenhum enum; se precisar de um, é nativo, não
  precisa virar `String`.)

## 2. Migrar e regenerar (comandos da RAIZ, com `--schema`)

Não há scripts `db:generate`/`db:migrate`/`db:reset` — o `package.json` de
`web_v2/` só tem `dev/build/preview/lint/format`. Rode o Prisma direto, **da raiz**,
sempre passando `--schema`:

```bash
# regenera o client em web_v2/src/generated/prisma (necessário no 1º setup também)
npx prisma generate --schema=web_v2/prisma/schema.prisma

# cria/aplica migration (nome curto, verbo em inglês)
npx prisma migrate dev --schema=web_v2/prisma/schema.prisma --name add-coisa-model

# inspecionar dados
npx prisma studio --schema=web_v2/prisma/schema.prisma
```

> Ainda **não há pasta `prisma/migrations/`**: a primeira `migrate dev` cria a
> migration inicial. Nunca apague nem edite migrations já commitadas — corrija com
> uma migration nova.

O `DATABASE_URL` vem do `.env` (Neon/Supabase, ou `docker-compose up -d` na raiz →
Postgres em `localhost:5433`, user/senha/db = `activepdf`).

## 3. Efeitos colaterais obrigatórios

Mudou o schema? Verifique, nesta ordem:

1. **Regenerar o client** (`prisma generate`) — senão os tipos não enxergam o
   modelo/campo novo.
2. **Omit de senha** — se o modelo novo tiver campo sensível (senha, token),
   adicione-o ao `omit` global em `web_v2/src/lib/prisma.server.ts`, como já é feito
   para `user.password`.
3. **Schemas Zod** nas server functions (`web_v2/src/lib/api/*.functions.ts`) que
   espelham o modelo (create/update).
4. **Server functions** que fazem `select`/`include` no modelo alterado —
   `npx tsc --noEmit` aponta as quebras.

## 4. Antes de entregar

1. `npx prisma validate --schema=web_v2/prisma/schema.prisma` passa?
2. `npx prisma generate --schema=web_v2/prisma/schema.prisma` rodou e
   `npx tsc --noEmit` (dentro de `web_v2/`) passa sem erro de tipo?
3. Migration tem nome descritivo e está commitada junto com o schema?
4. Modelo com `id cuid()`, `createdAt`/`updatedAt`, `onDelete` explícito, `ownerId`
   + `@@index` quando é dado de usuário?
5. Nenhum arquivo de `web_v2/src/generated/prisma/` editado manualmente?
