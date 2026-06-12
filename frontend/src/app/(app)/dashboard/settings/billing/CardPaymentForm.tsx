"use client";
import { useRef, useState } from "react";
import Script from "next/script";
import { CreditCard, LockSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import type { BillingInfo } from "@/types";

// Tipagem mínima do MercadoPago.js v2 — só o que usamos
interface MercadoPagoInstance {
  createCardToken(card: Record<string, string>): Promise<{ id: string }>;
}
declare global {
  interface Window {
    MercadoPago?: new (publicKey: string, options?: { locale: string }) => MercadoPagoInstance;
  }
}

const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? "";

type SubscribeResult = Pick<BillingInfo, "plan" | "subscription">;

interface Props {
  onSuccess: (data: SubscribeResult) => void;
}

async function subscribe(cardTokenId: string): Promise<SubscribeResult> {
  const res = await fetch("/api/billing/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cardTokenId }),
  });
  const data = (await res.json()) as SubscribeResult & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Erro ao processar o pagamento. Tente novamente.");
  return data;
}

export function CardPaymentForm({ onSuccess }: Props) {
  const mpRef = useRef<MercadoPagoInstance | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [card, setCard] = useState({
    number: "",
    holder: "",
    expiry: "",
    cvv: "",
    cpf: "",
  });

  function setField(field: keyof typeof card) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setCard((c) => ({ ...c, [field]: e.target.value }));
  }

  // Sem public key (dev local): simula a aprovação via gateway fake do backend
  if (!MP_PUBLIC_KEY) {
    return (
      <div className="flex flex-col gap-3">
        <div className="px-3 py-2 rounded-lg bg-marker-light border border-marker text-xs text-slate-700">
          <span className="font-semibold">Modo desenvolvimento:</span> sem
          <span className="font-mono"> NEXT_PUBLIC_MP_PUBLIC_KEY</span>, o pagamento é simulado.
        </div>
        {error && (
          <p className="text-sm text-correction">{error}</p>
        )}
        <Button
          variant="primary"
          size="md"
          icon={<CreditCard size={15} weight="bold" />}
          loading={busy}
          onClick={async () => {
            setBusy(true);
            setError("");
            try {
              onSuccess(await subscribe("fake_card_token"));
            } catch (e: unknown) {
              setError(e instanceof Error ? e.message : "Erro ao processar o pagamento.");
            } finally {
              setBusy(false);
            }
          }}
        >
          Simular pagamento aprovado
        </Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!mpRef.current) return;
    const [month, year] = card.expiry.split("/").map((p) => p.trim());
    if (!month || !year) {
      setError("Informe a validade no formato MM/AA.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      // O cartão vai direto do navegador para o Mercado Pago — só o token chega ao Grifo
      const token = await mpRef.current.createCardToken({
        cardNumber: card.number.replace(/\s/g, ""),
        cardholderName: card.holder,
        cardExpirationMonth: month,
        cardExpirationYear: year.length === 2 ? `20${year}` : year,
        securityCode: card.cvv,
        identificationType: "CPF",
        identificationNumber: card.cpf.replace(/\D/g, ""),
      });
      onSuccess(await subscribe(token.id));
    } catch (e: unknown) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : "Não foi possível validar o cartão. Confira os dados."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        onLoad={() => {
          if (window.MercadoPago) {
            mpRef.current = new window.MercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" });
            setSdkReady(true);
          }
        }}
      />

      {error && <p className="text-sm text-correction">{error}</p>}

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-slate-700">Número do cartão</span>
        <input
          className="ui-input text-sm font-mono"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="0000 0000 0000 0000"
          value={card.number}
          onChange={setField("number")}
          required
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-slate-700">Nome impresso no cartão</span>
        <input
          className="ui-input text-sm"
          autoComplete="cc-name"
          placeholder="Como está no cartão"
          value={card.holder}
          onChange={setField("holder")}
          required
        />
      </label>

      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-700">Validade</span>
          <input
            className="ui-input text-sm font-mono"
            autoComplete="cc-exp"
            placeholder="MM/AA"
            value={card.expiry}
            onChange={setField("expiry")}
            required
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-700">CVV</span>
          <input
            className="ui-input text-sm font-mono"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            value={card.cvv}
            onChange={setField("cvv")}
            required
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-700">CPF do titular</span>
          <input
            className="ui-input text-sm font-mono"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={card.cpf}
            onChange={setField("cpf")}
            required
          />
        </label>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        icon={<CreditCard size={15} weight="bold" />}
        loading={busy}
        disabled={!sdkReady}
        fullWidth
      >
        {sdkReady ? "Assinar agora" : "Carregando pagamento seguro..."}
      </Button>

      <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
        <LockSimple size={12} weight="fill" />
        Dados do cartão criptografados pelo Mercado Pago — não passam pelo Grifo.
      </p>
    </form>
  );
}
