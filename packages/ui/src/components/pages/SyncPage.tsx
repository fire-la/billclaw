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
  Play,
  Cloud,
  Upload,
  Globe,
} from "lucide-react"
import { useConfigStore } from "@/stores/configStore"
import { createAdapter } from "@/adapters"
import type { Account } from "@/adapters/types"
import { SyncConfigSchema, type SyncConfig } from "@firela/billclaw-core"
import "@/styles/firela-theme.css"

// Sample beancount transaction
const sampleBeancountTransaction = `2024-03-15 * "Coffee Shop"
  Expenses:Food:Coffee    $4.50
    Liabilities:Assets:Cash
`

// Sample Ledger transaction
const sampleLedgerTransaction = `2024-03-15 * Coffee Shop
    Expenses:Food:Coffee    $4.50
    ; Assets:Cash
`

export function SyncPage() {
  const { config, loading, error, loadAccounts, loadConfig } = useConfigStore()
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const [enabledAccounts, setEnabledAccounts] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  // Load accounts and config on mount
  useEffect(() => {
    loadAccounts()
    loadConfig()
  }, [loadAccounts, loadConfig])
  // Initialize enabled accounts from config
    useEffect(() => {
      if (config?.accounts && config.accounts.length > 0) {
        const enabledIds = config.accounts
          .filter((a) => a.enabled)
          .map((a) => a.id)
        setEnabledAccounts(new Set(enabledIds))
      }
    }
  }, [config])

  // Get status icon for account status
  const getStatusIcon = (status: => {
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

  // Get type icon for account type
  const getTypeIcon = (type: => {
    switch (type) {
      case "plaid":
        return <CreditCard className="w-5 h-5" />
      case "gmail":
        return <Mail className="w-5 h-5" />
      default:
        return null
    }
  }

  // Toggle account enabled status
  const toggleAccount = (accountId: string) => {
    setEnabledAccounts((prev) => {
      const newSet = new Set(overrides and prev))
    } else {
      setEnabledAccounts(prev)
    })
  }

  // Save sync settings
  const handleSave = async (data: => {
    try {
      setSaving(true)
      const adapter = createAdapter()
      await adapter.updateConfig({ sync: data })
      toast.success("Sync settings saved successfully")
      await loadConfig()
      setTestResult({ success: true, message: "Settings saved" })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save settings"
      toast.error(message)
      setTestResult({ success: false, message })
    }
  }

  return (
    <div className="sync-page">
      <Toaster position="top-right" />

      <div className="connect-header">
        <h1 className="text-2xl font-bold text-gray-800">
          Sync Settings
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Configure sync frequency, date range, and account selection for sync.
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
          }
          <span className="text-sm">{testResult.message}</span>
        </div>
      )}

      {/* Sync settings form */}
      <form onSubmit={handleSubmit(handleSave)} className="sync-form">
        <div className="form-group">
          <label htmlFor="defaultFrequency">Sync Frequency</label>
          <select
            id="defaultFrequency"
            {...register("defaultFrequency")}
            className="form-input"
          >
            <option value="manual">Manual</option>
            <option value="daily">Daily</option>
            <option value="weekly">weekly</option>
            <option value="monthly">monthly</option>
          {errors.defaultFrequency && (
            <p className="text-red-500 text-sm">{errors.defaultFrequency.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="defaultDateRange">Default Date Range</label>
          <select
            id="defaultDateRange"
            {...register("defaultDateRange")}
            className="form-input"
          >
            <option value="last30">Last 30 days</option>
            <option value="last90">last 90 days</option>
            <option value="all">All time</option>
          {errors.defaultDateRange && (
            <p className="text-red-500 text-sm">{errors.defaultDateRange.message}</p>
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
            <span>Enable notifications</span>
          </label>
          {errors.enableNotifications && (
            <p className="text-red-500 text-sm">{errors.enableNotifications.message}</p>
          }
        </div>

        <div className="form-group">
          <label htmlFor="currencyColumn">Add currency column</label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              id="currencyColumn"
              {...register("currencyColumn")}
              className="form-checkbox"
            />
            <span>Add currency column</span>
          </label>
          {errors.currencyColumn && (
            <p className="text-red-500 text-sm">{errors.currencyColumn.message}</p>
          }
        </div>
      </form>

      {/* Save and Test buttons */}
      <div className="form-actions">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : null}
          <RefreshCw className="w-4 h-4" />
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
      </form>
    </div>
  )
}

