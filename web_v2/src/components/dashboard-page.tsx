import {
  LayoutGrid, BookOpen, Trophy, Network, GraduationCap, Award, MessageSquare, Settings,
  Search, Bell, Highlighter, ArrowRight, Clock, BookMarked, Flame, Target,
  ChevronLeft, ChevronRight, Info, Star, PenLine, FileText, Upload,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getDict, localePath, type Locale } from "@/lib/i18n";

type T = ReturnType<typeof getDict>;
const asRoute = (p: string) => p as never;

export function DashboardPage({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  return (
    <div className="min-h-screen w-full bg-highlight/40 lg:h-screen lg:overflow-hidden">
      <div className="grid w-full grid-cols-1 gap-0 bg-background lg:h-full lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_340px]">
        <Sidebar locale={locale} t={t} />
        <Main locale={locale} t={t} />
        <Details t={t} />
      </div>
    </div>
  );
}

function Logo({ locale }: { locale: Locale }) {
  return (
    <Link to={asRoute(localePath(locale, "/"))} className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-highlight">
        <Highlighter className="h-5 w-5" />
      </span>
      <span className="relative text-xl font-bold tracking-tight">
        <span className="relative z-10 px-1">Grifo</span>
        <span className="absolute inset-x-0 bottom-1 h-2.5 bg-highlight" aria-hidden />
      </span>
    </Link>
  );
}

function Sidebar({ locale, t }: { locale: Locale; t: T }) {
  const m = t.dashboard.menu;
  const menu = [
    { icon: LayoutGrid, label: m.overview, active: true },
    { icon: BookOpen, label: m.classes },
    { icon: Trophy, label: m.ranking },
    { icon: Network, label: m.skillMap },
    { icon: GraduationCap, label: m.courses },
    { icon: Award, label: m.certificates },
    { icon: MessageSquare, label: m.messages, badge: 5 },
    { icon: Settings, label: m.settings },
  ];
  return (
    <aside className="sticky top-0 z-20 flex flex-col gap-4 border-b border-border bg-card p-4 lg:static lg:gap-8 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-6">
      <div className="flex items-center justify-between gap-3 lg:block">
        <Logo locale={locale} />
      </div>
      <div>
        <p className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground lg:block">Menu</p>
        <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 lg:mx-0 lg:mt-4 lg:flex-col lg:overflow-visible lg:px-0">
          {menu.map(({ icon: Icon, label, active, badge }) => (
            <button
              key={label}
              aria-label={label}
              className={`group flex shrink-0 items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors lg:w-full lg:shrink lg:py-2.5 ${
                active ? "bg-ink text-highlight" : "text-foreground/70 hover:bg-secondary hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4.5 w-4.5" size={18} />
                <span className="hidden lg:inline">{label}</span>
              </span>
              {badge ? (
                <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-pen-red)] text-[9px] font-bold text-white lg:h-5 lg:w-5 lg:text-[10px]">
                  {badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
      </div>
      <div className="hidden lg:block"><UpgradeCard t={t} /></div>
    </aside>
  );
}

function UpgradeCard({ t }: { t: T }) {
  return (
    <div className="rounded-2xl border-2 border-ink bg-highlight p-5 lg:mt-auto">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-highlight">
        <PenLine className="h-5 w-5" />
      </span>
      <h4 className="mt-4 text-base font-bold text-ink">{t.dashboard.upgrade.title}</h4>
      <p className="mt-1 text-xs text-ink/70">{t.dashboard.upgrade.desc}</p>
      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-2.5 text-xs font-semibold text-highlight transition-transform hover:scale-[1.02]">
        {t.dashboard.upgrade.cta} <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function Topbar({ locale, t }: { locale: Locale; t: T }) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card px-4 py-4 sm:px-8 sm:py-5">
      <h1 className="truncate text-lg font-bold">{t.dashboard.topbar.title}</h1>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground md:flex">
          <Search className="h-4 w-4" />
          <input
            placeholder={t.dashboard.topbar.search}
            className="w-40 bg-transparent outline-none placeholder:text-muted-foreground lg:w-56"
          />
          <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </div>
        <LanguageSwitcher current={locale} page="/dashboard" />
        <button aria-label={t.dashboard.topbar.notifications} className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--color-pen-red)]" />
        </button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-highlight font-mono text-sm font-bold">BS</div>
      </div>
    </header>
  );
}

function Main({ locale, t }: { locale: Locale; t: T }) {
  return (
    <main className="flex min-w-0 flex-col bg-background lg:overflow-y-auto">
      <Topbar locale={locale} t={t} />
      <div className="flex flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:p-8">
        <ContinueSection t={t} />
        <RecommendedSection t={t} />
      </div>
    </main>
  );
}

function ContinueSection({ t }: { t: T }) {
  const cards = [
    { title: "ENEM — Functions", tag: "Math", lessons: "18/40", progress: 45, color: "var(--color-pen-blue)", icon: BookMarked },
    { title: "Writing Notebook", tag: "Language", lessons: "22/40", progress: 55, color: "var(--color-pen-red)", icon: FileText },
  ];
  return (
    <section>
      <div className="flex items-end justify-between">
        <h2 className="text-lg font-bold sm:text-xl">{t.dashboard.continue.heading}</h2>
        <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">{t.dashboard.continue.viewAll}</a>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <article key={c.title} className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-lg">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ backgroundColor: c.color }}>
                <c.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{c.tag}</p>
                <h3 className="text-base font-semibold leading-tight">{c.title}</h3>
              </div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full" style={{ width: `${c.progress}%`, backgroundColor: c.color }} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> {c.lessons} {t.dashboard.continue.pages}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {t.dashboard.continue.remaining}</span>
            </div>
            <button className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: c.color }}>
              {t.dashboard.continue.cta} <ArrowRight className="h-4 w-4" />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function RecommendedSection({ t }: { t: T }) {
  const items = [
    { title: "Drop your PDF: interactive answer key", author: "Grifo Team", rating: 4.9, reviews: 128, price: t.dashboard.recommended.free, accent: "var(--color-pen-green)", badge: t.dashboard.recommended.new },
    { title: "Worksheet → Quiz in 3 minutes", author: "Prof. Helena", rating: 4.7, reviews: 540, price: "R$ 19", accent: "var(--color-pen-orange)" },
  ];
  return (
    <section>
      <h2 className="text-lg font-bold sm:text-xl">{t.dashboard.recommended.heading}</h2>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((it) => (
          <article key={it.title} className="overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg">
            <div className="relative flex h-44 items-center justify-center" style={{ backgroundColor: it.accent }}>
              {it.badge && (
                <span className="absolute left-3 top-3 rounded-md bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-highlight">
                  {it.badge}
                </span>
              )}
              <div className="rounded-xl bg-card/95 p-4 shadow-lg"><FileText className="h-10 w-10 text-ink" /></div>
              <span className="absolute bottom-3 right-3 rounded-md bg-ink/80 px-2 py-1 font-mono text-[10px] text-highlight">PDF · 12 p</span>
            </div>
            <div className="p-5">
              <h3 className="text-base font-semibold leading-snug">{it.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{it.author}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm">
                  <Star className="h-4 w-4 fill-highlight text-highlight" />
                  <span className="font-semibold">{it.rating}</span>
                  <span className="text-muted-foreground">({it.reviews})</span>
                </span>
                <span className="font-bold">{it.price}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Details({ t }: { t: T }) {
  return (
    <aside className="flex flex-col gap-5 border-t border-border bg-card p-4 sm:p-5 xl:overflow-y-auto xl:border-l xl:border-t-0 xl:p-6">
      <button className="hidden items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground xl:flex">
        <ChevronLeft className="h-4 w-4" /> {t.dashboard.details.close}
      </button>
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-1">
        <ProfileCard t={t} />
        <StreakCard t={t} />
        <StatsCard t={t} />
      </div>
    </aside>
  );
}

function ProfileCard({ t }: { t: T }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-highlight font-mono text-base font-bold ring-4 ring-highlight">BS</div>
        </div>
        <div>
          <h3 className="text-base font-bold">Brooklyn Simmons</h3>
          <p className="text-xs text-muted-foreground">{t.dashboard.profile.role}</p>
          <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-highlight px-2 py-0.5 text-[11px] font-semibold text-ink">
            <Award className="h-3 w-3" /> {t.dashboard.profile.points}
          </p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <Metric icon={Flame} value="54" label={t.dashboard.profile.daysRow} color="var(--color-pen-red)" />
        <Metric icon={Target} value="06" label={t.dashboard.profile.goals} color="var(--color-pen-blue)" />
        <Metric icon={Trophy} value="02" label={t.dashboard.profile.rank} color="var(--color-pen-green)" />
      </div>
    </div>
  );
}

function Metric({ icon: Icon, value, label, color }: { icon: typeof Flame; value: string; label: string; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <Icon className="mx-auto h-4 w-4" style={{ color }} />
      <p className="mt-1.5 text-lg font-bold">{value}</p>
      <p className="text-[10px] leading-tight text-muted-foreground">{label}</p>
    </div>
  );
}

function StreakCard({ t }: { t: T }) {
  const labels = t.dashboard.streak.days;
  const days = [
    { d: labels[0], n: 29, on: true, c: "var(--color-pen-red)" },
    { d: labels[1], n: 30, on: true, c: "var(--color-pen-orange)" },
    { d: labels[2], n: 31, on: true, c: "var(--color-pen-blue)" },
    { d: labels[3], n: 1, on: false },
    { d: labels[4], n: 2, on: false },
    { d: labels[5], n: 3, on: false },
    { d: labels[6], n: 4, on: false },
  ];
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-semibold">
          {t.dashboard.streak.heading} <Info className="h-3.5 w-3.5 text-muted-foreground" />
        </p>
        <button className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs">
          Jun 2026 <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{t.dashboard.streak.daysOf}</p>
        <div className="flex gap-1">
          <button aria-label={t.dashboard.streak.prev} className="rounded-md border border-border p-1"><ChevronLeft className="h-3 w-3" /></button>
          <button aria-label={t.dashboard.streak.next} className="rounded-md bg-ink p-1 text-highlight"><ChevronRight className="h-3 w-3" /></button>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {days.map((day) => (
          <div
            key={day.d}
            className={`flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] ${
              day.on ? "text-white" : "border border-border bg-card text-muted-foreground"
            }`}
            style={day.on ? { backgroundColor: day.c } : undefined}
          >
            <span className="opacity-80">{day.d}</span>
            <span className="text-sm font-bold">{day.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsCard({ t }: { t: T }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-pen-blue)]/10 text-[var(--color-pen-blue)]">
            <FileText className="h-4 w-4" />
          </span>
          <p className="mt-3 text-xl font-bold">3 PDFs</p>
          <p className="text-xs text-muted-foreground">{t.dashboard.stats.inProgress}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-pen-green)]/10 text-[var(--color-pen-green)]">
            <Award className="h-4 w-4" />
          </span>
          <p className="mt-3 text-xl font-bold">17 PDFs</p>
          <p className="text-xs text-muted-foreground">{t.dashboard.stats.finished}</p>
        </div>
      </div>
      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3 text-sm font-semibold text-highlight transition-transform hover:scale-[1.02]">
        <Upload className="h-4 w-4" /> {t.dashboard.stats.cta}
      </button>
    </div>
  );
}