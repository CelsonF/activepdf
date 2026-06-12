import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/ui";

const NAV = [
  { label: "Recursos", href: "#recursos" },
  { label: "Para quem", href: "#para-quem" },
  { label: "Plataforma", href: "#plataforma" },
] as const;

export function LandingHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-900/10 bg-slate-100/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <a href="#top" aria-label="Grifo — início">
          <Logo size={26} />
        </a>

        <div className="flex items-center gap-2 sm:gap-6">
          <nav className="hidden items-center gap-6 sm:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-slate-500 transition-colors hover:text-slate-900"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className="ui-btn ui-btn-ghost ui-btn-sm font-pfmono">
              Entrar
            </Link>
            <Link href="/register" className="ui-btn ui-btn-primary ui-btn-sm gap-1 font-pfmono">
              Criar conta <ArrowRight size={13} weight="bold" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
