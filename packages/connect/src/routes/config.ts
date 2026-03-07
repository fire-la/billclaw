/**
 * Config API Routes
 *
 * REST API endpoints for configuration management.
 * Provides endpoints for reading and updating BillClaw configuration.
 */
import { Router } from "express"
import { ConfigManager } from "@firela/billclaw-core"
import type { BillclawConfig } from "@firela/billclaw-core"

export const configRouter: Router = Router()

/**
 * Mask sensitive configuration fields
 */
function maskConfig(config: BillclawConfig): BillclawConfig {
  const masked = { ...config }

  // Mask Plaid secret
  if (masked.plaid) {
    masked.plaid = {
      ...masked.plaid,
      secret: masked.plaid.secret ? "***" : undefined,
    }
  }

  // Mask Gmail client secret
  if (masked.gmail) {
    masked.gmail = {
      ...masked.gmail,
      clientSecret: masked.gmail.clientSecret ? "***" : undefined,
    }
  }

  // Mask IGN API token
  if (masked.ign) {
    masked.ign = {
      ...masked.ign,
      apiToken: masked.ign.apiToken ? "***" : undefined,
    }
  }

  // Mask account-level sensitive data (tokens, etc.)
  if (masked.accounts) {
    masked.accounts = masked.accounts.map((account) => ({
      ...account,
      plaidAccessToken: account.plaidAccessToken ? "***" : undefined,
      gocardlessAccessToken: account.gocardlessAccessToken ? "***" : undefined,
      gmailAccessToken: account.gmailAccessToken ? "***" : undefined,
      gmailRefreshToken: account.gmailRefreshToken ? "***" : undefined,
    }))
  }

  return masked
}

/**
 * GET /api/config
 * Returns the current configuration with sensitive fields masked
 */
configRouter.get("/config", async (_req, res) => {
  try {
    const configManager = ConfigManager.getInstance()
    const config = await configManager.getConfig()
    const masked = maskConfig(config)
    res.json({ success: true, data: masked })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load config"
    res.status(500).json({ success: false, error: message })
  }
})

/**
 * PUT /api/config
 * Updates the configuration
 */
configRouter.put("/config", async (req, res) => {
  try {
    const configManager = ConfigManager.getInstance()
    // Use updateConfig for partial updates
    await configManager.updateConfig(req.body as Partial<BillclawConfig>)
    res.json({ success: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update config"
    res.status(400).json({ success: false, error: message })
  }
})

/**
 * GET /api/accounts
 * Lists all connected accounts
 */
configRouter.get("/accounts", async (_req, res) => {
  try {
    const configManager = ConfigManager.getInstance()
    const config = await configManager.getConfig()

    // Transform accounts for UI display
    const accounts = config.accounts.map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      enabled: account.enabled,
      lastSync: account.lastSync || null,
      lastStatus: account.lastStatus || null,
      status:
        account.type === "plaid"
          ? account.plaidAccessToken
            ? "connected"
            : "disconnected"
          : account.type === "gmail"
            ? account.gmailRefreshToken
              ? "connected"
              : "disconnected"
            : account.type === "gocardless"
              ? account.gocardlessAccessToken
                ? "connected"
                : "disconnected"
              : "unknown",
    }))

    res.json({ success: true, data: accounts })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list accounts"
    res.status(500).json({ success: false, error: message })
  }
})

/**
 * GET /api/system/status
 * Returns system status information
 */
configRouter.get("/system/status", async (_req, res) => {
  try {
    res.json({
      success: true,
      data: {
        version: process.env.npm_package_version || "0.5.5",
        platform: process.platform,
        nodeVersion: process.version,
        configPath: "~/.firela/billclaw/config.json",
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get system status"
    res.status(500).json({ success: false, error: message })
  }
})
