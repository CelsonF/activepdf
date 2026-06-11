# ActivePDF — Regras do Projeto (Front-end)

> Este arquivo é lido automaticamente em toda conversa. São as regras
> **inegociáveis** para escrever código neste repositório.
>
> Skills disponíveis:
> - `criar-componente` — criar ou revisar qualquer componente de UI
> - `refatorar-design-system` — auditar e refatorar componentes/páginas para o padrão do design system
> - `storybook` — configurar o Storybook e escrever stories para os primitivos
> - `consumir-api` — buscar/enviar dados para a API (serverFetch, proxy, contrato de erro)

## Stack (não trocar sem pedir)

| Camada | Tecnologia |
|---|---|
| Framework | **Next.js 14** (App Router) |
| Linguagem | **TypeScript** strict — sem `any` |
| Estilo | **Tailwind CSS v3** + design system em `src/app/globals.css` |
| Ícones | **@phosphor-icons/react** (Phosphor) |
| Estado | **Zustand** |
| PDF | `pdfjs-dist` (render) · `pdf-lib` (geração) · `tesseract.js` (OCR) |

---

## Regra de ouro do visual

**Todo componente é feito com Tailwind + TypeScript. Sem exceções.**

1. **Use as classes do design system (`.ui-*`) antes de qualquer coisa.** Elas
   estão em `src/app/globals.css` dentro de `@layer components`. Botão é
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

---

## Como escrever um componente

- Um componente = uma responsabilidade. Passou de ~80 linhas? Extraia partes.
- Props tipadas com `interface Props { ... }` no topo. **Sem `React.FC`** —
  escreva `export function Nome(props: Props)`.
- **Named export** para componentes reutilizáveis; **default export só em
  páginas** (`src/app/**`).
- Reexporte primitivos novos em `src/components/ui/index.ts`.
- Combine classes com o helper **`cn()`** de `src/lib/cn.ts` — nunca monte
  strings gigantes com ternários aninhados.
- `"use client"` só quando o componente usa estado, efeito ou evento. Server
  Component é o padrão no App Router.
- Antes de criar: **confira se o componente já existe** em `src/components/ui/`.

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

---

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

- Uma store por domínio (`src/store.ts` = editor de PDF; `src/store/authStore.ts` = auth).
- Estado mínimo — não duplique o que dá pra derivar. Actions dentro do `create()`.
- Sem mutação direta: use spread/immer.

---

## Estrutura de arquivos

```
src/
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

## Não fazer

- `console.log` em código commitado.
- `key={index}` em listas que reordenam.
- Componente novo do zero quando já existe um `.ui-*` ou um primitivo em `ui/`.
- Hex de cor inventado / `style` para cor / gradiente decorativo.
- Refatorar além do escopo pedido.

## Antes de entregar

1. Reaproveitou as classes `.ui-*` e os tokens `brand`/`slate`?
2. `npx tsc --noEmit` passa (sem `any`, sem erro de tipo)?
3. Componente reexportado em `index.ts` se for primitivo?
4. Sem `console.log`, sem `style` de cor, sem hex solto?
