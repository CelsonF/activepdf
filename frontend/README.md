# ActivePDF — Frontend

Interface web da plataforma de exercícios interativos em PDF para professores e alunos de inglês. Construída com Next.js 14 App Router.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | **Next.js 14** (App Router) |
| Linguagem | **TypeScript** strict (sem `any`) |
| Estilo | **Tailwind CSS v3** + design system em `src/app/globals.css` |
| Ícones | **@phosphor-icons/react** |
| Estado global | **Zustand** |
| PDF render | `pdfjs-dist` |
| PDF geração | `pdf-lib` |
| OCR | `tesseract.js` |
| Auth | JWT via cookie HttpOnly `activepdf_session` |
| Backend | Hono.js na porta 4000, chamado via proxy em `src/app/api/` |

---

## Rodar localmente

```bash
npm install
npm run dev   # → http://localhost:3000
```

Variáveis de ambiente (copie `.env.example`):

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
JWT_SECRET=sua-chave-secreta   # mesma do backend
```

---

## Domínios de negócio e cobertura atual

| Dor original | Substituto no ActivePDF | Status frontend |
|---|---|---|
| Pasta Google Drive por aluno | Perfil do aluno com aulas, plano e matérias | ✅ |
| Tabela de calendário no Google Docs | Páginas de aulas (list, new, detail, edit) | ✅ |
| Link Teams/Meet | Botão "Entrar" na aula | ✅ |
| Vocabulário no doc avulso | Seção de vocabulário na aula (read-only) | ⚠️ exibe mas não permite adicionar |
| PDF enviado por e-mail | Upload de PDF + editor de campos | ✅ |
| Aluno responde em screenshot | Editor em modo "Preencher" | ✅ |
| Professora corrige a resposta | Visualização dos campos + respostas do aluno | ❌ `/exercises/[id]` usa dados MOCK |
| Aluno vê seu cronograma | Dashboard do aluno | ❌ tudo MOCK |
| Áudio via WhatsApp | Player e upload por aula | ❌ não implementado |
| Escrita livre tipo Google Docs | `<textarea>` nas aulas | ⚠️ mínimo viável |

---

## Recursos implementados

### Editor de PDF (rota `/`)

A peça central do produto. Tela dividida em três regiões:

```
┌──────────────────────────────────────────────────────┐
│  Toolbar (logo · arquivo · Editar/Preencher · OCR)   │
├────────────┬──────────────────────┬──────────────────┤
│ FieldsPanel│     PdfCanvas        │ PropertiesPanel  │
│ lista de   │  PDF renderizado     │ edita campo      │
│ campos     │  + marcadores        │ selecionado      │
└────────────┴──────────────────────┴──────────────────┘
```

- **Modo Editar** — drag para criar campo, mover e redimensionar
- **Modo Preencher** — campos viram inputs/textareas editáveis pelo aluno
- **OCR** — extrai texto do PDF com Tesseract.js para sugerir labels de campos
- **Exportar** — PDF preenchido (com respostas embutidas) ou PDF limpo
- **Salvar exercício** — modal com título + seleção de aluno → `POST /api/exercises`
- Tipos de campo: `text`, `checkbox`, `select` (com opções configuráveis)

### Autenticação

| Rota | Descrição |
|---|---|
| `/login` | Tela de login (professor e aluno) |
| `/register` | Cadastro com seleção de papel + e-mail do professor para alunos |

### Aulas — professor

| Rota | Implementado |
|---|---|
| `/dashboard/lessons` | Lista de aulas |
| `/dashboard/lessons/new` | Formulário de nova aula |
| `/dashboard/lessons/[id]` | Detalhe: conteúdo, homework, meet link, vocabulário (read-only) |
| `/dashboard/lessons/[id]/edit` | Editar + marcar como concluída |

### Alunos — professor

| Rota | Implementado |
|---|---|
| `/dashboard/students` | Lista de alunos |
| `/dashboard/students/new` | Criar aluno + plano inicial |
| `/dashboard/students/[id]` | Perfil: plano, matérias, próximas aulas, histórico |

### Matérias — professor

| Rota | Implementado |
|---|---|
| `/dashboard/subjects` | Lista |
| `/dashboard/subjects/new` | Criar |
| `/dashboard/subjects/[id]/edit` | Editar + excluir |

### Exercícios — professor e aluno

| Rota | Implementado |
|---|---|
| `/dashboard/exercises` | Lista com status |
| `/dashboard/exercises/[id]` | ⚠️ **usa dados MOCK** — ver bugs abaixo |

---

## Bugs conhecidos

### F1 — `/dashboard/exercises/[id]` usa dados completamente mockados

**Arquivo:** [`src/app/dashboard/exercises/[id]/page.tsx`](src/app/dashboard/exercises/[id]/page.tsx)

A página é um player de questões de múltipla escolha com `MOCK_PAGES` hardcoded. Ela **não lê** o exercício real da API, não renderiza o PDF, não salva respostas e não atualiza o status. O fluxo real (abrir PDF em modo "Preencher" com `answersJson` já salvos) nunca foi conectado.

**O que deveria ser:** o aluno clica no exercício → o PDF é carregado via `GET /api/exercises/:id` → o editor abre em modo "Preencher" com os campos e respostas já carregadas do `answersJson`.

---

### F2 — Formulário de nova aula não tem campo de matéria

**Arquivo:** [`src/app/dashboard/lessons/new/page.tsx`](src/app/dashboard/lessons/new/page.tsx)

O campo `subjectId` existe no model `Lesson` e no backend, mas o formulário de criação não inclui um `<select>` para matéria. A aula é sempre criada sem matéria vinculada.

---

### F3 — Página de edição de plano de aprendizado não existe

**Arquivo:** [`src/app/dashboard/students/[id]/page.tsx:69`](src/app/dashboard/students/[id]/page.tsx)

O botão "Editar" e o link "Criar plano" apontam para `/dashboard/students/[id]/plan`, mas essa rota não existe. Clicar neles resulta em 404.

---

### F4 — Dashboards usam 100% de dados mockados

**Arquivo:** [`src/app/dashboard/page.tsx`](src/app/dashboard/page.tsx)

Tanto `StudentDashboard` quanto `TeacherDashboard` renderizam com constantes `STUDENT_MOCK` e `TEACHER_MOCK`. A API de dashboard (`/api/dashboard/teacher` e `/api/dashboard/student`) não é chamada.

---

## Sprints — O que falta implementar

### Sprint 1 — Bugs críticos (bloqueiam fluxo principal)

#### F1 — Conectar `exercises/[id]` ao PDF real

O player mock deve ser substituído pela integração com o editor de PDF.

**Arquivo:** `src/app/dashboard/exercises/[id]/page.tsx`

- Chamar `GET /api/exercises/:id` para obter `pdfData`, `fieldsJson` e `answersJson`.
- Renderizar o PDF com `pdfjs-dist` como o `PdfCanvas` do editor já faz.
- Abrir em modo `"fill"` com os campos carregados e as respostas do `answersJson` já preenchidas.
- Ao sair/submeter: chamar `PATCH /api/exercises/:id` com `answersJson` e `status`.

#### F2 — Adicionar seletor de matéria no formulário de nova aula

**Arquivo:** `src/app/dashboard/lessons/new/page.tsx`

- Buscar lista de matérias com `GET /api/subjects` ao montar o componente.
- Adicionar `<select>` antes do campo de data com a lista de matérias (campo opcional).
- Incluir `subjectId` no body do `POST /api/lessons`.
- Replicar o mesmo campo no formulário de edição: `src/app/dashboard/lessons/[id]/edit/page.tsx`.

#### F3 — Criar página de plano de aprendizado

**Arquivo a criar:** `src/app/dashboard/students/[id]/plan/page.tsx`

- Carregar o plano existente com `GET /api/students/:id/learning-plan` (quando a rota existir no backend).
- Enquanto a rota de backend não existe, usar os dados que já chegam em `GET /api/students/:id` (campo `learningPlan`).
- Formulário com os campos: Nível, Objetivo, Livro de referência, Notas.
- Submeter para `PATCH /api/students/:id/learning-plan`.

---

### Sprint 2 — Vocabulário

O backend tem o model `VocabularyEntry` mas sem rotas. O frontend exibe vocabulário existente mas não deixa adicionar.

**Depende do:** Sprint 1 do backend (rotas de vocabulário).

**Arquivo:** `src/app/dashboard/lessons/[id]/page.tsx`

- Adicionar seção "Adicionar vocabulário" abaixo da lista existente de palavras.
- Formulário inline com campos: Palavra, Definição (opcional), Exemplo (opcional).
- `POST /api/lessons/:id/vocabulary` ao submeter.
- Botão de excluir em cada item existente (`DELETE /api/lessons/:id/vocabulary/:entryId`).
- Recarregar a lista com `router.refresh()` após cada operação.

---

### Sprint 3 — Aluno vê seu cronograma de aulas

Hoje o aluno não tem acesso ao seu cronograma fora do dashboard mockado.

**Depende do:** Sprint 2 do backend (rota de lessons para alunos).

**Arquivo a criar:** `src/app/dashboard/schedule/page.tsx` (ou `/dashboard/lessons` com vista do aluno)

- Chamar `GET /api/lessons` — quando o backend suportar alunos, retorna as aulas do aluno autenticado.
- Ordenar por `scheduledAt` desc.
- Card de cada aula: data, conteúdo, homework, vocabulário da aula, botão Meet.
- Mostrar `notes` apenas para professor — o aluno não deve ver esse campo.

---

### Sprint 4 — Professor revisa o que o aluno preencheu

Hoje o professor não tem uma tela para ver as respostas do aluno sobre o PDF.

**Depende do:** Sprint 4 do backend (rota `/api/exercises/:id/review`).

**Arquivo a criar:** `src/app/dashboard/exercises/[id]/review/page.tsx`

- Acessível apenas para professores.
- Chamar `GET /api/exercises/:id/review` para obter o PDF + fields + answers mesclados.
- Renderizar o PDF com `pdfjs-dist`.
- Sobrepor os `FieldMarker` já preenchidos com o valor da resposta do aluno em modo leitura (sem edição).
- Destaque visual: campo com resposta em `bg-emerald-50/border-emerald-300`, campo sem resposta em `bg-slate-50`.
- Link para essa página na listagem de exercícios e na página de correções.

---

### Sprint 5 — Conectar dashboards à API real

Remover `STUDENT_MOCK` e `TEACHER_MOCK` e usar dados reais.

**Arquivo:** `src/app/dashboard/page.tsx`

**Dashboard do aluno:**
- Chamar `GET /api/dashboard/student` para obter aluno, professor, plano, matérias, aulas e exercícios.
- Chamar `GET /api/gamification/me` para XP, nível e streak (quando existir no backend).
- Substituir cards de estatísticas pelos dados reais.
- "Continuar de onde parou": listar exercícios com `status = "in_progress"` ou `"assigned"`.
- "Próxima aula": primeira aula com `status = "SCHEDULED"` e `scheduledAt > agora`.

**Dashboard do professor:**
- Chamar `GET /api/dashboard/teacher` para obter alunos, próximas aulas e exercícios recentes.
- Substituir `TEACHER_MOCK.classList` pelos alunos reais agrupados.
- "Precisa de atenção": alunos com exercícios sem submissão há mais de 7 dias (calcular no cliente ou criar endpoint específico).

---

### Sprint 6 — Matrícula de aluno em matéria

**Depende do:** Sprint 3 do backend (rotas de enrollment).

**Arquivo:** `src/app/dashboard/students/[id]/page.tsx`

- Adicionar botão "Matricular em matéria" abaixo da lista de matérias do aluno.
- Modal com `<select>` das matérias disponíveis (excluindo as já matriculadas).
- `POST /api/students/:id/subjects` ao confirmar.
- Botão de remover em cada badge de matéria (`DELETE /api/students/:id/subjects/:subjectId`).

---

### Sprint 7 — Áudio por aula

**Depende do:** Sprint 6 do backend (modelo + rotas de áudio).

**Arquivo:** `src/app/dashboard/lessons/[id]/page.tsx`

- Seção "Materiais de áudio" abaixo do vocabulário.
- Professor: botão "Adicionar áudio" → input `file` aceita `audio/*` → converte para base64 → `POST /api/lessons/:id/audio`.
- Aluno e professor: player HTML5 com `<audio src="..." controls />` para cada faixa.
- Exibir título e duração. Botão de excluir para o professor.

---

### Sprint 8 — Editor de texto rico nas aulas

Melhora o campo "Conteúdo" e "Lição de casa" de `<textarea>` para um editor com formatação básica (negrito, itálico, listas). Nenhuma mudança de schema — o conteúdo é salvo como **Markdown**.

**Dependência:** biblioteca de editor (sugestão: `react-markdown` para render + barra de formatação manual, ou `@uiw/react-md-editor` que é leve e sem dependências pesadas).

**Arquivos afetados:**
- `src/app/dashboard/lessons/new/page.tsx` — substituir `<textarea>` do conteúdo por editor Markdown.
- `src/app/dashboard/lessons/[id]/edit/page.tsx` — mesmo editor.
- `src/app/dashboard/lessons/[id]/page.tsx` — substituir `whitespace-pre-wrap` por renderização de Markdown.
- `src/app/dashboard/students/[id]/page.tsx` — mesmo na exibição do histórico de aulas.

Não exige mudança no backend — o campo já é `String?`.

---

### Sprint 9 — Gamificação real

**Depende do:** Sprint 5 do backend (rotas de gamificação).

**Arquivo:** `src/app/dashboard/page.tsx`

- Card de nível/XP do aluno: conectar a `GET /api/gamification/me`.
- Streak real em vez de constante.
- Gráfico de atividade semanal: conectar a `GET /api/gamification/week`.

**Arquivos a criar:**
- `src/app/dashboard/ranking/page.tsx` — conectar a `GET /api/gamification/leaderboard`.
- `src/app/dashboard/achievements/page.tsx` — conectar a `GET /api/gamification/achievements`.
