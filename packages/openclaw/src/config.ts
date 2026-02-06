/**
 * OpenClaw configuration schema and UI hints for BillClaw
 *
 * Provides TypeBox schema for config validation and UI hints for
 * the OpenClaw config interface.
 */

import { Type } from "@sinclair/typebox"

/**
 * BillClaw configuration schema for OpenClaw
 */
export const billclawConfigSchema = Type.Object({
  enabled: Type.Optional(Type.Boolean()),
  accounts: Type.Optional(
    Type.Array(
      Type.Object({
        id: Type.String(),
        name: Type.String(),
        type: Type.Union([
          Type.Literal("plaid"),
          Type.Literal("gocardless"),
          Type.Literal("gmail"),
        ]),
        enabled: Type.Boolean(),
        syncFrequency: Type.Optional(
          Type.Union([
            Type.Literal("realtime"),
            Type.Literal("hourly"),
            Type.Literal("daily"),
            Type.Literal("weekly"),
            Type.Literal("manual"),
          ]),
        ),
        lastSync: Type.Optional(Type.String()),
        lastStatus: Type.Optional(
          Type.Union([
            Type.Literal("success"),
            Type.Literal("error"),
            Type.Literal("pending"),
          ]),
        ),
        // Plaid-specific
        plaidItemId: Type.Optional(Type.String()),
        plaidAccessToken: Type.Optional(Type.String()),
        // GoCardless-specific
        gocardlessRequisitionId: Type.Optional(Type.String()),
        gocardlessAccessToken: Type.Optional(Type.String()),
        // Gmail-specific
        gmailEmailAddress: Type.Optional(Type.String()),
        gmailFilters: Type.Optional(Type.Array(Type.String())),
      }),
      { additionalProperties: false },
    ),
  ),
  plaid: Type.Optional(
    Type.Object({
      clientId: Type.Optional(Type.String()),
      secret: Type.Optional(Type.String()),
      environment: Type.Optional(
        Type.Union([
          Type.Literal("sandbox"),
          Type.Literal("development"),
          Type.Literal("production"),
        ]),
      ),
      webhookUrl: Type.Optional(Type.String()),
    }),
  ),
  gocardless: Type.Optional(
    Type.Object({
      accessToken: Type.Optional(Type.String()),
      environment: Type.Optional(
        Type.Union([Type.Literal("sandbox"), Type.Literal("live")]),
      ),
    }),
  ),
  gmail: Type.Optional(
    Type.Object({
      clientId: Type.Optional(Type.String()),
      clientSecret: Type.Optional(Type.String()),
      historyId: Type.Optional(Type.String()),
      pubsubTopic: Type.Optional(Type.String()),
      senderWhitelist: Type.Optional(Type.Array(Type.String())),
      keywords: Type.Optional(Type.Array(Type.String())),
      confidenceThreshold: Type.Optional(Type.Number()),
      requireAmount: Type.Optional(Type.Boolean()),
      requireDate: Type.Optional(Type.Boolean()),
      billTypePatterns: Type.Optional(
        Type.Record(Type.String(), Type.Array(Type.String())),
      ),
    }),
  ),
  storage: Type.Optional(
    Type.Object({
      path: Type.String(),
      format: Type.Optional(
        Type.Union([
          Type.Literal("json"),
          Type.Literal("csv"),
          Type.Literal("both"),
        ]),
      ),
      encryption: Type.Optional(
        Type.Object({
          enabled: Type.Boolean(),
          keyPath: Type.Optional(Type.String()),
        }),
      ),
    }),
  ),
  sync: Type.Optional(
    Type.Object({
      defaultFrequency: Type.Optional(
        Type.Union([
          Type.Literal("realtime"),
          Type.Literal("hourly"),
          Type.Literal("daily"),
          Type.Literal("weekly"),
          Type.Literal("manual"),
        ]),
      ),
      retryOnFailure: Type.Optional(Type.Boolean()),
      maxRetries: Type.Optional(Type.Number()),
    }),
  ),
  webhooks: Type.Optional(
    Type.Array(
      Type.Object({
        enabled: Type.Boolean(),
        url: Type.Optional(Type.String()),
        secret: Type.Optional(Type.String()),
        retryPolicy: Type.Optional(
          Type.Object({
            maxRetries: Type.Optional(Type.Number()),
            initialDelay: Type.Optional(Type.Number()),
            maxDelay: Type.Optional(Type.Number()),
          }),
        ),
        events: Type.Optional(
          Type.Array(
            Type.Union([
              Type.Literal("transaction.new"),
              Type.Literal("transaction.updated"),
              Type.Literal("transaction.deleted"),
              Type.Literal("sync.started"),
              Type.Literal("sync.completed"),
              Type.Literal("sync.failed"),
              Type.Literal("account.connected"),
              Type.Literal("account.disconnected"),
              Type.Literal("account.error"),
              Type.Literal("webhook.test"),
            ]),
          ),
        ),
      }),
    ),
  ),
})

/**
 * UI hints for OpenClaw config interface
 */
export const billclawUiHints = {
  enabled: {
    label: "Enable BillClaw",
    description: "Enable BillClaw financial data import",
  },
  "accounts[].id": {
    label: "Account ID",
    description: "Unique identifier for this account",
  },
  "accounts[].name": {
    label: "Account Name",
    description: "Display name for this account",
  },
  "accounts[].type": {
    label: "Account Type",
    description: "Type of account (plaid, gocardless, gmail)",
  },
  "accounts[].enabled": {
    label: "Enabled",
    description: "Whether this account is active for syncing",
  },
  "accounts[].syncFrequency": {
    label: "Sync Frequency",
    description: "How often to sync this account",
  },
  "plaid.clientId": {
    label: "Plaid Client ID",
    description: "Your Plaid API client ID",
    sensitive: true,
  },
  "plaid.secret": {
    label: "Plaid Secret",
    description: "Your Plaid API secret",
    sensitive: true,
  },
  "plaid.environment": {
    label: "Plaid Environment",
    description: "Plaid API environment (sandbox, development, production)",
  },
  "gmail.clientId": {
    label: "Gmail Client ID",
    description: "Google Cloud OAuth client ID",
    sensitive: true,
  },
  "gmail.clientSecret": {
    label: "Gmail Client Secret",
    description: "Google Cloud OAuth client secret",
    sensitive: true,
  },
  "gmail.senderWhitelist": {
    label: "Trusted Senders",
    description: "Email addresses or domains trusted for bill detection",
  },
  "gmail.keywords": {
    label: "Bill Keywords",
    description: "Keywords indicating an email contains a bill",
  },
  "storage.path": {
    label: "Storage Path",
    description: "Local directory for storing transaction data",
    advanced: true,
  },
  "storage.format": {
    label: "Storage Format",
    description: "File format for storing transactions (json, csv, both)",
  },
  "sync.defaultFrequency": {
    label: "Default Sync Frequency",
    description: "Default sync frequency for new accounts",
  },
  "sync.retryOnFailure": {
    label: "Retry on Failure",
    description: "Whether to retry failed sync operations",
  },
  "sync.maxRetries": {
    label: "Max Retries",
    description: "Maximum number of retry attempts",
  },
  "webhooks[].url": {
    label: "Webhook URL",
    description: "URL for webhook endpoint",
  },
  "webhooks[].secret": {
    label: "Webhook Secret",
    description: "HMAC secret for webhook signature verification",
    sensitive: true,
  },
}
