/**
 * Unified inbound webhook receiver module
 *
 * Exports configuration types, mode selection logic, and webhook manager
 * for webhook reception via Direct/Relay/Polling modes.
 *
 * @packageDocumentation
 */

export type {
  InboundWebhookMode,
  DirectWebhookConfig,
  RelayWebhookConfig,
  PollingWebhookConfig,
  HealthCheckConfig,
  EventHandlingConfig,
  RelayCredentials,
  InboundWebhookReceiverConfig,
  ConnectionStatus,
  WebhookModeStatus,
  WebhookEvent,
  RelayConnectionState,
} from "./config.js"

export type {
  ModeSelectionResult,
} from "./mode-selector.js"

export type {
  WebhookManagerOptions,
  ModeChangeEvent,
} from "./manager.js"

// Note: WebhookManagerState is an interface, accessed via getState() method
// It is not exported separately as it's part of the WebhookManager class

export {
  InboundWebhookModeSchema,
  DirectWebhookConfigSchema,
  RelayWebhookConfigSchema,
  PollingWebhookConfigSchema,
  HealthCheckConfigSchema,
  EventHandlingConfigSchema,
  RelayCredentialsSchema,
  InboundWebhookReceiverConfigSchema,
  ConnectionStatusSchema,
} from "./config.js"

export {
  isDirectAvailable,
  isRelayAvailable,
  selectMode,
  getFallbackMode,
  canUpgradeMode,
  getBestAvailableMode,
} from "./mode-selector.js"

export {
  WebhookManager,
  createWebhookManager,
} from "./manager.js"

// Webhook configuration helpers
export type {
  WebhookReceiverConfigOptions,
  WebhookReceiverSetupOptions,
  WebhookReceiverSetupResult,
} from "./helpers.js"

export {
  getRelayConfigDefaults,
  buildWebhookReceiverConfig,
  setupWebhookReceiver,
} from "./helpers.js"
