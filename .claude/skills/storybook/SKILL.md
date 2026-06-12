---
name: storybook
description: >
  Configura o Storybook no projeto ActivePDF (Next.js 14 + Tailwind + TypeScript)
  e escreve stories para os componentes do design system. Use quando a tarefa
  for instalar o Storybook, criar uma nova story, documentar variantes de um
  primitivo (.ui-*), ou manter o catálogo de componentes atualizado.
---

# Storybook — ActivePDF Design System

O Storybook documenta e isola os componentes do design system em um catálogo
interativo. **Todo primitivo em `frontend/src/components/ui/` deve ter uma story.**

---

## 1. Setup (primeira vez)

Execute dentro de `frontend/`:

```bash
npx storybook@latest init --type nextjs
```

O comando detecta Next.js automaticamente e instala:
- `@storybook/nextjs`
- `@storybook/addon-essentials`
- `@storybook/addon-interactions`

### 1.1 Integrar Tailwind

Edite `.storybook/preview.ts` para importar o CSS global:

```ts
// .storybook/preview.ts
import type { Preview } from "@storybook/react";
import "../src/app/globals.css"; // ← design system + Tailwind

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#f8fafc" },   // bg-slate-50 (padrão do app)
        { name: "white", value: "#ffffff" },
        { name: "dark",  value: "#0f172a" },
      ],
    },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
  },
};

export default preview;
```

### 1.2 Resolver imports `@/`

Adicione ao `.storybook/main.ts`:

```ts
import path from "path";
import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: { name: "@storybook/nextjs", options: {} },
  webpackFinal: async (config) => {
    config.resolve!.alias = {
      ...config.resolve!.alias,
      "@": path.resolve(__dirname, "../src"),
    };
    return config;
  },
};

export default config;
```

### 1.3 Scripts úteis

```json
// package.json
"storybook": "storybook dev -p 6006",
"build-storybook": "storybook build"
```

---

## 2. Onde criar stories

```
frontend/src/
  components/
    ui/
      Button.stories.tsx      ← história do primitivo
      Badge.stories.tsx
      ...
    editor/
      Toolbar.stories.tsx     ← história de componente de domínio (opcional)
```

Convenção: **story ao lado do componente**, mesmo diretório.

---

## 3. Estrutura de uma story (template)

```tsx
// src/components/ui/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI / Button",           // seção / componente no sidebar
  component: Button,
  tags: ["autodocs"],             // gera docs automáticos
  args: {
    children: "Label",
    disabled: false,
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "outline", "danger", "success"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Story mínima — herda args do meta
export const Default: Story = {};

// Stories explícitas por variante
export const Primary: Story   = { args: { variant: "primary",   size: "md" } };
export const Secondary: Story = { args: { variant: "secondary", size: "md" } };
export const Ghost: Story     = { args: { variant: "ghost",     size: "md" } };
export const Danger: Story    = { args: { variant: "danger",    size: "md" } };
export const Disabled: Story  = { args: { variant: "primary",   disabled: true } };
```

---

## 4. Convenções deste projeto

### Títulos no sidebar
```
UI / Button
UI / Badge
UI / Header
UI / AsideMenu
UI / StatCard
Editor / Toolbar
Editor / FieldsPanel
```

### Tags obrigatórias
- `"autodocs"` em todo primitivo de `frontend/src/components/ui/` — gera docs automáticos.
- Sem tags em componentes de domínio — só stories manuais.

### Decorators para contexto
Se o componente precisa de padding ou de um provider (ex.: Zustand):

```tsx
// story isolada com padding
export const WithPadding: Story = {
  decorators: [(Story) => <div className="p-8 bg-slate-50"><Story /></div>],
};
```

### Não mocke o design system
As classes `.ui-*` vêm de `globals.css` — importado em `preview.ts`. Não copie
estilos inline na story; o componente deve estar com a aparência real do app.

---

## 5. Stories para o catálogo de design tokens

Crie `frontend/src/components/ui/DesignTokens.stories.tsx` para documentar a paleta:

```tsx
import type { Meta, StoryObj } from "@storybook/react";

function Swatch({ name, cls }: { name: string; cls: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-12 h-12 rounded-lg border border-slate-200 ${cls}`} />
      <span className="text-xs text-slate-500">{name}</span>
    </div>
  );
}

function TokenPage() {
  return (
    <div className="p-8 flex flex-col gap-8">
      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Brand</h2>
        <div className="flex gap-4">
          <Swatch name="brand"       cls="bg-brand" />
          <Swatch name="brand-dark"  cls="bg-brand-dark" />
          <Swatch name="brand-light" cls="bg-brand-light border-brand" />
        </div>
      </section>
      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Neutros (slate)</h2>
        <div className="flex gap-4">
          {[50,100,200,300,400,500,600,700,800,900].map(n => (
            <Swatch key={n} name={`slate-${n}`} cls={`bg-slate-${n}`} />
          ))}
        </div>
      </section>
    </div>
  );
}

const meta: Meta = { title: "Design System / Tokens", tags: ["autodocs"] };
export default meta;
export const Palette: StoryObj = { render: () => <TokenPage /> };
```

---

## 6. Rodar e verificar

Execute dentro de `frontend/`:

```bash
npm run storybook        # abre em http://localhost:6006
npm run build-storybook  # build estático (CI / deploy)
```

Após criar uma story, confirme que:
- As classes `.ui-*` aparecem com o visual correto (Tailwind carregado).
- Os controles do painel `Controls` refletem todas as props/variantes.
- O Autodocs gerou a tabela de props corretamente.

---

## 7. Checklist ao adicionar uma nova story

- [ ] Arquivo: `NomeDoComponente.stories.tsx`, mesmo diretório do componente.
- [ ] `title` segue o padrão `"Seção / Nome"` (ex.: `"UI / Badge"`).
- [ ] `tags: ["autodocs"]` presente (primitivos).
- [ ] Uma story por variante relevante (sem inventar variantes que não existem).
- [ ] Sem `style={{}}` nas stories — use classes Tailwind.
- [ ] `npm run storybook` passa sem erro de console.
