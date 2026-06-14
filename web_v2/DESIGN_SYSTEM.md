# Grifo — Design System & Frontend Guide

A complete reference for replicating the Grifo frontend in another project.
Covers the framework stack, CSS tokens, color palette, typography, components
and the layout patterns used on each page (Landing, Dashboard, Tool/Editor).

---

## 1. Tech Stack

| Layer            | Choice                                             |
| ---------------- | -------------------------------------------------- |
| Framework        | **TanStack Start v1** (React 19 + SSR, file-based routing in `src/routes/`) |
| Bundler          | **Vite 7** via `@lovable.dev/vite-tanstack-config` |
| Styling          | **Tailwind CSS v4** (CSS-first, no `tailwind.config.js`) |
| UI primitives    | **shadcn/ui** (`new-york` style, Radix under the hood) in `src/components/ui/*` |
| Icons            | **lucide-react**                                   |
| Data layer       | **TanStack Query** wired into router context       |
| Utils            | `clsx` + `tailwind-merge` exposed as `cn()` in `src/lib/utils.ts` |
| PDF runtime      | `pdfjs-dist` (render) + `pdf-lib` (export)         |
| Type system      | TypeScript strict                                  |

### Folder layout that matters
```
src/
  routes/            # file-based routes (TanStack)
    __root.tsx       # html shell, fonts, global meta
    index.tsx        # Landing
    dashboard.tsx    # Dashboard
    tool.tsx         # PDF editor
  components/ui/     # shadcn primitives (Button, Skeleton, ...)
  lib/utils.ts       # cn() helper
  styles.css         # ENTIRE design system lives here
```

### Tailwind v4 rules to keep
- Entry is `@import "tailwindcss";` — no `@tailwind base/components/utilities`.
- No `tailwind.config.js`. Tokens go in `@theme` inside `src/styles.css`.
- shadcn tokens use `@theme inline` so utilities inline the `var(--x)` value.
- Fonts are loaded via `<link>` in `__root.tsx`, then referenced as
  `--font-sans`, `--font-display`, `--font-mono`.
- Custom utilities use `@utility name { ... }`, never `@layer utilities`.
- Custom variants use `@custom-variant`.

---

## 2. Design Language

**Concept:** *"the editor is the cover"* — an editorial document aesthetic with a
PDF/paperwork identity. Warm off-white paper canvas, near-black ink, a deep
**crimson** accent (the brand "grifo"/highlighter mark) for emphasis, and four
ballpoint-pen accents (red / blue / green / orange) for category cues.

- Bold display typography (Archivo Black) for hero headlines.
- Heavy rounded corners (`rounded-xl` / `rounded-2xl`).
- 2px ink borders on premium cards (`border-2 border-ink`).
- Hover micro-interactions: `hover:scale-[1.02]` on CTAs, `hover:shadow-lg` on cards.
- Monospace mini-labels in all caps (`font-mono text-[10px] uppercase tracking-[0.2em]`).
- The brand mark = word "Grifo" with a crimson highlighter mark behind it
  (`.text-highlight-mark`, cream text on crimson).

---

## 3. Color Tokens (`src/styles.css`)

All colors are **oklch**. Semantic tokens are defined on `:root` (and `.dark`),
then mapped to Tailwind utilities via `@theme inline`.

### Semantic palette — light

| Token                      | oklch value                  | Tailwind class examples                |
| -------------------------- | ---------------------------- | -------------------------------------- |
| `--background`             | `oklch(0.98 0.006 75)` (warm off-white) | `bg-background`             |
| `--surface`                | `oklch(1 0 0)`               | `bg-surface`                           |
| `--foreground` / `--ink`   | `oklch(0.2 0.012 55)` (warm near-black) | `text-foreground`, `bg-ink`, `text-ink`|
| `--card`                   | `oklch(1 0 0)`               | `bg-card`                              |
| `--primary`                | `oklch(0.47 0.18 21)` (deep crimson) | `bg-primary`                  |
| `--primary-foreground`     | `oklch(0.98 0.006 75)` (cream) | `text-primary-foreground`            |
| `--secondary` / `--muted`  | `oklch(0.96 0.008 60)`       | `bg-secondary`, `bg-muted`             |
| `--muted-foreground`       | `oklch(0.46 0.02 40)`        | `text-muted-foreground`                |
| `--accent`                 | `oklch(0.95 0.025 25)` (faint crimson tint) | `bg-accent`             |
| `--border` / `--input`     | `oklch(0.9 0.008 60)`        | `border-border`, `border-input`        |
| `--ring`                   | `oklch(0.47 0.18 21)`        | `ring-ring`                            |
| `--destructive`            | `oklch(0.55 0.22 25)`        | `bg-destructive`                       |

### Brand palette

