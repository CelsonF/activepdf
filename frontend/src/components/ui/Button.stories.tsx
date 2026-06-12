import type { Meta, StoryObj } from "@storybook/nextjs";
import { PencilSimple, ArrowRight, Trash } from "@phosphor-icons/react/dist/ssr";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI / Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Enviar um PDF",
    variant: "primary",
    size: "md",
    disabled: false,
    loading: false,
    fullWidth: false,
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "outline", "danger", "success"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
    },
    icon: { control: false },
    iconRight: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const Secondary: Story = { args: { variant: "secondary" } };

export const Ghost: Story = { args: { variant: "ghost" } };

export const Outline: Story = { args: { variant: "outline" } };

export const Danger: Story = {
  args: { variant: "danger", children: "Excluir atividade", icon: <Trash size={14} /> },
};

export const Success: Story = { args: { variant: "success", children: "Corrigido" } };

export const ComIcone: Story = {
  args: { icon: <PencilSimple size={14} />, children: "Editar campos" },
};

export const ComIconeDireita: Story = {
  args: { iconRight: <ArrowRight size={14} />, children: "Continuar" },
};

export const Loading: Story = { args: { loading: true, children: "Salvando…" } };

export const Disabled: Story = { args: { disabled: true } };

export const Tamanhos: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Button {...args} size="xs">Extra small</Button>
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="md">Medium</Button>
      <Button {...args} size="lg">Large</Button>
    </div>
  ),
};
