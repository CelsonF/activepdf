"use client";

import { SpecGap, SpecTag } from "./Spec";
import { useReveal } from "./useReveal";

interface Project {
  name: string;
  blurb: string;
  role: string;
  year: string;
  metric: string;
}

const PROJECTS: readonly Project[] = [
  {
    name: "Pleno",
    blurb: "Checkout for a payments platform",
    role: "Lead product designer",
    year: "2025",
    metric: "+18% conversion",
  },
  {
    name: "Sonar",
    blurb: "Analytics dashboard for podcast studios",
    role: "Design systems & UI",
    year: "2024",
    metric: "11 squads on one system",
  },
  {
    name: "Faro",
    blurb: "Turn-by-turn navigation for cyclists",
    role: "End-to-end product design",
    year: "2024",
    metric: "4.8★ on both stores",
  },
  {
    name: "Lume",
    blurb: "Smart-home controls people actually use",
    role: "Interaction design",
    year: "2023",
    metric: "−40% support tickets",
  },
] as const;

export function WorkList() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} id="work" className="relative mx-auto max-w-6xl px-6 py-28">
      <SpecTag className="right-6 top-10 hidden sm:block">section · py-112</SpecTag>

      <h2
        data-reveal
        className="mb-4 font-pfmono text-xs uppercase tracking-[0.2em] text-pf-muted"
      >
        Selected work
      </h2>

      <ul className="divide-y divide-pf-ink/10 border-y border-pf-ink/10">
        {PROJECTS.map((project) => (
          <li key={project.name} data-reveal>
            <a
              href="#contact"
              className="group relative flex flex-col gap-3 py-10 transition-colors hover:bg-pf-panel sm:flex-row sm:items-baseline sm:gap-16 sm:px-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pf-blue"
            >
              <SpecGap value="64" hover className="left-[34%] top-1/2 hidden w-16 sm:flex" />

              <span className="font-display text-4xl font-bold tracking-tight transition-colors group-hover:text-pf-blue sm:w-1/3 sm:text-5xl">
                {project.name}
              </span>

              <span className="flex-1 text-base text-pf-muted">{project.blurb}</span>

              <span className="flex flex-col gap-0.5 text-left font-pfmono text-xs text-pf-muted sm:items-end sm:text-right">
                <span>
                  {project.year} · {project.role}
                </span>
                <span className="text-pf-ink">{project.metric}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p data-reveal className="mt-6 font-pfmono text-xs text-pf-muted">
        Case studies under NDA — full walkthroughs available on a call.
      </p>
    </section>
  );
}
