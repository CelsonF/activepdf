import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { serverFetch } from "@/lib/api";
import { Logo } from "@/components/ui";
import { SidebarNav } from "./_components/SidebarNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  let isAutodidact = false;
  if (session.role === "student") {
    try {
      const profile = await serverFetch<{ isAutodidact?: boolean }>("/api/profile");
      isAutodidact = profile.isAutodidact === true;
    } catch {
      isAutodidact = false;
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex w-[248px] shrink-0 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-5 h-[64px] flex items-center border-b border-slate-100 shrink-0">
          <Link href="/dashboard">
            <Logo size={26} />
          </Link>
        </div>

        {/* Nav with CTA, items, account section, alert card, sair */}
        <SidebarNav role={session.role} isAutodidact={isAutodidact} />
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
