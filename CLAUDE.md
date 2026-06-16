# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Grifo (activepdf) — Regras do Projeto

> Este arquivo é lido automaticamente em toda conversa. São as regras
> **inegociáveis** para escrever código neste repositório.
>
> Layout: **um único app** em `web_v2/` (TanStack Start — front-end SSR +
> back-end via server functions, mesmo processo, porta 3000). Não há mais
> `backend/`, `frontend/` nem `web/` — foram removidos em 16/jun/2026 para
> eliminar duplicação; `web_v2/` é o único projeto vivo.
>
> Skills disponíveis (ainda referenciam a estrutura antiga em alguns pontos —
> revisar/atualizar antes de seguir ao pé da letra):
> - `criar-endpoint` — criar ou alterar uma server function (`web_v2/src/lib/api/*.functions.ts`)
> - `alterar-modelo` — mudanças no schema Prisma (`web_v2/prisma/schema.prisma`)
> - `criar-componente` — criar ou revisar qualquer componente de UI
> - `refatorar-design-system` — auditar e refatorar para o padrão do design system
> - `storybook` — configurar o Storybook e escrever stories
> - `consumir-api` — buscar/enviar dados via server functions no front-end

---

# App (`web_v2/`)

## Comandos

App (rodar **de dentro de `web_v2/`**):

| Ação | Comando |
|---|---|
| Dev (SSR, porta 3000) | `npm run dev` |
| Build de produção | `npm run build` (preset Vercel via Nitro — ver Deploy) |
| Preview do build | `npm run preview` |
| Lint | `npm run lint` (ESLint flat config) |
| Format | `npm run format` (Prettier) |
| **Type-check (gate de entrega)** | `npx tsc --noEmit` |

Banco de dados — **o Prisma está instalado na RAIZ do repo, não em `web_v2/`**.
O schema fica em `web_v2/prisma/schema.prisma` e gera o client em
`web_v2/src/generated/prisma/`. Rode **da raiz** sempre com `--schema`:

```bash
npx prisma generate --schema=web_v2/prisma/schema.prisma   # gera o client (necessário no 1º setup)
npx prisma migrate dev --schema=web_v2/prisma/schema.prisma --name <nome>
npx prisma studio --schema=web_v2/prisma/schema.prisma
```

> Ainda **não há pasta `prisma/migrations/`**: a primeira `migrate dev` cria a
> migration inicial. `BACKEND_SETUP.md` cita `npm run db:generate`/`db:migrate`,
> mas **esses scripts não existem** — use os comandos `npx prisma` acima.

Ambiente: `cp web_v2/.env.example web_v2/.env` e preencha `DATABASE_URL`
(Neon/Supabase, ou `docker-compose up -d` na raiz → Postgres em `localhost:5433`,
user/senha/db = `activepdf`) e `JWT_SECRET` (`openssl rand -base64 32`).

## Stack (não trocar sem pedir)

| Camada | Tecnologia |
|---|---|
| Framework | **TanStack Start v1** (React 19 + SSR, rotas file-based em `src/routes/`) |
| Back-end | **Server functions** (`createServerFn`) em `src/lib/api/*.functions.ts` — sem processo HTTP separado |
| ORM | **Prisma** + **PostgreSQL** (Neon/Supabase), client em `src/generated/prisma/` |
| Validação | **Zod** via `.inputValidator(schema)` nas server functions |
| Auth | JWT (**jose**) em cookie httpOnly; helpers em `src/lib/auth.server.ts` e `src/lib/session.server.ts` |
| Bundler | **Vite 7** via `@lovable.dev/vite-tanstack-config` |
| Linguagem | **TypeScript** strict — sem `any` |
| Estilo | **Tailwind CSS v4** (CSS-first, sem `tailwind.config.js`) — tokens em `@theme` no `src/styles.css` |
| Primitivos | **shadcn/ui** (estilo `new-york`, Radix) em `src/components/ui/` |
| Ícones | **lucide-react** (tamanho via `className="h-4 w-4"`, não a prop `size`) |
| PDF | `pdfjs-dist` (render) · `pdf-lib` (export) |

## Regras de ouro do back-end (server functions)

1. **Arquivo por domínio**: `src/lib/api/auth.functions.ts`, `documents.functions.ts` —
   uma server function exportada por operação (`createServerFn`).
2. **Sufixo `.server.ts`** para todo módulo server-only (`prisma.server.ts`,
   `auth.server.ts`, `session.server.ts`) — o Vite tree-shake garante que não
   vaza para o bundle do client. Nunca importe um `.server.ts` de um componente.
3. **Sessão via `requireSession()`** (`src/lib/session.server.ts`) no topo do
   handler de toda operação autenticada — nunca leia o cookie manualmente.
