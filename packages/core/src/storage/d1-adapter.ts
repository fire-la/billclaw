/**
 * D1StorageAdapter - Cloudflare D1 database implementation of StorageAdapter
 *
 * This adapter enables BillClaw to run on Cloudflare Workers using D1
 * as the storage backend instead of the local file system.
 *
 * @packageDocumentation
 */

import type {
  StorageAdapter,
  StorageCapabilities,
  Transaction,
  SyncState,
  AccountRegistry,
} from "./types.js"

/**
 * D1Database type from @cloudflare/workers-types
 *
 * Note: We use a minimal interface to avoid importing Cloudflare types
 * which would add unnecessary dependencies for non-Workers environments.
 */
export interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>
  exec(query: string): Promise<D1Result>
  dump(): Promise<ArrayBuffer>
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = unknown>(colName?: string): Promise<T | null>
  run(): Promise<D1Result>
  all<T = unknown>(): Promise<D1Result<T[]>>
  raw<T = unknown>(): Promise<T[]>
}

export interface D1Result<T = unknown> {
  results: T[]
  success: boolean
  error?: string
  meta?: {
    duration: number
    changes: number
    last_row_id: number
    rows_read: number
    rows_written: number
  }
}

/**
 * D1StorageAdapter options
 */
export interface D1StorageAdapterOptions {
  /**
   * D1 database binding
   */
  db: D1Database
}

/**
 * D1 database storage adapter for Cloudflare Workers
 *
 * Uses D1 SQL API for all storage operations. Unlike FileStorageAdapter,
 * D1StorageAdapter supports transactions and does not require file locking.
 *
 * @example
 * ```typescript
 * // In Cloudflare Worker
 * const storage = new D1StorageAdapter({ db: env.DB })
 * await storage.initialize()
 *
 * const transactions = await storage.getTransactions('account-1', 2024, 1)
 * ```
 */
export class D1StorageAdapter implements StorageAdapter {
  private db: D1Database

  constructor(options: D1StorageAdapterOptions) {
    this.db = options.db
  }

  /**
   * Get the storage capabilities for this adapter
   */
  getCapabilities(): StorageCapabilities {
    return {
      supportsLocking: false, // D1 uses transactions, not file locking
      supportsTransactions: true,
      supportsStreaming: false,
    }
  }

  // StorageAdapter implementation

  async initialize(): Promise<void> {
    // Read and execute the schema
    // In production, schema should be applied via D1 migrations
    // This method is provided for development/testing purposes
    const schema = await this.getSchema()
    await this.db.exec(schema)
  }

  /**
   * Get the D1 schema SQL
   *
   * This returns the schema that should be applied to the D1 database.
   * In production, use wrangler d1 migrations instead.
   */
  private async getSchema(): Promise<string> {
    // Schema is defined in d1-schema.sql
    // This is a placeholder - actual implementation should read the file
    // or embed the schema as a constant
    return `
      -- Schema will be applied via wrangler d1 migrations
      -- See d1-schema.sql for the full schema
    `
  }

  async getTransactions(
    _accountId: string,
    _year: number,
    _month: number,
  ): Promise<Transaction[]> {
    // TODO: Implement in 06-02
    throw new Error("D1StorageAdapter.getTransactions not implemented yet")
  }

  async saveTransactions(
    _accountId: string,
    _year: number,
    _month: number,
    _transactions: Transaction[],
  ): Promise<void> {
    // TODO: Implement in 06-02
    throw new Error("D1StorageAdapter.saveTransactions not implemented yet")
  }

  async appendTransactions(
    _accountId: string,
    _year: number,
    _month: number,
    _transactions: Transaction[],
  ): Promise<{ added: number; updated: number }> {
    // TODO: Implement in 06-02
    throw new Error("D1StorageAdapter.appendTransactions not implemented yet")
  }

  async getSyncStates(_accountId: string): Promise<SyncState[]> {
    // TODO: Implement in 06-02
    throw new Error("D1StorageAdapter.getSyncStates not implemented yet")
  }

  async getLatestSyncState(_accountId: string): Promise<SyncState | null> {
    // TODO: Implement in 06-02
    throw new Error(
      "D1StorageAdapter.getLatestSyncState not implemented yet",
    )
  }

  async saveSyncState(_state: SyncState): Promise<void> {
    // TODO: Implement in 06-02
    throw new Error("D1StorageAdapter.saveSyncState not implemented yet")
  }

  async getAccounts(): Promise<AccountRegistry[]> {
    // TODO: Implement in 06-02
    throw new Error("D1StorageAdapter.getAccounts not implemented yet")
  }

  async getAccount(_accountId: string): Promise<AccountRegistry | null> {
    // TODO: Implement in 06-02
    throw new Error("D1StorageAdapter.getAccount not implemented yet")
  }

  async saveAccount(_account: AccountRegistry): Promise<void> {
    // TODO: Implement in 06-02
    throw new Error("D1StorageAdapter.saveAccount not implemented yet")
  }

  async deleteAccount(_accountId: string): Promise<void> {
    // TODO: Implement in 06-02
    throw new Error("D1StorageAdapter.deleteAccount not implemented yet")
  }
}

/**
 * Create a D1StorageAdapter with the given database binding
 *
 * @param db - D1 database binding from Cloudflare Worker environment
 * @returns D1StorageAdapter instance
 */
export function createD1StorageAdapter(db: D1Database): D1StorageAdapter {
  return new D1StorageAdapter({ db })
}
