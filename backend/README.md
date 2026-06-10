# ActivePDF — Backend

API REST para a plataforma de exercícios interativos em PDF e áudio para professores de inglês. Construída com Hono.js, Prisma e SQLite.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework HTTP | **Hono.js** |
| Runtime | **Node.js** (via `@hono/node-server`) |
| ORM | **Prisma 7** com driver `better-sqlite3` |
| Banco de dados | **SQLite** (arquivo `dev.db`) |
| Auth | **JWT** via `jose` (expiração: 7d) · hash de senha com `bcryptjs` (custo 10) |
| Linguagem | **TypeScript 5** |

---

## Rodar localmente

```bash
npm install
npm run db:migrate    # cria as tabelas (inclui AudioMaterial)
npm run db:generate   # gera o Prisma Client
npm run dev           # porta 4000 com watch
```

Variáveis de ambiente (copie `.env.example`):

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="troque-em-producao"
FRONTEND_URL="http://localhost:3000"
PORT=4000
```

Documentação OpenAPI interativa: `http://localhost:4000/docs`  
Schema e MER completo: [`docs/database-schema.md`](docs/database-schema.md)

---

## O problema que o produto resolve

A professora gerenciava cada aluno em uma pasta separada no Google Drive com:
- Um Google Doc com tabela de calendário (data, conteúdo, tarefa, notas)
- PDFs do livro Interchange enviados por e-mail ou Drive
- Áudios de listening enviados pelo WhatsApp (se perdem no histórico do chat)
- Link de videochamada (Teams / Meet) informado por mensagem

O ActivePDF centraliza tudo em uma única plataforma:

| Antes | Agora |
|---|---|
| Pasta no Drive por aluno | Perfil do aluno com todos os dados |
| Tabela de calendário no Google Docs | `Lesson` com data, conteúdo, homework, notas |
| Link de videochamada por mensagem | `Lesson.meetLink` direto na aula |
| PDF enviado por e-mail, aluno responde em print | `Exercise` com PDF preenchível diretamente |
| Áudio enviado pelo WhatsApp | `AudioMaterial` vinculado à aula |
| Vocabulário num doc avulso | `VocabularyEntry` por aula, acumulado no perfil |

---

## Modelo de dados (resumo)

```
Professor ──< Student >──< StudentSubject >──< Subject
               │
               ├── LearningPlan  (1:1)
               ├── UserStats     (1:1, gamificação)
               ├──< Achievement  (gamificação)
               ├──< XpEvent      (gamificação)
               │
               └──< Lesson
                        │
                        ├──< VocabularyEntry
                        ├──< Exercise
                        └──< AudioMaterial   ← migration pendente
```

MER completo com Mermaid: [`docs/database-schema.md`](docs/database-schema.md)

---

## Regras de negócio

### Autenticação

- JWT contém `{ userId, role, name }` com expiração de 7 dias.
- Token aceito em `Authorization: Bearer <token>` **ou** no cookie `activepdf_session`.
- Dois tipos de usuário em tabelas separadas: `Professor` e `Student`.
- Aluno pode se registrar informando o e-mail do professor para já se vincular.

### Professor

- Gerencia apenas alunos com `student.professorId === session.userId`.
- Cria exercícios e aulas apenas para seus alunos.
- Matérias são **globais** — sem `professorId` em `Subject`.
- Upload de áudio: apenas o professor pode adicionar áudios a uma aula.
- Pode ouvir qualquer áudio de suas próprias aulas.

### Aluno

- Acessa apenas seus próprios exercícios e aulas.
- Não pode criar exercícios nem aulas.
- Pode atualizar `answersJson` e `status` apenas de exercícios atribuídos a ele.
- Transições de status: `assigned → in_progress → completed` (sem reversão).
- Pode ouvir todos os áudios das aulas às quais pertence.
- XP é concedido automaticamente ao completar exercícios e ao ouvir áudios.
- O campo `Lesson.notes` **nunca** é enviado ao aluno — é privado do professor.

### Áudio

- Armazenado em Base64 no campo `AudioMaterial.fileData` (mesma abordagem dos PDFs).
- Sem dependência de storage externo (S3, Supabase) na fase atual.
- Tamanho prático recomendado: abaixo de 5 MB por arquivo.
- Formatos aceitos: `audio/mpeg`, `audio/ogg`, `audio/webm`, `audio/mp4`.
- XP `+10` concedido ao aluno quando escuta o áudio até o fim (`reason: "audio_listened"`).

