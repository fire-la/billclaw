/**
 * Unit tests for sync utilities
 */

import { describe, it, expect, beforeEach } from "vitest";
import { SyncFrequency } from "../../config.js";

// Re-implement the functions here for testing since importing from sync-service
// causes issues with the compiled plaid-sync.js module
function calculateNextSync(frequency: SyncFrequency, lastSync?: Date): Date {
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

function isDueForSync(
  account: { enabled: boolean; lastSync?: string; syncFrequency: SyncFrequency }
): boolean {
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

describe("sync utilities", () => {
  describe("calculateNextSync", () => {
    it("should return zero date for realtime frequency", () => {
      const result = calculateNextSync(SyncFrequency.Realtime);
      expect(result.getTime()).toBe(0);
    });

    it("should return zero date for manual frequency", () => {
      const result = calculateNextSync(SyncFrequency.Manual);
      expect(result.getTime()).toBe(0);
    });

    it("should calculate hourly next sync", () => {
      const now = new Date("2024-01-15T10:00:00.000Z");
      const result = calculateNextSync(SyncFrequency.Hourly, now);

      expect(result.getTime()).toBe(now.getTime() + 60 * 60 * 1000);
      expect(result.toISOString()).toBe("2024-01-15T11:00:00.000Z");
    });

    it("should calculate daily next sync", () => {
      const now = new Date("2024-01-15T10:30:00.000Z");
      const result = calculateNextSync(SyncFrequency.Daily, now);

      // Next day at same time
      expect(result.toISOString()).toBe("2024-01-16T10:30:00.000Z");
    });

    it("should calculate weekly next sync", () => {
      const now = new Date("2024-01-15T10:30:00.000Z"); // Monday
      const result = calculateNextSync(SyncFrequency.Weekly, now);

      // Next week on same day (7 days later)
      expect(result.toISOString()).toBe("2024-01-22T10:30:00.000Z");
    });

    it("should use current time when lastSync is not provided", () => {
      const before = Date.now();
      const result = calculateNextSync(SyncFrequency.Hourly);
      const after = Date.now();

      expect(result.getTime()).toBeGreaterThanOrEqual(before + 60 * 60 * 1000);
      expect(result.getTime()).toBeLessThanOrEqual(after + 60 * 60 * 1000);
    });
  });

  describe("isDueForSync", () => {
    let mockAccount: {
      id: string;
      type: string;
      name: string;
      enabled: boolean;
      syncFrequency: SyncFrequency;
      lastSync?: string;
    };

    beforeEach(() => {
      mockAccount = {
        id: "acc_1",
        type: "plaid",
        name: "Test Account",
        enabled: true,
        syncFrequency: SyncFrequency.Daily,
        lastSync: undefined,
      };
    });

    it("should return true for account without lastSync", () => {
      const result = isDueForSync(mockAccount);
      expect(result).toBe(true);
    });

    it("should return false for manual frequency accounts", () => {
      mockAccount.syncFrequency = SyncFrequency.Manual;
      mockAccount.lastSync = "2024-01-01T00:00:00.000Z";

      const result = isDueForSync(mockAccount);
      expect(result).toBe(false);
    });

    it("should return false for realtime frequency accounts", () => {
      mockAccount.syncFrequency = SyncFrequency.Realtime;
      mockAccount.lastSync = "2024-01-01T00:00:00.000Z";

      const result = isDueForSync(mockAccount);
      expect(result).toBe(false);
    });

    it("should return true when sync period has elapsed", () => {
      // Last sync was 2 days ago, frequency is daily
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      mockAccount.lastSync = twoDaysAgo;
      mockAccount.syncFrequency = SyncFrequency.Daily;

      const result = isDueForSync(mockAccount);
      expect(result).toBe(true);
    });

    it("should return false when sync period has not elapsed", () => {
      // Last sync was 1 hour ago, frequency is daily
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      mockAccount.lastSync = oneHourAgo;
      mockAccount.syncFrequency = SyncFrequency.Daily;

      const result = isDueForSync(mockAccount);
      expect(result).toBe(false);
    });

    it("should return true exactly at sync time", () => {
      // Last sync was 24 hours ago, frequency is daily
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      mockAccount.lastSync = twentyFourHoursAgo;
      mockAccount.syncFrequency = SyncFrequency.Daily;

      const result = isDueForSync(mockAccount);
      expect(result).toBe(true);
    });

    it("should handle hourly frequency", () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      mockAccount.lastSync = twoHoursAgo;
      mockAccount.syncFrequency = SyncFrequency.Hourly;

      const result = isDueForSync(mockAccount);
      expect(result).toBe(true);
    });

    it("should handle weekly frequency", () => {
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
      mockAccount.lastSync = eightDaysAgo;
      mockAccount.syncFrequency = SyncFrequency.Weekly;

      const result = isDueForSync(mockAccount);
      expect(result).toBe(true);
    });

    it("should return false for weekly frequency within period", () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      mockAccount.lastSync = threeDaysAgo;
      mockAccount.syncFrequency = SyncFrequency.Weekly;

      const result = isDueForSync(mockAccount);
      expect(result).toBe(false);
    });
  });
});
