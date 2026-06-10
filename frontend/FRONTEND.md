# ActivePDF — Documentação do Front-end

## O que é o projeto

ActivePDF é uma plataforma SaaS para **professores de inglês** criarem exercícios interativos em PDF e os enviarem para seus alunos preencherem online. O professor faz upload de um PDF, desenha campos de resposta sobre ele, salva como exercício e atribui a um aluno. O aluno acessa, preenche e submete. O professor vê o status de cada exercício em tempo real.

Existem **dois perfis de usuário** com dashboards completamente distintos:
- **Professor** — cria exercícios, gerencia alunos, matérias e aulas
- **Aluno** — recebe exercícios, preenche PDFs, vê próximas aulas e plano de aprendizado

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS + design system próprio (`globals.css`) |
| Ícones | @phosphor-icons/react |
| Estado global | Zustand |
| PDF render | pdfjs-dist |
| PDF geração | pdf-lib |
| OCR | Tesseract.js |
| Auth | JWT via cookie HttpOnly `activepdf_session` |
| Back-end | Hono.js (porta 4000) — chamado via proxy em `/src/app/api/` |

---

## Cor e identidade visual

| Token | Valor | Uso |
|---|---|---|
| `--brand` | `#4f46e5` (indigo-600) | Cor primária, botões, links ativos, campos de PDF |
| `--brand-dark` | `#4338ca` | Hover do botão primário |
| `--brand-light` | `#eef2ff` | Fundo de badges, cards ativos, highlights |
| `--bg-base` | `#f8fafc` (slate-50) | Fundo de todas as páginas |
| `--text-primary` | `#0f172a` | Títulos |
| `--text-secondary` | `#475569` | Parágrafos |
| `--text-muted` | `#94a3b8` | Labels, placeholders |

Cores de acento por seção:
- **Matérias** → indigo (`bg-indigo-50`, `text-indigo-600`)
- **Alunos** → violet (`bg-violet-50`, `text-violet-600`)
- **Aulas** → blue (`bg-blue-50`, `text-blue-600`)
- **Exercícios** → emerald (`bg-emerald-50`, `text-emerald-600`)

---

## Design System (`globals.css`)

Todas as classes de UI são declaradas com `@layer components` usando `@apply` Tailwind. São as únicas classes de componente a usar — não existe um arquivo de componentes separado para estilos base.

### Botões

```
.ui-btn            — base (todos os botões herdam)
.ui-btn-xs/sm/md/lg — tamanhos (padding + font-size + border-radius)

Variantes:
.ui-btn-primary    — indigo sólido, texto branco
.ui-btn-secondary  — branco com borda slate
.ui-btn-ghost      — transparente com borda slate
.ui-btn-danger     — fundo vermelho suave
.ui-btn-outline    — borda indigo, fundo transparente
.ui-btn-success    — emerald sólido
.ui-btn-mode       — toggle de modo (ex: Editar / Preencher no editor)
.ui-btn-page-nav   — navegação de páginas do PDF
.ui-export-btn     — seletor de modo de exportação
```

### Badges

```
.ui-badge          — base
.ui-badge-sm/md    — tamanhos

Variantes:
.ui-badge-brand    — indigo (Aguardando exercício)
.ui-badge-success  — emerald (Concluído)
.ui-badge-warning  — amber (Em andamento)
.ui-badge-error    — vermelho
.ui-badge-neutral  — slate (vocabulário, tags neutras)
```

### Inputs

```
.ui-input   — input, select, textarea (borda slate, focus ring indigo)
```

### Outros

```
.ui-divider    — separador vertical (usado no header)
.ui-divider-h  — separador horizontal
.ui-spinner    — spinner de carregamento (CSS puro)
.ui-field-item — item de campo no painel lateral do editor
.ui-menu-item  — item de menu lateral (aside)
```

### Animações

```
.animate-fadeUp   — entra com opacity 0 → 1 + translateY(8px) → 0 (0.3s)
.animate-slideIn  — entra da direita (0.2s)
```

---

## Estrutura de rotas (App Router)

