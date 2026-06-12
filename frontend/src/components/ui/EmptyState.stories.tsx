import type { Meta, StoryObj } from "@storybook/nextjs";
import { FileDashed, Plus } from "@phosphor-icons/react/dist/ssr";
import { EmptyState } from "./EmptyState";
import { Button } from "./Button";

const meta: Meta<typeof EmptyState> = {
  title: "UI / EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  args: {
    icon: <FileDashed size={40} />,
    title: "Nenhuma atividade por aqui",
  },
  argTypes: {
    icon: { control: false },
    action: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {};

export const ComDescricao: Story = {
  args: {
    description: "Envie um PDF para criar a primeira atividade da turma.",
  },
};

export const ComAcao: Story = {
  args: {
    description: "Envie um PDF para criar a primeira atividade da turma.",
    action: (
      <Button variant="primary" size="sm" icon={<Plus size={14} />}>
        Enviar um PDF
      </Button>
    ),
  },
};