4. **Ownership em toda query**: `findFirst({ where: { id, ownerId: session.userId } })`.
   Nunca `findUnique` solto por id em dado de usuário.
5. **Validação só via Zod** em `.inputValidator(schema)` — nada de assumir o
   shape do `data` sem schema.
6. **Erro como `Response` lançada** com `{ error: string }` em JSON e status
   semântico (401/404/409) — é o padrão que o client trata.
7. **Senha nunca sai**: `omit: { user: { password: true } }` no client Prisma
   (`prisma.server.ts`); só o login usa `omit: { password: false }`.

## Não fazer (back-end)

- Editar `src/generated/prisma/` à mão (regenere com `npx prisma generate --schema=web_v2/prisma/schema.prisma`).
- Editar migrations já commitadas (crie uma nova).
- Confiar no `mimeType` enviado pelo client para arquivos (validar magic bytes).
- `any` em dados de request; `console.log` com PII.
- Criar um servidor Hono/Express separado — server functions bastam para o
  tamanho atual do projeto.

## Regra de ouro do visual — identidade Grifo

Conceito: **"o editor é a capa"** — estética editorial de documento/PDF.
Papel off-white quente, tinta quase-preta, grifo de marca-texto **carmim**
(`highlight` = `primary`, mesma cor), canetas categóricas.

1. **Só tokens semânticos** (`bg-card`, `text-muted-foreground`, `border-border`,
   `bg-ink`, `bg-primary`, `bg-pen-blue`…). Cor nova = estender o `@theme`
   primeiro; **nunca** literal de cor em JSX.
2. **CTAs têm só duas formas**: carmim preenchido (`bg-primary text-primary-foreground`)
   ou contornado (`border-2 border-ink bg-surface text-ink`). Nunca texto carmim
   sobre fundo escuro.
3. **`pen-*` é categórico**: `pen-red` erro/alerta · `pen-blue` info ·
   `pen-green` sucesso/grátis · `pen-orange` destaque/aviso. Em loop de dados,
   `style={{ backgroundColor: "var(--color-pen-blue)" }}` é aceitável.
4. **Tipografia**: `font-sans` (Inter) corpo/UI · `font-display` (Archivo Black)
   em heros e H2 de seção · `font-mono` (JetBrains Mono) em eyebrows
   (`text-[10px] uppercase tracking-[0.2em]`), badges e teclas.
5. **Loading = skeleton, nunca spinner bloqueante.** O skeleton espelha a
   geometria real do card. No editor, o skeleton **sobrepõe** o canvas
   (`absolute inset-0`) — nunca substitui (o `canvasRef` precisa ficar montado).
6. A marca é o wordmark "Grifo" com marca-texto carmim por trás
   (`.text-highlight-mark`, palavra creme sobre carmim, em palavra-chave de hero;
   logo = bloco `bg-primary` com `Highlighter` em `text-primary-foreground`).

## Como escrever um componente

- Um componente = uma responsabilidade. Passou de ~80 linhas? Extraia partes.
- Props tipadas com `interface Props { ... }` no topo. **Sem `React.FC`** —
  escreva `export function Nome(props: Props)`.
- **Named export** para componentes reutilizáveis; rotas usam
  `createFileRoute` em `src/routes/`.
- Combine classes com o **`cn()`** de `src/lib/utils.ts` (clsx +
  tailwind-merge) — nunca monte strings gigantes com ternários aninhados.
- Antes de criar: **confira se o primitivo já existe** em `src/components/ui/`
  (shadcn) — estenda em vez de duplicar.
- `src/routes/tool.tsx` (o editor) está com ~1400 linhas — ao tocar nele,
  prefira extrair um pedaço (hook, subcomponente) a adicionar mais lógica
  inline. Não é necessário reescrever tudo de uma vez.

## TypeScript

- **Sem `any`.** Use `unknown` + type guard quando o tipo for incerto.
- `interface` para contratos de componente; `type` para shapes de dados simples.
- `readonly` em arrays/objetos que não mudam.
- `const` sobre `let`; nunca `var`.
- Estenda os atributos nativos quando fizer sentido:
  `interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>`.

## Tailwind v4

- Entry é `@import "tailwindcss";` — sem `@tailwind base/components/utilities`.
- **Sem `tailwind.config.js`** — tokens no `@theme` de `src/styles.css`;
  tokens shadcn em `@theme inline`.
- Utility custom = `@utility nome { ... }` (nunca `@layer utilities`);
  variant custom = `@custom-variant`.
- Ordem das classes: **layout → tamanho → espaçamento → visual → interação → responsivo**.
- Espaçamento entre irmãos: `flex`/`grid` + `gap-*`, não margens soltas.
- Micro-interações padrão: `hover:scale-[1.02]` em CTA, `hover:shadow-lg` em card.

