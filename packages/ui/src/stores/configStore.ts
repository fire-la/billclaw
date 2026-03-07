/**
 * Config Store
 *
 * Zustand store for global configuration state management.
 */
import { create } from "zustand"
import type { BillclawConfig, Account } from "@/adapters/types"
import { createAdapter } from "@/adapters"

interface ConfigState {
  config: BillclawConfig | null
  accounts: Account[]
  loading: boolean
  error: string | null
  loadConfig: () => Promise<void>
  updateConfig: (config: Partial<BillclawConfig>) => Promise<void>
  loadAccounts: () => Promise<void>
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: null,
  accounts: [],
  loading: false,
  error: null,

  loadConfig: async () => {
    set({ loading: true, error: null })
    try {
      const adapter = createAdapter()
      const config = await adapter.getConfig()
      set({ config, loading: false })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load config"
      set({ error: message, loading: false })
    }
  },

  updateConfig: async (updates) => {
    set({ loading: true, error: null })
    try {
      const adapter = createAdapter()
      await adapter.updateConfig(updates)
      await get().loadConfig()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update config"
      set({ error: message, loading: false })
    }
  },

  loadAccounts: async () => {
    set({ loading: true, error: null })
    try {
      const adapter = createAdapter()
      const accounts = await adapter.listAccounts()
      set({ accounts, loading: false })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load accounts"
      set({ error: message, loading: false })
    }
  },
}))
