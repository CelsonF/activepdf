# Referência do Design System — Grifo (carmim + off-white)

Fonte da verdade: `web_v2/src/styles.css` (tokens `@theme` + variáveis oklch em
`:root`). Conceito e voz: `docs/identidade-grifo.md`. Referência completa de
tokens, tipografia e blueprints: `docs/design-system-grifo.md`. Este arquivo é o
resumo consultável para criar componentes.

> **Tailwind v4, CSS-first.** Não existe `tailwind.config.js`. Os tokens são CSS
> custom properties no `@theme` de `styles.css`; cada `--color-<nome>` vira as
> utilities `bg-<nome>`, `text-<nome>`, `border-<nome>`. Cor nova = adicionar a
> variável em `:root` e registrá-la no `@theme inline` **antes** de usar em JSX.

---

## Tokens de cor (semânticos — use estes, nunca um hex)

Todas as cores são **oklch**. Identidade: papel off-white quente, tinta
quase-preta, grifo carmim (`highlight` = `primary`, mesma cor), canetas
categóricas.

| Token / classe | oklch (`:root`) | Uso |
|---|---|---|
| `bg-background` | `0.98 0.006 75` (off-white quente) | Fundo de página |
| `bg-surface` / `bg-card` | `1 0 0` (branco) | Superfícies, cartões |
| `text-foreground` / `text-ink` / `bg-ink` | `0.2 0.012 55` (preto quente) | Texto principal, borda de tinta |
| `bg-primary` / `text-primary-foreground` | `0.47 0.18 21` / `0.98 0.006 75` | **Carmim da marca** + creme: CTA primário, item ativo |
| `bg-highlight` / `text-highlight` | mesmo carmim / creme | Grifo de marca-texto, destaque (= primary) |
| `bg-secondary` / `bg-muted` | `0.96 0.008 60` | Neutros de apoio |
| `text-muted-foreground` | `0.46 0.02 40` | Texto secundário, eyebrow, placeholder |
| `bg-accent` | `0.95 0.025 25` (carmim levíssimo) | Bandas/realces sutis de seção |
| `border-border` / `border-input` | `0.9 0.008 60` | Bordas de card/input (pauta) |
| `ring-ring` | carmim `0.47 0.18 21` | Focus ring |
| `bg-destructive` / `text-destructive-foreground` | `0.55 0.22 25` / creme | Ação destrutiva |

### Canetas categóricas (`pen-*`) — significado fixo, não decoração

| Classe | oklch | Significado |
|---|---|---|
| `pen-red` | `0.55 0.2 25` | Erro, alerta, tag "caneta vermelha" |
| `pen-blue` | `0.52 0.16 245` | Info / matéria exata |
| `pen-green` | `0.6 0.15 150` | Sucesso, grátis, recomendado |
| `pen-orange` | `0.7 0.16 55` | Destaque, aviso |

Em **loop de dados** (a cor vem do dado), use
`style={{ backgroundColor: "var(--color-pen-blue)" }}` — único `style` de cor
aceitável. Fora disso, prefira a classe utilitária.

### Regras inegociáveis de cor

1. **CTAs têm só duas formas**: carmim preenchido
   (`bg-primary text-primary-foreground`) ou contornado
   (`border-2 border-ink bg-surface text-ink`). Nunca texto carmim sobre escuro.
2. **`pen-*` é categórico** — cada caneta tem um papel fixo (erro/info/sucesso/aviso).
3. **Nenhum literal de cor em JSX** (`#...`, `rgb(...)`, `bg-[#...]`) — token novo
   nasce no `@theme` do `styles.css`.
4. O carmim `highlight` é a assinatura: marca o wordmark e pinta UMA palavra-chave
   por hero (`.text-highlight-mark`). Usado com parcimônia; o fundo é off-white.

---

## Tipografia

| Classe | Fonte | Uso |
|---|---|---|
| `font-sans` (padrão) | Inter | UI e corpo |
| `font-display` | Archivo Black | Heros e H2 de seção (tracking -0.03em, line-height 0.95) |
| `font-mono` | JetBrains Mono | Eyebrows em caps, badges, teclas, contadores, nomes de arquivo |

Eyebrow padrão: `font-mono text-[10px] uppercase tracking-[0.2em]`. Números de
dados (contagens, notas) sempre em `font-mono`.

---

## Primitivos shadcn (`web_v2/src/components/ui/`) — use estes, não recrie

Catálogo `new-york` completo (Radix por baixo). Os mais usados:

| Componente | Import | Notas |
|---|---|---|
| `Button` | `@/components/ui/button` | `cva`: `variant` = `default`(carmim)/`outline`/`secondary`/`ghost`/`link`/`destructive`; `size` = `default`/`sm`/`lg`/`icon`. Suporta `asChild` (para `<Link>`). |
| `Badge` | `@/components/ui/badge` | `variant` = `default`/`secondary`/`destructive`/`outline`. |
| `Card` | `@/components/ui/card` | `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`. |
| `Input` / `Textarea` / `Label` | `@/components/ui/input` … | Inputs com `border-input` + focus ring. |
| `Skeleton` | `@/components/ui/skeleton` | `animate-pulse rounded-md bg-primary/10` — loading. |
| `Dialog` / `Sheet` / `Drawer` | idem | Overlays Radix. |
| `Select` / `Tabs` / `Tooltip` / `DropdownMenu` | idem | Primitivos Radix prontos. |

Padrão de todo primitivo (siga ao criar um novo): `forwardRef`, variantes via
`cva`, classes via `cn()`, `export { Componente, componenteVariants }`.

```tsx
// CTA primário (carmim filled) usando o Button + Link
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

<Button asChild>
  <Link to="/tool">Enviar um PDF</Link>
</Button>

// CTA contornado (ink-bordered) via variant outline + override
<Button variant="outline" className="border-2 border-ink bg-surface text-ink">
  Ver exemplo
</Button>
```

---

## Assinatura visual (utilities de `styles.css`)

- `.text-highlight-mark` — grifo de marca-texto: palavra creme sobre carmim
  (`color` + `background` + `box-shadow` simétrico). Uso raro: wordmark, 1
  palavra-chave do hero, gamificação.
- `.font-display` / `.font-mono` — definidas em `@layer base`.
- Cantos pesados (`rounded-xl`/`rounded-2xl`), borda de tinta (`border-2
  border-ink`), chip de caneta (ícone claro sobre bloco `pen-*` arredondado).

### Logo / wordmark

Bloco `bg-primary` arredondado com `<Highlighter />` (lucide) em
`text-primary-foreground`, ao lado do wordmark "Grifo" com marca-texto carmim
(`.text-highlight-mark`). Veja `dashboard-page.tsx` (`Logo`) e
`docs/design-system-grifo.md` §5 — não monte logo à mão.

---

## Ícones (lucide-react)

```tsx
import { Upload, Search, Trash2, CheckCircle, Highlighter } from "lucide-react";
```

- **Tamanho via `className="h-4 w-4"` — nunca a prop `size`.**
- Cor herda de `currentColor` (controlada pela classe de texto do container).
- `h-4 w-4` em linha/botão; `h-5 w-5`+ em destaque.

---

## Tipos compartilhados

Tipos de domínio do editor (ex.: `Field`, `FieldType`) vivem junto do código que
os usa (`web_v2/src/routes/tool.tsx`). Tipos de retorno de server function podem ser
derivados com `Awaited<ReturnType<typeof minhaServerFn>>` em vez de redeclarar.
