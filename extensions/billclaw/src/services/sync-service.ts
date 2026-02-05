/**
 * Background sync service - runs scheduled transaction synchronization
 */

import type { ServiceContext } from "../../openclaw-types";
import { AccountConfig, AccountType, SyncFrequency } from "../../config.js";
import type { PlaidSyncResult } from "../tools/plaid-sync.js";
import { plaidSyncTool } from "../tools/plaid-sync.js";

export interface SyncServiceState {
  isRunning: boolean;
  lastSync: string | null;
  nextSync: string | null;
  accountsSynced: number;
}

/**
 * Calculate next sync time based on sync frequency
 */
export function calculateNextSync(frequency: SyncFrequency, lastSync?: Date): Date {
  const now = new Date();
  const base = lastSync || now;

  switch (frequency) {
    case SyncFrequency.Realtime:
      // Webhook-based, no scheduled sync
      return new Date(0);

    case SyncFrequency.Hourly:
      return new Date(base.getTime() + 60 * 60 * 1000);

    case SyncFrequency.Daily:
      // Next day at same time
      const nextDay = new Date(base);
      nextDay.setDate(nextDay.getDate() + 1);
      return nextDay;

    case SyncFrequency.Weekly:
      // Next week on same day
      const nextWeek = new Date(base);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;

    case SyncFrequency.Manual:
      // No scheduled sync
      return new Date(0);

    default:
      return new Date(base.getTime() + 24 * 60 * 60 * 1000);
  }
}

/**
 * Check if an account is due for sync
 */
export function isDueForSync(account: AccountConfig): boolean {
  if (!account.enabled || !account.lastSync) {
    return true;
  }

  const lastSync = new Date(account.lastSync);
  const nextSync = calculateNextSync(account.syncFrequency, lastSync);

  // Manual accounts never sync automatically
  if (account.syncFrequency === SyncFrequency.Manual) {
    return false;
  }

  // Realtime accounts sync via webhook, not scheduled
  if (account.syncFrequency === SyncFrequency.Realtime) {
    return false;
  }

  return new Date() >= nextSync;
}

/**
 * Trigger sync for a single account
 */
async function syncAccount(
  accountId: string,
  context: ServiceContext
): Promise<void> {
  try {
    const result: PlaidSyncResult = await plaidSyncTool(context as any, {
      accountId,
    });

    if (result.success) {
      context.logger.info(
        `Sync completed for ${accountId}: ${result.transactionsAdded} added, ${result.transactionsUpdated} updated`
      );
    } else {
      context.logger.error(
        `Sync failed for ${accountId}:`,
        result.errors || []
      );
    }
  } catch (error) {
    context.logger.error(`Error syncing ${accountId}:`, error);
  }
}

/**
 * Background service for automatic transaction synchronization
 *
 * This service runs periodically (based on account sync frequency settings)
 * and syncs transactions from all enabled accounts.
 */
export async function syncService(context: ServiceContext): Promise<void> {
  context.logger.info("billclaw sync service started");

  const config = context.config.get("billclaw") as any;
  const accounts: AccountConfig[] = config?.accounts || [];

  // Filter for Plaid accounts
  const plaidAccounts = accounts.filter(
    (acc) => acc.type === AccountType.Plaid && acc.enabled
  );

  if (plaidAccounts.length === 0) {
    context.logger.info("No enabled Plaid accounts to sync");
    return;
  }

  context.logger.info(`Found ${plaidAccounts.length} Plaid accounts to check`);

  let syncedCount = 0;

  for (const account of plaidAccounts) {
    if (isDueForSync(account)) {
      context.logger.info(`Syncing account: ${account.name} (${account.id})`);
      await syncAccount(account.id, context);
      syncedCount++;
    } else {
      context.logger.info(
        `Skipping ${account.name} (${account.id}): not due for sync`
      );
    }
  }

  context.logger.info(`Sync service completed: ${syncedCount} accounts synced`);
}
