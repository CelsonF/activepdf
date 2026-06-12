# ActivePDF — Regras do Projeto (Monorepo)

> Este arquivo é lido automaticamente em toda conversa. São as regras
> **inegociáveis** para escrever código neste repositório.
>
> Layout: `backend/` (API Hono, porta 4000), `web/` (app TanStack Start, porta
> 3000) e `frontend/` (app Next.js **legado**, em migração).
> Os comandos npm rodam **dentro da pasta** de cada app.
>
> **Front-end em migração (decisão de 12/jun/2026):** o app novo vive em
> `web/` e segue `docs/design-system-grifo.md` (referência canônica do design).
> Todo código novo de UI nasce em `web/`; não invista em melhoria visual no
> legado `frontend/` — ele some quando a migração terminar.
>
> Skills disponíveis:
> - `criar-endpoint` — criar ou alterar qualquer rota da API
> - `alterar-modelo` — mudanças no schema Prisma (modelo, campo, relação, migration)
> - `criar-componente` — criar ou revisar qualquer componente de UI ⚠️ ainda descreve o app legado
> - `refatorar-design-system` — auditar e refatorar para o padrão do design system ⚠️ ainda descreve o app legado
> - `storybook` — configurar o Storybook e escrever stories ⚠️ ainda descreve o app legado
> - `consumir-api` — buscar/enviar dados para a API ⚠️ ainda descreve o app legado

---

# Back-end (`backend/`)

## Stack (não trocar sem pedir)

| Camada | Tecnologia |
|---|---|
| HTTP | **Hono 4** + `@hono/node-server` — porta 4000 |
| ORM | **Prisma 7** + SQLite (`better-sqlite3`), client em `backend/src/generated/prisma/` |
| Validação | **Zod 4** via `jsonValidator()` (`backend/src/lib/validate.ts`) |
| Auth | JWT (**jose**) + **bcryptjs**; middlewares em `backend/src/middleware/auth.ts` |
| Docs | OpenAPI manual em `backend/src/openapi.ts` → `/docs` (Scalar) |

TypeScript strict, ESM — imports relativos terminam em `.js`.

## Regras de ouro

1. **Contrato de erro fixo**: `{ error: string }` com status semântico
   (400/401/404/409); o frontend depende desse shape. DELETE ok → `{ ok: true }`.
2. **Ownership em toda query**: `findFirst({ where: { id, professorId: session.userId } })`
   ou helpers de `backend/src/lib/ownership.ts`. Nunca `findUnique` solto por id.
3. **Auth só via middleware** (`requireAuth` / `requireTeacher` / `requireStudent`)
   e router tipado `new Hono<AuthEnv>()`.
4. **Validação só via schema Zod** em `backend/src/schemas/` + `jsonValidator(schema)`;
   leia com `c.req.valid("json")` — nada de `await c.req.json()` cru.
5. **Senha nunca sai**: omit global em `backend/src/lib/prisma.ts`; só o login usa
   `omit: { password: false }`.
6. **Listas grandes**: `parsePagination(c)` (`backend/src/lib/pagination.ts`) —
   resposta continua array puro.
7. Endpoint novo = registrar em `backend/src/index.ts` **e** documentar em
   `backend/src/openapi.ts`.
8. Mensagens de erro em **pt-BR**, genéricas e seguras (sem stack/SQL).
9. **Regra de negócio em `backend/src/services/`** — a rota valida, chama o
   service e mapeia o `Result` (`services/result.ts`) para HTTP. Query complexa
   ou efeito colateral (XP, correção) não nasce inline na rota.
10. **Limites de plano só em `backend/src/lib/entitlements.ts`** (FREE × PRO) —
    gate de recurso Pro via `requirePlan("PRO")`; nunca hardcode um limite em
    rota ou service. Limite estourado responde 409 com mensagem de upsell.

## Não fazer (back-end)

- Editar `backend/src/generated/prisma/` à mão (use `npm run db:generate`).
- Editar migrations já commitadas (crie uma nova).
- try/catch vazio ou decorativo — o `onError` global já cobre o 500.
- Confiar no `mimeType` enviado pelo client (tipo real vem dos magic bytes).
- `any` em dados de request; `console.log` com PII.

## Antes de entregar (back-end)

1. `npm run build` (tsc, dentro de `backend/`) passa?
2. Toda query escopada pela sessão?
3. Erros no contrato `{ error }` com status correto?
4. `index.ts` + `openapi.ts` atualizados se houve endpoint novo?

---

# Front-end (`web/`)

> **Referência canônica do design: `docs/design-system-grifo.md`.** Tokens,
> tipografia, componentes e blueprints de página vivem lá — este arquivo só
> resume as regras. O app Next.js 14 em `frontend/` é legado em migração.

## Stack (não trocar sem pedir)