```
/                          → Editor de PDF (página principal)
/login                     → Tela de login
/register                  → Tela de cadastro

/dashboard                 → Dashboard do professor ou aluno (detecta role)
/dashboard/students        → Lista de alunos
/dashboard/students/new    → Formulário criar aluno
/dashboard/students/[id]   → Perfil do aluno (aulas, exercícios, plano)

/dashboard/subjects        → Lista de matérias
/dashboard/subjects/new    → Formulário criar matéria
/dashboard/subjects/[id]/edit → Formulário editar matéria

/dashboard/lessons         → Lista de aulas
/dashboard/lessons/new     → Formulário agendar aula
/dashboard/lessons/[id]    → Detalhe da aula
/dashboard/lessons/[id]/edit → Formulário editar aula

/dashboard/exercises       → Lista de exercícios com status
```

---

## Header padrão (presente em todas as páginas)

Altura fixa de **52px**, `bg-white`, `border-b border-slate-200`, `shadow-[0_1px_0_rgba(0,0,0,0.04)]`.

Estrutura interna:
```
[Logo ActivePDF] [.ui-divider] [Breadcrumb / botões de ação]     [perfil + logout]
```

O logo é um ícone `FilePdf` em `bg-brand` (indigo), `w-7 h-7`, `rounded-lg`, seguido do texto "ActivePDF" em `font-extrabold text-[15px] tracking-[-0.3px]`.

---

## Dashboard do Professor

**Arquivo:** `src/app/dashboard/page.tsx` (Server Component)

### Grid de navegação (4 cards)

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ 📚 Matérias  │ 🎓 Alunos    │ 📅 Aulas     │ 📄 Exercícios│
│  indigo      │  violet      │  blue        │  emerald     │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

Cards com `p-4 bg-white rounded-2xl border border-slate-200`, hover para `border-brand`. Ícone `w-9 h-9 rounded-lg`, título `text-sm font-bold`, contagem `text-xs text-slate-500`.

### Seções abaixo do grid

1. **Exercícios criados** — lista de cards com ícone PDF, título, nome do aluno e badge de status
2. **Próximas aulas** — cards com data/hora, nome do aluno e botão "Meet" se houver link
3. **Meus alunos** — grid 2 colunas com avatar (inicial do nome), nível do plano, objetivo e próxima aula

---

## Dashboard do Aluno

**Arquivo:** `src/app/dashboard/page.tsx` (Server Component, componente `StudentDashboard`)

### Seções

1. **Exercícios** — lista com link para `/?exerciseId=` (abre o editor no modo de preenchimento)
2. **Plano de aprendizado** — grid com Nível, Livro, Objetivo e badges de matérias
3. **Próxima aula** — card em `bg-brand-light border border-[#c7d2fe]` com data, conteúdo, lição de casa e botão "Entrar" para Meet
4. **Aulas anteriores** — lista com ícone `CheckCircle` verde, data, matéria e badges de vocabulário

---

## Editor de PDF (tela principal `/`)

**Arquivo:** `src/components/editor/AppShell.tsx`

O editor é a peça central do produto. Divide a tela em três regiões:

```
┌─────────────────────────────────────────────────────────────┐
│  TOOLBAR (header) — 52px                                    │
├───────────────┬─────────────────────────┬───────────────────┤
│ FieldsPanel   │    PdfCanvas            │ PropertiesPanel   │
│ (painel esq.) │    (área central)       │ (painel dir.)     │
│ lista campos  │    PDF renderizado      │ editar campo sel. │
│               │    + field markers      │                   │
└───────────────┴─────────────────────────┴───────────────────┘
```

### Toolbar (`src/components/editor/Toolbar.tsx`)
- Logo ActivePDF
- Nome do arquivo PDF (truncado)
- Toggle **Editar / Preencher** (`.ui-btn-mode`)
- Navegação de páginas (`.ui-btn-page-nav`)
- Botão **OCR** — extrai texto do PDF com Tesseract
- Seletor de exportação (`.ui-export-btn`): PDF preenchido ou PDF limpo
- Botão **Salvar exercício** (abre `SaveExerciseModal`)

### PdfCanvas (`src/components/editor/PdfCanvas.tsx`)
- Renderiza cada página do PDF via `pdfjs-dist`
- Sobrepõe os `FieldMarker` (campos interativos) como divs absolutos sobre o canvas
- No modo **Editar**: drag para criar campo, drag para mover, resize handle
- No modo **Preencher**: campos viram inputs/textareas editáveis

