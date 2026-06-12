"use client";

import { SpecTag } from "./Spec";
import { useReveal } from "@/hooks/useReveal";

interface Step {
  index: string;
  name: string;
  description: string;
}

const STEPS: readonly Step[] = [
  {
    index: "01",
    name: "Listen",
    description: "Interviews, support logs and analytics before any pixel. The brief is written with the team, not for it.",
  },
  {
    index: "02",
    name: "Map",
    description: "Flows and information architecture on one shared canvas, so every screen has a reason to exist.",
  },
  {
    index: "03",
    name: "Prototype",
    description: "High-fidelity, in the real stack when possible. If engineers can click it, the handoff is half done.",
  },
  {
    index: "04",
    name: "Measure",
    description: "Ship behind a flag, instrument the flow, compare against the baseline. Design survives inspection.",
  },
] as const;

export function Process() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="relative mx-auto max-w-6xl px-6 py-28">
      <SpecTag className="right-6 top-10 hidden sm:block">grid · 4 cols · gap 32</SpecTag>

      <h2
        data-reveal
        className="mb-12 font-pfmono text-xs uppercase tracking-[0.2em] text-pf-muted"
      >
        How a project runs
      </h2>

      <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <li
            key={step.index}
            data-reveal
            className="rounded-lg border border-pf-ink/10 bg-pf-panel p-6"
          >
            <span className="font-pfmono text-xs text-pf-red">{step.index}</span>
            <h3 className="mt-3 font-display text-2xl font-bold">{step.name}</h3>
            <p className="mt-3 text-sm leading-relaxed text-pf-muted">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
