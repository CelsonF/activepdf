import type { Meta, StoryObj } from "@storybook/nextjs";
import { Student, FileText, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { StatCard } from "./StatCard";

const meta: Meta<typeof StatCard> = {
  title: "UI / StatCard",
  component: StatCard,
  tags: ["autodocs"],
  args: {
    icon: <Student size={18} className="text-pen" />,
    value: "32",
    label: "Alunos ativos",
  },
  argTypes: {
    icon: { control: false },
    deltaDir: { control: "select", options: ["up", "down"] },
  },
  decorators: [
    (Story) => (
      <div className="w-56">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {};

export const ComDelta: Story = {
  args: { delta: "12%", deltaDir: "up" },
};

export const DeltaNegativo: Story = {
  args: {
    icon: <CheckCircle size={18} className="text-pen" />,
    value: "78%",
    label: "Taxa de entrega",
    delta: "5%",
    deltaDir: "down",
  },
};

export const Grade: Story = {
  render: () => (
    <div className="grid w-[640px] grid-cols-3 gap-4">
      <StatCard icon={<Student size={18} className="text-pen" />} value="32" label="Alunos ativos" delta="12%" />
      <StatCard icon={<FileText size={18} className="text-pen" />} value="14" label="Atividades criadas" />
      <StatCard icon={<CheckCircle size={18} className="text-pen" />} value="86%" label="Taxa de conclusão" delta="3%" />
    </div>
  ),
};
