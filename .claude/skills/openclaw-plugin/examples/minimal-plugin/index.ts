/**
 * Minimal OpenClaw Plugin Example
 *
 * A complete, working minimal plugin that demonstrates
 * all required OpenClaw SDK patterns.
 */

import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { Type } from "@sinclair/typebox";
import { minimalConfigSchema } from "./config.ts";

const minimalPlugin = {
  // Required: Simple kebab-case ID
  id: "minimal-plugin",

  // Required: Human-readable name
  name: "Minimal Plugin",

  // Required: Plugin kind
  kind: "tools" as const,

  // Required: Description
  description: "A minimal example plugin for OpenClaw",

  // Required: Config schema with parse() method
  configSchema: minimalConfigSchema,

  // Required: Single registration function
  register(api: OpenClawPluginApi) {
    const config = minimalConfigSchema.parse(api.pluginConfig);

    api.logger.info(`minimal-plugin: registered with API key: ${config.apiKey ? "***" : "none"}`);

    // Register a simple tool
    api.registerTool(
      {
        name: "hello_world",
        label: "Hello World",
        description: "A simple hello world tool",
        parameters: Type.Object({
          name: Type.Optional(Type.String({
            description: "Name to greet",
          })),
        }),
        async execute(_toolCallId, params) {
          const name = (params as { name?: string }).name || "World";
          return {
            success: true,
            message: `Hello, ${name}!`,
          };
        },
      },
      { name: "hello_world" }
    );

    // Register a simple CLI command
    api.registerCli(
      ({ program }) => {
        program
          .command("hello")
          .description("Say hello")
          .argument("[name]", "Name to greet")
          .action(async (name = "World") => {
            console.log(`Hello, ${name}!`);
          });
      },
      { commands: ["hello"] }
    );

    // Register a simple background service
    api.registerService({
      id: "minimal-service",
      start: async () => {
        api.logger.info("minimal-plugin service started");
      },
      stop: async () => {
        api.logger.info("minimal-plugin service stopped");
      },
    });
  },
};

export default minimalPlugin;