---

## Endpoints implementados

### Auth

| Método | Rota | Acesso |
|---|---|---|
| POST | `/api/auth/register` | Público |
| POST | `/api/auth/login` | Público |

### Alunos

| Método | Rota | Acesso |
|---|---|---|
| GET | `/api/students` | Professor |
| POST | `/api/students` | Professor |
| GET | `/api/students/:id` | Professor (somente seus) |
| PATCH | `/api/students/:id` | Professor |
| DELETE | `/api/students/:id` | Professor |

### Matérias

| Método | Rota | Acesso |
|---|---|---|
| GET | `/api/subjects` | Professor |
| POST | `/api/subjects` | Professor |
| GET | `/api/subjects/:id` | Professor |
| PATCH | `/api/subjects/:id` | Professor |
| DELETE | `/api/subjects/:id` | Professor |

### Aulas

| Método | Rota | Acesso |
|---|---|---|
| GET | `/api/lessons` | Professor (filtros: `?status=`, `?studentId=`) |
| POST | `/api/lessons` | Professor |
| GET | `/api/lessons/:id` | Professor |
| PATCH | `/api/lessons/:id` | Professor |
| DELETE | `/api/lessons/:id` | Professor |

### Exercícios

| Método | Rota | Acesso |
|---|---|---|
| GET | `/api/exercises` | Professor (seus) · Aluno (atribuídos a ele) |
| POST | `/api/exercises` | Professor |
| GET | `/api/exercises/:id` | Professor ou Aluno |
| PATCH | `/api/exercises/:id` | Aluno (answersJson + status) |
| DELETE | `/api/exercises/:id` | Professor |

### Dashboard

| Método | Rota | Acesso |
|---|---|---|
| GET | `/api/dashboard/teacher` | Professor |
| GET | `/api/dashboard/student` | Aluno |

---

## Bug conhecido

### `POST /api/lessons` ignora `subjectId`

**Arquivo:** [`src/routes/lessons.ts`](src/routes/lessons.ts) — linha 30

O campo `subjectId` existe no model `Lesson` mas não é desestruturado no body da requisição. Corrigir antes da Sprint 1:

```ts
// atual — falta subjectId
const { studentId, scheduledAt, meetLink, content, homework, notes } = await c.req.json();

// correto
const { studentId, subjectId, scheduledAt, meetLink, content, homework, notes } = await c.req.json();
// adicionar no prisma.lesson.create: subjectId: subjectId || null
```

---

## Sprints — Roadmap do backend

> Ordenadas por dependência e impacto no produto. Cada sprint é independente das posteriores.

---

### Sprint 1 — Vocabulário e Áudio por aula

**Por que primeiro:** São os dois recursos que a professora mais sente falta (vocabulário antes estava no Google Docs, áudio no WhatsApp). Ambos dependem apenas da `Lesson` que já existe.

**Pré-requisito:** Corrigir o bug de `subjectId` em `POST /api/lessons`.

**Pré-requisito de migration:** Rodar `npm run db:migrate` para criar a tabela `AudioMaterial`.

#### 1A — Vocabulário

**Arquivo a criar:** `src/routes/vocabulary.ts`  
**Registrar em** `src/index.ts`: subrouting dentro de `/api/lessons`

| Rota | Método | Regra de negócio |
|---|---|---|
| `/api/lessons/:id/vocabulary` | GET | Professor verifica `lesson.professorId === session.userId`. Retorna `VocabularyEntry[]` ordenado por `createdAt`. Aluno verifica `lesson.studentId === session.userId`. |
| `/api/lessons/:id/vocabulary` | POST | Apenas professor. `word` obrigatório. `studentId` é derivado de `lesson.studentId` — não exige envio pelo frontend. |
| `/api/lessons/:id/vocabulary/:entryId` | DELETE | Apenas o professor da aula. Verifica `lesson.professorId` antes de deletar. |

#### 1B — Áudio

**Arquivo a criar:** `src/routes/audio.ts`  
**Registrar em** `src/index.ts`: `app.route("/api/lessons", audioRoutes)`

