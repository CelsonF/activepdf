import { Logo } from "@/components/ui";

const LINKS = ["Privacidade", "Termos", "Suporte"] as const;

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-900/10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8">
        <Logo size={22} />
        <div className="flex flex-wrap items-center gap-6 font-pfmono text-xs text-slate-500">
          {LINKS.map((link) => (
            <a key={link} href="#" className="transition-colors hover:text-slate-900">
              {link}
            </a>
          ))}
          <span>© 2026 ActivePDF</span>
        </div>
      </div>
    </footer>
  );
}
