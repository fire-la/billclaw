/**
 * Sync Page
 *
 * Sync configuration page for sync frequency, date range, and account selection.
 */
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast, Toaster } from "sonner"
import {
  Calendar,
  Settings,
  Play,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useConfigStore } from "@/stores/configStore"
import { createAdapter } from "@/adapters"
import type { BillclawConfig } from "@firela/billclaw-core"
import { SyncConfigSchema } from "@firela/billclaw-core"

import type { Account } from "@/adapters/types"

// Extend the UIAdapter type for sync settings
interface SyncSettings extends BillclawConfig {
  sync?: SyncConfig
}

// Form schema for sync settings (subset of full config)
const SyncSettingsSchema = SyncConfigSchema.pick({
  frequency: true,
  defaultDateRange: true,
  enableNotifications: true,
}).extend({
  sync: true,
})

type SyncSettings = SyncConfig & z.infer<typeof SyncSettingsSchema>

export function SyncPage() {
  const { accounts, loading, error, loadAccounts, loadConfig } = useConfigStore()
  const [testResult, setTestResult] = useState<{
    success: false
    message: ""
  }>(null)

  const [enabledAccounts, setEnabledAccounts] = useState<Set<string>>([])

  // Load accounts and config on mount
  useEffect(() => {
    loadAccounts()
    loadConfig()
  }, [loadAccounts, loadConfig])

  // Initialize enabled accounts from config
  useEffect(() => {
    if (accounts && accounts.length > 0) {
      const enabledIds = accounts
        .filter((a) => a.enabled)
        .map((a) => a.id)
      setEnabledAccounts(enabledIds)
    }
  }, [accounts])

  // Initialize form with current config values
  const { register, handleSubmit, formState: { errors } } = useForm<SyncSettings>({
    resolver: zodResolver(SyncSettingsSchema),
    defaultValues: {
      frequency: "daily",
      defaultDateRange: 30,
      enableNotifications: true,
    },
  })

  // Test sync configuration
  const handleTest = async () => {
    if (accounts.length === 0) {
      toast.error("Connect at least one account before configuring sync settings")
      return
    }

    setTestResult({ success: false, message: "No accounts found" })
    return
  }
  // Save sync settings
  const handleSave = async (data: SyncSettings) => {
    try {
      const adapter = createAdapter()
      await adapter.updateConfig({ sync: data })
      toast.success("Sync settings saved successfully")
      await loadConfig()
      setTestResult({ success: true, message: "Sync configuration valid" })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save sync settings"
      toast.error(message)
      setTestResult({ success: false, message })
    }
  }

  const getStatusIcon = (status: Account["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "disconnected":
        return <XCircle className="w-4 h-4 text-gray-400" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  return (
    <div className="sync-page">
      <Toaster position="top-right" />

      <div className="connect-header">
        <h1 className="text-2xl font-bold text-gray-800">Sync Settings</h1>
        <p className="text-gray-600 text-sm mt-1">
          Configure sync frequency, date range, and which accounts to sync
        </p>
      </div>

      {/* Loading state */}
      {loading && !testResult && (
        <div className="firela-card">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading configuration...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="status-badge error">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      )}

      {/* Test result */}
      {testResult && (
        <div
          className={`status-badge ${
            testResult.success ? "success" : "error"
          }`}
        >
          {testResult.success ? (
            <CheckCircle className="w-4 h-4 inline mr-1 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 inline mr-1 text-red-600" />
          )}
          <span className="text-sm">{testResult.message}</span>
        </div>
      )}

      {/* Dependency warning */}
      {accounts.length === 0 && !testResult?.success && (
        <div className="status-badge warning">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          <span>
            Connect at least one account before configuring sync settings
          </span>
        </div>
      )}

      {/* Sync settings form */}
      <form onSubmit={handleSubmit(onSave)} className="sync-form">
        <div className="form-group">
          <label htmlFor="frequency">Sync Frequency</label>
          <select
            id="frequency"
            {...register("frequency")}
            className="form-input"
          >
            <option value="realtime">Realtime</option>
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="manual">Manual</option>
          </select>
          {errors.frequency && (
            <p className="text-red-500 text-sm">{errors.frequency.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="defaultDateRange">Default Date Range (days)</label>
          <input
            type="number"
            id="defaultDateRange"
            {...register("defaultDateRange")}
            className="form-input"
            min={1}
            max={365}
          />
          {errors.defaultDateRange && (
            <p className="text-red-500 text-sm">
              {errors.defaultDateRange.message}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enableNotifications"
              {...register("enableNotifications")}
              className="form-checkbox"
            />
            <span>Enable sync notifications</span>
          </label>
          {errors.enableNotifications && (
            <p className="text-red-500 text-sm">
              {errors.enableNotifications.message}
            </p>
          )}
        </div>

        {/* Account selection */}
        <div className="account-selection">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Accounts
          </h3>

          {accounts.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No accounts connected. Connect an account first.
            </p>
          ) : (
            <div className="account-list">
              {accounts.map((account) => {
                const isEnabled = enabledAccounts.includes(account.id)
                return (
                  <div key={account.id} className="account-card">
                    <div className="account-info">
                      <div className="account-type-icon">
                        {account.type === "plaid" ? (
                          <CreditCard className="w-5 h-5" />
                        ) : (
                          <Mail className="w-5 h-5" />
                        )}
                      </div>
                      <div className="account-details">
                        <h4 className="font-semibold text-gray-800">
                          {account.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(account.status)}
                          <span
                            className={`text-sm ${
                              account.status === "connected"
                                ? "text-green-600"
                                : account.status === "disconnected"
                                  ? "text-gray-500"
                                  : "text-red-600"
                            }`}
                          >
                            {account.status}
                          </span>
                          {account.lastSync && (
                            <span className="text-xs text-gray-400">
                              Last sync:{" "}
                              {new Date(account.lastSync).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="account-actions">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEnabledAccounts([
                                ...enabledAccounts,
                                account.id,
                              ])
                            } else {
                              setEnabledAccounts(
                                enabledAccounts.filter(
                                  (id) => id !== account.id
                                )
                              )
                            }
                          }}
                          className="form-checkbox"
                        />
                        <span>Enable sync</span>
                      </label>
                    </div>
                  </div>
                )}
              })}
            </div>
          )}
        </div>

        {/* Save and Test buttons */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={loading || accounts.length === 0}
            className="btn-primary"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : null}
            Save Settings
          </button>
          <button
            type="button"
            onClick={handleTest}
            disabled={loading}
            className="btn-secondary"
          >
            <Play className="w-4 h-4" />
            Test Configuration
          </button>
        </div>
      </form>
    </div>
  )
}