| Token            | Purpose                                | oklch                  |
| ---------------- | -------------------------------------- | ---------------------- |
| `--highlight`    | Crimson brand accent / highlighter mark | `oklch(0.47 0.18 21)`  |
| `--highlight-foreground` | Cream text on highlight/crimson | `oklch(0.98 0.006 75)` |
| `--ink`          | Warm near-black, primary text          | `oklch(0.2 0.012 55)`  |

> `--highlight` and `--primary` are the same crimson — the brand pop doubles as
> the highlighter mark. CTAs are crimson-filled with cream text (not red-on-black).

### School-pen accents (categorical)

| Token           | Use                            | oklch                  |
| --------------- | ------------------------------ | ---------------------- |
| `--pen-red`     | Errors, alerts, "red pen" tag  | `oklch(0.55 0.2 25)`   |
| `--pen-blue`    | Math / info category           | `oklch(0.52 0.16 245)` |
| `--pen-green`   | Success, free, recommended     | `oklch(0.6 0.15 150)`  |
| `--pen-orange`  | Highlights, warnings           | `oklch(0.7 0.16 55)`   |

Use them either as Tailwind tokens (`bg-pen-blue`) or as inline style
`style={{ backgroundColor: "var(--color-pen-blue)" }}` when looping over data.

### Radius scale
`--radius: 0.75rem` is the base. Tailwind exposes `rounded-sm/md/lg/xl/2xl/3xl/4xl`
computed from it (e.g. `--radius-2xl = calc(var(--radius) + 8px)`).

---

## 4. Typography

Fonts loaded in `src/routes/__root.tsx` via Google Fonts:
`Inter` (400-700), `Archivo Black`, `JetBrains Mono` (400-500).

| Token            | Family                          | Use                                  |
| ---------------- | ------------------------------- | ------------------------------------ |
| `--font-sans`    | Inter                           | Default body, UI                     |
| `--font-display` | Archivo Black                   | Hero H1/H2 (`.font-display`)         |
| `--font-mono`    | JetBrains Mono                  | Eyebrow labels, badges, keyboard hints |

`.font-display` ships extra rules: `letter-spacing: -0.03em; line-height: 0.95`.
Hero headline pattern:
```tsx
<h1 className="font-display text-[clamp(3rem,8vw,7rem)] text-ink">
  Qualquer PDF vira<br />
  prática que <span className="text-highlight-mark">engaja.</span>
</h1>
```
The `.text-highlight-mark` utility paints a fake highlighter behind text using
`background-color` + symmetric `box-shadow`.

Body defaults: `font-feature-settings: "ss01", "cv11"` on `body`.

### Type scale used in the app

| Role          | Classes                                                       |
| ------------- | ------------------------------------------------------------- |
| Hero          | `font-display text-[clamp(3rem,8vw,7rem)]`                    |
| Section H2    | `font-display text-4xl md:text-5xl`                           |
| Page title    | `text-lg sm:text-xl font-bold`                                |
| Card title    | `text-base font-semibold leading-tight`                       |
| Body          | `text-sm` / `text-base`, `text-muted-foreground` for support  |
| Eyebrow label | `font-mono text-[10px] uppercase tracking-[0.2em]`            |
| Keyboard      | `<kbd class="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>` |

---

## 5. Core Components

### Logo (reused on every page)
```tsx
<Link to="/" className="flex items-center gap-2.5">
  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
    <Highlighter className="h-5 w-5" />
  </span>
  <span className="relative text-lg font-bold tracking-tight">
    <span className="relative z-10 px-1 text-highlight-mark">Grifo</span>
  </span>
</Link>
```

### Primary CTA (crimson filled)
```tsx
<Link to="/tool" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02]">
  <Upload className="h-5 w-5" /> Enviar um PDF agora
</Link>
```

### Secondary CTA (ink-bordered on surface)
```tsx
<Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-surface px-6 py-3.5 text-base font-semibold text-ink transition-transform hover:scale-[1.02]">
  Abrir o editor <ArrowRight className="h-4 w-4" />
</Link>
```

### Card
```tsx
<article className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-lg">...</article>
```

### Eyebrow + section title
```tsx
<p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Como funciona</p>
<h2 className="font-display mt-3 text-4xl md:text-5xl text-ink">Três passos. Zero atrito.</h2>
```

### Skeleton (loading state — used everywhere instead of spinners)
`src/components/ui/skeleton.tsx`:
```tsx
<div className="animate-pulse rounded-md bg-primary/10" />
```
Rule of thumb: build a skeleton component that mirrors the real card geometry
(same wrapper, same heights). Never block the UI with a centered spinner.

### Icon chip
```tsx
<span className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
      style={{ backgroundColor: "var(--color-pen-blue)" }}>
  <Icon className="h-5 w-5" />
</span>
```

### Avatar / initials
```tsx
<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-mono text-sm font-bold">BS</div>
```

---

## 6. Page Blueprints

### 6.1 Landing — `src/routes/index.tsx`

Single-column scroll page with a sticky-feeling nav, hero, and feature grid.

