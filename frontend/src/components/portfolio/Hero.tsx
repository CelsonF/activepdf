"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Cursors } from "./Cursors";
import { SpecTag } from "./Spec";
import { useInspect } from "./inspect";

const HANDLES = [
  "-left-1 -top-1",
  "-right-1 -top-1",
  "-left-1 -bottom-1",
  "-right-1 -bottom-1",
] as const;

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const { toggle } = useInspect();

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: Math.round(width), h: Math.round(height) });
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from("[data-hero-eyebrow]", { y: 16, opacity: 0, duration: 0.5 })
        .from("[data-hero-line]", { y: 56, opacity: 0, duration: 0.8, stagger: 0.12 }, "-=0.2")
        .from("[data-hero-frame]", { scale: 0.96, opacity: 0, duration: 0.5 }, "-=0.5")
        .from("[data-hero-sub]", { y: 20, opacity: 0, duration: 0.6 }, "-=0.3")
        .from("[data-hero-cta]", { y: 14, opacity: 0, duration: 0.5, stagger: 0.08 }, "-=0.35");
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="top"
      className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-center px-6 pb-16 pt-32"
    >
      <Cursors />

      <p
        data-hero-eyebrow
        className="mb-8 font-pfmono text-xs uppercase tracking-[0.2em] text-pf-muted"
      >
        Lina Maré — Product &amp; interface designer · São Paulo
      </p>

      <div ref={boxRef} data-hero-frame className="relative w-fit max-w-full">
        {/* Caixa de seleção de ferramenta de design, com handles e dimensões ao vivo */}
        <div aria-hidden className="pointer-events-none absolute -inset-3 border-2 border-pf-blue sm:-inset-5">
          {HANDLES.map((pos) => (
            <span
              key={pos}
              className={`absolute ${pos} h-2 w-2 border-2 border-pf-blue bg-pf-panel`}
            />
          ))}
          <span className="absolute -bottom-7 right-0 rounded-sm bg-pf-blue px-1.5 py-0.5 font-pfmono text-[11px] font-medium leading-none text-white">
            {size.w} × {size.h}
          </span>
        </div>

        <SpecTag className="-top-9 left-0 hidden sm:block">
          h1 · Bricolage Grotesque 800 · clamp(3rem, 8vw, 6.5rem)
        </SpecTag>

        <h1 className="font-display text-[clamp(3rem,8vw,6.5rem)] font-extrabold leading-[0.95] tracking-tight">
          <span data-hero-line className="block">
            Good design
          </span>
          <span data-hero-line className="block">
            survives <span className="text-pf-blue">inspection.</span>
          </span>
        </h1>
      </div>

      <p data-hero-sub className="mt-12 max-w-xl text-lg leading-relaxed text-pf-muted">
        I design product interfaces that hold up when you zoom in — on the grid, on the
        numbers, on the people using them. This page is built like my work. Open it up.
      </p>

      <div data-hero-cta className="mt-10 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          className="rounded-md bg-pf-ink px-6 py-3 font-pfmono text-sm text-white transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pf-blue"
        >
          Inspect this page
        </button>
        <a
          href="#work"
          className="rounded-md border border-pf-ink/20 px-6 py-3 font-pfmono text-sm text-pf-ink transition-colors hover:border-pf-ink/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pf-blue"
        >
          See selected work ↓
        </a>
      </div>
    </section>
  );
}