| Rota | Método | Regra de negócio |
|---|---|---|
| `/api/lessons/:id/audio` | GET | Professor e aluno da aula podem listar. Retorna sem `fileData` (só metadados) para listagem rápida. |
| `/api/lessons/:id/audio` | POST | Apenas professor. Body: `{ title, fileData (base64), mimeType, durationSecs?, transcript? }`. Valida que `mimeType` começa com `audio/`. |
| `/api/lessons/:id/audio/:audioId` | GET | Professor ou aluno da aula. Retorna com `fileData` para reprodução. |
| `/api/lessons/:id/audio/:audioId` | DELETE | Apenas professor da aula. |
| `/api/lessons/:id/audio/:audioId/listened` | POST | Apenas aluno. Registra `XpEvent` com `reason: "audio_listened"` e `referenceId: audioId`. Idempotente — se já existir XpEvent para esse `referenceId`, não duplica. |

**Por que GET separado com fileData:** A listagem retorna apenas `id, title, mimeType, durationSecs, createdAt` (sem base64) para não sobrecarregar a requisição de detalhe da aula. O player faz um GET individual para obter o arquivo.

---

### Sprint 2 — Aluno acessa seu cronograma

**Por que antes de matrícula/plano:** O aluno não consegue ver suas próprias aulas hoje — depende do endpoint de dashboard que é um agregado. Isso bloqueia o fluxo básico do produto para o lado do aluno.

**Atualização em:** `src/routes/lessons.ts`

**`GET /api/lessons`** — adicionar lógica para `role === "student"`:
```ts
if (session.role === "student") {
  const lessons = await prisma.lesson.findMany({
    where: { studentId: session.userId },
    include: {
      subject: true,
      vocabularyEntries: { orderBy: { createdAt: "asc" } },
      audioMaterials: { select: { id: true, title: true, mimeType: true, durationSecs: true } },
    },
    orderBy: { scheduledAt: "desc" },
  });
  return c.json(lessons);
}
```

**`GET /api/lessons/:id`** — adicionar acesso do aluno:
```ts
if (session.role === "student") {
  const lesson = await prisma.lesson.findFirst({
    where: { id: c.req.param("id"), studentId: session.userId },
    include: { subject: true, vocabularyEntries: true, audioMaterials: { select: { id: true, title: true, mimeType: true, durationSecs: true } } },
  });
  if (!lesson) return c.json({ error: "Aula não encontrada" }, 404);
  // NUNCA expor lesson.notes ao aluno
  const { notes: _omit, ...lessonSafe } = lesson as any;
  return c.json(lessonSafe);
}
```

---

### Sprint 3 — Matrícula e plano de aprendizado

**Por que aqui:** Funcionalidade core do setup do aluno. Depende da Sprint 1 (vocabulário) só para a conquista `vocabulary_50`, mas pode ser desenvolvida em paralelo.

**Arquivo a criar:** `src/routes/enrollment.ts`

| Rota | Método | Regra de negócio |
|---|---|---|
| `/api/students/:id/subjects` | GET | Retorna matérias do aluno com `include: { subject: true }`. Valida `student.professorId === session.userId`. |
| `/api/students/:id/subjects` | POST | Body: `{ subjectId }`. Valida que a matéria existe. Cria `StudentSubject`. Retorna 409 se já matriculado (`@@unique`). |
| `/api/students/:id/subjects/:subjectId` | DELETE | Deleta `StudentSubject` pela chave composta. Valida posse do aluno. |

**Atualização em:** `src/routes/students.ts`

| Rota | Método | Regra de negócio |
|---|---|---|
| `/api/students/:id/learning-plan` | GET | Retorna o plano. 404 se não existe ainda. |
| `/api/students/:id/learning-plan` | PATCH | **Upsert** com `prisma.learningPlan.upsert`. Cria se não existe, atualiza se existe. Aceita `level`, `objective`, `bookRef`, `notes` (todos opcionais no update). |

---

### Sprint 4 — Revisão de exercícios pelo professor

**Por que aqui:** A professora precisa ver o que o aluno preencheu no PDF. Hoje só existe o `answersJson` bruto — sem interface de revisão.

**Arquivo a criar:** `src/routes/corrections.ts`

