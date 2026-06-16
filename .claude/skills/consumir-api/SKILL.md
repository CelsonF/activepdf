---
name: consumir-api
description: >
  Passo a passo para consumir o back-end do Grifo (activepdf) a partir do
  front-end — que agora são server functions do TanStack Start chamadas direto
  (não há mais Hono na porta 4000, nem proxy /api/*, nem fetch relativo). Use
  sempre que a tarefa for buscar ou enviar dados numa rota/componente: carregar
  lista, submeter formulário, tratar loading (skeleton) e ler o erro no contrato
  { error }. Cobre tanto a chamada direta quanto o wrapper em TanStack Query.
---

# Consumir server functions (Grifo — TanStack Start)

> **Não existe mais API HTTP separada.** Sem Hono na porta 4000, sem catch-all
> `/api/[...path]`, sem `serverFetch`/`proxyRequest`, sem `fetch("/api/...")`
> relativo. O back-end são **server functions** (`createServerFn`) em
> `web_v2/src/lib/api/*.functions.ts`: você as **importa e chama direto** —
> o TanStack Start cuida do transporte (a função roda no servidor, mesmo chamada
> de um componente do cliente).

## 1. Chamar uma server function

Importe e chame. Input vai dentro de `{ data: ... }`; sem input, chame sem args:

```tsx
import { listDocuments, createDocument } from "@/lib/api/documents.functions";

// leitura (GET) — sem input
const docs = await listDocuments();

// mutação (POST) — input no campo `data`
const novo = await createDocument({ data: { title, pdfName, pdfData } });
```

O retorno já é o objeto/array tipado que a `.handler` devolveu — sem
`res.json()`, sem checar `res.ok`.

## 2. Tratar erro — contrato `{ error }`

A server function **lança uma `Response`** em caso de erro (401/404/409…). No
cliente isso vira uma exceção: capture com `try/catch` e leia o corpo `{ error }`:

```tsx
try {
  await createDocument({ data: payload });
} catch (e) {
  // a Response lançada chega como erro; o corpo é { error: string } em pt-BR
  const message =
    e instanceof Response ? (await e.json()).error : "Erro inesperado";
  setError(message);
}
```

- Erro é **sempre** `{ error: string }` (mensagem pt-BR, pronta para a UI).
- Status: 400 validação, 401 sessão, 404 não encontrado, 409 conflito.
- Sucesso de deleção é `{ ok: true }`; listas são arrays puros; create devolve o
  objeto criado.

## 3. Loading = skeleton (regra do projeto)

Estado assíncrono **nunca** usa spinner bloqueante. Use `<Skeleton>` de
`@/components/ui/skeleton` com a **geometria real** do conteúdo. No editor
(`tool.tsx`) o skeleton **sobrepõe** o canvas (`absolute inset-0`) — nunca
substitui o `canvasRef` (ele precisa ficar montado):

```tsx
<div className="relative">
  <canvas ref={canvasRef} />
  {pdfLoading && (
    <div className="absolute inset-0">
      <PdfSkeleton />
    </div>
  )}
</div>
```

## 4. Padrão direto com `useState`/`useEffect`

É o padrão hoje exercido no código (o editor persiste em `localStorage`; quando
for ler do servidor, o shape é este):

```tsx
const [docs, setDocs] = useState<Awaited<ReturnType<typeof listDocuments>> | null>(null);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  listDocuments()
    .then(setDocs)
    .catch(async (e) =>
      setError(e instanceof Response ? (await e.json()).error : "Erro inesperado"),
    );
}, []);

if (error) return <ErrorState message={error} />;
if (!docs) return <ListSkeleton />;   // skeleton, não spinner
return <DocList docs={docs} />;
```

## 5. Wrapper opcional em TanStack Query

O `QueryClient` já é provido em `web_v2/src/router.tsx`/`__root.tsx`, então você
pode embrulhar a server function em `useQuery`/`useMutation` quando quiser cache,
revalidação ou estados prontos. (Nenhuma rota faz isso hoje — adote quando a tela
precisar de cache/refetch, não por padrão.)

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listDocuments, deleteDocument } from "@/lib/api/documents.functions";

function useDocuments() {
  return useQuery({ queryKey: ["documents"], queryFn: () => listDocuments() });
}

function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocument({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
  });
}
```

- `queryFn`/`mutationFn` apenas chamam a server function — não recrie fetch.
- O `isPending`/`isLoading` do hook controla o **skeleton** (não spinner).
- O `error` do hook é a `Response` lançada — leia `.error` do corpo como na §2.

## 6. Rota só de cliente (editor)

O editor de PDF é browser-only: a rota declara `ssr: false`
(`createFileRoute("/tool")({ ssr: false, ... })`). Documentos anônimos persistem
em `localStorage` (`grifo:tool:docs`); só os de conta logada passam pelas server
functions de `documents.functions.ts`.

## 7. Antes de entregar

1. Nenhum `fetch("/api/...")`, nenhum `serverFetch`/`proxyRequest`, nenhuma URL de
   `localhost:4000` — só import + chamada da server function?
2. Input passado como `{ data: ... }`; retorno usado direto (sem `res.json()`)?
3. Erro lido do corpo `{ error }` da `Response` e exibido nos padrões da UI?
4. Loading com **skeleton** espelhando a geometria real (sem spinner bloqueante)?
5. `npx tsc --noEmit` (dentro de `web_v2/`) passa, sem `any`?
