# ActivePDF — Plano de Produto, Arquitetura e Sprints

> Decisões de base (11/jun/2026): editor gratuito **híbrido** na capa (usa sem conta,
> salva com conta), cliente pagante é o **professor**, billing via **Mercado Pago**,
> **rebrand completo** do design.

---

## 1. Produto — os três degraus

| Degrau | Quem | O que tem | Objetivo |
|---|---|---|---|
| **Anônimo (capa)** | Visitante | Editor de PDF direto na home: envia PDF, cria campos de texto/textarea por cima, preenche e **exporta** — 100% no navegador, nada vai ao servidor | Atrair: a pessoa resolve a atividade de inglês dela em 2 minutos, sem cadastro |
| **Conta gratuita** | Estudante/curioso | Tudo do anônimo **+ salvar até N documentos** na nuvem (sugestão: 3), histórico, reabrir e continuar | Capturar e-mail e criar hábito |
| **Pro (pago)** | Professor | Turmas, alunos ilimitados (alunos entram grátis por convite), biblioteca de PDFs, exercícios com correção, planos de aula, vocabulário, áudio, XP/gamificação, relatórios | Monetizar via assinatura Mercado Pago |

Regras de conversão:
- A capa **é** o editor (não um print dele). CTA de salvar/limite → criar conta.
- Dentro da conta gratuita, recursos Pro aparecem bloqueados com upsell claro.
- Aluno nunca paga: o valor do plano Professor inclui os alunos dele.

---

## 2. Arquitetura Front-end (Next.js 14, App Router)

Reorganização por **route groups** (marketing × app) e **features por domínio**:

```
frontend/src/
  app/
    (marketing)/            # rebrand, RSC, SEO forte
      page.tsx              # CAPA = editor gratuito embutido
      precos/page.tsx
      portfolio/page.tsx
    (auth)/
      login/  register/
    (app)/
      dashboard/...         # produto logado (estrutura atual migra pra cá)
    api/[...path]/route.ts  # proxy catch-all (mantém)
  features/
    editor/                 # NÚCLEO: o mesmo editor da capa e do dashboard
      components/  hooks/  persistence/   # ver adapter abaixo
    classes/  students/  lessons/  exercises/
    gamification/  library/  corrections/
  components/ui/            # design system v2 (rebrand)
  lib/  hooks/  store/  types.ts
```

Decisões estruturais:

1. **Editor é um pacote isolado** com um *persistence adapter* injetado
   (Dependency Inversion): `LocalAdapter` (anônimo — memória/IndexedDB, exporta
   com pdf-lib) e `ApiAdapter` (logado — salva via API). O mesmo componente
   serve capa e dashboard; o que muda é o adapter.
2. **`(marketing)` é Server Component puro** exceto a ilha do editor —
   performance e SEO da capa são prioridade nº 1.
3. **Um domínio = uma pasta em `features/`** com componentes, hooks e store
   próprios. `components/ui/` só guarda primitivos genéricos.
4. Mantém: Zustand por domínio, `cn()`, tipos compartilhados em `types.ts`,
   contrato de erro `{ error: string }`.

---

## 3. Arquitetura Back-end (Hono 4)

Hoje a regra de negócio mora nas rotas. Estrutura alvo em três camadas:

```
backend/src/
  routes/        # HTTP fino: valida (Zod), chama service, formata resposta
  services/      # regra de negócio testável (xp, correções, limites de plano…)
  lib/           # prisma, ownership, pagination, files (mantém)
  middleware/    # requireAuth/Teacher/Student + NOVO requirePlan("PRO")
  modules novos:
    billing/     # Mercado Pago: criar assinatura (preapproval), webhook, status
    entitlements/# FREE × PRO: limites (N docs), gates de recurso
    documents/   # SavedDocument do tier gratuito
```

Regras novas que se somam às existentes:

- **Gate de plano é middleware** (`requirePlan`), nunca `if` espalhado na rota.
- **Webhook do Mercado Pago é a fonte da verdade** do status da assinatura
  (`authorized`, `paused`, `cancelled`); o front só lê o estado.
- Limites do tier gratuito vivem em `entitlements` (constantes versionadas),
  não hardcoded nas rotas.

---

## 4. Banco de dados — SQLite → PostgreSQL

O Prisma abstrai quase tudo; o trabalho é de migração e de aproveitar o que o
PG dá e o SQLite não dava:

1. **Datasource** `postgresql`, Postgres 16 em Docker local
   (`docker-compose.yml` na raiz) e gerenciado em produção (Neon/Supabase/Railway
   — decidir na Sprint 0; qualquer um serve o Prisma igual).
2. **Baseline nova de migrations** (as atuais são SQLite; não convertê-las —
   gerar `init` novo). Dados locais: recriar via `seed.ts`; se houver dado real
   a preservar, script de export/import pontual.
3. **Tipos nativos**: enums de verdade (`Role`, `ExerciseStatus`, status de
   assinatura — hoje `String` por limitação do SQLite), `Json`/JSONB para os
   campos posicionados sobre o PDF, índices em toda FK de escopo
   (`professorId`, `studentId`, `classId`).
