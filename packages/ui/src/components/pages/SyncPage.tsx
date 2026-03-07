/**
 * Sync Page
 *
 * Sync configuration page for sync frequency, date range, and account selection.
 */
import { useEffect, useState } from "react"
import { toast, Toaster } from "sonner"
import {
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  CreditCard,
  Mail,
} from "lucide-react"
import { useConfigStore } from "@/stores/configStore"
import { createAdapter } from "@/adapters"
import type { Account } from "@/adapters/types"
import { SyncConfigSchema, type SyncConfig } from "@firela/billclaw-core"
import "@/styles/firela-theme.css"

export function SyncPage() {
  const { accounts, loading, error, loadAccounts, config, loadConfig } = useConfigStore()
  const [saving, setSaving] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const [enabledAccounts, setEnabledAccounts] = useState<Set<string>>(new Set())

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
      setEnabledAccounts(new Set(enabledIds))
    }
  }, [accounts])

  // Get status icon for account
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "disconnected":
        return <XCircle className="w-4 h-4 text-gray-400" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  // Get type icon for account
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "plaid":
        return <CreditCard className="w-5 h-5" />
      case "gmail":
        return <Mail className="w-5 h-5" />
      default:
        return null
    }
  }

  // Handle sync settings save
  const handleSave = async () => {
    setSaving(true)
    setTestResult(null)

    try {
      const adapter = createAdapter()
      const syncSettings: SyncConfig = {
        defaultFrequency: "daily",
        retryOnFailure: true,
        maxRetries: 3,
      }

      await adapter.updateConfig({ sync: syncSettings })
      toast.success("Sync settings saved successfully")
      setTestResult({ success: true, message: "Settings saved" })
      await loadConfig()
    } catch (error) {
      const message =
          error instanceof Error ? error.message : "Failed to save settings"
      toast.error(message)
      setTestResult({ success: false, message })
    } finally {
      setSaving(false)
    }
  }

  // Handle test sync
  const handleTest = async () => {
    setTestResult(null)

    try {
      // Test sync configuration
      // For now, just validate that we have enabled accounts
      if (enabledAccounts.size === 0) {
        setTestResult({
          success: false,
          message: "Please enable at least one account for sync",
        })
        return
      }

      toast.success("Sync configuration is valid")
      setTestResult({ success: true, message: "Configuration valid" })
    } catch (error) {
      const message =
          error instanceof Error ? error.message : "Failed to test configuration"
      toast.error(message)
      setTestResult({ success: false, message })
    }
  }

  // Toggle account enabled status
  const toggleAccount = (accountId: string) => {
    setEnabledAccounts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(accountId)) {
        newSet.delete(accountId)
      } else {
        newSet.add(accountId)
      }
      return newSet
    })
  }

  return (
    <div className="sync-page">
      <Toaster position="top-right" />

      <div className="connect-header">
        <h1 className="text-2xl font-bold text-gray-800">Sync Settings</h1>
        <p className="text-gray-600 text-sm mt-1">
          Configure sync frequency and select accounts for synchronization
        </p>
      </div>

      {/* Loading state */}
      {loading && accounts.length === 0 && (
        <div className="firela-card">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading accounts...</span>
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

      {/* Sync settings form */}
      <div className="firela-card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Accounts
        </h3>

        {accounts.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No accounts found. Connect an account first to enable sync.
          </p>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => {
              const isEnabled = enabledAccounts.has(account.id)
              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-gray-500">{getTypeIcon(account.type)}</div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {account.name}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {getStatusIcon(account.status)}
                        <span
                          className={
                            account.status === "connected"
                              ? "text-green-600"
                              : "text-gray-500"
                          }
                        >
                          {account.status}
                        </span>
                        {account.lastSync && (
                          <span className="text-gray-400">
                            Last sync:{" "}
                            {new Date(account.lastSync).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => toggleAccount(account.id)}
                      className="form-checkbox"
                    />
                    <span className="text-sm text-gray-600">Enable sync</span>
                  </label>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Save and Test buttons */}
      <div className="form-actions">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="btn-primary"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : null}
          Save Settings
        </button>
        <button
          type="button"
          onClick={handleTest}
          disabled={saving || loading || accounts.length === 0}
          className="btn-secondary"
        >
          Test Configuration
        </button>
      </div>
    </div>
  )
}
