import { LOCALES, LOCALE_LABEL, type Locale, localePath } from "@/lib/i18n";

interface Props {
  current: Locale;
  /** Which page we are on so links keep the user on the same page in the target language. */
  page: "/" | "/dashboard";
  className?: string;
}

export function LanguageSwitcher({ current, page, className }: Props) {
  return (
    <div
      className={`flex items-center gap-0.5 rounded-xl border border-border bg-card p-0.5 text-xs font-semibold ${className ?? ""}`}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((loc) => {
        const href = localePath(loc, page);
        const active = loc === current;
        return (
          <a
            key={loc}
            href={href}
            hrefLang={loc}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-2 py-1 transition-colors ${
              active ? "bg-ink text-highlight" : "text-ink/70 hover:bg-secondary"
            }`}
          >
            {LOCALE_LABEL[loc]}
          </a>
        );
      })}
    </div>
  );
}