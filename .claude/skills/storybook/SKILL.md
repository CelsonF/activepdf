---
name: storybook
description: >
  Configura o Storybook no Grifo (activepdf) — TanStack Start + Vite 7 + React 19
  + Tailwind v4 + shadcn/ui — e escreve stories para os primitivos do design
  system. Use quando a tarefa for instalar o Storybook, criar uma nova story,
  documentar variantes de um primitivo de components/ui, ou manter o catálogo de
  componentes atualizado.
---

# Storybook — Grifo Design System (Vite + shadcn)

O Storybook documenta e isola os componentes do design system num catálogo
interativo. **Todo primitivo em `web_v2/src/components/ui/` pode ter uma story.**

> O projeto é **Vite**, não Next.js — o builder do Storybook é
> **`@storybook/react-vite`** (não `@storybook/nextjs`). Tudo roda dentro de
> `web_v2/`.

---

## 1. Setup (primeira vez)

Execute dentro de `web_v2/`:

```bash
npx storybook@latest init --builder vite
```

O comando detecta React + Vite e instala o framework
`@storybook/react-vite`, `@storybook/addon-essentials` e
`@storybook/addon-interactions`.

### 1.1 Integrar Tailwind v4 + tokens

Edite `.storybook/preview.ts` para importar o CSS global (que já traz o
`@import "tailwindcss"` e todos os tokens `@theme`):

```ts
// .storybook/preview.ts
import type { Preview } from "@storybook/react";
import "../src/styles.css"; // ← design system Grifo + Tailwind v4

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "paper",
      values: [
        { name: "paper", value: "oklch(0.98 0.006 75)" }, // bg-background (off-white)
        { name: "surface", value: "oklch(1 0 0)" },        // bg-surface (branco)
        { name: "ink", value: "oklch(0.2 0.012 55)" },     // bg-ink (preto quente)
      ],
    },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
  },
};

export default preview;
```

### 1.2 Resolver imports `@/`

O projeto resolve `@/` via `vite-tsconfig-paths`. Garanta que o plugin esteja no
Vite do Storybook em `.storybook/main.ts`:

```ts
import type { StorybookConfig } from "@storybook/react-vite";
import tsconfigPaths from "vite-tsconfig-paths";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-interactions"],
  framework: { name: "@storybook/react-vite", options: {} },
  viteFinal: async (cfg) => {
    cfg.plugins = [...(cfg.plugins ?? []), tsconfigPaths()];
    return cfg;
  },
};

export default config;
```

### 1.3 Scripts úteis

```json
// package.json (web_v2/)
"storybook": "storybook dev -p 6006",
"build-storybook": "storybook build"
```

---

## 2. Onde criar stories

```
web_v2/src/components/
  ui/
    button.stories.tsx     ← história do primitivo shadcn
    badge.stories.tsx
    ...
  language-switcher.stories.tsx   ← componente de domínio (opcional)
```

Convenção: **story ao lado do componente**, mesmo diretório.

---

## 3. Estrutura de uma story (template)

```tsx
// src/components/ui/button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "UI / Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "Label", disabled: false },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost", "link", "destructive"],
    },
    size: { control: "select", options: ["default", "sm", "lg", "icon"] },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {};
export const Outline: Story = { args: { variant: "outline" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Destructive: Story = { args: { variant: "destructive" } };
export const Disabled: Story = { args: { disabled: true } };

// CTA contornado oficial (ink-bordered)
export const InkBordered: Story = {
  args: { variant: "outline", className: "border-2 border-ink bg-surface text-ink" },
};
```

Use os nomes **reais** de `variant`/`size` do `buttonVariants` (`cva` em
`button.tsx`) — não invente variantes (`primary`/`md` não existem; o carmim é o
`default`).

---

## 4. Convenções deste projeto

### Títulos no sidebar
```
UI / Button
UI / Badge
UI / Card
UI / Skeleton
```

### Tags
- `"autodocs"` em todo primitivo de `components/ui/` — gera a tabela de props.
- Componente de domínio: stories manuais, sem `autodocs` obrigatório.

### Decorators para contexto

```tsx
export const WithPadding: Story = {
  decorators: [(Story) => <div className="bg-background p-8"><Story /></div>],
};
```

> Componente que usa `<Link>`/hooks do `@tanstack/react-router` precisa de um
> provider de router no decorator, ou isole o pedaço puramente visual na story.

### Não mocke o design system
As classes e tokens vêm de `styles.css` (importado no `preview.ts`). Não copie
estilo inline na story — o componente deve aparecer com o visual real do app.

---

## 5. Story de tokens (catálogo de cor)

`web_v2/src/components/ui/design-tokens.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";

function Swatch({ name, cls }: { name: string; cls: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`h-12 w-12 rounded-lg border border-border ${cls}`} />
      <span className="font-mono text-[10px] text-muted-foreground">{name}</span>
    </div>
  );
}

function TokenPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <section>
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Marca
        </h2>
        <div className="flex gap-4">
          <Swatch name="primary" cls="bg-primary" />
          <Swatch name="ink" cls="bg-ink" />
          <Swatch name="background" cls="bg-background" />
          <Swatch name="accent" cls="bg-accent" />
        </div>
      </section>
      <section>
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Canetas
        </h2>
        <div className="flex gap-4">
          <Swatch name="pen-red" cls="bg-pen-red" />
          <Swatch name="pen-blue" cls="bg-pen-blue" />
          <Swatch name="pen-green" cls="bg-pen-green" />
          <Swatch name="pen-orange" cls="bg-pen-orange" />
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

Dentro de `web_v2/`:

```bash
npm run storybook        # http://localhost:6006
npm run build-storybook  # build estático (CI / deploy)
```

Após criar uma story, confirme:
- Tokens carregados (cores carmim/pen-* corretas — Tailwind ativo).
- Painel `Controls` reflete `variant`/`size` reais do `cva`.
- Autodocs gerou a tabela de props.

---

## 7. Checklist ao adicionar uma story

- [ ] Arquivo `nome-do-componente.stories.tsx`, mesmo diretório do componente.
- [ ] `title` no padrão `"Seção / Nome"` (ex.: `"UI / Badge"`).
- [ ] `tags: ["autodocs"]` (primitivos).
- [ ] Uma story por variante **real** do `cva` (sem inventar variante inexistente).
- [ ] Sem `style={{}}` de cor na story — só classes/tokens.
- [ ] `npm run storybook` sobe sem erro de console.
