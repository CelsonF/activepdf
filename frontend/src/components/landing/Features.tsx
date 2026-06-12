import { RevealSection } from "./RevealSection";

interface Feature {
  index: string;
  title: string;
  description: string;
}

const FEATURES: readonly Feature[] = [
  {
    index: "01",
    title: "Carregue",
    description:
      "Apostilas, exercícios, artigos — transforme o material que você já usa em prática interativa, direto no navegador.",
  },
  {
    index: "02",
    title: "Responda",
    description:
      "Campos de resposta e questões sobre a própria página do PDF. O exercício acontece no contexto real.",
  },
  {
    index: "03",
    title: "Evolua",
    description:
      "XP, níveis, streaks e conquistas trazem o aluno de volta todo dia — sem sair do material.",
  },
  {
    index: "04",
    title: "Acompanhe",
    description:
      "Pontuações, conquistas e rankings visíveis para o aluno e para o professor.",
  },
] as const;

export function Features() {
  return (
    <RevealSection id="recursos" className="mx-auto max-w-6xl px-6 py-28">
      <h2
        data-reveal
        className="mb-4 font-pfmono text-xs uppercase tracking-[0.2em] text-slate-500"
      >
        Como funciona
      </h2>
      <p
        data-reveal
        className="mb-12 font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl"
      >
        Seu material. Ativado.
      </p>

      <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <li
            key={feature.index}
            data-reveal
            className="rounded-lg border border-slate-900/10 bg-white p-6"
          >
            <span className="font-pfmono text-xs text-brand">{feature.index}</span>
            <h3 className="mt-3 font-display text-2xl font-bold text-slate-900">
              {feature.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">{feature.description}</p>
          </li>
        ))}
      </ol>
    </RevealSection>
  );
}
