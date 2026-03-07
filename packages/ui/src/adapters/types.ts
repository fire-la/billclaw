/**
 * UIAdapter Types
 *
 * Core interface for multi-environment UI deployment.
 * Enables the same React codebase to work in browser, CLI, and OpenClaw contexts.
 */

/**
 * Account information
 */
export interface Account {
  id: string
  name: string
  type: "plaid" | "gmail"
  lastSync?: string
  status: "connected" | "disconnected" | "error"
}

/**
 * Result of a sync operation
 */
export interface SyncResult {
  success: boolean
  transactionsAdded: number
  error?: string
}

/**
 * Current sync status
 */
export interface SyncStatus {
  lastSync: string | null
  status: "idle" | "syncing" | "error"
  accounts: { id: string; name: string; lastSync: string | null }[]
}

/**
 * System status information
 */
export interface SystemStatus {
  version: string
  platform: string
  configPath: string
}

/**
 * BillClaw configuration (masked for UI display)
 */
export interface BillclawConfig {
  plaid?: {
    clientId?: string
    secret?: string // Masked as "***"
    env?: string
  }
  gmail?: {
    clientId?: string
    clientSecret?: string // Masked as "***"
    refreshToken?: string // Masked as "***"
  }
  ign?: {
    apiToken?: string // Masked as "***"
    webhookSecret?: string // Masked as "***"
  }
  export?: {
    format?: "beancount" | "ledger"
    outputPath?: string
    filePrefix?: string
    includePending?: boolean
    currencyColumn?: boolean
  }
  storage?: {
    path?: string
  }
  connect?: {
    publicUrl?: string
  }
}

/**
 * UIAdapter Interface
 *
 * Abstract interface for UI operations across different runtime environments.
 * Implementations:
 * - BrowserAdapter: Uses fetch API for HTTP communication
 * - (Future) CLIAdapter: Direct function calls to core
 * - (Future) OpenClawAdapter: Integration with OpenClaw runtime
 */
export interface UIAdapter {
  /**
   * Get the current BillClaw configuration (with sensitive fields masked)
   */
  getConfig(): Promise<BillclawConfig>

  /**
   * Update BillClaw configuration
   */
  updateConfig(config: Partial<BillclawConfig>): Promise<void>

  /**
   * List all connected accounts
   */
  listAccounts(): Promise<Account[]>

  /**
   * Initiate OAuth connection for a provider
   * Returns URL to redirect user to for authorization
   */
  connectAccount(provider: "plaid" | "gmail"): Promise<{ url: string }>

  /**
   * Disconnect an account
   */
  disconnectAccount(accountId: string): Promise<void>

  /**
   * Trigger sync for a specific account
   */
  syncAccount(accountId: string): Promise<SyncResult>

  /**
   * Get current sync status
   */
  getSyncStatus(): Promise<SyncStatus>

  /**
   * Get system status information
   */
  getSystemStatus(): Promise<SystemStatus>
}
