"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Upload, ArrowRight, CheckCircle } from "@phosphor-icons/react";

const HANDLES = [
  "-left-1 -top-1",
  "-right-1 -top-1",
  "-left-1 -bottom-1",
  "-right-1 -bottom-1",
] as const;

const GUARANTEES = ["Sem cartão de crédito", "Bilíngue PT / EN", "Conforme a LGPD"] as const;

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

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
      className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-6 pb-16 pt-32"
    >
      <p
        data-hero-eyebrow
        className="mb-8 font-pfmono text-xs uppercase tracking-[0.2em] text-slate-500"
      >
        Grifo — Aprendizado nativo em PDF · PT / EN
      </p>

      <div ref={boxRef} data-hero-frame className="relative w-fit max-w-full">
        {/* Caixa de seleção do editor: a headline emoldurada como um campo sobre o PDF */}
        <div aria-hidden className="pointer-events-none absolute -inset-3 border-2 border-brand sm:-inset-5">
          {HANDLES.map((pos) => (
            <span key={pos} className={`absolute ${pos} h-2 w-2 border-2 border-brand bg-white`} />
          ))}
          <span className="absolute -bottom-7 right-0 rounded-sm bg-brand px-1.5 py-0.5 font-pfmono text-[11px] font-medium leading-none text-white">
            {size.w} × {size.h}
          </span>
        </div>

        <h1 className="font-display text-[clamp(2.75rem,7.5vw,6rem)] font-extrabold leading-[0.95] tracking-tight text-slate-900">
          <span data-hero-line className="block">
            Qualquer PDF vira
          </span>
          <span data-hero-line className="block">
            prática que <span className="ui-marker">engaja.</span>
          </span>
        </h1>
      </div>

      <p data-hero-sub className="mt-12 max-w-xl text-lg leading-relaxed text-slate-500">
        Suba sua apostila, responda exercícios sobre a própria página e mantenha o ritmo com XP,
        streaks e rankings — para alunos, professores e times.
      </p>

      <div data-hero-cta className="mt-10 flex flex-wrap items-center gap-4">
        <Link href="/register" className="ui-btn ui-btn-primary ui-btn-lg gap-2 font-pfmono">
          <Upload size={16} weight="bold" /> Começar grátis
        </Link>
        <Link href="/dashboard" className="ui-btn ui-btn-ghost ui-btn-lg gap-2 font-pfmono">
          Ver o dashboard <ArrowRight size={15} />
        </Link>
      </div>

      <div data-hero-cta className="mt-8 flex flex-wrap gap-5 font-pfmono text-xs text-slate-500">
        {GUARANTEES.map((item) => (
          <span key={item} className="flex items-center gap-1.5">
            <CheckCircle size={14} weight="fill" className="text-emerald-500" /> {item}
          </span>
        ))}
      </div>
    </section>
  );
}
