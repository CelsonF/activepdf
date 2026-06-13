import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import {
  ArrowRight,
  Upload,
  Highlighter,
  CheckCircle2,
  FileText,
  PenLine,
  Download,
  ShieldCheck,
  Zap,
  Layers,
  GraduationCap,
  X,
  Check,
  Lock,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getDict, localePath, type Locale } from "@/lib/i18n";
import { PaperScene } from "@/components/landing/paper-scene";

// Cast helper: localePath builds a valid registered route, but Link's `to`
// is a literal union and can't be narrowed from a runtime string.
const asRoute = (p: string) => p as never;

export function LandingPage({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  useGsapReveals();
  return (
    <div className="flex min-h-screen flex-col bg-highlight/40 text-ink">
      <Nav locale={locale} t={t} />
      <main className="flex-1">
        <Hero locale={locale} t={t} />
        <Differentiators t={t} />
        <Features t={t} />
        <Compare t={t} />
        <Privacy t={t} />
        <FinalCta locale={locale} t={t} />
      </main>
      <Footer t={t} />
    </div>
  );
}

function useGsapReveals() {
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    (async () => {
      const gsapMod = await import("gsap");
      const stMod = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      const gsap = gsapMod.default ?? gsapMod;
      const ScrollTrigger = stMod.ScrollTrigger ?? stMod.default;
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            y: 36,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-stagger] > *").forEach((el, i) => {
          gsap.from(el, {
            y: 28,
            opacity: 0,
            duration: 0.7,
            delay: i * 0.06,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        });

        const hero = document.querySelector<HTMLElement>("[data-hero-title]");
        if (hero) {
          gsap.from(hero, { y: 60, opacity: 0, duration: 1, ease: "power3.out" });
        }
      });

      cleanup = () => ctx.revert();
    })();
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);
}

function Logo({ locale }: { locale: Locale }) {
  return (
    <Link to={asRoute(localePath(locale, "/"))} className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-highlight">
        <Highlighter className="h-5 w-5" />
      </span>
      <span className="relative text-lg font-bold tracking-tight">
        <span className="relative z-10 px-1">Grifo</span>
        <span className="absolute inset-x-0 bottom-0.5 h-2.5 bg-highlight" aria-hidden />
      </span>
    </Link>
  );
}

function Nav({ locale, t }: { locale: Locale; t: ReturnType<typeof getDict> }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-8 py-5">
      <Logo locale={locale} />
      <nav className="hidden items-center gap-8 md:flex">
        <a href={`${localePath(locale, "/")}#recursos`} className="text-sm font-medium text-ink/70 transition-colors hover:text-ink">
          {t.nav.features}
        </a>
        <Link to="/tool" className="text-sm font-medium text-ink/70 transition-colors hover:text-ink">
          {t.nav.editor}
        </Link>
      </nav>
      <div className="flex items-center gap-2">
        <LanguageSwitcher current={locale} page="/" />
        <Link to="/tool" className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-highlight transition-transform hover:scale-[1.02]">
          {t.nav.openEditor} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}

