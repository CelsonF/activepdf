# Grifo — Identidade de Marca

> v2 — revisada em 12/jun/2026 junto com a decisão de migrar o front-end para
> TanStack Start. Direção: **caderno escolar** ("o editor é a capa"). O nome
> vem do traço de marca-texto (*grifar*) que é a assinatura visual da marca.
> Tagline: **"Marque, pratique, aprenda."**
>
> A referência técnica completa (tokens oklch, tipografia, componentes e
> blueprints de página) é **`docs/design-system-grifo.md`** — este arquivo
> guarda o conceito, a semântica das cores e a voz.

## Conceito

O Grifo transforma qualquer PDF em exercício interativo. A identidade vem do
mundo real da sala de aula: papel cinza-azulado de caderno, tinta navy de quem
escreve, o marca-texto amarelo de quem estuda e as canetas coloridas que
categorizam. **As cores não são decoração — são semântica de sala de aula.**

## Paleta (resumo semântico)

Valores oficiais em oklch no `docs/design-system-grifo.md` §3.

| Token | Papel na interface |
|---|---|
| `background` / `surface` / `card` | Papel: fundo de página, superfícies, cartões |
| `ink` | Tinta navy quase preta — texto principal e fundo do CTA primário |
| `highlight` | **O grifo amarelo da marca** — destaque de hero, CTA secundário, moldura `bg-highlight/40` das telas |
| `muted` / `muted-foreground` / `border` | Neutros de apoio e pauta |
| `primary` | Azul elétrico — foco/ring e elementos interativos do sistema |
| `pen-red` | Erros, alertas, tag "caneta vermelha" |
| `pen-blue` | Categoria informativa / matérias exatas |
| `pen-green` | Sucesso, grátis, recomendado |
| `pen-orange` | Destaques e avisos |

Regras inegociáveis:
1. **CTAs têm só duas formas**: tinta (fundo `ink`, texto `highlight`) ou
   marca-texto (fundo `highlight`, borda 2px `ink`, texto `ink`).
2. **`pen-*` é categórico, não decorativo** — cada caneta tem um significado
   fixo (erro, info, sucesso, aviso/categoria).
3. **Nenhum literal de cor em JSX** — cor nova nasce no `@theme` do
   `styles.css` antes de aparecer em componente.
4. O amarelo `highlight` é a assinatura: emoldura as telas (`bg-highlight/40`),
   sublinha o wordmark e pinta UMA palavra-chave por hero
   (`.text-highlight-mark`).

## Tipografia

| Papel | Fonte | Uso |
|---|---|---|
| Display | **Archivo Black** | Heros e H2 de seção (`font-display`, tracking -0.03em, line-height 0.95) |
| Texto | **Inter** | UI e corpo (`font-sans`, padrão) |
| Mono | **JetBrains Mono** | Eyebrows em caps, badges, teclas, contadores, nomes de arquivo (`font-mono`) |

Números de dados (XP, notas, contagens) sempre em mono. Eyebrow padrão:
`font-mono text-[10px] uppercase tracking-[0.2em]`.

## Assinatura visual

O **grifo de marca-texto**: um traço amarelo atrás de palavra-chave, como
caderno marcado. Implementado como utility `.text-highlight-mark`
(background + box-shadow simétrico). Usos: wordmark, palavra-chave do hero,
momentos de gamificação. O resto da interface é quieto: papel, tinta e pauta.

Elementos derivados:
- **Cantos pesados**: `rounded-xl` / `rounded-2xl` em cartões e CTAs.
- **Borda de tinta**: `border-2 border-ink` marca cartões premium.
- **Chips de caneta**: ícone branco sobre bloco `pen-*` arredondado.
- **Micro-interações**: `hover:scale-[1.02]` em CTA, `hover:shadow-lg` em card.

## Logo

Wordmark "Grifo" em negrito com tarja amarela (`bg-highlight`) atravessando a
base. Marca reduzida: bloco `bg-ink` arredondado com ícone `Highlighter`
(lucide-react) em `text-highlight`. Snippet oficial no
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
| Marketing (capa/preços) | Display gigante, `.text-highlight-mark` na palavra-chave do hero, moldura `bg-highlight/40`, demonstração viva do editor |
| Dashboard | Shell 3 colunas, item ativo do menu invertido (`bg-ink text-highlight`), barras de progresso em `pen-*` |
| Editor (tool) | Workspace quieto: canvas branco sobre `bg-muted`, skeleton sobreposto no loading, lacunas azuis sobre o PDF |
