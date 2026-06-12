---
name: consumir-api
description: >
  Passo a passo para consumir a API do ActivePDF (Hono na porta 4000) a partir
  do front-end Next.js 14. Use sempre que a tarefa for buscar ou enviar dados —
  carregar lista numa página, submeter formulário, criar um route handler
  proxy, tratar erro de request ou tipar resposta da API. Garante uso de
  serverFetch/proxyRequest, do contrato de erro { error: string } e dos tipos
  compartilhados em frontend/src/types.ts.
---

# Consumir a API — Next.js → Hono (ActivePDF)

A API é um serviço separado (`backend/`, Hono, porta 4000). O browser **nunca
fala direto com ela** — todo acesso passa pelo servidor Next, que injeta o
token da sessão (cookie `activepdf_session`) como `Authorization: Bearer`.

## Os dois caminhos (e quando usar cada um)

| Contexto | Helper | Onde mora |
|---|---|---|
| Server Component / página carregando dados | `serverFetch<T>(path)` | `frontend/src/lib/api.ts` |
| Client Component que precisa de fetch (form, ação) | `fetch("/api/...")` relativo → catch-all `frontend/src/app/api/[...path]/route.ts` | `frontend/src/lib/proxy.ts` |

Não invente um terceiro caminho: nada de `fetch("http://localhost:4000/...")`
em componente, nem de ler o cookie manualmente.

## 1. Carregar dados em página (Server Component)

```tsx
import { serverFetch } from "@/lib/api";
import type { Subject } from "@/types";

export default async function SubjectsPage() {
  const subjects = await serverFetch<Subject[]>("/api/subjects");
  // listas da API são arrays puros
  return <SubjectList subjects={subjects} />;
}
```

- `serverFetch` lança o body de erro (`{ error: string }`) quando `!res.ok` —
  trate com `try/catch` quando a página tiver fallback, ou deixe propagar
  para o `error.tsx` do segmento.
- O tipo `T` vem de `frontend/src/types.ts`; se o shape ainda não existe lá, crie-o
  espelhando a resposta real do backend (confira em `backend/src/routes/` ou
  em `http://localhost:4000/docs`).

## 2. Mutação a partir de Client Component

**Já existe um catch-all** em `frontend/src/app/api/[...path]/route.ts` que repassa
qualquer `/api/*` (GET/POST/PATCH/PUT/DELETE, com query string) para o
backend via `proxyRequest`. Na maioria dos casos **não crie route handler
novo** — só faça o fetch relativo do client:

```tsx
const res = await fetch("/api/subjects", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name }),
});
const data = await res.json();
if (!res.ok) {
  setError((data as { error?: string }).error ?? "Erro desconhecido");
  return;
}
```

- O catch-all devolve o status original do backend — não reembrulhe a resposta.
- Só crie um route handler específico (ex.: `frontend/src/app/api/exercises/route.ts`)
  quando precisar de lógica extra antes/depois do proxy; o Next prioriza a
  rota específica sobre o catch-all, então não há conflito.

## 3. Contrato com o backend (não quebrar)

- Erro é **sempre** `{ error: string }` (mensagem em pt-BR, já pronta para a
  UI). Status: 400 validação, 401 sessão, 404 não encontrado, 409 conflito.
- Sucesso de DELETE é `{ ok: true }`.
- Criação retorna o objeto criado com status 201.
- Listas são arrays puros; paginação é opt-in via `?take=&skip=`.

## 4. Antes de entregar

1. Nenhum componente client falando direto com `localhost:4000`?
2. Resposta tipada com tipo de `frontend/src/types.ts` (sem `any`)?
3. Erro tratado lendo `.error` do body, exibido com os padrões da UI?
4. `npx tsc --noEmit` (dentro de `frontend/`) passa?
