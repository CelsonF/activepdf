import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { serverFetch } from "@/lib/api";
import { Crown } from "@phosphor-icons/react/dist/ssr";
import { BillingClient } from "./BillingClient";
import type { BillingInfo } from "@/types";

export default async function BillingPage() {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/dashboard");

  const billing = await serverFetch<BillingInfo>("/api/billing/subscription");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 h-[60px] flex items-center gap-3 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
          <Crown size={14} weight="fill" color="white" />
        </div>
        <h1 className="font-extrabold text-[15px] text-slate-900 tracking-[-0.3px]">
          Assinatura
        </h1>
      </header>

      <div className="max-w-2xl mx-auto p-6">
        <BillingClient initial={billing} />
      </div>
    </div>
  );
}
