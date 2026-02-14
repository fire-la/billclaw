/**
 * Services module for BillClaw OpenClaw plugin
 *
 * This module exports service utilities for webhook handling and background services.
 */

export { registerWebhookHandlers } from "./webhook-handler.js"
export {
  startWebhookListener,
  stopWebhookListener,
  getWebhookListenerStatus,
} from "./webhook-listener.js"

// OAuth completion service
export {
  startOAuthSession,
  cancelOAuthSession,
  onOAuthComplete,
  offOAuthComplete,
  getOAuthSessionStatus,
  getActiveOAuthSessions,
  cleanupCompletedSessions,
} from "./oauth-completion.js"

export type { OAuthCompletionResult, OAuthCompletionCallback } from "./oauth-completion.js"
