/**
 * Connection status tool for OpenClaw
 *
 * Returns current status of unified connection mode selector
 * for both webhooks and OAuth completion.
 *
 * @packageDocumentation
 */

import type { OpenClawPluginApi } from "../types/openclaw-plugin.js"
import { parseOauthError, logError } from "@firela/billclaw-core/errors"

/**
 * Connection status tool
 */
export const connectStatusTool = {
  name: "connect_status",
  label: "Connection Status",
  description:
    "Get current status of unified connection mode (Direct/Relay/Polling) for webhooks and OAuth",
  parameters: {
    type: "object",
    properties: {
      purpose: {
        type: "string",
        description: "Connection purpose to check: 'webhook' or 'oauth' (default: both)",
        enum: ["webhook", "oauth", "both"],
      },
    },
  },
  execute: async (api: OpenClawPluginApi, params: { purpose?: string }) => {
    try {
      const runtime = await import("../runtime/context.js")
      const { getConfig } = await import("@firela/billclaw-core")
      const { selectConnectionMode, isDirectAvailable, isRelayAvailable } =
        await import("@firela/billclaw-core/connection")

      const context = new runtime.OpenClawRuntimeContext(api)
      const config = await getConfig()

      const checkPurpose = params?.purpose ?? "both"

      // Check connection configuration
      const connectionConfig = config.connect?.connection
      const receiverConfig = config.connect?.receiver

      if (!connectionConfig && !receiverConfig) {
        return {
          content: [
            {
              type: "text",
              text: `Connection mode is not configured.

To enable, set 'connect.connection.mode' in config:
  connection:
    mode: auto  # auto | direct | relay | polling
    healthCheck:
      enabled: true
      timeout: 5000`,
            },
          ],
        }
      }

      // Build status report
      const sections: string[] = []

      sections.push(
        "Connection Status\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      )

      // Configuration section
      const configuredMode = connectionConfig?.mode ?? receiverConfig?.mode ?? "auto"
      sections.push(`\nConfiguration:`)
      sections.push(`  Mode: ${configuredMode}`)

      if (connectionConfig?.healthCheck) {
        sections.push(`  Health Check: ${connectionConfig.healthCheck.enabled ? "enabled" : "disabled"}`)
        sections.push(`  Timeout: ${connectionConfig.healthCheck.timeout}ms`)
        sections.push(`  Retries: ${connectionConfig.healthCheck.retries ?? 2}`)
      }

      // Check webhook mode if requested
      if (checkPurpose === "webhook" || checkPurpose === "both") {
        sections.push("\n--- Webhook Connection ---")
        const webhookResult = await selectConnectionMode(context, "webhook")
        sections.push(`Selected Mode: ${webhookResult.mode}`)
        sections.push(`Reason: ${webhookResult.reason}`)

        // Check availability
        const directCheck = await isDirectAvailable(context)
        const relayCheck = await isRelayAvailable(context)

        sections.push("\nAvailability:")
        sections.push(`  Direct: ${formatAvailability(directCheck)}`)
        sections.push(`  Relay: ${formatAvailability(relayCheck)}`)
      }

      // Check OAuth mode if requested
      if (checkPurpose === "oauth" || checkPurpose === "both") {
        sections.push("\n--- OAuth Connection ---")
        const oauthResult = await selectConnectionMode(context, "oauth")
        sections.push(`Selected Mode: ${oauthResult.mode}`)
        sections.push(`Reason: ${oauthResult.reason}`)

        // OAuth-specific checks
        const directCheck = await isDirectAvailable(context)
        const relayCheck = await isRelayAvailable(context)

        sections.push("\nAvailability:")
        sections.push(`  Direct: ${formatAvailability(directCheck)}`)
        sections.push(`  Relay: ${formatAvailability(relayCheck)}`)
        sections.push(`  Polling: N/A (not supported for OAuth)`)
      }

      // Additional info
      if (config.connect?.publicUrl) {
        sections.push(`\nPublic URL: ${config.connect.publicUrl}`)
      }

      if (receiverConfig?.relay?.webhookId) {
        sections.push(`Relay Webhook ID: ${receiverConfig.relay.webhookId}`)
      }

      return {
        content: [
          {
            type: "text",
            text: sections.join("\n"),
          },
        ],
      }
    } catch (error) {
      const userError = parseOauthError(
        error as Error | { code?: string; message?: string },
        { provider: "generic", operation: "link_token" },
      )
      logError(api.logger, userError, { tool: "connect_status" })

      return {
        content: [
          {
            type: "text",
            text: `Error: ${userError.humanReadable.message}\n\n${userError.humanReadable.suggestions.join("\n")}`,
          },
        ],
      }
    }
  },
}

/**
 * Format health check result for display
 */
function formatAvailability(
  result: { available: boolean; error?: string; latency?: number },
): string {
  if (result.available) {
    const latency = result.latency !== undefined ? ` (${result.latency}ms)` : ""
    return `✅ Available${latency}`
  }
  const error = result.error ?? "Unknown error"
  return `❌ Unavailable - ${error}`
}
