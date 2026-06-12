import Link from "next/link";
import { Upload } from "@phosphor-icons/react/dist/ssr";
import { RevealSection } from "./RevealSection";

export function CtaSection() {
  return (
    <RevealSection className="mx-auto max-w-6xl px-6 py-28">
      <div className="flex flex-col items-center text-center">
        <h2
          data-reveal
          className="font-display text-[clamp(2.25rem,5vw,4rem)] font-extrabold leading-[0.95] tracking-tight text-slate-900"
        >
          Pronto para ativar
          <br />
          um <span className="text-brand">PDF?</span>
        </h2>

        <p data-reveal className="mt-6 max-w-md text-lg leading-relaxed text-slate-500">
          Crie sua conta em menos de um minuto. Traga seu próprio material.
        </p>

        <div data-reveal className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/register" className="ui-btn ui-btn-primary ui-btn-lg gap-2 font-pfmono">
            <Upload size={16} weight="bold" /> Começar grátis
          </Link>
          <Link href="/login" className="ui-btn ui-btn-ghost ui-btn-lg font-pfmono">
            Já tenho conta
          </Link>
        </div>
      </div>
    </RevealSection>
  );
}
