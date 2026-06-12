import type { Meta, StoryObj } from "@storybook/nextjs";

interface SwatchProps {
  name: string;
  cls: string;
  hex: string;
  role?: string;
}

function Swatch({ name, cls, hex, role }: SwatchProps) {
  return (
    <div className="flex w-28 flex-col gap-1.5">
      <div className={`h-14 w-full rounded-lg border border-line ${cls}`} />
      <span className="text-xs font-semibold text-ink">{name}</span>
      <span className="font-mono text-[10px] text-ink-muted">{hex}</span>
      {role && <span className="text-[10px] leading-tight text-ink-soft">{role}</span>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-sm font-bold text-ink">{title}</h2>
      <div className="flex flex-wrap gap-4">{children}</div>
    </section>
  );
}

/** Paleta Grifo — Folha & Caneta (docs/identidade-grifo.md). */
function TokenPage() {
  return (
    <div className="flex flex-col gap-10 p-8">
      <Section title="Papel e tinta (neutros)">
        <Swatch name="paper" cls="bg-paper" hex="#F7F7F5" role="Fundo de página" />
        <Swatch name="ink" cls="bg-ink" hex="#16181D" role="Texto principal" />
        <Swatch name="ink-soft" cls="bg-ink-soft" hex="#4A4F57" role="Texto secundário" />
        <Swatch name="ink-muted" cls="bg-ink-muted" hex="#8B9097" role="Placeholder" />
        <Swatch name="line" cls="bg-line" hex="#E5E5E1" role="Bordas (pauta)" />
        <Swatch name="line-strong" cls="bg-line-strong" hex="#D2D2CC" role="Borda hover" />
      </Section>

      <Section title="Caneta (ação primária)">
        <Swatch name="pen" cls="bg-pen" hex="#0B5FFF" role="Botões, links, campos" />
        <Swatch name="pen-dark" cls="bg-pen-dark" hex="#0A4ED6" role="Hover" />
        <Swatch name="pen-light" cls="bg-pen-light" hex="#EBF1FF" role="Fundo ativo" />
      </Section>

      <Section title="Correção (SÓ erro e caneta vermelha do professor)">
        <Swatch name="correction" cls="bg-correction" hex="#DE2B1F" role="Erro real, destrutivo" />
        <Swatch name="correction-light" cls="bg-correction-light" hex="#FDEDEB" role="Fundo de erro" />
      </Section>

      <Section title="Marca-texto (SÓ gamificação e marca)">
        <Swatch name="marker" cls="bg-marker" hex="#FFD64D" role="XP, streak, grifo" />
        <Swatch name="marker-light" cls="bg-marker-light" hex="#FFF6D6" role="Fundo gamificação" />
      </Section>
    </div>
  );
}

function TypographyPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] text-ink-muted">font-display · Bricolage Grotesque</span>
        <p className="font-display text-3xl font-bold text-ink">
          Marque, pratique, <span className="ui-marker">aprenda</span>.
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] text-ink-muted">font-sans · Instrument Sans</span>
        <p className="text-sm text-ink">
          O Grifo transforma qualquer PDF em exercício interativo. A folha, a caneta
          azul de quem responde e o marca-texto de quem estuda.
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] text-ink-muted">font-mono · Spline Sans Mono — XP, scores, arquivos</span>
        <p className="font-mono text-sm text-ink">+120 XP · nota 8,5 · prova-fracoes.pdf</p>
      </div>
    </div>
  );
}

function AssinaturaPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] text-ink-muted">.ui-marker — o grifo da marca (extrema parcimônia)</span>
        <p className="font-display text-2xl font-bold text-ink">
          Transforme PDFs em <span className="ui-marker">atividades</span>
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] text-ink-muted">.ui-spinner — tamanho via classes</span>
        <div className="flex items-center gap-4 text-pen">
          <div className="ui-spinner h-4 w-4 border-2 border-line" />
          <div className="ui-spinner h-6 w-6 border-2 border-line" />
          <div className="ui-spinner h-8 w-8 border-[3px] border-line" />
        </div>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: "Design System / Tokens",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Paleta: Story = { render: () => <TokenPage /> };
export const Tipografia: Story = { render: () => <TypographyPage /> };
export const Assinatura: Story = { render: () => <AssinaturaPage /> };
