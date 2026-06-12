import type { Meta, StoryObj } from "@storybook/nextjs";

/**
 * `.ui-input` é uma classe do design system (globals.css), não um componente —
 * aplica-se direto no elemento nativo. Estas stories documentam os estados.
 */
const meta: Meta = {
  title: "UI / Input (.ui-input)",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="w-64">
      <input className="ui-input" placeholder="Nome da atividade" />
    </div>
  ),
};

export const ComValor: Story = {
  render: () => (
    <div className="w-64">
      <input className="ui-input" defaultValue="Prova de Frações — 7º ano" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-64">
      <input className="ui-input" disabled placeholder="Indisponível" />
    </div>
  ),
};

export const Textarea: Story = {
  render: () => (
    <div className="w-64">
      <textarea className="ui-input min-h-[80px] resize-y" placeholder="Enunciado da questão…" />
    </div>
  ),
};

export const ComLabel: Story = {
  render: () => (
    <label className="flex w-64 flex-col gap-1.5">
      <span className="text-xs font-medium text-ink-soft">Título da aula</span>
      <input className="ui-input" placeholder="Ex.: Revolução Industrial" />
    </label>
  ),
};
