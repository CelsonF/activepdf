# Referência do Design System — ActivePDF

Fonte da verdade: `src/app/globals.css` (`@layer components`) e
`tailwind.config.js`. Este arquivo é o resumo consultável para criar componentes.

---

## Tokens de cor (Tailwind)

| Classe Tailwind | Valor | Uso |
|---|---|---|
| `bg-brand` `text-brand` `border-brand` | `#4f46e5` (indigo-600) | Primária: botões, links ativos, campos de PDF |
| `bg-brand-dark` | `#4338ca` | Hover do botão primário |
| `bg-brand-light` `border-brand-light` | `#eef2ff` | Fundo de badge/card ativo, highlight |
| `text-slate-900` | `#0f172a` | Títulos |
| `text-slate-600` / `text-slate-500` | — | Parágrafos / labels |
| `text-slate-400` | `#94a3b8` | Placeholder, texto muted |
| `bg-slate-50` | `#f8fafc` | Fundo de página |
| `border-slate-200` | `#e2e8f0` | Borda padrão de cards/inputs |

**Sombras** (do `tailwind.config.js`): `shadow-xs`, `shadow-card`,
`shadow-brand`, `shadow-brand-lg`, `shadow-brand-hover`, `shadow-success`.

**Background especial:** `bg-upload-gradient` (gradiente sutil da tela de upload — o único gradiente sancionado).

### Acentos por seção (semânticos — só na própria seção)

| Seção | Fundo | Texto |
|---|---|---|
| Matérias | `bg-indigo-50` | `text-indigo-600` |
| Alunos | `bg-violet-50` | `text-violet-600` |
| Aulas | `bg-blue-50` | `text-blue-600` |
| Exercícios | `bg-emerald-50` | `text-emerald-600` |

> Regra: **uma cor primária (brand) por tela.** Os acentos acima não são
> decorativos — só aparecem para identificar a seção correspondente.

---

## Classes de componente (`.ui-*`) — use estas, não recrie

### Botões
```
.ui-btn                         base (todo botão herda)
.ui-btn-xs / -sm / -md / -lg    tamanhos
.ui-btn-primary                 indigo sólido, texto branco  ← 1 por tela
.ui-btn-secondary               branco + borda slate
.ui-btn-ghost                   transparente + borda slate
.ui-btn-outline                 borda indigo, fundo transparente
.ui-btn-danger                  vermelho suave
.ui-btn-success                 emerald sólido
.ui-btn-mode                    toggle (Editar / Preencher) — usa data-active
.ui-btn-page-nav                navegação de página do PDF
.ui-export-btn                  seletor de modo de exportação — usa data-active
```
Uso: `className="ui-btn ui-btn-primary ui-btn-md"`. Em React, prefira o
componente `<Button variant="primary" size="md">` de `src/components/ui/`.

### Badges
```
.ui-badge            base
.ui-badge-sm / -md   tamanhos
.ui-badge-brand      indigo (ex: "Aguardando exercício")
.ui-badge-success    emerald (Concluído)
.ui-badge-warning    amber (Em andamento)
.ui-badge-error      vermelho
.ui-badge-neutral    slate (tags neutras, vocabulário)
```
Uso: `className="ui-badge ui-badge-sm ui-badge-success"` ou `<Badge variant="success" />`.

### Inputs
```
.ui-input            input / select / textarea (borda slate, focus ring indigo)
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
| **Header** (todas as páginas) | `h-[52px] bg-white border-b border-slate-200 shadow-[0_1px_0_rgba(0,0,0,0.04)]` |
| **Card de navegação** (dashboard) | `p-4 bg-white rounded-2xl border border-slate-200` + hover `border-brand` |
| **Card de formulário** | `p-5 bg-white rounded-2xl border border-slate-200 flex flex-col gap-3.5` |
| **Container de CRUD** | `max-w-lg mx-auto px-4 py-8 animate-fadeUp` |
| **Label de form** | `text-xs font-semibold text-slate-700` |
| **Erro inline** | `px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700` |
| **Modal** | `fixed inset-0 z-50` + backdrop blur; conteúdo em card branco `rounded-2xl` |
| **Ícone de seção** | `w-9 h-9 rounded-lg` + fundo/texto do acento da seção |

---

## Ícones (Phosphor)

```tsx
import { Upload, MagnifyingGlass, Trash, CheckCircle, FilePdf } from "@phosphor-icons/react";
```
- Tamanho 14–18px em linha/botão; 24–30px em destaque; ~58px em empty state.
- `weight="bold"` para o logo/realces; padrão `regular` no resto.
- Cor herda de `currentColor` — controle pela classe de texto do container.
- Logo da marca: ícone `FilePdf` em `bg-brand w-7 h-7 rounded-lg` + texto
  "ActivePDF" `font-extrabold text-[15px] tracking-[-0.3px]`.

---

## Tipos compartilhados

`src/types.ts` tem os contratos do domínio (ex.: `PdfField`). Importe de lá em
vez de redeclarar. Tipos só de um componente ficam no próprio arquivo.
