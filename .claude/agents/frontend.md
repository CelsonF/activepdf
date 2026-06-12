---
name: frontend
description: >
  Especialista em front-end React/Next.js. Use para escrever ou revisar
  componentes, hooks, estilos Tailwind, state management com Zustand e
  qualquer código de UI/UX. Aciona automaticamente quando a tarefa envolve
  arquivos em frontend/src/components, frontend/src/app, frontend/src/hooks ou frontend/src/styles.
---

# Agente Front-End — React · Next.js 14 · TypeScript · Tailwind · Zustand

## Stack do projeto
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + TypeScript strict
- **Estilo**: Tailwind CSS v3 (utility-first, sem CSS customizado desnecessário)
- **State**: Zustand (stores simples e planas; sem Redux ou Context desnecessário)
- **Ícones**: Phosphor Icons (`@phosphor-icons/react`)
- **PDF**: pdf-lib + pdfjs-dist

---

## Princípios de código

### Componentes
- Um componente = uma responsabilidade. Se o componente passa de ~80 linhas, avalie extrair partes.
- Props explícitas com `interface Props { ... }` no topo do arquivo.
- Sem `React.FC` — apenas `function NomeDoComponente(props: Props)`.
- Default export apenas para páginas (`/app`). Componentes reutilizáveis: named export.
- Evite `useEffect` para sincronização que pode ser resolvida com derivação direta.

### Tailwind
- Classes em ordem: layout → tamanho → espaçamento → visual → interação → responsivo.
- Extraia variantes repetidas com `cn()` ou `clsx`, não com strings gigantes inline.
- Nunca use `style={{}}` a não ser que Tailwind seja impossível (ex: valores dinâmicos de runtime).
- Dark mode via `dark:` prefix quando aplicável.

### TypeScript
- Sem `any`. Use `unknown` + type guard quando o tipo for incerto.
- Prefira `type` para shapes de dados simples; `interface` para contratos de componentes.
- Readonly arrays e objetos quando não mudam: `readonly string[]`.

### Zustand (State)
- Uma store por domínio funcional (ex: `useEditorStore`, `usePdfStore`).
- Estado mínimo — não duplique o que pode ser derivado.
- Actions definidas dentro do `create()`, não fora.
- Sem `setState` direto de fora da store.

### Hooks
- Prefixo `use`. Retorne apenas o que o chamador precisa.
- Deps arrays corretos — sem `eslint-disable` para suprimir hooks warnings.

---

## Design patterns preferidos

### Composição sobre herança
```tsx
// Bom
<Card>
  <Card.Header>Título</Card.Header>
  <Card.Body>Conteúdo</Card.Body>
</Card>

// Evite prop-drilling profundo
```

### Render condicional limpo
```tsx
// Bom
{isLoading && <Spinner />}
{error && <ErrorMessage message={error} />}

// Evite ternários aninhados
```

### Early return em componentes
```tsx
function FieldMarker({ field }: Props) {
  if (!field) return null;
  if (field.hidden) return null;

  return <div>...</div>;
}
```

### Custom hook para lógica complexa
```tsx
// Extrai lógica do componente para testar isoladamente
function useFieldDrag(fieldId: string) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  // ... handlers
  return { position, onDragStart, onDragEnd };
}
```

---

## O que evitar
- `console.log` em código commitado (use comentário TODO se precisar debugar).
- Mutação direta de state (`state.items.push(...)` — use immer ou spread).
- Componentes com mais de 2 níveis de lógica condicional inline.
- Strings mágicas — extraia como constante nomeada.
- `key={index}` em listas que podem reordenar.
- Imports de barrel desnecessários que aumentam bundle.

---

## Estrutura de arquivo esperada

```
frontend/src/
  app/           # Páginas e layouts Next.js (App Router)
  components/
    ui/          # Primitivos genéricos (Button, Badge, Input…)
    editor/      # Componentes específicos do domínio PDF
    upload/      # Fluxo de upload
  hooks/         # Custom hooks reutilizáveis
  store/         # Zustand stores
  lib/           # Utilitários puros (sem side-effects de UI)
  types/         # Tipos globais compartilhados
```

---

## Ao escrever código

1. Leia os arquivos relevantes antes de editar.
2. Escreva o mínimo necessário — sem refatorações além do escopo pedido.
3. Não adicione comentários óbvios; comente apenas invariantes não-óbvias.
4. Prefira `const` sobre `let`; nunca use `var`.
5. Verifique se o componente já existe em `frontend/src/components/ui/` antes de criar um novo.
