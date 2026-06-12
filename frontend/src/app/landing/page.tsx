import { LandingHeader } from "@/components/landing/LandingHeader";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Audiences } from "@/components/landing/Audiences";
import { StatStrip } from "@/components/landing/StatStrip";
import { CtaSection } from "@/components/landing/CtaSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

const TRUST_BRANDS = ["LinguaLab", "CodeAcademy BR", "EduPrime", "TechFluent", "Nova Idiomas"] as const;

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-100 font-sans text-slate-900 antialiased">
      <LandingHeader />
      <Hero />

      <section className="border-y border-slate-900/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <span className="font-pfmono text-xs uppercase tracking-[0.2em] text-slate-500">
            Usado por escolas e times
          </span>
          <div className="flex flex-wrap items-center gap-8 opacity-60">
            {TRUST_BRANDS.map((brand) => (
              <span key={brand} className="font-display text-sm font-bold tracking-tight text-slate-600">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Features />
      <StatStrip />
      <Audiences />
      <CtaSection />
      <LandingFooter />
    </main>
  );
}
