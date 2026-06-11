"use client";

import { cn } from "@/lib/cn";
import { useInspect } from "./inspect";

const NAV = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;

export function Header() {
  const { on, toggle } = useInspect();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-pf-ink/10 bg-pf-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <a href="#top" className="font-display text-lg font-extrabold tracking-tight">
          LM<span className="text-pf-blue">·</span>
        </a>

        <div className="flex items-center gap-2 sm:gap-6">
          <nav className="hidden items-center gap-6 sm:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-pf-muted transition-colors hover:text-pf-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pf-blue"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            onClick={toggle}
            aria-pressed={on}
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-1.5 font-pfmono text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pf-blue",
              on
                ? "border-pf-red bg-pf-red text-white"
                : "border-pf-ink/20 bg-pf-panel text-pf-ink hover:border-pf-ink/40"
            )}
          >
            <span
              className={cn("h-1.5 w-1.5 rounded-full", on ? "bg-white" : "bg-pf-red")}
            />
            Inspect
          </button>
        </div>
      </div>
    </header>
  );
}
