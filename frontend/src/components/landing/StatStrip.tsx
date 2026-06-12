import { RevealSection } from "./RevealSection";

interface Stat {
  name: string;
  value: string;
}

const STATS: readonly Stat[] = [
  { name: "exercícios", value: "sobre a própria página" },
  { name: "correção", value: "feedback do professor" },
  { name: "xp", value: "+20 por exercício" },
  { name: "streaks", value: "dias seguidos" },
  { name: "ranking", value: "entre alunos" },
  { name: "idiomas", value: "PT · EN" },
  { name: "ocr", value: "PDFs escaneados" },
  { name: "lgpd", value: "conforme" },
] as const;

export function StatStrip() {
  return (
    <RevealSection id="plataforma" className="border-y border-slate-900/10 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p
          data-reveal
          className="mb-5 font-pfmono text-xs uppercase tracking-[0.2em] text-slate-500"
        >
          Por dentro da plataforma
        </p>
        <ul data-reveal className="flex flex-wrap gap-2">
          {STATS.map((stat) => (
            <li
              key={stat.name}
              className="flex items-center gap-2 rounded-md border border-slate-900/10 px-3 py-1.5 font-pfmono text-xs"
            >
              <span className="text-slate-500">{stat.name}:</span>
              <span className="text-slate-900">{stat.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </RevealSection>
  );
}
