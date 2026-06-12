import Link from "next/link";
import { RevealSection } from "./RevealSection";

interface Audience {
  name: string;
  blurb: string;
  meta: string;
  highlight: string;
}

const AUDIENCES: readonly Audience[] = [
  {
    name: "Alunos",
    blurb: "Pratique com material real e acompanhe cada passo do aprendizado.",
    meta: "autodidatas · vestibular · fluência",
    highlight: "XP e streaks diários",
  },
  {
    name: "Professores",
    blurb: "Atribua PDFs, corrija com feedback e acompanhe a evolução de cada aluno.",
    meta: "turmas · correção com feedback",
    highlight: "relatórios por aluno",
  },
  {
    name: "Empresas",
    blurb: "Capacite times em inglês de negócios com resultado medível.",
    meta: "T&D · business english",
    highlight: "progresso mensurável",
  },
  {
    name: "Devs & Tech",
    blurb: "Inglês técnico para início de carreira, diretamente em documentação real.",
    meta: "docs · entrevistas · carreira",
    highlight: "vocabulário de verdade",
  },
] as const;

export function Audiences() {
  return (
    <RevealSection id="para-quem" className="mx-auto max-w-6xl px-6 py-28">
      <h2
        data-reveal
        className="mb-4 font-pfmono text-xs uppercase tracking-[0.2em] text-slate-500"
      >
        Feito para
      </h2>
      <p
        data-reveal
        className="mb-12 font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl"
      >
        Uma plataforma, quatro jornadas.
      </p>

      <ul className="divide-y divide-slate-900/10 border-y border-slate-900/10">
        {AUDIENCES.map((audience) => (
          <li key={audience.name} data-reveal>
            <Link
              href="/register"
              className="group flex flex-col gap-3 py-10 transition-colors hover:bg-white sm:flex-row sm:items-baseline sm:gap-16 sm:px-4"
            >
              <span className="font-display text-4xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-brand sm:w-1/3 sm:text-5xl">
                {audience.name}
              </span>

              <span className="flex-1 text-base text-slate-500">{audience.blurb}</span>

              <span className="flex flex-col gap-0.5 text-left font-pfmono text-xs text-slate-500 sm:items-end sm:text-right">
                <span>{audience.meta}</span>
                <span className="text-slate-900">{audience.highlight}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </RevealSection>
  );
}
