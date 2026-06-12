"use client";
import Link from "next/link";
import { Compass, ArrowLeft, HouseLine, ArrowCounterClockwise } from "@phosphor-icons/react";
import { Logo } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* minimal header */}
      <header className="bg-white border-b border-slate-200 h-[52px] flex items-center px-6">
        <Link href="/">
          <Logo size={26} />
        </Link>
      </header>

      {/* content */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="text-center max-w-md animate-fadeUp">
          {/* icon badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-light mb-6">
            <Compass size={40} weight="bold" className="text-brand" />
          </div>

          {/* code */}
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            Erro 404
          </p>

          <h1 className="text-[30px] font-bold text-slate-900 tracking-[-0.02em] leading-tight mb-3">
            Esta página se perdeu
          </h1>

          <p className="text-slate-500 text-[15px] leading-relaxed mb-8">
            A página que você procura não existe ou foi movida.
            Vamos te colocar de volta no caminho certo.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/dashboard" className="ui-btn ui-btn-primary ui-btn-md gap-1.5">
              <HouseLine size={15} weight="bold" /> Ir para o painel
            </Link>
            <Link href="/" className="ui-btn ui-btn-secondary ui-btn-md gap-1.5">
              <ArrowLeft size={15} weight="bold" /> Página inicial
            </Link>
          </div>

          {/* divider */}
          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">ou</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* suggestion */}
          <p className="text-sm text-slate-400 mb-4">
            Se o problema persistir, tente recarregar a página.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="ui-btn ui-btn-ghost ui-btn-sm gap-1.5 mx-auto"
          >
            <ArrowCounterClockwise size={14} /> Recarregar
          </button>
        </div>
      </div>
    </div>
  );
}
