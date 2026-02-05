/**
 * billclaw - Bank transaction and bill data import for OpenClaw
 *
 * Data sovereignty for your financial data.
 * Hold your own Plaid/bank access tokens locally.
 *
 * @author fire-zu
 * @license MIT
 */

import type {
  Plugin,
  CLIRegistry,
  ToolRegistry,
  OAuthRegistry,
  ServiceRegistry,
} from "./openclaw-types";

export const billclawPlugin: Plugin = {
  name: "@fire-zu/billclaw",
  version: "0.0.1",

  // Register CLI commands
  async registerCLI(cli: CLIRegistry) {
    cli.registerCommand({
      name: "bills",
      description: "Manage bank account connections and transaction imports",
      subcommands: {
        setup: {
          description: "Interactive setup wizard for connecting bank accounts",
          handler: async () => {
            const { setupWizard } = await import("./src/cli/commands.js");
            return setupWizard();
          },
        },
        sync: {
          description: "Manually trigger transaction sync for all connected accounts",
          handler: async (args: { accountId?: string }) => {
            const { syncCommand } = await import("./src/cli/commands.js");
            return syncCommand(args.accountId);
          },
        },
        status: {
          description: "Show connection status and recent sync results",
          handler: async () => {
            const { statusCommand } = await import("./src/cli/commands.js");
            return statusCommand();
          },
        },
        config: {
          description: "Manage plugin configuration",
          handler: async (args: { key?: string; value?: string }) => {
            const { configCommand } = await import("./src/cli/commands.js");
            return configCommand(args);
          },
        },
      },
    });
  },

  // Register Agent tools
  async registerTools(tools: ToolRegistry) {
    tools.register({
      name: "plaid_sync",
      description: "Sync transactions from Plaid-connected bank accounts",
      parameters: {
        type: "object",
        properties: {
          accountId: {
            type: "string",
            description: "Optional: specific account ID to sync (omits to sync all)",
          },
        },
      },
      handler: async (params: any, context: any) => {
        const { plaidSyncTool } = await import("./src/tools/plaid-sync.js");
        return plaidSyncTool(context, params);
      },
    });

    tools.register({
      name: "gmail_fetch_bills",
      description: "Fetch and parse bills from Gmail",
      parameters: {
        type: "object",
        properties: {
          days: {
            type: "number",
            description: "Number of days to look back (default: 30)",
          },
        },
      },
      handler: async (params: any) => {
        const { gmailFetchTool } = await import("./src/tools/gmail-fetch.js");
        return gmailFetchTool(params);
      },
    });

    tools.register({
      name: "bill_parse",
      description: "Parse bill data from various formats (PDF, CSV, email)",
      parameters: {
        type: "object",
        properties: {
          source: {
            type: "string",
            description: "Source type: plaid, gmail, file, or email",
          },
          data: {
            type: "string",
            description: "Raw data or file path to parse",
          },
        },
        required: ["source", "data"],
      },
      handler: async (params: any) => {
        const { billParseTool } = await import("./src/tools/bill-parse.js");
        return billParseTool(params);
      },
    });
  },

  // Register OAuth providers
  async registerOAuth(oauth: OAuthRegistry) {
    oauth.register({
      name: "plaid",
      description: "Plaid Link OAuth flow for connecting bank accounts",
      handler: async (context: any) => {
        const { plaidOAuth } = await import("./src/oauth/plaid.js");
        return plaidOAuth(context);
      },
    });
  },

  // Register background services
  async registerServices(services: ServiceRegistry) {
    services.register({
      name: "sync-service",
      description: "Background service for automatic transaction synchronization",
      handler: async (context: any) => {
        const { syncService } = await import("./src/services/sync-service.js");
        return syncService(context);
      },
    });

    services.register({
      name: "webhook-handler",
      description: "HTTP endpoint for handling Plaid and Gmail webhooks",
      handler: async (context: any) => {
        const { webhookHandler } = await import("./src/services/webhook-handler.js");
        return webhookHandler(context);
      },
      routes: [
        { path: "/webhook/plaid", method: "POST" },
        { path: "/webhook/gmail", method: "POST" },
      ],
    });
  },
};

export default billclawPlugin;
