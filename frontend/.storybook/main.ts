import path from "path";
import { fileURLToPath } from "url";
import type { StorybookConfig } from "@storybook/nextjs";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: { name: "@storybook/nextjs", options: {} },
  webpackFinal: async (config) => {
    config.resolve!.alias = {
      ...config.resolve!.alias,
      "@": path.resolve(configDir, "../src"),
    };
    return config;
  },
};

export default config;
