import type { Preview } from "@storybook/nextjs";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      options: {
        paper: { name: "Paper", value: "#F7F7F5" },
        white: { name: "White", value: "#FFFFFF" },
        ink: { name: "Ink", value: "#16181D" },
      },
    },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
  },
  initialGlobals: {
    backgrounds: { value: "paper" },
  },
};

export default preview;
