---
name: refatorar-design-system
description: >
  Passo a passo para auditar e refatorar qualquer componente ou rota existente do
  Grifo (activepdf) para ficar 100% alinhado ao design system carmim: tokens
  semânticos do styles.css (primary/ink/pen-*), primitivos shadcn de
  components/ui, Tailwind v4 (sem tailwind.config.js), TypeScript strict e cn().
  Use quando a tarefa for limpar código legado, remover hex/var de cor solto,
  trocar style={{}} de cor por token, ou padronizar um componente fora das
  convenções.
---

# Refatorar Design System — Grifo (TanStack Start + shadcn + Tailwind v4)

Use este fluxo para trazer um componente/rota existente ao padrão. Objetivo:
**zero regressão visual + máxima reutilização** dos primitivos em
`web_v2/src/components/ui/` e dos tokens de `web_v2/src/styles.css`.

> **Tailwind v4, CSS-first.** Não há `tailwind.config.js` — qualquer instrução que
> assuma esse arquivo está errada. Tokens vivem no `@theme` de `styles.css`.

---

## 1. Auditoria — o que procurar

Rode os greps abaixo no arquivo alvo antes de editar:

```bash
# Literal de cor em JSX (hex, rgb, hsl) e arbitrary com cor
grep -nE "#[0-9a-fA-F]{3,6}|rgb\(|hsl\(|\[#|bg-\[|text-\[" <arquivo>

# style={{}} de cor estática (cor de runtime via var() em loop é OK; cor fixa não)
grep -n "style=.*color\|style=.*[bB]ackground" <arquivo>

# className com template/ternário aninhado (candidato a cn())
grep -n "className={\`\|className={.*?.*:.*}" <arquivo>

# <button>/<input> cru que deveria ser primitivo shadcn
grep -n "<button\|<input\|<select\|<textarea" <arquivo>

# Ícone lucide com prop size (proibido — usar className h-4 w-4)
grep -n "size={" <arquivo>

# Resíduos da arquitetura antiga
grep -nE "ui-btn|ui-badge|ui-input|ui-menu|ui-field|@phosphor|react-router-dom|use client|tailwind\.config" <arquivo>

# TypeScript / higiene
grep -n ": any\|React\.FC\|console\.log\|key={index\|key={i}" <arquivo>
```

Anote cada violação antes de começar.

---

## 2. Ordem de refatoração (não pule etapas)

### 2.1 Cores → tokens semânticos

| Antes | Depois |
|---|---|
| `style={{ color: '#16181D' }}` / `text-[#16181D]` | `className="text-ink"` (ou `text-foreground`) |
| `bg-[#FDEDEB]` / `style={{ background: '#...' }}` | `bg-accent` / `bg-destructive/10` (token equivalente) |
| `text-white` literal | `text-primary-foreground` (creme) ou `text-card` conforme contexto |
| `bg-[var(--color-pen-red)]` (classe arbitrária) | `bg-pen-red` (a utility do token existe) |
| `bg-brand` / `bg-pen` / `text-slate-500` (tokens antigos) | `bg-primary` / `text-muted-foreground` (ver `referencia-design-system.md`) |
| Hex fora da paleta | **Discuta antes** — pode justificar um token novo no `@theme` |

> `var(--color-pen-*)` em `style={{}}` **permanece** quando a cor vem de **dados em
> loop** (ex.: cor de categoria de um card). Só troque cor *estática*.

### 2.2 Elementos crus → primitivos shadcn

```tsx
// ❌ antes
<button className="px-4 py-2 bg-primary text-white rounded-lg ...">Salvar</button>

// ✅ depois
import { Button } from "@/components/ui/button";
<Button>Salvar</Button>
```

| Elemento | Substituto |
|---|---|
| `<button>` customizado | `<Button variant size>` de `@/components/ui/button` |
| `<span className="badge...">` | `<Badge variant>` de `@/components/ui/badge` |
| `<input>`/`<textarea>` cru | `<Input>` / `<Textarea>` de `@/components/ui/` |
| Spinner/loading manual | `<Skeleton>` com geometria real (nunca spinner bloqueante) |
| CTA "fora de forma" | uma das duas formas: carmim filled ou `border-2 border-ink bg-surface text-ink` |

### 2.3 Ícones lucide

```tsx
// ❌ <Search size={18} />
// ✅ <Search className="h-4 w-4" />
```

### 2.4 className → cn()

```tsx
import { cn } from "@/lib/utils";
className={cn(
  "rounded-2xl border border-border bg-card p-4",
  active && "border-2 border-ink bg-accent",
  disabled && "opacity-50",
)}
```

### 2.5 TypeScript

- `any` → tipo concreto ou `unknown` + type guard.
- Embrulha elemento nativo? Estenda: `interface Props extends
  React.ButtonHTMLAttributes<HTMLButtonElement>`.
- Remova `React.FC` → `function Nome(props: Props)`. Exponha `className?: string`
  em primitivos e mescle com `cn()`.

### 2.6 Resíduos de stack antiga

- `import { X } from "@phosphor-icons/react"` → `lucide-react`.
- `import ... from "react-router-dom"` → `@tanstack/react-router`.
- `"use client"` no topo → **remover** (é Next.js; aqui rota browser-only usa
  `ssr: false` no `createFileRoute`).
- `.ui-btn`/`.ui-badge`/`.ui-input`/`.ui-menu-item` etc. → primitivo shadcn + token.

---

## 3. O que NÃO mudar

- Lógica de negócio, chamadas de server function, estado (`useState`/localStorage)
  — refatoração de estilo não toca nisso. (Não há Zustand no projeto.)
- `style={{}}` legítimo: posição de campo sobre o canvas do PDF (coordenadas 0..1),
  `fontSize` por campo, cor `pen-*` vinda de dados — **esses ficam**.
- Animações funcionando (GSAP no landing) — não mexa fora do escopo.
- Não extraia sub-componentes além do que o escopo pede.

---

## 4. Sequência para uma tela inteira

1. Rode os greps da §1 em todos os arquivos da tela.
2. Liste violação dura (literal de cor, `style` de cor, `any`, prop `size`,
   resíduo antigo) vs. estilo só subótimo.
3. Refatore arquivo a arquivo, primitivo antes de quem o consome.
4. Após cada arquivo: `npx tsc --noEmit` (dentro de `web_v2/`).
5. Checklist final (§5).

---

## 5. Checklist de entrega

- [ ] Zero literal de cor em JSX (`#...`, `rgb`, `bg-[#...]`); `bg-[var(...)]` só
      sobrou como `style` em loop de dados.
- [ ] Zero `style={{ color/background }}` com cor estática.
- [ ] Botões/badges/inputs usando primitivos de `components/ui/`.
- [ ] CTAs numa das duas formas oficiais; eyebrows em `font-mono` uppercase.
- [ ] Ícone lucide com `className="h-4 w-4"` (sem prop `size`).
- [ ] `cn()` em todo `className` condicional.
- [ ] `any` eliminado; `React.FC` removido; sem `console.log`.
- [ ] `key={index}` trocado por id estável em lista reordenável.
- [ ] Nenhum resíduo: `.ui-*`, `@phosphor`, `react-router-dom`, `"use client"`,
      `tailwind.config.js`.
- [ ] `npx tsc --noEmit` (em `web_v2/`) passa; sem regressão visual.

---

> Referência de tokens e primitivos: `referencia-design-system.md` (skill
> `criar-componente`). Conceito: `docs/identidade-grifo.md`.
