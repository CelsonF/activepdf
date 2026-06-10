---
name: refatorar-design-system
description: >
  Passo a passo para auditar e refatorar qualquer componente ou página existente
  do ActivePDF para ficar 100% alinhado com o design system (classes .ui-*,
  tokens de cor brand/slate, TypeScript strict, cn()). Use quando a tarefa for
  limpar código legado, remover hex solto, substituir style={{}} de cor, ou
  padronizar um componente que foi criado fora das convenções do projeto.
---

# Refatorar Design System — ActivePDF

Use este fluxo sempre que precisar trazer um componente ou página existente para
o padrão do projeto. O objetivo é **zero regressão visual + máxima reutilização
do que já existe em `globals.css` e `src/components/ui/`**.

---

## 1. Auditoria — o que procurar

Antes de editar qualquer coisa, rode os greps abaixo no arquivo alvo:

```bash
# Cores hardcoded
grep -n "style=.*color\|style=.*background\|#[0-9a-fA-F]\{3,6\}" <arquivo>

# className com ternário aninhado (candidato a cn())
grep -n "className={\`\|className={.*?.*:.*}" <arquivo>

# Botão/badge/input sem classe .ui-*
grep -n "<button\|<input\|<select\|<textarea" <arquivo>

# any / React.FC
grep -n ": any\|React\.FC" <arquivo>

# console.log
grep -n "console\.log" <arquivo>

# key={index} em listas
grep -n "key={index\|key={i}" <arquivo>
```

Anote cada violação antes de começar a refatorar.

---

## 2. Ordem de refatoração (não pule etapas)

### 2.1 Substituir cores hardcoded → tokens

| Antes | Depois |
|---|---|
| `style={{ color: '#4f46e5' }}` | `className="text-brand"` |
| `style={{ background: '#eef2ff' }}` | `className="bg-brand-light"` |
| `bg-[#4f46e5]` / `text-[#...]` | token equivalente (veja `referencia-design-system.md`) |
| Hex inventado fora da paleta | **Discuta com o usuário antes de trocar** — pode ser cor de acento de seção |

### 2.2 Substituir elements nativos → classes .ui-*

```tsx
// ❌ antes
<button className="px-4 py-2 bg-indigo-600 text-white rounded-lg ...">
  Salvar
</button>

// ✅ depois
<button className="ui-btn ui-btn-primary ui-btn-md">
  Salvar
</button>
// ou o componente <Button variant="primary" size="md">
```

| Elemento | Substituto |
|---|---|
| `<button>` customizado | `<Button>` de `src/components/ui/` ou `.ui-btn .ui-btn-*` |
| `<span className="badge...">` | `<Badge>` ou `.ui-badge .ui-badge-*` |
| `<input>` sem classe | `.ui-input` |
| Divisor inline | `<Divider />` ou `.ui-divider` |
| Spinner manual | `.ui-spinner` |

### 2.3 Limpar className → cn()

```tsx
// ❌ antes
className={`card ${active ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'} ${disabled ? 'opacity-50' : ''}`}

// ✅ depois
import { cn } from "@/lib/cn";
className={cn(
  "p-4 bg-white rounded-2xl border border-slate-200",
  active && "border-brand bg-brand-light",
  disabled && "opacity-50",
)}
```

### 2.4 Corrigir TypeScript

- Troque `any` por tipo concreto ou `unknown` + type guard.
- Se o componente embrulha um elemento nativo, estenda:
  `interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement>`.
- Remova `React.FC` — use `function Nome(props: Props)`.
- Exponha `className?: string` em todo primitivo e mescle com `cn()`.

### 2.5 Exports

- Componente primitivo reutilizável → `src/components/ui/` + linha em `index.ts`.
- Componente de domínio → pasta do domínio, sem tocar em `index.ts`.
- Página → `default export`, nada mais muda.

---

## 3. O que NÃO mudar

- Lógica de negócio, chamadas de API, estado Zustand — refatoração de estilo
  não toca nisso.
- Animações já funcionando (`animate-fadeUp`, `animate-slideIn`) — só limpe se
  estiverem com `style={{}}`.
- `style={{}}` legítimos: posição de campo sobre o canvas do PDF, dimensões
  calculadas em runtime — **esses ficam**.
- Não extraia sub-componentes além do que o escopo pede.

---

## 4. Sequência para refatorar uma página inteira

1. Rode os greps da seção 1 em todos os arquivos da pasta da página.
2. Crie uma lista priorizada: o que é violação dura (hex, style de cor, any) vs.
   o que é apenas estilo subótimo.
3. Refatore arquivo a arquivo, menor dependência primeiro (primitivos antes de
   páginas que os consomem).
4. Após cada arquivo: `npx tsc --noEmit` — não deixe acumular erro de tipo.
5. Checklist final (seção 5).

---

## 5. Checklist de entrega

- [ ] Zero `style={{color/background/...}}` com cor estática.
- [ ] Zero hex inventado (`#abc123`) fora dos tokens.
- [ ] Botões, badges e inputs usando `.ui-*` ou componente de `ui/`.
- [ ] `cn()` em todo `className` condicional.
- [ ] `any` eliminado; types concretos ou `unknown`.
- [ ] `React.FC` removido.
- [ ] `console.log` removido.
- [ ] `key={index}` substituído por id estável em listas reordenáveis.
- [ ] `npx tsc --noEmit` passa sem erros.
- [ ] Sem regressão visual nas rotas afetadas.

---

> Referência completa de tokens e classes: `referencia-design-system.md`
> (skill `criar-componente`).
