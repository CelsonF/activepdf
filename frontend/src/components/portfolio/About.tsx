"use client";

import { SpecTag } from "./Spec";
import { useReveal } from "@/hooks/useReveal";

const FACTS = [
  ["Experience", "8 years in product"],
  ["Focus", "Design systems · fintech · tools"],
  ["Works in", "Figma + the real codebase"],
  ["Based in", "São Paulo, BR (UTC−3)"],
] as const;

export function About() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} id="about" className="relative mx-auto max-w-6xl px-6 py-28">
      <SpecTag className="right-6 top-10 hidden sm:block">2 cols · 1fr 1fr · gap 64</SpecTag>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2
            data-reveal
            className="mb-6 font-pfmono text-xs uppercase tracking-[0.2em] text-pf-muted"
          >
            About
          </h2>
          <p data-reveal className="font-display text-3xl font-bold leading-tight sm:text-4xl">
            I joined design through engineering — and never stopped opening the inspector.
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:pt-12">
          <p data-reveal className="text-lg leading-relaxed text-pf-muted">
            For eight years I&apos;ve designed interfaces for products where mistakes are
            expensive: payments, navigation, infrastructure. My work is opinionated about
            systems — tokens before screens, flows before features — because that&apos;s
            what makes a product feel inevitable instead of assembled.
          </p>
          <dl data-reveal className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {FACTS.map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5 border-t border-pf-ink/10 pt-3">
                <dt className="font-pfmono text-[11px] uppercase tracking-wider text-pf-muted">
                  {label}
                </dt>
                <dd className="text-sm text-pf-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
