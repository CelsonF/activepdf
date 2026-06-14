import { useEffect, useRef, useState } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { LOCALES, LOCALE_LABEL, LOCALE_FULL_LABEL, type Locale, localePath } from "@/lib/i18n";

interface Props {
  current: Locale;
  /** Which page we are on so links keep the user on the same page in the target language. */
  page: "/" | "/dashboard";
  className?: string;
}

export function LanguageSwitcher({ current, page, className }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Close on outside click / Escape while the menu is open.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Language"
        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-ink/80 transition-colors hover:bg-secondary"
      >
        <Globe className="h-3.5 w-3.5" aria-hidden />
        <span className="uppercase">{LOCALE_LABEL[current]}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Language"
          className="absolute right-0 top-full z-50 mt-1.5 w-44 max-w-[calc(100vw-1.5rem)] rounded-xl border border-border bg-card p-1 shadow-lg"
        >
          {LOCALES.map((loc) => {
            const active = loc === current;
            return (
              <a
                key={loc}
                href={localePath(loc, page)}
                hrefLang={loc}
                role="menuitemradio"
                aria-checked={active}
                aria-current={active ? "page" : undefined}
                className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none ${
                  active ? "text-ink" : "text-ink/70"
                }`}
              >
                <span>{LOCALE_FULL_LABEL[loc]}</span>
                {active ? (
                  <Check className="h-3.5 w-3.5 text-primary" aria-hidden />
                ) : (
                  <span className="font-mono text-[10px] uppercase text-ink/40">{loc}</span>
                )}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
