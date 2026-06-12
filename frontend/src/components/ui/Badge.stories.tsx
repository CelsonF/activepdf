import type { Meta, StoryObj } from "@storybook/nextjs";
import { CheckCircle, Clock } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "UI / Badge",
  component: Badge,
  tags: ["autodocs"],
  args: {
    children: "Pendente",
    variant: "neutral",
    size: "sm",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["brand", "success", "warning", "error", "neutral"],
    },
    size: { control: "select", options: ["sm", "md"] },
    icon: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Neutral: Story = {};

export const Brand: Story = { args: { variant: "brand", children: "Em andamento" } };

export const Success: Story = {
  args: { variant: "success", children: "Corrigida", icon: <CheckCircle size={12} weight="fill" /> },
};

export const Warning: Story = {
  args: { variant: "warning", children: "Aguardando", icon: <Clock size={12} /> },
};

export const Error: Story = { args: { variant: "error", children: "Atrasada" } };

export const Medium: Story = { args: { size: "md", variant: "brand", children: "Turma 9B" } };

export const Todas: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge variant="neutral">Rascunho</Badge>
      <Badge variant="brand">Em andamento</Badge>
      <Badge variant="success">Corrigida</Badge>
      <Badge variant="warning">Aguardando</Badge>
      <Badge variant="error">Atrasada</Badge>
    </div>
  ),
};