function Hero({ locale, t }: { locale: Locale; t: ReturnType<typeof getDict> }) {
  return (
    <section className="relative overflow-hidden px-8 pb-20 pt-12 md:px-14 md:pt-16">
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div data-hero-title>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{t.hero.eyebrow}</p>
          <h1 className="font-display mt-8 text-[clamp(2.6rem,7vw,6rem)] text-ink">
            {t.hero.titleLine1}<br />
            {t.hero.titleLine2} <span className="text-highlight-mark">{t.hero.titleHighlight}</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-muted-foreground">{t.hero.description}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/tool" className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-base font-semibold text-highlight shadow-lg shadow-ink/20 transition-transform hover:scale-[1.02]">
              <Upload className="h-5 w-5" /> {t.hero.ctaPrimary}
            </Link>
            <Link to="/tool" className="inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-highlight px-6 py-3.5 text-base font-semibold text-ink transition-transform hover:scale-[1.02]">
              {t.hero.ctaSecondary} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-foreground/80">
            {t.hero.bullets.map((b) => (
              <li key={b} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" style={{ color: "var(--color-pen-green)" }} /> {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative h-[360px] w-full md:h-[460px] lg:h-[520px]">
          <div className="absolute inset-0 rounded-3xl border border-border bg-gradient-to-br from-card to-highlight/30 shadow-xl shadow-ink/10" />
          <PaperScene />
          <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl bg-ink/85 px-4 py-2 text-xs font-mono text-highlight backdrop-blur">
            <span className="flex items-center gap-2"><Lock className="h-3.5 w-3.5" /> 0 KB enviados</span>
            <span>render local · WebGL</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Differentiators({ t }: { t: ReturnType<typeof getDict> }) {
  const icons = [ShieldCheck, Layers, Zap, GraduationCap];
  const colors = ["var(--color-pen-blue)", "var(--color-pen-red)", "var(--color-pen-orange)", "var(--color-pen-green)"];
  return (
    <section className="border-t border-border bg-background">
      <div className="px-8 py-20 md:px-14">
        <div data-reveal className="max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t.diff.eyebrow}</p>
          <h2 className="font-display mt-3 text-4xl md:text-5xl text-ink">{t.diff.heading}</h2>
          <p className="mt-5 text-lg text-muted-foreground">{t.diff.sub}</p>
        </div>
        <div data-stagger className="mt-12 grid gap-4 md:grid-cols-2">
          {t.diff.pillars.map((p, i) => {
            const Icon = icons[i] ?? ShieldCheck;
            return (
              <article key={p.title} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl text-white" style={{ backgroundColor: colors[i] }}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{p.metric}</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold leading-tight">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                <div
                  className="pointer-events-none absolute inset-x-0 -bottom-px h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  style={{ backgroundColor: colors[i] }}
                  aria-hidden
                />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Features({ t }: { t: ReturnType<typeof getDict> }) {
  const icons = [FileText, PenLine, Download];
  const colors = ["var(--color-pen-blue)", "var(--color-pen-red)", "var(--color-pen-green)"];
  return (
    <section id="recursos" className="border-t border-border bg-card">
      <div className="px-8 py-20 md:px-14">
        <div data-reveal>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t.features.eyebrow}</p>
          <h2 className="font-display mt-3 text-4xl md:text-5xl text-ink">{t.features.heading}</h2>
        </div>
        <div data-stagger className="mt-10 grid gap-4 md:grid-cols-3">
          {t.features.items.map((item, i) => {
            const Icon = icons[i];
            return (
              <article key={item.title} className="rounded-2xl border border-border bg-background p-6 transition-shadow hover:shadow-lg">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: colors[i] }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold leading-tight">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Compare({ t }: { t: ReturnType<typeof getDict> }) {
  return (
    <section className="border-t border-border bg-background">
      <div className="px-8 py-20 md:px-14">
        <div data-reveal className="max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t.compare.eyebrow}</p>
          <h2 className="font-display mt-3 text-4xl md:text-5xl text-ink">{t.compare.heading}</h2>
          <p className="mt-5 text-lg text-muted-foreground">{t.compare.sub}</p>
        </div>
        <div data-reveal className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid grid-cols-[1.4fr_1fr_1fr] items-center border-b border-border bg-ink px-6 py-4 text-xs font-mono uppercase tracking-[0.15em] text-highlight">
            <span>—</span>
            <span className="flex items-center gap-2"><Highlighter className="h-4 w-4" /> {t.compare.columns.grifo}</span>
            <span className="text-highlight/70">{t.compare.columns.others}</span>
          </div>
          {t.compare.rows.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-[1.4fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm ${i % 2 ? "bg-background/50" : ""}`}
            >
              <span className="font-medium text-ink">{row.feature}</span>
              <span className="flex items-center gap-2 text-ink">
                <Check className="h-4 w-4" style={{ color: "var(--color-pen-green)" }} />
                {row.grifo}
              </span>
              <span className="flex items-center gap-2 text-muted-foreground">
                <X className="h-4 w-4 text-destructive" />
                {row.others}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Privacy({ t }: { t: ReturnType<typeof getDict> }) {
  return (
    <section className="border-t border-border bg-ink text-highlight">
      <div className="grid gap-10 px-8 py-20 md:px-14 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div data-reveal>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-highlight/60">{t.privacy.eyebrow}</p>
          <h2 className="font-display mt-3 text-4xl md:text-5xl">
            {t.privacy.heading}
          </h2>
          <p className="mt-6 max-w-xl text-base text-highlight/80">{t.privacy.desc}</p>
          <Link to="/tool" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-highlight px-6 py-3.5 text-base font-semibold text-ink transition-transform hover:scale-[1.02]">
            <Lock className="h-5 w-5" /> {t.privacy.cta}
          </Link>
        </div>
        <ul data-stagger className="grid gap-3">
          {t.privacy.points.map((p) => (
            <li key={p} className="flex items-start gap-3 rounded-xl border border-highlight/15 bg-highlight/5 px-5 py-4 text-sm">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-highlight" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FinalCta({ locale, t }: { locale: Locale; t: ReturnType<typeof getDict> }) {
  return (
    <section className="border-t border-border bg-highlight/40">
      <div data-reveal className="px-8 py-20 text-center md:px-14">
        <h2 className="font-display mx-auto max-w-3xl text-4xl md:text-6xl text-ink">{t.finalCta.heading}</h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">{t.finalCta.sub}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/tool" className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-base font-semibold text-highlight shadow-lg shadow-ink/20 transition-transform hover:scale-[1.02]">
            <Upload className="h-5 w-5" /> {t.finalCta.primary}
          </Link>
          <Link to="/tool" className="inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-card px-6 py-3.5 text-base font-semibold text-ink transition-transform hover:scale-[1.02]">
            {t.finalCta.secondary} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer({ t }: { t: ReturnType<typeof getDict> }) {
  return (
    <footer className="border-t border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-6 text-sm text-muted-foreground">
        <span className="font-bold text-ink">Grifo</span>
        <p>© {new Date().getFullYear()} Grifo. {t.footer}</p>
      </div>
    </footer>
  );
}