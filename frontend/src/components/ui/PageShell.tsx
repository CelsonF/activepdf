import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "./Logo";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageShellProps {
  breadcrumbs: BreadcrumbItem[];
  children: React.ReactNode;
}

export function PageShell({ breadcrumbs, children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 h-[52px] flex items-center gap-3 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <Logo size={22} />
        <div className="ui-divider" />
        {breadcrumbs.map((item, i) => (
          <span key={i} className="flex items-center gap-3">
            {i > 0 && <span className="text-slate-300">/</span>}
            {item.href ? (
              <Link
                href={item.href}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors"
              >
                {i === 0 && <ArrowLeft size={14} />}
                {item.label}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-slate-700">{item.label}</span>
            )}
          </span>
        ))}
      </header>
      {children}
    </div>
  );
}
