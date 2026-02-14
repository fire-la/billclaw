/**
 * Webhook status tool for OpenClaw
 *
 * Returns the current status of the inbound webhook receiver.
 *
 * @packageDocumentation
 */

import type { OpenClawPluginApi } from "../types/openclaw-plugin.js"
import { parseWebhookError, logError, formatError } from "@firela/billclaw-core/errors"

/**
 * Webhook status tool
 */
export const webhookStatusTool = {
  name: "webhook_status",
  label: "Webhook Receiver Status",
  description:
    "Get the current status of the inbound webhook receiver (Direct/Relay/Polling modes)",
  parameters: {
    type: "object",
    properties: {},
  },
  execute: async (api: OpenClawPluginApi, _params: unknown) => {
    try {
      const runtime = await import("../runtime/context.js")
      const { getConfig } = await import("@firela/billclaw-core")
      const { selectMode } = await import("@firela/billclaw-core/connection")

      const context = new runtime.OpenClawRuntimeContext(api)
      const config = await getConfig()
      const receiver = config.connect?.receiver

      if (!receiver) {
        return {
          content: [
            {
              type: "text",
              text: `Webhook receiver is not configured.

To enable, use the 'webhook_connect' tool or run:
  bills:setup webhook`,
            },
          ],
        }
      }

      // Check mode status
      let statusMessage = ""
      let healthy = false
      let modeInfo = ""

      switch (receiver.mode) {
        case "direct":
          healthy = receiver.direct?.enabled ?? false
          statusMessage = healthy
            ? "Direct mode active - receiving webhooks via Connect service"
            : "Direct mode configured but not enabled"
          modeInfo = `Public URL: ${config.connect?.publicUrl ?? "Not configured"}`
          break

        case "relay":
          healthy = !!(receiver.relay?.webhookId && receiver.relay.apiKey)
          statusMessage = healthy
            ? "Relay mode active - receiving webhooks via Firela Relay"
            : "Relay mode configured but credentials missing"
          modeInfo = `Webhook ID: ${receiver.relay?.webhookId ?? "Not configured"}`
          break

        case "polling":
          healthy = true
          statusMessage = "Polling mode active - using API polling fallback"
          modeInfo = `Interval: ${receiver.polling?.interval ?? 300000}ms`
          break

        case "auto":
          // Check which mode would be selected
          const selection = await selectMode(context)
          healthy = true
          statusMessage = `Auto-detection: would use ${selection.mode}`
          modeInfo = `Reason: ${selection.reason}`
          break
      }

      return {
        content: [
          {
            type: "text",
            text: `Webhook Receiver Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mode: ${receiver.mode}
Status: ${healthy ? "✅" : "⚠️"} ${statusMessage}

${modeInfo}

Configuration:
  Direct: ${receiver.direct?.enabled ? "enabled" : "disabled"}
  Relay: ${receiver.relay?.enabled ? "enabled" : "disabled"}
  Polling: ${receiver.polling?.enabled ? "enabled" : "disabled"}

Health Check:
  Enabled: ${receiver.healthCheck?.enabled ?? true}
  Interval: ${receiver.healthCheck?.interval ?? 60000}ms
`,
          },
        ],
      }
    } catch (error) {
      const userError = parseWebhookError(error as Error)
      logError(api.logger, userError, { tool: "webhook_status" })

      return {
        content: [
          {
            type: "text",
            text: formatError(userError),
          },
        ],
      }
    }
  },
}
