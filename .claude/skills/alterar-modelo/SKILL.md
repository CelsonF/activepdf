---
name: alterar-modelo
description: >
  Passo a passo para criar ou alterar um modelo no schema Prisma do ActivePDF
  (Prisma 7 + SQLite via better-sqlite3, client gerado em backend/src/generated/prisma).
  Use sempre que a tarefa envolver backend/prisma/schema.prisma — novo modelo,
  novo campo, nova relação, índice ou enum. Garante migration nomeada, client
  regenerado, seed coerente e as convenções do projeto (cuid, timestamps,
  onDelete explícito, omit de password).
---

# Alterar modelo Prisma (ActivePDF)

O banco é SQLite (`backend/dev.db`) com Prisma 7 e client gerado em
`backend/src/generated/prisma/` — **nunca edite os arquivos gerados à mão**.

## 1. Editar `backend/prisma/schema.prisma`

Convenções de todo modelo do projeto:

```prisma
model Coisa {
  id          String   @id @default(cuid())
  title       String
  professorId String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  professor Professor @relation(fields: [professorId], references: [id], onDelete: Cascade)
}
```

- `id String @id @default(cuid())` — nunca autoincrement.
- `createdAt` / `updatedAt` em todo modelo.
- Toda relação com `onDelete` **explícito** (quase sempre `Cascade` para
  dados que pertencem a professor/aluno).
- Dados de professor têm `professorId`; dados de aluno, `studentId` — é isso
  que permite o escopo de ownership nas rotas.
- Campo opcional no banco = `String?`, e no Zod correspondente = `.nullish()`.
- SQLite não tem enum nativo: enums viram `String` + validação no Zod.

## 2. Migrar e regenerar

```bash
cd backend
npx prisma migrate dev --name <verbo-curto-em-ingles>   # ex: add-coisa-model
npm run db:generate                                       # regenera src/generated/prisma
```

Nunca apague nem edite migrations já commitadas; corrija com uma migration
nova. Para recomeçar o banco local: `npm run db:reset` (roda o seed).

## 3. Efeitos colaterais obrigatórios

Mudou o schema? Verifique, nesta ordem:

1. **`backend/prisma/seed.ts`** — o seed precisa continuar válido e, se o modelo é
   central, ganhar dados de exemplo.
2. **Omit de senha** — se o modelo novo tiver campo sensível (senha, token),
   adicione ao `omit` global em `backend/src/lib/prisma.ts`, como já é feito para
   `professor.password` e `student.password`.
3. **Schemas Zod** em `backend/src/schemas/` que espelham o modelo (create/update).
4. **Rotas** que fazem `include`/`select` no modelo alterado — `npm run build`
   aponta as quebras.
5. **`backend/src/openapi.ts`** se o shape de alguma resposta mudou.

## 4. Antes de entregar

1. `npx prisma validate` e `npm run build` (dentro de `backend/`) passam?
2. Migration tem nome descritivo e está commitada junto com o schema?
3. `npm run db:reset` roda sem erro (migrations + seed coerentes)?
4. Nenhum arquivo de `backend/src/generated/` editado manualmente?