| Camada | Tecnologia |
|---|---|
| Framework | **TanStack Start v1** (React 19 + SSR, rotas file-based em `src/routes/`) |
| Bundler | **Vite 7** via `@lovable.dev/vite-tanstack-config` |
| Linguagem | **TypeScript** strict — sem `any` |
| Estilo | **Tailwind CSS v4** (CSS-first, sem `tailwind.config.js`) — tokens em `@theme` no `src/styles.css` |
| Primitivos | **shadcn/ui** (estilo `new-york`, Radix) em `src/components/ui/` |
| Ícones | **lucide-react** (tamanho via `className="h-4 w-4"`, não a prop `size`) |
| Dados | **TanStack Query** no contexto do router |
| PDF | `pdfjs-dist` (render) · `pdf-lib` (export) · `tesseract.js` (OCR) |

## Regra de ouro do visual — identidade Grifo

Conceito: **"o editor é a capa"** — estética de caderno escolar. Papel
cinza-azulado, tinta navy, grifo de marca-texto amarelo, canetas categóricas.

1. **Só tokens semânticos** (`bg-card`, `text-muted-foreground`, `border-border`,
   `bg-ink`, `bg-highlight`, `bg-pen-blue`…). Cor nova = estender o `@theme`
   primeiro; **nunca** literal de cor em JSX.
2. **CTAs têm só duas formas**: ink-filled (`bg-ink text-highlight`) ou
   ink-bordered-on-highlight (`border-2 border-ink bg-highlight text-ink`).
3. **`pen-*` é categórico**: `pen-red` erro/alerta · `pen-blue` info ·
   `pen-green` sucesso/grátis · `pen-orange` destaque/aviso. Em loop de dados,
   `style={{ backgroundColor: "var(--color-pen-blue)" }}` é aceitável.
4. **Tipografia**: `font-sans` (Inter) corpo/UI · `font-display` (Archivo Black)
   em heros e H2 de seção · `font-mono` (JetBrains Mono) em eyebrows
   (`text-[10px] uppercase tracking-[0.2em]`), badges e teclas.
5. **Loading = skeleton, nunca spinner bloqueante.** O skeleton espelha a
   geometria real do card. No editor, o skeleton **sobrepõe** o canvas
   (`absolute inset-0`) — nunca substitui (o `canvasRef` precisa ficar montado).
6. A marca é o wordmark "Grifo" com traço amarelo por trás
   (`.text-highlight-mark` em palavra-chave de hero; logo = bloco `bg-ink` com
   `Highlighter` em `text-highlight`).

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

- Estado de servidor via **TanStack Query** (queries/mutations no contexto do
  router); não duplique cache em store local.
- O editor de PDF é browser-only: rota com `ssr: false`. Documentos anônimos
  persistem em `localStorage` (`grifo:tool:docs`); campos usam coordenadas
  normalizadas 0..1 sobre o tamanho renderizado da página.
- `style={{}}` só para valores genuínos de runtime (posição de campo sobre o
  canvas, `fontSize` por campo, cor `pen-*` vinda de dados).

## Estrutura de arquivos (front-end novo)

```
web/src/
  routes/            # rotas file-based (TanStack)
    __root.tsx       # shell html, fonts (Google Fonts via <link>), meta global
    index.tsx        # Landing
    dashboard.tsx    # Dashboard (3 colunas: sidebar 260px · main · detalhes 340px)
    tool.tsx         # Editor de PDF (ssr: false)
  components/ui/     # primitivos shadcn (Button, Skeleton, ...)
  lib/utils.ts       # cn()
  styles.css         # TODO o design system (tokens @theme, fonts, utilities)
```

> Blueprints completos de Landing, Dashboard e Tool em
> `docs/design-system-grifo.md` §6 — siga-os ao criar essas telas.

## Não fazer (front-end)

- `console.log` em código commitado.
- `key={index}` em listas que reordenam.
- Criar `tailwind.config.js` (é Tailwind v4, CSS-first).
- Literal de cor novo em JSX — estenda o `@theme` primeiro.
- Importar de `react-router-dom` — o router é `@tanstack/react-router`.
- Rotas fora de `src/routes/` (nada de `src/pages/`).
- Substituir o canvas do PDF durante loading — sobreponha um skeleton.
- Spinner centralizado bloqueando a UI.
- Refatorar além do escopo pedido.

## Antes de entregar (front-end)

1. Só tokens semânticos/brand/pen-* — nenhum literal de cor em JSX?
2. `npx tsc --noEmit` passa (sem `any`, sem erro de tipo)?
3. UI assíncrona tem skeleton com a geometria do conteúdo real?
4. CTAs numa das duas formas oficiais? Eyebrows em mono uppercase?
5. Sem `console.log`, sem `style` de cor estática?