| Rota | Método | Regra de negócio |
|---|---|---|
| `GET /api/corrections` | GET | Apenas professor. Exercícios com `status = "completed"` ou `"in_progress"` dos alunos do professor. Inclui `student.name`. Ordena por `updatedAt` desc. |
| `GET /api/exercises/:id/review` | GET | Apenas professor. Mescla `fieldsJson` + `answersJson` em `fields: Array<PdfField & { answer: string }>`. Inclui `pdfData` para renderização. |

**Estrutura da resposta `/review`:**
```ts
{
  id: string
  title: string
  pdfData: string          // base64 — para renderizar o PDF
  pdfName: string
  status: string
  submittedAt: string      // updatedAt quando completed
  student: { id: string; name: string }
  fields: Array<{
    id: string; label: string; type: string; page: number
    x: number; y: number; width: number; height: number
    answer: string         // answersJson[field.id] ?? ""
  }>
}
```

---

### Sprint 5 — Gamificação

**Por que por último:** Depende de todas as Sprints anteriores para as conquistas cruzadas (`vocabulary_50`, `first_audio`). As rotas de XP precisam da lógica de áudio (Sprint 1) e de exercícios (já implementado).

**Arquivo a criar:** `src/routes/gamification.ts`

| Rota | Método | Regra de negócio |
|---|---|---|
| `GET /api/gamification/me` | GET | Aluno. Cria `UserStats` sob demanda se não existir. Calcula `rank` via `COUNT` de alunos do mesmo professor com XP maior. Retorna `xp`, `level`, `levelBadge`, `levelName`, `xpForNextLevel`, `xpProgress` (%), `streak`, `rank`. |
| `GET /api/gamification/week` | GET | Aluno. Agrega `XpEvent` dos últimos 7 dias por data. Retorna `days[]` (com `date`, `label`, `xpGained`, `exercisesDone`), `weekXp`, `weekExercises`, `goalPercent`. |
| `GET /api/gamification/leaderboard` | GET | Aluno ou Professor. Escopo: alunos do mesmo professor. Ordena por `UserStats.xp` desc. Limit 10. |
| `GET /api/gamification/achievements` | GET | Aluno. Lista `Achievement[]` com `key` e `unlockedAt`. |

**Onde acionar XP (modificações em rotas existentes):**

| Arquivo | Evento | XP | `reason` |
|---|---|---|---|
| `src/routes/exercises.ts` — `PATCH /:id` | `status → completed` | +50 | `exercise_completed` |
| `src/routes/lessons.ts` — `PATCH /:id` | `status → COMPLETED` | +25 | `lesson_completed` |
| `src/routes/audio.ts` — `POST /:audioId/listened` | Áudio escutado | +10 | `audio_listened` |
| `src/routes/auth.ts` — `POST /login` | Streak mantido | +20 | `streak_maintained` |

Toda concessão de XP deve seguir este padrão (dentro de `prisma.$transaction`):
1. `prisma.xpEvent.create(...)` — registrar o evento.
2. `prisma.userStats.upsert(...)` — atualizar `xp` e recalcular `level`.
3. Verificar e desbloquear conquistas com `prisma.achievement.upsert(...)`.

---

### Sprint 6 — Qualidade e produção

Sem dependências — pode ser feito em paralelo às outras sprints a partir da Sprint 3.

| Tarefa | Descrição |
|---|---|
| Migrar para PostgreSQL | Trocar adapter SQLite → Postgres (`@prisma/adapter-pg`). Atualizar `DATABASE_URL`. |
| Paginação | `?page=1&limit=20` em `GET /api/students`, `/api/lessons`, `/api/exercises`. |
| Busca | `?q=` por nome em students, subjects e por título em exercises. |
| Testes de integração | Vitest + banco SQLite em memória. Cobrir o fluxo: criação de aluno → agendamento de aula → upload de exercício → aluno preenche → professor revisa. |
| Rate limiting | Middleware no `/api/auth` (10 req/min por IP). Hono tem `hono/rate-limiter` ou usar `@elysiajs/rate-limit` adaptado. |
| Limite de tamanho de upload | Middleware que rejeita bodies > 10 MB antes de parsear JSON (protege o endpoint de áudio e exercício). |
