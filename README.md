# Grifo

Editor de PDF baseado em browser — carregue qualquer PDF, adicione campos preenchíveis e anotações, exporte o resultado. Identidade editorial: papel off-white quente, tinta quase-preta e marca-texto carmim.

## Funcionalidades

- Carregamento e renderização de PDF no browser (`pdfjs-dist`)
- Campos posicionados sobre o PDF (texto, checkbox, assinatura…) com coordenadas normalizadas
- Anotações HTML por página
- Modo anônimo: documentos salvos em `localStorage` sem conta
- Modo autenticado: documentos persistidos no Postgres (CRUD completo)
- Export do PDF preenchido (`pdf-lib`)
- SSR com TanStack Start — landing e dashboard renderizados no servidor; editor roda só no client (`ssr: false`)

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | TanStack Start v1 — React 19 + SSR, rotas file-based |
| Back-end | Server functions (`createServerFn`) — sem processo separado |
| ORM | Prisma + PostgreSQL (Neon / Supabase) |
| Validação | Zod via `.inputValidator()` |
| Auth | JWT (jose) em cookie httpOnly |
| Bundler | Vite 7 via `@lovable.dev/vite-tanstack-config` |
| Estilo | Tailwind CSS v4 (CSS-first) + shadcn/ui (estilo `new-york`) |
| Ícones | lucide-react |
| PDF | `pdfjs-dist` (render) · `pdf-lib` (export) |
| Deploy | Vercel — Nitro preset (Build Output API) |

## Estrutura

```
activepdf/
  web_v2/                   # único app vivo (porta 3000)
    prisma/
      schema.prisma          # modelos User e Document
    src/
      routes/
        index.tsx            # Landing (pt)
        en.tsx / es.tsx      # Landing localizada
        dashboard.tsx        # Dashboard (pt)
        en.dashboard.tsx     # Dashboard localizada
        es.dashboard.tsx
        tool.tsx             # Editor de PDF (ssr: false)
        __root.tsx           # shell HTML, fontes, meta global
      lib/
        api/
          auth.functions.ts       # register, login, logout, me
          documents.functions.ts  # CRUD de documentos
        auth.server.ts       # assinar / verificar JWT
        session.server.ts    # cookie de sessão (get / create / destroy / require)
        prisma.server.ts     # client Prisma singleton
        utils.ts             # cn()
      components/ui/         # primitivos shadcn (Button, Skeleton…)
      styles.css             # design system — tokens @theme, fontes, utilities
      generated/prisma/      # client gerado (não editar manualmente)
  docs/                      # design system e decisões de produto
  docker-compose.yml         # Postgres local na porta 5433
```

## Setup local

```bash
# 1. Banco de dados — Docker (ou configure Neon / Supabase)
docker-compose up -d
# Postgres disponível em localhost:5433 (user/senha/db = activepdf)

# 2. Variáveis de ambiente
cp web_v2/.env.example web_v2/.env
# Preencha DATABASE_URL e JWT_SECRET:
#   DATABASE_URL="postgresql://activepdf:activepdf@localhost:5433/activepdf"
#   JWT_SECRET=$(openssl rand -base64 32)

# 3. Instalar dependências
cd web_v2 && npm install

# 4. Gerar client Prisma (rodar da raiz)
cd .. && npx prisma generate --schema=web_v2/prisma/schema.prisma

# 5. Criar migration inicial
npx prisma migrate dev --schema=web_v2/prisma/schema.prisma --name init

# 6. Dev server
cd web_v2 && npm run dev
# → http://localhost:3000
```

## Comandos

Todos os comandos abaixo rodam **dentro de `web_v2/`**, exceto os do Prisma que rodam da raiz.

| Ação | Comando |
|---|---|
| Dev server | `npm run dev` |
| Build de produção | `npm run build` |
| Preview do build | `npm run preview` |
| Type-check (gate de entrega) | `npx tsc --noEmit` |
| Lint | `npm run lint` |
| Format | `npm run format` |
| Prisma Studio | `npx prisma studio --schema=web_v2/prisma/schema.prisma` (da raiz) |
| Nova migration | `npx prisma migrate dev --schema=web_v2/prisma/schema.prisma --name <nome>` |
| Regenerar client | `npx prisma generate --schema=web_v2/prisma/schema.prisma` |

## Deploy (Vercel)

1. Conecte o repositório no Vercel
2. Defina o **Root Directory** como `web_v2`
3. Adicione as variáveis `DATABASE_URL` e `JWT_SECRET` nas configurações do projeto
4. O preset Nitro `vercel` gera o `.vercel/output` automaticamente — nenhuma config extra necessária

> O `vite.config.ts` força `nitro.preset = "vercel"`. Não altere o preset sem ajustar o alvo de deploy.

## Arquitetura de dados

```
User (users)
  id        cuid  PK
  name      String
  email     String  unique
  password  String  (bcrypt — nunca sai nas respostas)
  documents Document[]

Document (documents)
  id         cuid  PK
  ownerId    String  FK → users.id  (cascade delete)
  title      String
  pdfName    String
  pdfData    String  (base64 — plano: trocar por object storage)
  fieldsJson String  (Field[] — tipo, posição normalizada, valor)
  notesJson  String  (Record<page, html>)
```

## Convenções de back-end

- Server functions validadas por Zod via `.inputValidator(schema)`
- Toda operação autenticada começa com `requireSession()` (`session.server.ts`)
- Ownership em toda query: `findFirst({ where: { id, ownerId: session.userId } })`
- Erros retornados como `Response` com `{ error: string }` e status semântico (401 / 404 / 409)
- Módulos server-only com sufixo `.server.ts` — nunca importados por componentes client