4. **Modelos novos**:
   - `Subscription` — `professorId`, `mpPreapprovalId`, `status`, `plan`,
     `currentPeriodEnd`, timestamps.
   - `SavedDocument` — documento do tier gratuito: `ownerId`, nome, PDF
     (storage), `fields Json`, timestamps.
5. Mantém as convenções: `cuid()`, `createdAt/updatedAt`, `onDelete` explícito,
   omit global de `password`, ownership por `professorId`/`studentId`.

---

## 5. Design — Rebrand completo

O rebrand vem **antes** das telas (Sprint 1) e em duas frentes:

### 5.1 Identidade
- Nome/marca, logo, paleta nova (sai o indigo padrão), par tipográfico
  (display para marketing + texto para UI + mono para números/XP/scores),
  tom de voz pt-BR.
- Direção sugerida para diferenciar de SaaS genérico: estética de
  **material didático premium** — papel, anotação, carimbo de correção — em vez
  de gradiente tech. (Refinar com a skill `frontend-design` na sprint.)

### 5.2 Sistema
- **Tokens como fonte única**: CSS variables em `globals.css` → mapeadas no
  `tailwind.config.js`. Nenhum hex fora dos tokens (regra já existente, mantém).
- **`.ui-*` v2** reconstruídas sobre os tokens novos; Storybook como catálogo
  vivo desde o primeiro primitivo.
- **Protótipo antes de varredura**: redesenhar primeiro as 5 telas-chave —
  capa/editor, dashboard do professor, turma, correção, área do aluno — validar,
  e só então varrer o resto com a skill `refatorar-design-system`.
- Marketing pode ser mais ousado que o app logado, mas ambos saem dos mesmos tokens.

---

## 6. Sprints (1–2 semanas cada)

> Critério geral de aceite de toda sprint: `npm run build` (back) e
> `npx tsc --noEmit` (front) passam; regras do CLAUDE.md respeitadas.

### Sprint 0 — Fundação técnica
- Postgres em Docker + datasource Prisma + baseline de migrations + enums nativos.
- Extrair camada `services/` dos 3 domínios mais carregados (exercises, gamification, lessons).
- Route groups `(marketing)/(auth)/(app)` no front (mover, sem redesenhar).
- **Aceite**: app inteiro funciona igual a hoje, mas em PG e na estrutura nova.

### Sprint 1 — Identidade e Design System v2
- Marca: nome/logo/paleta/tipografia definidos e documentados.
- Tokens + primitivos v2 (Button, Badge, Input, Card, EmptyState…) com stories.
- Protótipo das 5 telas-chave aprovado.
- **Aceite**: Storybook com todos os primitivos; telas-chave prototipadas.

### Sprint 2 — Editor como produto isolado
- Mover editor para `features/editor` com persistence adapter (Local × Api).
- Modo anônimo 100% client-side: upload → campos texto/textarea → preencher → exportar (pdf-lib).
- **Aceite**: editor roda sem backend ligado; mesmo componente usado no dashboard.

### Sprint 3 — Capa gratuita e funil
- Landing nova (rebrand) com o editor embutido como herói; página de preços.
- Limite de salvar → modal de criar conta; SEO/meta/OG; analytics de funil.
- **Aceite**: visitante resolve uma atividade e exporta sem conta; CTA de conta funcional.

### Sprint 4 — Conta gratuita e entitlements
- `SavedDocument` (CRUD, limite N) + módulo `entitlements` + `requirePlan`.
- Área "Meus documentos" para conta gratuita; recursos Pro visíveis e bloqueados.
- **Aceite**: free salva até o limite e vê o upsell; Pro segue completo para professor.

### Sprint 5 — Billing Mercado Pago
- Assinatura (preapproval), webhook como fonte da verdade, modelo `Subscription`.
- Telas: upgrade, status da assinatura, falha de pagamento, cancelamento.
- **Aceite**: ciclo completo em sandbox — assinar → virar PRO → cancelar → voltar a FREE.

### Sprint 6 — Rebrand do app logado
- Varredura do dashboard com DS v2 (`refatorar-design-system`), tela a tela.
- Micro-interações, empty states, estados de loading/erro consistentes.
- **Aceite**: zero classe/cor do DS antigo; checklist visual nas rotas principais.

### Sprint 7 — Polimento e lançamento
- Onboarding do professor (primeira turma em <5 min), revisão de relatórios e gamificação.
- Deploy produção (front + API + PG gerenciado), backup, monitoramento de erro.
- **Aceite**: ambiente de produção no ar com billing real em modo teste → live.

---

## 7. Riscos e cortes conscientes

- **Mercado Pago preapproval** tem menos exemplos que Stripe — reservar tempo
  da Sprint 5 para sandbox/webhook; o módulo `billing/` é interface-first para
  permitir trocar de gateway sem tocar no resto.
- **Rebrand é a maior variável de prazo** — por isso identidade (S1) vem antes
  de qualquer tela nova, e a varredura do app (S6) vem depois do funil pago
  estar de pé (receita primeiro, estética do logado depois).
- **Não fazer agora**: app mobile, OCR no fluxo principal, plano autodidata
  pago (fica para depois do professor validar a receita).
