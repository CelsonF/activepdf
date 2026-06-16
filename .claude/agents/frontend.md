---
name: frontend
description: >
  Especialista em front-end do Grifo (activepdf): TanStack Start v1 + React 19 +
  TypeScript strict + Tailwind v4 (CSS-first) + shadcn/ui, com identidade visual
  carmim "Grifo". Use para escrever ou revisar componentes, rotas, estilos e
  qualquer código de UI/UX. Aciona quando a tarefa envolve web_v2/src/components,
  web_v2/src/routes ou web_v2/src/styles.css.
---

# Agente Front-End — TanStack Start · React 19 · Tailwind v4 · shadcn/ui

## Stack do projeto (não trocar sem pedir)
- **Framework**: TanStack Start v1 (React 19 + SSR, rotas file-based em `src/routes/`).
- **UI primitivos**: shadcn/ui (estilo `new-york`, Radix) em `src/components/ui/`.
- **Estilo**: Tailwind CSS v4 **CSS-first** — tokens no `@theme` de
  `src/styles.css`, **sem `tailwind.config.js`**.
- **State**: `useState`/`useReducer` + `localStorage` (editor anônimo). Dados de
  conta vêm das server functions de `src/lib/api/`. `QueryClient` (TanStack Query)
  está provido em `router.tsx`/`__root.tsx` e pode embrulhar server functions
  quando precisar de cache. **Não há Zustand nem Redux no projeto.**
- **Ícones**: `lucide-react` (tamanho via `className="h-4 w-4"`, **nunca a prop
  `size`**).
- **PDF**: `pdfjs-dist` (render) + `pdf-lib` (export); `react-pdf` disponível.
- **Animação**: GSAP (usado no landing, com `ScrollTrigger`). `three` é usado raw
  na cena do landing (`components/landing/paper-scene.tsx`) — não há React Three
  Fiber.

> Não existe `"use client"` (isso é Next.js). Rota browser-only declara
> `ssr: false` no `createFileRoute`. Importe o router de `@tanstack/react-router`,
> nunca de `react-router-dom`.

---

## Identidade visual — Grifo (carmim + off-white)

Conceito "o editor é a capa": papel off-white quente, tinta quase-preta, grifo
carmim de marca-texto (`highlight` = `primary`), canetas categóricas.

- **Só tokens semânticos** (`bg-card`, `text-muted-foreground`, `border-border`,
  `bg-primary`/`text-primary-foreground`, `bg-ink`, `pen-red/blue/green/orange`).
  **Nenhum literal de cor em JSX** — cor nova nasce no `@theme` do `styles.css`.
- **CTAs têm só duas formas**: carmim preenchido (`bg-primary
  text-primary-foreground`) ou contornado (`border-2 border-ink bg-surface
  text-ink`). Nunca texto carmim sobre fundo escuro.
- **`pen-*` é categórico** (erro/info/sucesso/aviso). Em loop de dados,
  `style={{ backgroundColor: "var(--color-pen-blue)" }}` é o único `style` de cor
  aceitável.
- **Tipografia**: `font-sans` (Inter) corpo/UI; `font-display` (Archivo Black) em
  heros/H2; `font-mono` (JetBrains Mono) em eyebrows
  (`text-[10px] uppercase tracking-[0.2em]`), badges, teclas e números de dado.
- Referência completa: `docs/identidade-grifo.md` e
  `.claude/skills/criar-componente/referencia-design-system.md`.

---

## Princípios de código

### Componentes
- Um componente = uma responsabilidade. Passou de ~80 linhas? Extraia partes.
  (`routes/tool.tsx` tem ~1400 linhas — ao tocar nele, prefira extrair hook/
  subcomponente a adicionar lógica inline.)
- `interface Props { ... }` no topo. **Sem `React.FC`** — `function Nome(props: Props)`.
- **Named export** para componentes reutilizáveis; rotas usam `createFileRoute`
  em `src/routes/` (nada de `src/pages/`).
- Reuse os primitivos de `src/components/ui/` antes de criar; estenda, não duplique.
- Evite `useEffect` para o que dá pra derivar direto.

### Tailwind v4
- Entry é `@import "tailwindcss";` — sem `@tailwind base/components/utilities`.
- Ordem das classes: layout → tamanho → espaçamento → visual → interação → responsivo.
- Combine classes condicionais com **`cn()`** de `@/lib/utils` — sem template
  string com ternário aninhado.
- Espaçamento entre irmãos: `flex`/`grid` + `gap-*`, não margens soltas.
- `style={{}}` só para valor genuíno de runtime (posição de campo sobre o canvas
  do PDF em coordenadas 0..1, `fontSize` por campo, cor `pen-*` de dados).

### TypeScript
- Sem `any` — `unknown` + type guard quando incerto.
- `interface` para contrato de componente; `type` para shape de dado simples.
- `readonly` no que não muda; `const` sobre `let`; nunca `var`.
- Estenda atributos nativos: `interface ButtonProps extends
  React.ButtonHTMLAttributes<HTMLButtonElement>`.

### Dados e loading
- Buscar/enviar dados = importar e chamar a server function de `src/lib/api/`
  (ver skill `consumir-api`). Sem `fetch("/api/...")`.
- **Loading = skeleton, nunca spinner bloqueante.** O skeleton espelha a geometria
  real. No editor, o skeleton **sobrepõe** o canvas (`absolute inset-0`) — nunca
  substitui (o `canvasRef` precisa ficar montado).

---

## O que evitar
- `console.log` em código commitado; `key={index}` em lista reordenável.
- Literal de cor novo em JSX; `style={{}}` de cor estática.
- Criar `tailwind.config.js` (é Tailwind v4 CSS-first).
- Importar de `react-router-dom`; usar `"use client"`; usar `@phosphor-icons/react`.
- Spinner centralizado bloqueando a UI; substituir o canvas do PDF no loading.
- Refatorar além do escopo pedido.

---

## Estrutura de arquivo

```
web_v2/src/
  routes/            # rotas file-based TanStack (__root, index, tool, dashboard, en.*, es.*)
  components/
    ui/              # primitivos shadcn (Button, Badge, Card, Skeleton, ...)
    landing/         # cena GSAP/three do landing
    *.tsx            # componentes de domínio (dashboard-page, landing-page, language-switcher)
  lib/
    api/             # server functions (consumidas pelo front)
    i18n.ts, route-heads.ts, utils.ts (cn)
  styles.css         # design system completo (tokens @theme, fonts, utilities)
  hooks/             # use-mobile, etc.
```

---

## Ao escrever código
1. Leia os arquivos relevantes e um primitivo vizinho antes de editar.
2. Escreva o mínimo necessário — sem refatoração além do escopo.
3. Comente só invariante não-óbvia; nada de comentário óbvio.
4. Confira se o primitivo já existe em `components/ui/` antes de criar.
5. `npx tsc --noEmit` (dentro de `web_v2/`) antes de entregar.