```
+-- Nav (Logo - links - CTAs) ---------------------------------------------+
| Hero                                                                     |
|  - eyebrow (font-mono uppercase)                                         |
|  - giant H1 with text-highlight-mark accent word                         |
|  - paragraph (max-w-2xl, muted)                                          |
|  - two CTAs (primary crimson, secondary ink-bordered)                    |
|  - checklist row (CheckCircle2 + pen-green)                              |
+--------------------------------------------------------------------------+
| Features (3 cards - grid md:grid-cols-3)                                 |
|  each card: pen-color icon chip + h3 + muted desc                        |
+--------------------------------------------------------------------------+
| Footer (logo + copyright, bg-card)                                       |
+--------------------------------------------------------------------------+
```
Shell: `flex min-h-screen flex-col bg-background text-ink` (warm off-white)
while `<main>` scrolls.

### 6.2 Dashboard — `src/routes/dashboard.tsx`

Full-screen 3-column app shell (responsive: stacks on mobile, 2-col on lg,
3-col on xl).

```
+-- Sidebar 260px ----+-- Main 1fr -------------+-- Details 340px ----+
| Logo                | Topbar (title - search  | ProfileCard         |
| Menu                |  - bell - avatar)       | StreakCard          |
| active item:        | ContinueSection (cards) | StatsCard           |
|  bg-primary         | RecommendedSection      | "Soltar novo PDF"   |
|  text-primary-fg    |                         |  CTA                |
| UpgradeCard         |                         |                     |
+---------------------+-------------------------+---------------------+
```

Key patterns:
- Outer wrapper: `h-screen w-screen bg-background`.
- Grid: `grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_340px]`.
- Active menu item uses crimson fill (`bg-primary text-primary-foreground`); badges use `bg-[var(--color-pen-red)]`.
- Progress bars: `h-2 rounded-full bg-secondary` with inner `div` colored by the card's `pen-*` token.
- Cards inside Details panel nest a `bg-background` outer + `bg-card` inner for a layered feel.
- All async lists have matching skeletons (`ContinueCardSkeleton`, `RecommendedCardSkeleton`, `ProfileCardSkeleton`, ...).

### 6.3 Tool / Editor — `src/routes/tool.tsx`

Full-screen PDF workspace. Set `ssr: false` on the route because pdf.js is
browser-only.

```
+-- Left rail --+----- Canvas area (bg-muted) -----+-- Right panel --+
| Tools         | +-- PDF canvas (white) -------+  | Properties      |
| (text, check, | |  rendered page              |  |  - label        |
|  date, number)| |  field boxes (abs overlay)  |  |  - value        |
| Document list | +-----------------------------+  |  - font size    |
|               | Zoom toolbar ( - 100% + )       | Notes (rich txt) |
|               | Page nav (prev - n/total - nxt) | Export buttons   |
+---------------+---------------------------------+------------------+
```

Notes for replication:
- Canvas wrapper is `relative` so field overlays can absolutely position with
  normalized 0..1 coordinates x current rendered page size.
- Loading state: `PdfSkeleton` overlays the canvas (`absolute inset-0`) instead
  of replacing it — keeps `canvasRef.current` mounted so pdf.js can draw.
- Zoom controls: `setScale(s => clamp(0.3, 3, s +/- 0.1))`, label shows `Math.round(scale*100)%`.
- Per-field `fontSize` is stored on the model and applied both in the live
  input (`style={{ fontSize }}`) and during PDF/Image export.
- Persisted to `localStorage` under key `grifo:tool:docs`.

---

## 7. Conventions / Do's & Don'ts

**Do**
- Use semantic tokens (`bg-card`, `text-muted-foreground`) — never raw colors.
- Compose class strings with `cn()` from `src/lib/utils.ts`.
- Use lucide-react icons sized via `className="h-4 w-4"` (not the `size` prop, for consistency).
- Use skeletons for any async UI; never use blocking spinners.
- Keep CTAs to two shapes: crimson-filled (`bg-primary text-primary-foreground`) or ink-bordered on surface.

**Don't**
- Don't introduce `tailwind.config.js` (Tailwind v4).
- Don't create new color literals in JSX — extend `@theme` first.
- Don't import from `react-router-dom`; use `@tanstack/react-router`.
- Don't put routes in `src/pages/`; TanStack Start uses `src/routes/`.
- Don't replace the canvas during loading — overlay a skeleton instead.

---

## 8. Quick Start in a new project

1. Scaffold a TanStack Start template (`tanstack_start_ts`).
2. Replace `src/styles.css` with the Grifo file (tokens + fonts + `.text-highlight-mark`).
3. Copy `src/components/ui/skeleton.tsx`, `button.tsx`, and `src/lib/utils.ts`.
4. Add the Google Fonts `<link>` in `src/routes/__root.tsx`.
5. Recreate the Logo + CTA snippets above as shared components.
6. Build pages following the blueprints in section 6.

You now have the same brand, palette, typography and layout language as Grifo.
