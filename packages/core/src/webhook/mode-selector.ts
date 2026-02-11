/**
 * Webhook mode selector with auto-detection
 *
 * Provides automatic mode selection based on environment availability:
 * - Direct: Checks if Connect service is reachable via health check
 * - Relay: Checks if Firela Relay is reachable and credentials are present
 * - Polling: Always available as fallback
 *
 * @packageDocumentation
 */

import type { RuntimeContext } from "../runtime/types.js"
import type {
  InboundWebhookMode,
  InboundWebhookReceiverConfig,
} from "./config.js"

/**
 * Mode selection result
 */
export interface ModeSelectionResult {
  mode: InboundWebhookMode
  reason: string
}

/**
 * Check if Direct mode is available
 *
 * Direct mode requires Connect service to be reachable via health check.
 * Uses native fetch (Node.js 18+) for framework independence.
 */
export async function isDirectAvailable(
  context: RuntimeContext,
): Promise<boolean> {
  try {
    const config = await context.config.getConfig()
    const publicUrl = config.connect?.publicUrl

    if (!publicUrl) {
      return false
    }

    // Use native fetch - no adapter dependency
    const response = await fetch(`${publicUrl}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    return response.ok
  } catch {
    return false
  }
}

/**
 * Check if Relay mode is available
 *
 * Relay mode requires:
 * 1. Relay credentials (webhookId and apiKey) to be present
 * 2. Firela Relay service to be reachable
 */
export async function isRelayAvailable(
  context: RuntimeContext,
): Promise<boolean> {
  try {
    const config = await context.config.getConfig()
    // Credentials stored in connect.receiver.relay (plaintext)
    const creds = config.connect?.receiver?.relay

    if (!creds?.webhookId || !creds?.apiKey) {
      return false
    }

    if (!creds.enabled) {
      return false
    }

    // Check relay service health
    const response = await fetch(`${creds.apiUrl}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    })

    return response.ok
  } catch {
    return false
  }
}

/**
 * Select optimal mode based on configuration and availability
 *
 * Selection priority:
 * 1. User configured mode (direct/relay/polling)
 * 2. Auto-detection: Try Direct → Try Relay → Fallback to Polling
 */
export async function selectMode(
  context: RuntimeContext,
  receiverConfig?: InboundWebhookReceiverConfig,
): Promise<ModeSelectionResult> {
  const config = receiverConfig ?? (await context.config.getConfig()).connect?.receiver

  if (!config) {
    // No receiver config, default to polling
    return {
      mode: "polling",
      reason: "No receiver configuration found",
    }
  }

  const configuredMode = config.mode

  // If user explicitly configured a mode, respect it
  if (configuredMode !== "auto") {
    return {
      mode: configuredMode,
      reason: `User configured mode: ${configuredMode}`,
    }
  }

  // Auto-detection: Try Direct → Try Relay → Fallback to Polling
  context.logger.debug("Mode selector: auto-detection started")

  // Check Direct mode first (lowest latency, no external dependency)
  const directEnabled = config.direct?.enabled ?? false
  if (directEnabled) {
    context.logger.debug("Mode selector: checking Direct mode availability")
    if (await isDirectAvailable(context)) {
      context.logger.info("Mode selector: Direct mode selected")
      return {
        mode: "direct",
        reason: "Direct mode available (Connect service reachable)",
      }
    }
  }

  // Check Relay mode
  const relayEnabled = config.relay?.enabled ?? false
  if (relayEnabled) {
    context.logger.debug("Mode selector: checking Relay mode availability")
    if (await isRelayAvailable(context)) {
      context.logger.info("Mode selector: Relay mode selected")
      return {
        mode: "relay",
        reason: "Relay mode available (Firela Relay reachable)",
      }
    }
  }

  // Fallback to Polling
  context.logger.info("Mode selector: Polling mode selected (fallback)")
  return {
    mode: "polling",
    reason: "Polling mode (Direct and Relay unavailable)",
  }
}

/**
 * Get fallback mode for current mode
 *
 * Fallback chain:
 * - Direct → Relay → Polling
 * - Relay → Polling
 * - Polling → Polling (no further fallback)
 */
export function getFallbackMode(currentMode: InboundWebhookMode): InboundWebhookMode {
  switch (currentMode) {
    case "direct":
      return "relay"
    case "relay":
      return "polling"
    case "polling":
      return "polling" // No further fallback
    case "auto":
      return "polling"
  }
}

/**
 * Check if mode can be upgraded to a better mode
 *
 * Upgrade path:
 * - Polling → Relay → Direct (if available)
 */
export async function canUpgradeMode(
  currentMode: InboundWebhookMode,
  context: RuntimeContext,
  _receiverConfig?: InboundWebhookReceiverConfig,
): Promise<boolean> {
  switch (currentMode) {
    case "polling":
      // Can upgrade to relay if available
      if (await isRelayAvailable(context)) {
        return true
      }
      // Can upgrade to direct if available
      if (await isDirectAvailable(context)) {
        return true
      }
      return false

    case "relay":
      // Can upgrade to direct if available
      return await isDirectAvailable(context)

    case "direct":
    case "auto":
      // Already at optimal mode
      return false
  }
}

/**
 * Get best available mode (for upgrade decisions)
 */
export async function getBestAvailableMode(
  context: RuntimeContext,
  _receiverConfig?: InboundWebhookReceiverConfig,
): Promise<InboundWebhookMode> {
  // Check Direct first (optimal)
  if (await isDirectAvailable(context)) {
    return "direct"
  }

  // Check Relay second
  if (await isRelayAvailable(context)) {
    return "relay"
  }

  // Fallback to Polling
  return "polling"
}
