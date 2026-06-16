# Backend do Grifo — Setup

O `web_v2` agora tem persistência via **server functions do TanStack Start**
(sem processo de API separado) + **Prisma** + **PostgreSQL**.

## 1. Banco de dados

Crie um banco Postgres grátis no [Neon](https://neon.tech) ou
[Supabase](https://supabase.com) e copie a connection string. Alternativa
local: `docker-compose up -d` na raiz do repo sobe um Postgres em
`localhost:5433` (usuário/senha/db = `activepdf`).

## 2. Variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` e preencha:
- `DATABASE_URL` — a connection string do passo 1
- `JWT_SECRET` — gere com `openssl rand -base64 32`

## 3. Gerar o client e criar as tabelas

```bash
npm run db:generate   # gera o Prisma Client em src/generated/prisma
npm run db:migrate    # cria a migration inicial e aplica no banco
```

## 4. Rodar

```bash
npm run dev
```

## O que existe hoje

- **`User`** — conta única (sem distinção professor/aluno por enquanto).
- **`Document`** — um PDF salvo com os campos do editor (`fieldsJson`) e
  anotações (`notesJson`).
- **Auth**: `register` / `login` / `logout` / `me` em
  `src/lib/api/auth.functions.ts` — sessão via cookie JWT httpOnly.
- **Documentos**: `listDocuments` / `getDocument` / `createDocument` /
  `updateDocument` / `deleteDocument` em `src/lib/api/documents.functions.ts`.

## Como chamar do front-end

Server functions são chamadas como funções normais a partir de um componente
ou route loader:

```ts
import { login } from "@/lib/api/auth.functions";
import { createDocument } from "@/lib/api/documents.functions";

// dentro de um handler de formulário, por exemplo:
const user = await login({ data: { email, password } });

// salvar o documento que está sendo editado em tool.tsx:
const doc = await createDocument({
  data: { title, pdfName, pdfData, fieldsJson: fields, notesJson: notes },
});
```

Erros chegam como `Response` com status 401/404/409 e corpo
`{ "error": "mensagem" }` — trate com try/catch em volta da chamada.

## Próximo passo natural

Ligar o botão "Salvar" do `tool.tsx` (hoje só grava em `localStorage`) a
`createDocument`/`updateDocument` quando o usuário estiver logado, e criar as
telas de login/registro/lista de documentos. Isso ainda não foi feito —
é puro backend por enquanto.