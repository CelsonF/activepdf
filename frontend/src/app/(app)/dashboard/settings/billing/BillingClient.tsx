"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Crown, Warning, Check } from "@phosphor-icons/react";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CardPaymentForm } from "./CardPaymentForm";
import { track } from "@/lib/analytics";
import type { BillingInfo, SubscriptionStatus } from "@/types";

interface Props {
  initial: BillingInfo;
}

const STATUS_BADGE: Record<SubscriptionStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: "Aguardando pagamento", variant: "warning" },
  AUTHORIZED: { label: "Ativa", variant: "success" },
  PAUSED: { label: "Pagamento com problema", variant: "error" },
  CANCELLED: { label: "Cancelada", variant: "neutral" },
};

const PRO_FEATURES = [
  "Turmas e alunos ilimitados, por convite",
  "Correção com caneta vermelha e nota",
  "Biblioteca de PDFs e planos de aula",
  "XP, ranking e relatórios da turma",
] as const;

function fmtPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export function BillingClient({ initial }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [billing, setBilling] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const sync = useCallback(async () => {
    const res = await fetch("/api/billing/sync", { method: "POST" });
    if (!res.ok) return;
    const data = (await res.json()) as Pick<BillingInfo, "plan" | "subscription">;
    setBilling((b) => ({ ...b, ...data }));
  }, []);

  // Voltou do checkout: o gateway é a fonte da verdade — ressincroniza
  useEffect(() => {
    if (searchParams.get("from") !== "checkout") return;
    sync().finally(() => router.replace("/dashboard/settings/billing"));
  }, [searchParams, sync, router]);

  // Fallback: checkout com redirect para o site do Mercado Pago
  async function handleRedirectCheckout() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const data = (await res.json()) as { checkoutUrl?: string; error?: string };
      if (!res.ok || !data.checkoutUrl) {
        setError(data.error ?? "Erro ao iniciar o checkout. Tente novamente.");
        return;
      }
      track("checkout_started", { mode: "redirect" });
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Erro ao iniciar o checkout. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  function handleSubscribed(data: Pick<BillingInfo, "plan" | "subscription">) {
    track("checkout_started", { mode: "transparent" });
    setBilling((b) => ({ ...b, ...data }));
  }

  async function handleCancel() {
    if (!confirm("Cancelar a assinatura? Você volta ao plano gratuito ao fim do período.")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Erro ao cancelar. Tente novamente.");
        return;
      }
      track("subscription_cancelled");
      await sync();
    } catch {
      setError("Erro ao cancelar. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  const sub = billing.subscription;
  const isPro = billing.plan === "PRO";
  const isPaused = sub?.status === "PAUSED";

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      {isPaused && (
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-correction bg-correction-light">
          <Warning size={20} weight="fill" className="text-correction shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">Não conseguimos cobrar sua assinatura</p>
            <p className="text-xs text-slate-600 mt-0.5">
              Informe um novo cartão abaixo para manter o plano Professor ativo.
            </p>
          </div>
        </div>
      )}

      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center">
              <Crown size={18} weight="fill" className="text-brand" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Plano {isPro ? "Professor" : "Gratuito"}
              </p>
              <p className="font-mono text-[11px] text-slate-400">
                {fmtPrice(billing.priceCents)}/mês no plano Professor
              </p>
            </div>
          </div>
          {sub && <Badge variant={STATUS_BADGE[sub.status].variant}>{STATUS_BADGE[sub.status].label}</Badge>}
        </div>

        {isPro && sub?.currentPeriodEnd && (
          <p className="mt-4 text-xs text-slate-500">
            Próxima cobrança em <span className="font-semibold">{fmtDate(sub.currentPeriodEnd)}</span>.
          </p>
        )}

        {!isPro && (
          <ul className="mt-5 flex flex-col gap-2">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                <Check size={15} weight="bold" className="mt-0.5 shrink-0 text-brand" />
                {feature}
              </li>
            ))}
          </ul>
        )}

        {!isPro && (
          <div className="mt-6 flex flex-col gap-3">
            <CardPaymentForm onSuccess={handleSubscribed} />
            <button
              type="button"
              onClick={handleRedirectCheckout}
              disabled={busy}
              className="self-start text-xs text-slate-500 underline-offset-2 hover:text-pen hover:underline"
            >
              Prefere pagar no site do Mercado Pago?
            </button>
          </div>
        )}

        {isPro && (
          <div className="mt-6">
            <Button variant="outline" size="sm" onClick={handleCancel} loading={busy}>
              Cancelar assinatura
            </Button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-400">
        Pagamento processado pelo Mercado Pago. Cancelou? Você volta ao plano
        gratuito sem perder seus dados.
      </p>
    </div>
  );
}
