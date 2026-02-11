/**
 * Webhook listener service for OpenClaw
 *
 * Background service that manages webhook reception for all modes.
 *
 * @packageDocumentation
 */

import type { OpenClawPluginApi } from "../types/openclaw-plugin.js"
import { WebhookManager, createWebhookManager } from "@firela/billclaw-core/webhook"
import type { WebhookEvent, ModeChangeEvent } from "@firela/billclaw-core/webhook"
import { parseWebhookError, parseRelayError, logError } from "@firela/billclaw-core/errors"

/**
 * Webhook listener service
 *
 * Manages the inbound webhook receiver with mode selection,
 * health monitoring, and automatic fallback.
 */
class WebhookListenerService {
  private manager: WebhookManager | null = null
  private api: OpenClawPluginApi

  constructor(api: OpenClawPluginApi) {
    this.api = api
  }

  /**
   * Start the webhook listener
   */
  async start(): Promise<void> {
    try {
      this.api.logger.info?.("Starting webhook listener service...")

      const { OpenClawRuntimeContext } = await import("../runtime/context.js")
      const context = new OpenClawRuntimeContext(this.api)

      // Create webhook manager
      this.manager = await createWebhookManager(context, {
        healthCheckInterval: 60000, // 1 minute
        autoModeSwitching: true,
        autoUpgrade: true,
      })

      // Register event handler for webhook events
      this.manager.onEvent((event: WebhookEvent) => {
        this.api.logger.info?.("Webhook event received:", {
          source: event.source,
          type: event.type,
          timestamp: event.timestamp,
        })

        // Note: OpenClaw doesn't have a built-in event emitter
        // Events are logged for debugging purposes
      })

      // Register mode change handler
      this.manager.onModeChange((event: ModeChangeEvent) => {
        this.api.logger.info?.("Webhook mode changed:", {
          from: event.from,
          to: event.to,
          reason: event.reason,
          timestamp: event.timestamp,
        })

        // Note: OpenClaw doesn't have a built-in event emitter
        // Mode changes are logged for debugging purposes
      })

      // Start the manager
      await this.manager.start()

      this.api.logger.info?.("Webhook listener service started")
    } catch (error) {
      // Parse error as webhook error (start/relay/connection issues)
      const userError =
        error instanceof Error &&
        (error.message.includes("relay") ||
          error.message.includes("OAuth") ||
          error.message.includes("WebSocket"))
          ? parseRelayError(error, { mode: this.manager?.getState().currentMode })
          : parseWebhookError(error as Error, {
              mode: this.manager?.getState().currentMode,
            })

      logError(this.api.logger, userError, { service: "webhook-listener" })
      throw error
    }
  }

  /**
   * Stop the webhook listener
   */
  async stop(): Promise<void> {
    try {
      this.api.logger.info?.("Stopping webhook listener service...")

      if (this.manager) {
        await this.manager.stop()
        this.manager = null
      }

      this.api.logger.info?.("Webhook listener service stopped")
    } catch (error) {
      const userError = parseWebhookError(error as Error, {
        mode: this.manager?.getState().currentMode,
      })

      logError(this.api.logger, userError, { service: "webhook-listener" })
      throw error
    }
  }

  /**
   * Get current status
   */
  getStatus(): { running: boolean; mode?: string; connectionStatus?: string } {
    if (!this.manager) {
      return { running: false }
    }

    const state = this.manager.getState()
    return {
      running: true,
      mode: state.currentMode,
      connectionStatus: state.connectionStatus,
    }
  }
}

// Service instance (singleton pattern)
let serviceInstance: WebhookListenerService | null = null

/**
 * Start webhook listener service
 */
export async function startWebhookListener(
  api: OpenClawPluginApi,
): Promise<void> {
  if (serviceInstance) {
    api.logger.warn?.("Webhook listener already running")
    return
  }

  serviceInstance = new WebhookListenerService(api)
  await serviceInstance.start()
}

/**
 * Stop webhook listener service
 */
export async function stopWebhookListener(
  api: OpenClawPluginApi,
): Promise<void> {
  if (!serviceInstance) {
    api.logger.warn?.("Webhook listener not running")
    return
  }

  await serviceInstance.stop()
  serviceInstance = null
}

/**
 * Get webhook listener status
 */
export function getWebhookListenerStatus(): {
  running: boolean
  mode?: string
  connectionStatus?: string
} {
  if (!serviceInstance) {
    return { running: false }
  }

  return serviceInstance.getStatus()
}
