"use client";

import { useReveal } from "./useReveal";

interface Token {
  name: string;
  value: string;
  swatch?: string;
}

/** Os tokens REAIS desta página — a faixa documenta o próprio artefato. */
const TOKENS: readonly Token[] = [
  { name: "--pf-canvas", value: "#ECEDEF", swatch: "bg-pf-canvas" },
  { name: "--pf-ink", value: "#131417", swatch: "bg-pf-ink" },
  { name: "--pf-blue", value: "#0D63FF", swatch: "bg-pf-blue" },
  { name: "--pf-red", value: "#E5261F", swatch: "bg-pf-red" },
  { name: "--font-display", value: "Bricolage Grotesque" },
  { name: "--font-body", value: "Inter" },
  { name: "--font-spec", value: "JetBrains Mono" },
  { name: "--baseline", value: "8px" },
] as const;

export function TokenStrip() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="border-y border-pf-ink/10 bg-pf-panel">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p data-reveal className="mb-5 font-pfmono text-xs uppercase tracking-[0.2em] text-pf-muted">
          This page&apos;s own tokens
        </p>
        <ul data-reveal className="flex flex-wrap gap-2">
          {TOKENS.map((token) => (
            <li
              key={token.name}
              className="flex items-center gap-2 rounded-md border border-pf-ink/10 px-3 py-1.5 font-pfmono text-xs"
            >
              {token.swatch && (
                <span className={`h-3 w-3 rounded-sm border border-pf-ink/20 ${token.swatch}`} />
              )}
              <span className="text-pf-muted">{token.name}:</span>
              <span className="text-pf-ink">{token.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