### FieldMarker (`src/components/editor/FieldMarker.tsx`)
Classe `.field-marker` (CSS em `globals.css`):
- Fundo `rgba(79, 70, 229, 0.13)` (indigo semitransparente)
- Borda `1.5px solid #4f46e5`
- Selecionado: ring `0 0 0 3px rgba(79,70,229,0.3)` + borda 2px
- Label em `text-[10px] font-bold text-brand` com sombra branca para legibilidade

### FieldsPanel (`src/components/editor/panels/FieldsPanel.tsx`)
Painel esquerdo. Cada campo listado com `.ui-field-item`. Mostra nome, tipo e botão de excluir.

### PropertiesPanel (`src/components/editor/panels/PropertiesPanel.tsx`)
Painel direito. Aparece quando um campo está selecionado. Edita: nome, tipo (text/checkbox/select), obrigatoriedade e outras propriedades do campo.

### SaveExerciseModal (`src/components/editor/SaveExerciseModal.tsx`)
Modal sobreposto (`fixed inset-0 z-50`), backdrop blur. Campos:
- **Título do exercício** (input, obrigatório)
- **Atribuir ao aluno** (select, opcional — lista os alunos do professor)
- Resumo: "X campos criados serão salvos para o aluno preencher."
- Botão **Salvar exercício** → POST `/api/exercises`

---

## Telas de CRUD

Todas seguem o mesmo padrão:

**Header** → mesmo header padrão com breadcrumb ("Dashboard / Matérias / Nova matéria")

**Container** → `max-w-lg mx-auto px-4 py-8 animate-fadeUp`

**Card de formulário** → `p-5 bg-white rounded-2xl border border-slate-200 flex flex-col gap-3.5`

**Labels** → `text-xs font-semibold text-slate-700`

**Inputs** → `.ui-input`

**Rodapé** → `flex gap-2 justify-end` com botão Cancelar (`.ui-btn-ghost`) e Salvar (`.ui-btn-primary`)

**Erro inline** → `px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700`

### Padrão de exclusão (dois passos)
Componentes como `DeleteExerciseButton` e `DeleteSubjectButton` usam estado local:
1. Clique no ícone `Trash` → exibe `"Excluir?"` com botões **Sim** (`.ui-btn-danger`) e **Não** (`.ui-btn-ghost`)
2. Confirmação → DELETE na API → `router.refresh()`

---

## Autenticação

- Login e registro em `/login` e `/register`
- Cookie HttpOnly `activepdf_session` com JWT (gerenciado pelo backend Hono)
- `src/lib/auth.ts` — `getSession()` lê e valida o cookie no servidor
- `src/middleware.ts` — protege rotas `/dashboard` e redireciona para `/login`
- `src/lib/api.ts` — `serverFetch()` injeta o token no header `Authorization` ao chamar o backend
- `src/lib/proxy.ts` — `proxyRequest()` usado nas API Routes do Next.js para repassar chamadas ao Hono

---

## Estado global (Zustand)

**`src/store.ts`** — estado do editor de PDF:
- Lista de `PdfField[]` (campos interativos)
- Campo selecionado
- Modo atual (`edit` | `fill`)
- Página atual
- Bytes do PDF carregado

**`src/store/authStore.ts`** — dados do usuário autenticado no cliente (nome, role).

---

## Tipos principais (`src/types.ts`)

```typescript
interface PdfField {
  id: string
  page: number
  x: number       // posição relativa ao canvas (0–1)
  y: number
  width: number
  height: number
  label: string
  type: "text" | "checkbox" | "select"
  required: boolean
  options?: string[]   // para type=select
  value?: string       // resposta do aluno no modo fill
}
```

---

## Fluxo principal do professor

```
Login → Dashboard → [Criar exercício]
                         ↓
                   Upload PDF (UploadScreen)
                         ↓
                   Editor (AppShell)
                   — desenha campos sobre o PDF —
                         ↓
                   "Salvar exercício" → SaveExerciseModal
                   — escolhe título + aluno —
                         ↓
                   POST /api/exercises → exercício salvo
                         ↓
                   Dashboard → lista de exercícios com status
```

## Fluxo principal do aluno

```
Login → Dashboard do aluno
            ↓
        Clica em exercício → /?exerciseId=xxx
            ↓
        Editor em modo "Preencher"
        — preenche os campos —
            ↓
        PATCH /api/exercises/:id (answersJson + status)
            ↓
        Badge muda: "Preencher" → "Em andamento" → "Concluído"
```
