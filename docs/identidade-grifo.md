# Grifo — Identidade de Marca

> Definida em 12/jun/2026 (Sprint 1). Direção: **Folha & Caneta** — papelaria
> técnica. O nome vem do traço de marca-texto (*grifar*) que é a assinatura
> visual da marca. Tagline: **"Marque, pratique, aprenda."**

## Conceito

O Grifo transforma qualquer PDF em exercício interativo. A identidade vem do
mundo real da sala de aula: a folha, a caneta azul de quem responde, a caneta
vermelha de quem corrige e o marca-texto de quem estuda. **As cores não são
decoração — são semântica de sala de aula.**

## Paleta

| Token | Hex | Papel na interface |
|---|---|---|
| `paper` | `#F7F7F5` | Fundo de página (papel) |
| `ink` | `#16181D` | Texto principal (tinta) |
| `ink-soft` | `#4A4F57` | Texto secundário |
| `ink-muted` | `#8B9097` | Placeholder, legendas |
| `line` | `#E5E5E1` | Bordas padrão (pauta do papel) |
| `pen` | `#0B5FFF` | **Ação primária** — caneta azul: botões, links, campos do PDF |
| `pen-dark` | `#0A4ED6` | Hover da primária |
| `pen-light` | `#EBF1FF` | Fundos ativos/selecionados |
| `correction` | `#DE2B1F` | **SÓ correção e erro** — a caneta vermelha do professor |
| `marker` | `#FFD64D` | **Grifo de marca-texto** — XP, streak, destaque da marca |
| `marker-light` | `#FFF6D6` | Fundo suave de gamificação |

Regras inegociáveis:
1. **Uma cor de ação por tela: `pen`.** O azul é de quem faz.
2. **`correction` nunca decora.** Quando o vermelho aparece, é professor
   corrigindo ou erro de verdade (estado destrutivo/inválido).
3. **`marker` é a marca.** Aparece no grifo do logo, em XP/conquistas e em UMA
   palavra-chave grifada por tela de marketing — nunca como cor de botão comum.
4. Neutros vêm de `ink`/`line`/`paper` (a escala `slate` legada será migrada na
   varredura da Sprint 6).

## Tipografia

| Papel | Fonte | Uso |
|---|---|---|
| Display | **Bricolage Grotesque** | Títulos, números de destaque, wordmark (`font-display`) |
| Texto | **Instrument Sans** | UI e corpo (`font-sans`, padrão) |
| Mono | **Spline Sans Mono** | XP, scores, contadores, nomes de arquivo (`font-mono`) |

Números de dados (XP, notas, contagens) sempre em mono — herdado da regra
existente do projeto, agora com fonte oficial.

## Assinatura visual

O **grifo de marca-texto**: um traço amarelo (`marker`) atrás de palavra-chave,
como caderno marcado. Implementado como `.ui-marker` (gradiente de fundo nos
55–92% da altura da linha). Usar com extrema parcimônia: wordmark, herói do
marketing e momentos de gamificação. O resto da interface é quieto: papel,
tinta e pauta.

Elementos derivados:
- **Carimbo** (`.ui-badge` v2): status com cara de carimbo — caixa alta,
  espaçamento de letra, canto pouco arredondado.
- **Lacuna**: campos sobre o PDF desenhados como lacuna de prova (traço azul).

## Logo

Wordmark "Grifo" em Bricolage Grotesque com grifo amarelo atravessando
(`.ui-marker`). Marca reduzida: bloco de tinta com ícone `Highlighter`
(Phosphor) em amarelo. Componente: `frontend/src/components/ui/Logo.tsx`.

## Voz

- pt-BR, direta, de professor bom: explica sem rodeio, encoraja sem exagero.
- Verbos no imperativo nos CTAs ("Envie um PDF", "Corrigir agora").
- Vocabulário da escola: folha, atividade, correção, nota, turma — não
  "documento", "task", "review".
- Erros dizem o que houve e como resolver; telas vazias convidam à ação.

## Aplicação por contexto

| Contexto | Tratamento |
|---|---|
| Marketing (capa/preços) | Display grande, grifo na palavra-chave do herói, papel + tinta, demonstração viva do editor |
| App do professor | Quieto e denso: pen para ações, carimbos de status, correction só no fluxo de corrigir |
| App do aluno | Mesma base + marker na gamificação (XP, streak, conquistas) |
