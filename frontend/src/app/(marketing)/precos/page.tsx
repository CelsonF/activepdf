import type { Metadata } from "next";
import Link from "next/link";
import { Check, Highlighter } from "@phosphor-icons/react/dist/ssr";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Preços",
  description:
    "Use o editor grátis sem cadastro, salve suas atividades com a conta gratuita e ensine com o plano Professor. Alunos nunca pagam.",
};

// Valor provisório até a Sprint de billing (Mercado Pago) fechar o preço real.
const PRO_PRICE = "R$ 39";

interface Plan {
  name: string;
  price: string;
  priceNote: string;
  description: string;
  features: readonly string[];
  cta: { label: string; href: string };
  highlighted?: boolean;
}

const PLANS: readonly Plan[] = [
  {
    name: "Anônimo",
    price: "R$ 0",
    priceNote: "sem conta",
    description: "Resolva uma atividade agora — nada sai do seu navegador.",
    features: [
      "Editor completo direto na capa",
      "Campos de texto sobre qualquer PDF",
      "Preencher e exportar com um clique",
      "1 rascunho guardado neste navegador",
    ],
    cta: { label: "Abrir o editor", href: "/editor" },
  },
  {
    name: "Conta gratuita",
    price: "R$ 0",
    priceNote: "para sempre",
    description: "Para quem estuda por conta própria e quer continuar depois.",
    features: [
      "Tudo do plano Anônimo",
      "Salve suas atividades e reabra de qualquer lugar",
      "Histórico do que você já respondeu",
      "XP e sequência de estudos",
    ],
    cta: { label: "Criar conta grátis", href: "/register" },
  },
  {
    name: "Professor",
    price: PRO_PRICE,
    priceNote: "/mês · seus alunos nunca pagam",
    description: "A sala de aula inteira em cima do seu próprio material.",
    features: [
      "Turmas e alunos ilimitados, por convite",
      "Correção com caneta vermelha e nota",
      "Biblioteca de PDFs e planos de aula",
      "XP, ranking e relatórios da turma",
    ],
    cta: { label: "Começar como professor", href: "/register" },
    highlighted: true,
  },
] as const;

const FAQ = [
  {
    q: "Meus alunos precisam pagar?",
    a: "Não. Alunos entram grátis por convite do professor — o plano Professor já inclui todos eles.",
  },
  {
    q: "Preciso de cartão para começar?",
    a: "Não. O editor da capa não pede nem conta, e a conta gratuita não pede cartão.",
  },
  {
    q: "Meus PDFs vão para o servidor?",
    a: "No modo anônimo, nunca: o arquivo é aberto e exportado 100% no seu navegador. Com conta, você escolhe o que salvar.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. A assinatura é mensal, sem fidelidade — cancelou, volta para a conta gratuita sem perder seus dados.",
  },
] as const;

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-100 font-sans text-slate-900 antialiased">
      <LandingHeader />

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-36">
        <p className="font-pfmono text-xs uppercase tracking-[0.2em] text-slate-500">
          Preços — simples como uma folha
        </p>
        <h1 className="mt-6 max-w-2xl font-display text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[0.95] tracking-tight">
          Quem aprende não paga. <span className="ui-marker">Quem ensina</span>, assina.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-500">
          Comece de graça na capa, crie uma conta para guardar seu progresso e
          assine só quando for levar a turma inteira.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "flex flex-col rounded-2xl border bg-white p-7",
                plan.highlighted
                  ? "border-brand shadow-brand-lg"
                  : "border-slate-200 shadow-card"
              )}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">{plan.name}</h2>
                {plan.highlighted && (
                  <span className="flex items-center gap-1 rounded-sm bg-marker-light px-2 py-1 font-pfmono text-[10px] font-medium uppercase tracking-[0.12em] text-slate-900">
                    <Highlighter size={11} weight="fill" /> Para quem ensina
                  </span>
                )}
              </div>

              <p className="mt-5 flex items-baseline gap-2">
                <span className="font-display text-4xl font-extrabold tracking-tight">{plan.price}</span>
                <span className="font-pfmono text-xs text-slate-500">{plan.priceNote}</span>
              </p>

              <p className="mt-3 text-sm leading-relaxed text-slate-500">{plan.description}</p>

              <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check size={15} weight="bold" className="mt-0.5 shrink-0 text-brand" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.cta.href}
                className={cn(
                  "mt-8 justify-center font-pfmono",
                  plan.highlighted
                    ? "ui-btn ui-btn-primary ui-btn-lg"
                    : "ui-btn ui-btn-outline ui-btn-lg"
                )}
              >
                {plan.cta.label}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-900/10 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="font-display text-2xl font-bold tracking-tight">Perguntas diretas</h2>
          <dl className="mt-8 flex flex-col gap-7">
            {FAQ.map(({ q, a }) => (
              <div key={q}>
                <dt className="text-sm font-semibold text-slate-900">{q}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-slate-500">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
