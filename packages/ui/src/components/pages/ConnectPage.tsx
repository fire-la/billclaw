/**
 * Connect Page
 *
 * Unified account management page for Plaid and Gmail connections.
 * Displays connected accounts and provides connect/disconnect actions.
 */
import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast, Toaster } from "sonner"
import {
  Link,
  Unlink,
  CheckCircle,
  XCircle,
  Loader2,
  CreditCard,
  Mail,
} from "lucide-react"
import { useConfigStore } from "@/stores/configStore"
import { createAdapter } from "@/adapters"
import type { Account } from "@/adapters/types"
import "@/styles/firela-theme.css"

export function ConnectPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { accounts, loading, error, loadAccounts } = useConfigStore()
  const [disconnecting, setDisconnecting] = useState<string | null>(null)

  // Load accounts on mount
  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  // Handle OAuth callback success
  useEffect(() => {
    const connected = searchParams.get("connected")
    if (connected === "true") {
      toast.success("Account connected successfully!")
      // Refresh account list
      loadAccounts()
      // Clean up URL
      navigate("/connect", { replace: true })
    }
  }, [searchParams, loadAccounts, navigate])

  const handleConnectPlaid = () => {
    navigate("/connect/plaid")
  }

  const handleConnectGmail = () => {
    navigate("/connect/gmail")
  }

  const handleDisconnect = async (accountId: string) => {
    setDisconnecting(accountId)
    try {
      const adapter = createAdapter()
      await adapter.disconnectAccount(accountId)
      toast.success("Account disconnected successfully")
      // Refresh account list
      await loadAccounts()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to disconnect account"
      toast.error(message)
    } finally {
      setDisconnecting(null)
    }
  }

  const getStatusIcon = (status: Account["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "disconnected":
        return <XCircle className="w-4 h-4 text-gray-400" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = (status: Account["status"]) => {
    switch (status) {
      case "connected":
        return "text-green-600"
      case "disconnected":
        return "text-gray-500"
      case "error":
        return "text-red-600"
    }
  }

  const getTypeIcon = (type: Account["type"]) => {
    switch (type) {
      case "plaid":
        return <CreditCard className="w-5 h-5" />
      case "gmail":
        return <Mail className="w-5 h-5" />
    }
  }

  return (
    <div className="connect-page">
      <Toaster position="top-right" />

      <div className="connect-header">
        <h1 className="text-2xl font-bold text-gray-800">Connected Accounts</h1>
        <p className="text-gray-600 text-sm mt-1">
          Manage your Plaid and Gmail account connections
        </p>
      </div>

      {/* Loading state */}
      {loading && accounts.length === 0 && (
        <div className="firela-card">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading accounts...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="status-badge error">
          <XCircle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      )}

      {/* Account list */}
      {!loading && accounts.length > 0 && (
        <div className="account-list">
          {accounts.map((account) => (
            <div key={account.id} className="account-card">
              <div className="account-info">
                <div className="account-type-icon">{getTypeIcon(account.type)}</div>
                <div className="account-details">
                  <h3 className="font-semibold text-gray-800">{account.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(account.status)}
                    <span className={`text-sm ${getStatusColor(account.status)}`}>
                      {account.status}
                    </span>
                    {account.lastSync && (
                      <span className="text-xs text-gray-400">
                        Last sync: {new Date(account.lastSync).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="account-actions">
                <button
                  className="btn-disconnect"
                  onClick={() => handleDisconnect(account.id)}
                  disabled={disconnecting === account.id}
                >
                  {disconnecting === account.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Unlink className="w-4 h-4" />
                  )}
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && accounts.length === 0 && !error && (
        <div className="firela-card">
          <div className="text-gray-500 mb-4">
            No accounts connected yet. Connect your first account to get started.
          </div>
        </div>
      )}

      {/* Connect buttons */}
      <div className="connect-actions">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Connect New Account
        </h2>
        <div className="connect-buttons">
          <button className="btn-connect btn-plaid" onClick={handleConnectPlaid}>
            <Link className="w-4 h-4" />
            <span>Connect Plaid</span>
          </button>
          <button className="btn-connect btn-gmail" onClick={handleConnectGmail}>
            <Link className="w-4 h-4" />
            <span>Connect Gmail</span>
          </button>
        </div>
      </div>
    </div>
  )
}
