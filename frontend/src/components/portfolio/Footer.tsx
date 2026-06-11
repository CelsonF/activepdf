"use client";

import { SpecTag } from "./Spec";
import { useReveal } from "./useReveal";

export function Footer() {
  const ref = useReveal<HTMLElement>();

  return (
    <footer ref={ref} id="contact" className="relative bg-pf-ink text-pf-canvas">
      <SpecTag className="left-6 top-10 hidden sm:block">footer · inverted · pf-ink</SpecTag>

      <div className="mx-auto max-w-6xl px-6 py-28">
        <p
          data-reveal
          className="mb-6 font-pfmono text-xs uppercase tracking-[0.2em] text-pf-canvas/60"
        >
          Contact
        </p>

        <h2
          data-reveal
          className="max-w-3xl font-display text-[clamp(2.25rem,6vw,4.5rem)] font-extrabold leading-[1.02] tracking-tight"
        >
          Have a product that deserves a closer look?
        </h2>

        <div data-reveal className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href="mailto:hello@linamare.studio"
            className="rounded-md bg-pf-blue px-6 py-3 font-pfmono text-sm text-white transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pf-canvas"
          >
            hello@linamare.studio
          </a>
          <span className="font-pfmono text-xs text-pf-canvas/60">
            Replies within 2 business days
          </span>
        </div>

        <div
          data-reveal
          className="mt-20 flex flex-col gap-2 border-t border-pf-canvas/15 pt-6 font-pfmono text-[11px] text-pf-canvas/50 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>© 2026 Lina Maré — a fictional designer, designed for real.</span>
          <span>Set in Bricolage Grotesque &amp; Inter · Built with Next.js + GSAP</span>
        </div>
      </div>
    </footer>
  );
}
