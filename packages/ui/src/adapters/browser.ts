/**
 * Browser Adapter
 *
 * Implementation of UIAdapter for browser environments.
 * Uses fetch API for HTTP communication with backend services.
 */
import type {
  UIAdapter,
  BillclawConfig,
  Account,
  SyncResult,
  SyncStatus,
  SystemStatus,
} from "./types"

/**
 * Browser-based adapter using fetch API
 */
export class BrowserAdapter implements UIAdapter {
  private baseUrl = "/api"

  async getConfig(): Promise<BillclawConfig> {
    const res = await fetch(`${this.baseUrl}/config`)
    const { data } = await res.json()
    return data
  }

  async updateConfig(config: Partial<BillclawConfig>): Promise<void> {
    const res = await fetch(`${this.baseUrl}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    })
    if (!res.ok) {
      const { error } = await res.json()
      throw new Error(error || "Failed to update config")
    }
  }

  async listAccounts(): Promise<Account[]> {
    const res = await fetch(`${this.baseUrl}/accounts`)
    const { data } = await res.json()
    return data
  }

  async connectAccount(provider: "plaid" | "gmail"): Promise<{ url: string }> {
    const res = await fetch(`${this.baseUrl}/connect/${provider}`, {
      method: "POST",
    })
    const { url } = await res.json()
    return { url }
  }

  async disconnectAccount(accountId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/accounts/${accountId}`, {
      method: "DELETE",
    })
    if (!res.ok) {
      const { error } = await res.json()
      throw new Error(error || "Failed to disconnect account")
    }
  }

  async syncAccount(accountId: string): Promise<SyncResult> {
    const res = await fetch(`${this.baseUrl}/sync/${accountId}`, {
      method: "POST",
    })
    const { data } = await res.json()
    return data
  }

  async getSyncStatus(): Promise<SyncStatus> {
    const res = await fetch(`${this.baseUrl}/sync/status`)
    const { data } = await res.json()
    return data
  }

  async getSystemStatus(): Promise<SystemStatus> {
    const res = await fetch(`${this.baseUrl}/system/status`)
    const { data } = await res.json()
    return data
  }
}
