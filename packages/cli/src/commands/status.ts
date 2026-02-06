/**
 * Status command
 *
 * Show connection status and recent sync results.
 */

import type { CliCommand, CliContext } from "./registry.js";
import { createTable, printTable, formatStatus, formatAccountType, formatDate } from "../utils/format.js";
import { Billclaw } from "@fire-zu/billclaw-core";

/**
 * Run status command
 */
async function runStatus(context: CliContext): Promise<void> {
  const { runtime } = context;
  const billclaw = new Billclaw(runtime);

  const accounts = await billclaw.getAccounts();

  if (accounts.length === 0) {
    console.log("No accounts configured. Run 'billclaw setup' first.");
    return;
  }

  console.log("");
  console.log("BillClaw Status");
  console.log("");

  // Accounts table
  const accountsTable = createTable({
    head: ["Account ID", "Type", "Status", "Last Sync"],
  });

  for (const account of accounts) {
    accountsTable.push([
      account.id,
      formatAccountType(account.type),
      formatStatus(account.lastStatus ?? "unknown"),
      account.lastSync
        ? formatDate(account.lastSync)
        : "Never",
    ]);
  }

  printTable(accountsTable);

  // TODO: Add storage stats
  // TODO: Add recent sync results
}

/**
 * Status command definition
 */
export const statusCommand: CliCommand = {
  name: "status",
  description: "Show connection status and recent sync results",
  handler: runStatus,
};
