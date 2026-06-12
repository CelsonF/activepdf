---
name: criar-componente
description: >
  Passo a passo para criar QUALQUER componente novo de UI no front-end do
  ActivePDF usando Tailwind CSS + TypeScript e o design system do projeto.
  Use sempre que a tarefa for criar, adaptar ou revisar um componente React
  em frontend/src/components ou frontend/src/app — botão, badge, card, input, modal, painel,
  item de lista, tela de dashboard, etc. Garante uso das classes .ui-*, dos
  tokens de cor (brand/slate) e das convenções de TypeScript do projeto.
---

# Criar componente — Tailwind + TypeScript (ActivePDF)

Siga este fluxo toda vez que for criar um componente. O objetivo é que **todo
componente saia consistente com o design system existente**, sem inventar
cores, sem CSS solto e sem reescrever o que já existe.

## 1. Antes de escrever — reaproveite

1. **Já existe?** Procure em `frontend/src/components/ui/` (primitivos: `Button`,
   `Badge`, `Header`, `AsideMenu`, `Divider`…). Se existir, use/estenda; não
   recrie.
2. **Tem classe `.ui-*` pra isso?** Veja `referencia-design-system.md` (nesta
   skill). Botão, badge, input, item de menu, item de campo, divisor e spinner
   já têm classe pronta em `globals.css`. Use a classe — não recrie o estilo.
3. **Precisa de cor?** Só os tokens: `brand`, `brand-dark`, `brand-light`,
   `shadow-brand`, e a escala `slate-*` para neutros. Acentos de seção
   (indigo/violet/blue/emerald) só na seção correspondente. **Nunca um hex novo.**

## 2. Estrutura do arquivo

- Nome do arquivo = nome do componente em PascalCase (`StatCard.tsx`).
- Primitivo reutilizável → `frontend/src/components/ui/` + reexport em `index.ts`.
- Componente de domínio → pasta do domínio (`editor/`, `upload/`, `auth/`).
- Página → `frontend/src/app/.../page.tsx` (**default export**, é a única exceção).

```tsx
"use client"; // só se usar estado/efeito/evento. Senão, deixe como Server Component.
import React from "react";
import { cn } from "@/lib/cn";

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
        "flex flex-col gap-1 p-4 bg-white rounded-2xl border border-slate-200 shadow-card",
        active && "border-brand bg-brand-light",
        className,
      )}
    >
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-lg font-bold text-slate-900">{value}</span>
    </div>
  );
}
```

## 3. Regras de estilo (resumo — detalhes em `referencia-design-system.md`)

- **Classes `.ui-*` primeiro.** Botão = `ui-btn ui-btn-{variante} ui-btn-{tamanho}`.
  Badge = `ui-badge ui-badge-{tamanho} ui-badge-{variante}`. Input = `ui-input`.
- **Combine classes com `cn()`** (`frontend/src/lib/cn.ts`). Nada de ternário aninhado
  dentro do `className`.
- **Estados ativos via `data-*`**, igual ao projeto:
  `data-active="true"`, `data-selected="true"` (as classes `.ui-*` já reagem a eles).
- **Ícones** sempre Phosphor, passados como prop ou inline:
  `import { Upload } from "@phosphor-icons/react"`. Tamanho 14–18px em linha.
- **Espaçamento** com `flex`/`grid` + `gap-*`. Cards: `rounded-2xl border
  border-slate-200`. Inputs/tiles: `rounded-lg`/`rounded-[6px]`.
- **`style={{}}` só** para valor de runtime (posição de campo sobre o PDF,
  dimensão calculada). Nunca para cor.
- **Animação de entrada**: `animate-fadeUp` (telas/cards) ou `animate-slideIn`.

## 4. TypeScript

- `interface Props` no topo. Sem `any` (use `unknown` + type guard).
- Estenda atributos nativos quando o componente embrulha um elemento:
  `interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>`.
- Sempre exponha `className?: string` em primitivos e mescle com `cn()`.

## 5. Checklist final

- [ ] Usou `.ui-*` / tokens `brand`+`slate`; zero hex inventado, zero `style` de cor.
- [ ] `cn()` para classes condicionais.
- [ ] Named export (ou default só se for `page.tsx`); reexportado em `ui/index.ts` se for primitivo.
- [ ] `"use client"` só se realmente precisa.
- [ ] Props tipadas, sem `any`. `npx tsc --noEmit` (dentro de `frontend/`) passa.
- [ ] Sem `console.log`, sem `key={index}` em lista reordenável.

> Quando estiver na dúvida sobre estilo, abra `frontend/src/components/ui/Button.tsx` e
> `Badge.tsx` — eles são o molde do padrão de primitivo deste projeto.
