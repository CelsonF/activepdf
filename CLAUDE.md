# ActivePDF — Regras do Projeto (Monorepo)

> Este arquivo é lido automaticamente em toda conversa. São as regras
> **inegociáveis** para escrever código neste repositório.
>
> Layout: `backend/` (API Hono, porta 4000) e `frontend/` (Next.js, porta 3000).
> Os comandos npm rodam **dentro da pasta** de cada app.
>
> Skills disponíveis:
> - `criar-endpoint` — criar ou alterar qualquer rota da API
> - `alterar-modelo` — mudanças no schema Prisma (modelo, campo, relação, migration)
> - `criar-componente` — criar ou revisar qualquer componente de UI
> - `refatorar-design-system` — auditar e refatorar componentes/páginas para o padrão do design system
> - `storybook` — configurar o Storybook e escrever stories para os primitivos
> - `consumir-api` — buscar/enviar dados para a API (serverFetch, proxy, contrato de erro)

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

# Front-end (`frontend/`)

## Stack (não trocar sem pedir)

| Camada | Tecnologia |
|---|---|
| Framework | **Next.js 14** (App Router) |
| Linguagem | **TypeScript** strict — sem `any` |
| Estilo | **Tailwind CSS v3** + design system em `frontend/src/app/globals.css` |
| Ícones | **@phosphor-icons/react** (Phosphor) |
| Estado | **Zustand** |
| PDF | `pdfjs-dist` (render) · `pdf-lib` (geração) · `tesseract.js` (OCR) |

## Regra de ouro do visual

**Todo componente é feito com Tailwind + TypeScript. Sem exceções.**

1. **Use as classes do design system (`.ui-*`) antes de qualquer coisa.** Elas
   estão em `frontend/src/app/globals.css` dentro de `@layer components`. Botão é
   `.ui-btn`, badge é `.ui-badge`, input é `.ui-input`, etc. Veja o catálogo
   completo na skill `criar-componente`.
2. **Cores só vêm dos tokens.** Use `bg-brand`, `text-brand`, `bg-brand-light`,
   `shadow-brand` e a escala `slate-*` para neutros. **Nunca** invente um hex
   novo nem use `style={{ color: '#...' }}` para cor de marca.
3. **Uma cor primária (indigo `brand`) por tela.** As cores de acento por seção
   são semânticas e só aparecem na sua seção:
   - Matérias → `indigo` · Alunos → `violet` · Aulas → `blue` · Exercícios → `emerald`
4. **Números, nomes de arquivo, contadores e scores** seguem o tom mono/tabular
   já usado no projeto — não estilize números soltos com cores decorativas.
5. **Nada de `style={{}}`** exceto valores de runtime genuínos (posição de campo
   sobre o canvas do PDF, dimensões calculadas). Cor, espaçamento e tipografia
   sempre via classe Tailwind.

## Como escrever um componente

- Um componente = uma responsabilidade. Passou de ~80 linhas? Extraia partes.
- Props tipadas com `interface Props { ... }` no topo. **Sem `React.FC`** —
  escreva `export function Nome(props: Props)`.
- **Named export** para componentes reutilizáveis; **default export só em
  páginas** (`frontend/src/app/**`).
- Reexporte primitivos novos em `frontend/src/components/ui/index.ts`.
- Combine classes com o helper **`cn()`** de `frontend/src/lib/cn.ts` — nunca
  monte strings gigantes com ternários aninhados.
- `"use client"` só quando o componente usa estado, efeito ou evento. Server
  Component é o padrão no App Router.
- Antes de criar: **confira se o componente já existe** em
  `frontend/src/components/ui/`.

```tsx
import { cn } from "@/lib/cn";

interface StatProps {
  label: string;
  value: string;
  active?: boolean;
}

export function Stat({ label, value, active = false }: StatProps) {
  return (
    <div className={cn("card-base", active && "border-brand bg-brand-light")}>
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-lg font-bold text-slate-900">{value}</span>
    </div>
  );
}
```

## TypeScript

- **Sem `any`.** Use `unknown` + type guard quando o tipo for incerto.
- `interface` para contratos de componente; `type` para shapes de dados simples.
- `readonly` em arrays/objetos que não mudam.
- `const` sobre `let`; nunca `var`.
- Estenda os atributos nativos quando fizer sentido:
  `interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>`.

## Tailwind

- Ordem das classes: **layout → tamanho → espaçamento → visual → interação → responsivo**.
- Espaçamento entre irmãos: `flex`/`grid` + `gap-*`, não margens soltas.
- Animações: use `.animate-fadeUp` / `.animate-slideIn` (já existem). O estado
  final visível é a base; nada de loops infinitos em conteúdo.

## Zustand

- Uma store por domínio (`frontend/src/store.ts` = editor de PDF;
  `frontend/src/store/authStore.ts` = auth).
- Estado mínimo — não duplique o que dá pra derivar. Actions dentro do `create()`.
- Sem mutação direta: use spread/immer.

## Estrutura de arquivos (front-end)

```
frontend/src/
  app/                  # páginas e layouts (App Router) — default export
  components/
    ui/                 # primitivos genéricos (Button, Badge, Header…) + index.ts
    editor/             # domínio do editor de PDF
    upload/             # fluxo de upload
    auth/               # telas de login/registro
  hooks/                # custom hooks reutilizáveis
  lib/                  # utilitários puros (cn, api, auth, coordinates…)
  store.ts / store/     # Zustand
  types.ts              # tipos compartilhados
```

## Não fazer (front-end)

- `console.log` em código commitado.
- `key={index}` em listas que reordenam.
- Componente novo do zero quando já existe um `.ui-*` ou um primitivo em `ui/`.
- Hex de cor inventado / `style` para cor / gradiente decorativo.
- Refatorar além do escopo pedido.

## Antes de entregar (front-end)

1. Reaproveitou as classes `.ui-*` e os tokens `brand`/`slate`?
2. `npx tsc --noEmit` (dentro de `frontend/`) passa (sem `any`, sem erro de tipo)?
3. Componente reexportado em `index.ts` se for primitivo?
4. Sem `console.log`, sem `style` de cor, sem hex solto?