## Estado e dados

- O editor de PDF é browser-only: rota com `ssr: false`. Documentos anônimos
  (sem conta) persistem em `localStorage` (`grifo:tool:docs`); campos usam
  coordenadas normalizadas 0..1 sobre o tamanho renderizado da página.
- Documentos de uma conta logada persistem via as server functions de
  `src/lib/api/documents.functions.ts` (Postgres) — o `localStorage` é só
  para o modo anônimo/rascunho.
- `style={{}}` só para valores genuínos de runtime (posição de campo sobre o
  canvas, `fontSize` por campo, cor `pen-*` vinda de dados).

## Estrutura de arquivos

```
web_v2/
  prisma/
    schema.prisma      # User, Document
  src/
    routes/             # rotas file-based (TanStack)
      __root.tsx         # shell html, fonts, meta global
      index.tsx          # Landing
      dashboard.tsx       # Dashboard
      tool.tsx            # Editor de PDF (ssr: false)
    lib/
      api/
        auth.functions.ts       # register, login, logout, me
        documents.functions.ts  # CRUD de documentos
      auth.server.ts     # assinar/verificar JWT
      session.server.ts  # cookie de sessão (get/create/destroy/require)
      prisma.server.ts   # client Prisma singleton
      result.ts          # tipo Result<T> para retorno de operações
      utils.ts            # cn()
    components/ui/       # primitivos shadcn (Button, Skeleton, ...)
    styles.css            # design system completo (tokens @theme, fonts, utilities)
```

> Blueprints completos de Landing, Dashboard e Tool em
> `docs/design-system-grifo.md` — siga-os ao criar essas telas (algumas
> seções ainda referenciam a estrutura antiga; tratar como referência visual,
> não como caminho de arquivo literal).

## i18n e SEO

- Três locales em `src/lib/i18n.ts`: `pt` (padrão, **sem prefixo** na URL),
  `en` e `es` (prefixados: `/en`, `/es`). Use `localePath(locale, path)` e
  `localePrefix()` — nunca monte a URL com prefixo na mão.
- Rotas localizadas são arquivos irmãos: `index.tsx` (pt) + `en.tsx` + `es.tsx`;
  o dashboard idem (`dashboard.tsx` + `en.dashboard.tsx` + `es.dashboard.tsx`).
  Ao mexer numa tela traduzida, ajuste as três variantes.
- SEO/infra geradas por rota: `sitemap[.]xml.ts`, `og[.]png.tsx` (OG image via
  `@vercel/og`), `blog.*.tsx` (artigos). `BASE_URL` canônico mora no `i18n.ts`.
- `src/lib/route-heads.ts` centraliza `<head>` (title/meta/canonical) por rota.

## SSR e deploy (Vercel)

- Entry de servidor customizado: `src/server.ts` (wrapper de erro de SSR), apontado
  pelo `vite.config.ts` (`tanstackStart.server.entry = "server"`).
- O build sai no **Vercel Build Output API** porque `vite.config.ts` força
  `nitro.preset = "vercel"` — o preset padrão do `@lovable.dev/vite-tanstack-config`
  é Cloudflare e **não** emite `.vercel/output`, o que dá 404 em todas as rotas.
  Não troque o preset sem ajustar o alvo de deploy.
- **Não** adicione plugins Vite manualmente (tanstackStart, react, tailwind,
  tsconfig-paths, nitro…): o config do Lovable já os inclui; duplicar quebra o app.
- Captura de erro client/SSR: `src/lib/error-capture.ts`,
  `lovable-error-reporting.ts`, `error-page.ts`.

## Não fazer

- `console.log` em código commitado.
- `key={index}` em listas que reordenam.
- Criar `tailwind.config.js` (é Tailwind v4, CSS-first).
- Literal de cor novo em JSX — estenda o `@theme` primeiro.
- Importar de `react-router-dom` — o router é `@tanstack/react-router`.
- Rotas fora de `src/routes/` (nada de `src/pages/`).
- Substituir o canvas do PDF durante loading — sobreponha um skeleton.
- Spinner centralizado bloqueando a UI.
- Refatorar além do escopo pedido.

## Antes de entregar

1. `npx tsc --noEmit` passa (sem `any`, sem erro de tipo)?
2. Server function nova: validada por Zod, escopada por `requireSession()`,
   erro no contrato `{ error }`?
3. Só tokens semânticos/brand/pen-* — nenhum literal de cor em JSX?
4. UI assíncrona tem skeleton com a geometria do conteúdo real?
5. CTAs numa das duas formas oficiais? Eyebrows em mono uppercase?
6. Sem `console.log`, sem `style` de cor estática?