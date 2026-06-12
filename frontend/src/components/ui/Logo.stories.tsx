import type { Meta, StoryObj } from "@storybook/nextjs";
import { Logo } from "./Logo";

const meta: Meta<typeof Logo> = {
  title: "UI / Logo",
  component: Logo,
  tags: ["autodocs"],
  args: {
    size: 30,
    showText: true,
    mono: false,
  },
};

export default meta;
type Story = StoryObj<typeof Logo>;

export const Wordmark: Story = {};

export const Grande: Story = { args: { size: 48 } };

export const SoMarca: Story = { args: { showText: false } };

export const MonoFundoEscuro: Story = {
  args: { mono: true },
  globals: { backgrounds: { value: "ink" } },
  decorators: [
    (Story) => (
      <div className="rounded-2xl bg-ink p-8">
        <Story />
      </div>
    ),
  ],
};
