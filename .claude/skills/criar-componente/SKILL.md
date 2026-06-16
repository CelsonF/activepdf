---
name: criar-componente
description: >
  Passo a passo para criar QUALQUER componente novo de UI no front-end do Grifo
  (activepdf) com TanStack Start + React 19 + Tailwind v4 + shadcn/ui e a
  identidade visual carmim "Grifo". Use sempre que a tarefa for criar, adaptar ou
  revisar um componente React em web_v2/src/components ou web_v2/src/routes —
  botão, badge, card, input, painel, item de lista, tela. Garante uso dos
  primitivos shadcn em components/ui, dos tokens semânticos (bg-card,
  text-muted-foreground, bg-primary, bg-ink, pen-*) e das convenções do projeto.
---

# Criar componente — TanStack Start + shadcn + Tailwind v4 (Grifo)

Siga este fluxo toda vez que criar um componente. O objetivo é que **todo
componente saia consistente com o design system carmim do Grifo**, reusando os
primitivos shadcn que já existem, sem inventar cor e sem CSS solto.

## 1. Antes de escrever — reaproveite

1. **Já existe um primitivo?** `web_v2/src/components/ui/` tem o catálogo shadcn
   completo (estilo `new-york`): `Button`, `Badge`, `Card`, `Input`, `Skeleton`,
   `Dialog`, `Select`, `Tabs`, `Tooltip`, … Se existir, **use/estenda — não
   recrie**. Para um primitivo novo do shadcn, prefira `npx shadcn@latest add <nome>`
   a escrever do zero.
2. **Precisa de cor?** Só **tokens semânticos** do `web_v2/src/styles.css`:
   `bg-background`, `bg-card`, `bg-surface`, `text-foreground`,
   `text-muted-foreground`, `border-border`, `bg-primary`/`text-primary-foreground`
   (carmim), `bg-ink`/`text-ink`, `bg-highlight`/`text-highlight`, e as canetas
   `pen-red`/`pen-blue`/`pen-green`/`pen-orange`. Detalhes em
   `referencia-design-system.md` (nesta skill). **Cor nova nasce no `@theme` do
   `styles.css` antes de aparecer em JSX — nunca um literal de cor.**

## 2. Estrutura do arquivo

- Componente reutilizável de domínio → `web_v2/src/components/` (kebab-case:
  `language-switcher.tsx`, `dashboard-page.tsx`). Primitivo genérico →
  `web_v2/src/components/ui/`.
- **Rota** → `web_v2/src/routes/*.tsx` com `createFileRoute(...)` (é a única coisa
  que não é "named export de componente"). Nada de `src/pages/`.
- **Named export** para componentes reutilizáveis. **Sem `React.FC`** — escreva
  `export function Nome(props: Props)`.

```tsx
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  active?: boolean;
  className?: string;
}

// named export, sem React.FC, props tipadas no topo
export function StatCard({ label, value, active = false, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-2xl border border-border bg-card p-4",
        active && "border-2 border-ink bg-accent",
        className,
      )}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <span className="text-lg font-bold text-foreground">{value}</span>
    </div>
  );
}
```

> Não há `"use client"` (isso é Next.js). No TanStack Start, componentes são
> isomórficos; rotas browser-only declaram `ssr: false` no `createFileRoute`.

## 3. Regras de estilo (resumo — detalhes em `referencia-design-system.md`)

- **Primitivo shadcn primeiro.** Botão = `<Button variant="..." size="...">` de
  `@/components/ui/button` (variantes via `cva`: `default`/`outline`/`secondary`/
  `ghost`/`link`/`destructive`). Badge = `<Badge variant="...">`. Não recrie o
  estilo de um `<button>`/`<input>` cru.
- **CTAs têm só duas formas oficiais** (identidade Grifo): carmim preenchido
  (`bg-primary text-primary-foreground`) ou contornado (`border-2 border-ink
  bg-surface text-ink`). Nunca texto carmim sobre fundo escuro.
- **Combine classes com `cn()`** de `@/lib/utils` (clsx + tailwind-merge). Nada de
  template string com ternário aninhado no `className`.
- **`pen-*` é categórico** (erro/info/sucesso/aviso). Em **loop de dados**, a cor
  vinda do dado vai em `style={{ backgroundColor: "var(--color-pen-blue)" }}` — esse
  é o único `style` de cor aceitável.
- **Ícones**: `lucide-react`, tamanho via `className="h-4 w-4"` — **nunca a prop
  `size`**. `import { Highlighter } from "lucide-react"`.
- **Tipografia**: `font-sans` (Inter) corpo/UI; `font-display` (Archivo Black) em
  heros e H2 de seção; `font-mono` (JetBrains Mono) em eyebrows
  (`text-[10px] uppercase tracking-[0.2em]`), badges, teclas e números de dados.
- **Cantos**: `rounded-xl`/`rounded-2xl` em cards e CTAs. Borda premium:
  `border-2 border-ink`.
- **Micro-interações**: `hover:scale-[1.02]` em CTA, `hover:shadow-lg` em card.
- **Loading = skeleton, nunca spinner** — `<Skeleton>` espelhando a geometria real.
- **Espaçamento entre irmãos**: `flex`/`grid` + `gap-*`, não margens soltas. Ordem
  das classes: layout → tamanho → espaçamento → visual → interação → responsivo.

## 4. TypeScript

- `interface Props` no topo. Sem `any` (use `unknown` + type guard).
- Estenda atributos nativos quando o componente embrulha um elemento:
  `interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>`.
- Sempre exponha `className?: string` em primitivos e mescle com `cn()`.
- `readonly` em arrays/objetos que não mudam; `const` sobre `let`.

## 5. Checklist final

- [ ] Reusou primitivo de `components/ui/` em vez de recriar.
- [ ] Só tokens semânticos/brand/pen-*; **zero literal de cor em JSX**, zero `style`
      de cor estática (só `var(--color-pen-*)` em loop de dados).
- [ ] CTA numa das duas formas oficiais (carmim preenchido ou ink-bordered).
- [ ] Ícone lucide com `className="h-4 w-4"` (sem prop `size`).
- [ ] Eyebrow em `font-mono` uppercase; números de dado em mono.
- [ ] `cn()` para classes condicionais; named export; sem `React.FC`.
- [ ] UI assíncrona com **skeleton** (geometria real), nunca spinner.
- [ ] Props tipadas, sem `any`; `npx tsc --noEmit` (em `web_v2/`) passa.
- [ ] Sem `console.log`, sem `key={index}` em lista reordenável.

> Em dúvida sobre estilo, abra `web_v2/src/components/ui/button.tsx` e `badge.tsx`
> (molde do primitivo shadcn) e `web_v2/src/styles.css` (tokens `@theme`).
