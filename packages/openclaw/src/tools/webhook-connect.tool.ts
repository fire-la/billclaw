/**
 * Webhook connect tool for OpenClaw
 *
 * Enables and configures the inbound webhook receiver.
 *
 * @packageDocumentation
 */

import type { OpenClawPluginApi } from "../types/openclaw-plugin.js"
import type { InboundWebhookMode } from "@firela/billclaw-core/webhook"
import {
  logError,
  formatError,
  parseWebhookError,
} from "@firela/billclaw-core/errors"

/**
 * Webhook connect tool
 */
export const webhookConnectTool = {
  name: "webhook_connect",
  label: "Configure Webhook Receiver",
  description:
    "Enable and configure the inbound webhook receiver with Direct/Relay/Polling modes",
  parameters: {
    type: "object",
    properties: {
      mode: {
        type: "string",
        enum: ["auto", "direct", "relay", "polling"],
        description: "Receiver mode to enable",
      },
    },
  },
  execute: async (api: OpenClawPluginApi, params: unknown) => {
    // Declare mode outside try block for error handling
    const { mode = "auto" } = params as { mode?: InboundWebhookMode }

    try {
      api.logger.info?.(`Enabling webhook receiver in ${mode} mode...`)

      const runtime = await import("../runtime/context.js")
      const { getConfig, updateConfig } = await import("@firela/billclaw-core")

      const context = new runtime.OpenClawRuntimeContext(api)
      const config = await getConfig()
      const existingReceiver = config.connect?.receiver

      // Use unified helper for webhook receiver setup
      const { setupWebhookReceiver } = await import("@firela/billclaw-core/webhook")

      const setupResult = await setupWebhookReceiver(mode, context, {
        oauthTimeout: 300000,
      })

      if (!setupResult.success) {
        const userError = setupResult.userError
        if (userError) {
          logError(api.logger, userError, { tool: "webhook_connect", mode })
        }

        const displayError =
          userError ?? parseWebhookError(new Error(setupResult.error ?? "Setup failed"), { mode })

        return {
          content: [
            {
              type: "text",
              text: formatError(displayError),
            },
          ],
        }
      }

      if (mode === "relay") {
        api.logger.info?.("Relay credentials obtained successfully")
      }

      // Build configuration update
      await updateConfig({
        connect: {
          port: config.connect?.port ?? 4456,
          host: config.connect?.host ?? "localhost",
          publicUrl: config.connect?.publicUrl,
          tls: config.connect?.tls,
          receiver: {
            mode,
            ...setupResult.config,
            // Preserve existing settings
            healthCheck: existingReceiver?.healthCheck,
            eventHandling: existingReceiver?.eventHandling,
          },
        },
      })

      // Prepare next steps
      const nextSteps: string[] = []
      const publicUrl = config.connect?.publicUrl

      if (mode === "direct") {
        nextSteps.push(
          "1. Ensure Connect service is running",
          `2. Configure Plaid webhooks to: ${publicUrl}/webhook/plaid`,
        )
      } else if (mode === "relay") {
        nextSteps.push(
          "1. Your webhook receiver is now active",
          "2. Use 'webhook_status' tool to verify connection",
          "3. Configure Plaid webhooks to use relay URL",
        )
      } else if (mode === "auto") {
        nextSteps.push(
          "1. Webhook receiver will auto-detect optimal mode",
          "2. Direct mode will be tried first, then Relay, then Polling",
          "3. Use 'webhook_status' tool to check current mode",
        )
      }

      return {
        content: [
          {
            type: "text",
            text: `✅ Webhook receiver enabled in ${mode} mode

Next Steps:
${nextSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Configuration:
  Public URL: ${publicUrl ?? "Not configured"}
  Mode: ${mode}
`,
          },
        ],
      }
    } catch (err) {
      const userError = parseWebhookError(
        err instanceof Error ? err : new Error(String(err)),
        { mode },
      )

      logError(api.logger, userError, { tool: "webhook_connect", mode })

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
