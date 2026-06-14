# Grifo — Identidade de Marca

> v3 — 13/jun/2026: **rebrand de paleta** para **carmim profundo + off-white**
> (identidade editorial de documento/PDF); o amarelo saiu. A direção "o editor é
> a capa" e o conceito de marca-texto (*grifar*) permanecem — agora o grifo é
> **carmim**. Tagline: **"Marque, pratique, aprenda."**
>
> A referência técnica completa (tokens oklch, tipografia, componentes e
> blueprints de página) é **`docs/design-system-grifo.md`** — este arquivo
> guarda o conceito, a semântica das cores e a voz.

## Conceito

O Grifo transforma qualquer PDF em exercício interativo. A identidade é
editorial e de documento: papel off-white quente, tinta quase-preta de quem
escreve, o **grifo carmim** que destaca e as canetas coloridas que categorizam.
**As cores não são decoração — são semântica de sala de aula.**

## Paleta (resumo semântico)

Valores oficiais em oklch no `docs/design-system-grifo.md` §3.

| Token | Papel na interface |
|---|---|
| `background` / `surface` / `card` | Papel: fundo de página, superfícies, cartões |
| `ink` | Tinta quente quase preta — texto principal e borda dos cartões |
| `highlight` / `primary` | **O grifo carmim da marca** (mesma cor) — CTA primário, destaque de hero, marca-texto, item ativo |
| `muted` / `muted-foreground` / `border` | Neutros de apoio e pauta |
| `accent` | Tom carmim bem leve — bandas/realces sutis de seção |
| `pen-red` | Erros, alertas, tag "caneta vermelha" |
| `pen-blue` | Categoria informativa / matérias exatas |
| `pen-green` | Sucesso, grátis, recomendado |
| `pen-orange` | Destaques e avisos |

Regras inegociáveis:
1. **CTAs têm só duas formas**: carmim preenchido (fundo `primary`, texto
   `primary-foreground` creme) ou contornado (borda 2px `ink`, fundo `surface`,
   texto `ink`). Nunca texto carmim sobre fundo escuro (contraste ruim).
2. **`pen-*` é categórico, não decorativo** — cada caneta tem um significado
   fixo (erro, info, sucesso, aviso/categoria).
3. **Nenhum literal de cor em JSX** — cor nova nasce no `@theme` do
   `styles.css` antes de aparecer em componente.
4. O carmim `highlight` é a assinatura: marca o wordmark e pinta UMA
   palavra-chave por hero (`.text-highlight-mark`, palavra creme sobre carmim).
   Usado com parcimônia — o fundo das telas é o off-white `background`.

## Tipografia

| Papel | Fonte | Uso |
|---|---|---|
| Display | **Archivo Black** | Heros e H2 de seção (`font-display`, tracking -0.03em, line-height 0.95) |
| Texto | **Inter** | UI e corpo (`font-sans`, padrão) |
| Mono | **JetBrains Mono** | Eyebrows em caps, badges, teclas, contadores, nomes de arquivo (`font-mono`) |

Números de dados (XP, notas, contagens) sempre em mono. Eyebrow padrão:
`font-mono text-[10px] uppercase tracking-[0.2em]`.

## Assinatura visual

O **grifo de marca-texto**: um traço carmim atrás de palavra-chave (texto em
creme), como documento marcado. Implementado como utility `.text-highlight-mark`
(color + background + box-shadow simétrico). Usos: wordmark, palavra-chave do
hero, momentos de gamificação. O resto da interface é quieto: papel, tinta e pauta.

Elementos derivados:
- **Cantos pesados**: `rounded-xl` / `rounded-2xl` em cartões e CTAs.
- **Borda de tinta**: `border-2 border-ink` marca cartões premium.
- **Chips de caneta**: ícone branco sobre bloco `pen-*` arredondado.
- **Micro-interações**: `hover:scale-[1.02]` em CTA, `hover:shadow-lg` em card.

## Logo

Wordmark "Grifo" em negrito com marca-texto carmim (`.text-highlight-mark`).
Marca reduzida: bloco `bg-primary` arredondado com ícone `Highlighter`
(lucide-react) em `text-primary-foreground`. Snippet oficial no
`docs/design-system-grifo.md` §5.

## Voz

- pt-BR, direta, de professor bom: explica sem rodeio, encoraja sem exagero.
- Verbos no imperativo nos CTAs ("Envie um PDF", "Corrigir agora").
- Vocabulário da escola: folha, atividade, correção, nota, turma — não
  "documento", "task", "review".
- Erros dizem o que houve e como resolver; telas vazias convidam à ação.

## Aplicação por contexto

| Contexto | Tratamento |
|---|---|
| Marketing (capa/preços) | Display gigante, `.text-highlight-mark` na palavra-chave do hero, fundo off-white `bg-background`, demonstração viva do editor |
| Dashboard | Shell 3 colunas, item ativo do menu em carmim (`bg-primary text-primary-foreground`), barras de progresso em `pen-*` |
| Editor (tool) | Workspace quieto: canvas branco sobre `bg-muted`, skeleton sobreposto no loading, lacunas azuis sobre o PDF |
