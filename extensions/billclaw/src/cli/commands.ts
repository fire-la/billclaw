/**
 * CLI command implementations for billclaw
 */

import { AccountConfig, AccountType, SyncFrequency, PlaidEnvironment } from "../../config.js";
import type { PlaidOAuthResult } from "../oauth/plaid.js";
import { plaidOAuth, createLinkToken } from "../oauth/plaid.js";
import type { PlaidSyncResult } from "../tools/plaid-sync.js";
import { plaidSyncTool } from "../tools/plaid-sync.js";
import type {
  AccountRegistry,
  StorageConfig,
} from "../storage/transaction-storage.js";
import {
  initializeStorage,
  readAccountRegistry,
  writeAccountRegistry,
  readSyncStates,
} from "../storage/transaction-storage.js";

/**
 * Mock context for CLI commands (in real usage, OpenClaw provides this)
 */
interface MockContext {
  logger: {
    info: (...args: any[]) => void;
    error: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    debug: (...args: any[]) => void;
  };
  config: {
    get: (key: string) => any;
    set: (key: string, value: any) => Promise<void>;
  };
}

/**
 * Create a mock context for CLI operations
 */
function createMockContext(): MockContext {
  return {
    logger: {
      info: (...args: any[]) => console.log(...args),
      error: (...args: any[]) => console.error(...args),
      warn: (...args: any[]) => console.warn(...args),
      debug: (...args: any[]) => console.debug(...args),
    },
    config: {
      get: (key: string) => {
        // In real usage, OpenClaw provides the config
        // For now, return empty config
        return {};
      },
      set: async (key: string, value: any) => {
        // In real usage, OpenClaw handles persistence
        console.log(`Config updated: ${key}`);
      },
    },
  };
}

/**
 * Interactive setup wizard for connecting bank accounts
 */
export async function setupWizard(): Promise<void> {
  console.log("🦀 billclaw Setup Wizard");
  console.log("This will guide you through connecting your bank accounts.\n");

  const context = createMockContext();

  // Initialize storage
  await initializeStorage();

  // Step 1: Select data source
  console.log("Step 1: Select your data source");
  console.log("  1. Plaid (US/Canada)");
  console.log("  2. GoCardless (Europe) - Coming soon");
  console.log("  3. Gmail Bills - Coming soon\n");

  // In real implementation, this would be interactive
  // For now, show instructions for Plaid setup
  console.log("⚠️  Plaid Setup Instructions:");
  console.log("\n1. Get your Plaid API credentials:");
  console.log("   - Go to https://dashboard.plaid.com");
  console.log("   - Create an account or sign in");
  console.log("   - Go to API Keys and note your Client ID and Secret");
  console.log("\n2. Set environment variables:");
  console.log("   export PLAID_CLIENT_ID='your_client_id'");
  console.log("   export PLAID_SECRET='your_secret'");
  console.log("\n3. Run: openclaw bills sync");
  console.log("\n4. For OAuth flow (coming soon):");
  console.log("   Run: openclaw bills setup --interactive");
  console.log("\n💡 Your transactions will be stored in: ~/.openclaw/billclaw/");
  console.log("💡 Data sovereignty: Access tokens are stored locally, never on our servers.");
}

/**
 * Manually trigger sync for all or specific account
 */
export async function syncCommand(
  accountId?: string
): Promise<{
  success: boolean;
  accounts: number;
  transactions: number;
  errors: string[];
}> {
  console.log(`🔄 Syncing${accountId ? ` account ${accountId}` : " all accounts"}...`);

  const context = createMockContext();

  // In real implementation, this would call the actual tool
  // For now, show a message
  try {
    const result: PlaidSyncResult = await plaidSyncTool(context, {
      accountId,
    });

    if (result.success) {
      console.log(`✅ Sync completed:`);
      console.log(`   Accounts synced: ${accountId || "all"}`);
      console.log(`   Transactions added: ${result.transactionsAdded}`);
      console.log(`   Transactions updated: ${result.transactionsUpdated}`);
      if (result.cursor) {
        console.log(`   Cursor: ${result.cursor.substring(0, 16)}...`);
      }
    } else {
      console.log(`❌ Sync failed:`);
      if (result.errors) {
        for (const error of result.errors) {
          console.log(`   - ${error}`);
        }
      }
    }

    return {
      success: result.success,
      accounts: accountId ? 1 : -1, // TODO: Get actual count
      transactions: result.transactionsAdded + result.transactionsUpdated,
      errors: result.errors || [],
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.log(`❌ Sync error: ${errorMsg}`);
    return {
      success: false,
      accounts: 0,
      transactions: 0,
      errors: [errorMsg],
    };
  }
}

/**
 * Show connection status and recent sync results
 */
export async function statusCommand(): Promise<void> {
  console.log("📊 billclaw Status\n");

  const context = createMockContext();

  try {
    // Read accounts
    const accounts = await readAccountRegistry();

    if (accounts.length === 0) {
      console.log("No accounts configured yet.");
      console.log("\nRun 'openclaw bills setup' to get started.");
      return;
    }

    console.log(`Configured Accounts: ${accounts.length}\n`);

    for (const account of accounts) {
      const syncStates = await readSyncStates(account.id);
      const lastSync = syncStates.find((s) => s.status === "completed");
      const lastSyncTime = lastSync?.completedAt
        ? new Date(lastSync.completedAt).toLocaleString()
        : "Never";
      const status = lastSync?.status || "pending";

      const statusEmoji =
        status === "completed" ? "✅" : status === "failed" ? "❌" : "⏳";

      console.log(
        `  ${statusEmoji} ${account.name} (${account.type}) - Last sync: ${lastSyncTime}`
      );
    }

    console.log("\n💡 Run 'openclaw bills sync' to sync all accounts.");
  } catch (error) {
    console.log("❌ Failed to read status:", error);
  }
}

/**
 * Manage configuration
 */
export async function configCommand(args: {
  key?: string;
  value?: string;
}): Promise<void> {
  const context = createMockContext();

  if (args.key && args.value) {
    console.log(`Setting ${args.key} = ${args.value}`);
    // In real implementation, this would update the config
    await context.config.set(`billclaw.${args.key}`, args.value);
    console.log(`✅ Configuration updated`);
  } else if (args.key) {
    console.log(`Getting ${args.key}:`);
    // In real implementation, this would read from config
    const value = context.config.get(`billclaw.${args.key}`);
    console.log(JSON.stringify(value, null, 2));
  } else {
    console.log("💡 billclaw Configuration Management\n");
    console.log("View all config:");
    console.log("  openclaw bills config\n");
    console.log("Set a value:");
    console.log("  openclaw bills config set plaid.clientId YOUR_CLIENT_ID");
    console.log("  openclaw bills config set plaid.secret YOUR_SECRET");
    console.log("  openclaw bills config set plaid.environment sandbox\n");
    console.log("Available config paths:");
    console.log("  plaid.clientId     - Plaid Client ID");
    console.log("  plaid.secret       - Plaid Secret");
    console.log("  plaid.environment  - sandbox|development|production");
    console.log("  storage.path       - Local storage path (default: ~/.openclaw/billclaw)");
  }
}
