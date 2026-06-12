# Referência do Design System v2 — Grifo (Folha & Caneta)

Fonte da verdade: `frontend/src/app/globals.css` (`@layer components` + CSS vars)
e `frontend/tailwind.config.js`. Identidade completa: `docs/identidade-grifo.md`.
Este arquivo é o resumo consultável para criar componentes.

---

## Tokens de cor (Tailwind)

| Classe Tailwind | Valor | Uso |
|---|---|---|
| `bg-pen` `text-pen` `border-pen` | `#0B5FFF` | **Ação primária** (caneta azul): botões, links ativos, lacunas do PDF |
| `bg-pen-dark` | `#0A4ED6` | Hover do botão primário |
| `bg-pen-light` `border-pen-light` | `#EBF1FF` | Fundo de item ativo/selecionado |
| `text-ink` | `#16181D` | Títulos e texto principal (tinta) |
| `text-ink-soft` | `#4A4F57` | Parágrafos / labels |
| `text-ink-muted` | `#8B9097` | Placeholder, texto muted |
| `bg-paper` | `#F7F7F5` | Fundo de página (papel) |
| `border-line` / `border-line-strong` | `#E5E5E1` / `#D2D2CC` | Bordas de cards/inputs (pauta) |
| `bg-correction` `text-correction` | `#DE2B1F` | **SÓ correção e erro** — caneta vermelha do professor |
| `bg-correction-light` | `#FDEDEB` | Fundo de erro/destrutivo suave |
| `bg-marker` | `#FFD64D` | **SÓ gamificação e marca** — marca-texto |
| `bg-marker-light` | `#FFF6D6` | Fundo suave de XP/streak |

`brand` (DEFAULT/dark/light) é **alias legado** de `pen` — não usar em código
novo; a varredura da Sprint 6 remove. Escala `slate-*` é legada: prefira
`ink`/`line`/`paper` em código novo.

**Sombras**: `shadow-xs`, `shadow-card`, `shadow-pen`, `shadow-pen-hover`
(aliases legados: `shadow-brand*`), `shadow-success`.

**Background especial**: `bg-upload-gradient` (pen-light → paper → marker-light;
o único gradiente sancionado).

### Semântica de sala de aula (não negociar)

- `pen` = quem faz (uma cor de ação por tela).
- `correction` = quem corrige; **nunca decora**.
- `marker` = a marca grifando; só wordmark, herói do marketing e XP/conquistas.

---

## Tipografia

| Classe | Fonte | Uso |
|---|---|---|
| `font-sans` (padrão) | Instrument Sans | UI e corpo |
| `font-display` | Bricolage Grotesque | Títulos, números de destaque, wordmark |
| `font-mono` | Spline Sans Mono | XP, scores, contadores, nomes de arquivo |

Números de dados sempre em `font-mono` (tabular por natureza).

---

## Classes de componente (`.ui-*`) — use estas, não recrie

### Assinatura da marca
```
.ui-marker           grifo de marca-texto atrás do texto (amarelo)
                     USO RARO: wordmark, 1 palavra-chave no herói, gamificação
```

### Botões
```
.ui-btn                         base (todo botão herda)
.ui-btn-xs / -sm / -md / -lg    tamanhos
.ui-btn-primary                 pen sólido, texto branco  ← 1 por tela
.ui-btn-secondary               branco + borda line
.ui-btn-ghost                   transparente + borda line
.ui-btn-outline                 borda pen, fundo transparente
.ui-btn-danger                  correction suave (hover vira sólido)
.ui-btn-success                 emerald sólido
.ui-btn-mode                    toggle (Editar / Preencher) — usa data-active
.ui-btn-page-nav                navegação de página do PDF
.ui-export-btn                  seletor de modo de exportação — usa data-active
```
Uso: `className="ui-btn ui-btn-primary ui-btn-md"`. Em React, prefira o
componente `<Button variant="primary" size="md">` de `frontend/src/components/ui/`.

### Badges v2 — carimbos de status
Caixa alta + tracking + canto `4px`: lê-se como carimbo, não pílula.
```
.ui-badge            base
.ui-badge-sm / -md   tamanhos
.ui-badge-brand      pen (ex: "Aguardando exercício")
.ui-badge-success    emerald (Concluído)
.ui-badge-warning    marker-light/amber (Em andamento)
.ui-badge-error      correction (erro, corrigido com ressalvas)
.ui-badge-neutral    ink/line (tags neutras, vocabulário)
```

### Inputs
```
.ui-input            input / select / textarea (borda line, focus ring pen)
```

### Itens de lista / navegação
```
.ui-field-item       item de campo no painel do editor (usa data-selected)
.ui-menu-item        item de menu lateral/aside (usa data-active, data-danger)
```

### Divisores e loaders
```
.ui-divider          divisor vertical (22px) — usado no header
.ui-divider-h        divisor horizontal
.ui-spinner          spinner CSS puro (passe width/height/borderWidth via style)
```

### Estados via atributo (não via classe extra)
- `data-active="true"` → `.ui-btn-mode`, `.ui-export-btn`, `.ui-menu-item`
- `data-selected="true"` → `.ui-field-item`
- `data-danger="true"` → `.ui-menu-item`
- `:disabled` já tratado nas classes de botão/input.

---

## Padrões de layout reutilizados

| Elemento | Receita Tailwind |
|---|---|
| **Header** (todas as páginas) | `h-[52px] bg-white border-b border-line shadow-[0_1px_0_rgba(0,0,0,0.04)]` |
| **Card de navegação** (dashboard) | `p-4 bg-white rounded-2xl border border-line` + hover `border-pen` |
| **Card de formulário** | `p-5 bg-white rounded-2xl border border-line flex flex-col gap-3.5` |
| **Container de CRUD** | `max-w-lg mx-auto px-4 py-8 animate-fadeUp` |
| **Label de form** | `text-xs font-semibold text-ink-soft` |
| **Erro inline** | `px-3 py-2.5 rounded-lg bg-correction-light border border-correction/25 text-sm text-correction` |
| **Modal** | `fixed inset-0 z-50` + backdrop blur; conteúdo em card branco `rounded-2xl` |
| **Lacuna sobre o PDF** | `.field-marker` (CSS vars `--field-*`, traço pen) |

---

## Ícones (Phosphor)

```tsx
import { Upload, MagnifyingGlass, Trash, CheckCircle, Highlighter } from "@phosphor-icons/react";
```
- Tamanho 14–18px em linha/botão; 24–30px em destaque; ~58px em empty state.
- `weight="bold"` para realces; padrão `regular` no resto.
- Cor herda de `currentColor` — controle pela classe de texto do container.
- **Logo**: componente `<Logo />` (`frontend/src/components/ui/Logo.tsx`) —
  bloco `ink` com `Highlighter` em `marker` + wordmark "Grifo" grifado
  (`.ui-marker`). Não montar logo à mão.

---

## Tipos compartilhados

`frontend/src/types.ts` tem os contratos do domínio (ex.: `PdfField`). Importe
de lá em vez de redeclarar. Tipos só de um componente ficam no próprio arquivo.
