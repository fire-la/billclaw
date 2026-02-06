"use strict";
/**
 * billclaw configuration schema
 *
 * Uses Zod for runtime validation and uiHints for OpenClaw config UI
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.configUiHints = exports.BillclawConfigSchema = exports.PlaidConfigSchema = exports.PlaidEnvironment = exports.StorageConfigSchema = exports.WebhookConfigSchema = exports.AccountConfigSchema = exports.WebhookEventType = exports.SyncFrequency = exports.AccountType = void 0;
var zod_1 = require("zod");
/**
 * Account types supported by billclaw
 */
var AccountType;
(function (AccountType) {
    AccountType["Plaid"] = "plaid";
    AccountType["GoCardless"] = "gocardless";
    AccountType["Gmail"] = "gmail";
})(AccountType || (exports.AccountType = AccountType = {}));
/**
 * Sync frequency options
 */
var SyncFrequency;
(function (SyncFrequency) {
    SyncFrequency["Realtime"] = "realtime";
    SyncFrequency["Hourly"] = "hourly";
    SyncFrequency["Daily"] = "daily";
    SyncFrequency["Weekly"] = "weekly";
    SyncFrequency["Manual"] = "manual";
})(SyncFrequency || (exports.SyncFrequency = SyncFrequency = {}));
/**
 * Webhook event types
 */
var WebhookEventType;
(function (WebhookEventType) {
    WebhookEventType["TransactionNew"] = "transaction.new";
    WebhookEventType["TransactionUpdated"] = "transaction.updated";
    WebhookEventType["TransactionDeleted"] = "transaction.deleted";
    WebhookEventType["SyncStarted"] = "sync.started";
    WebhookEventType["SyncCompleted"] = "sync.completed";
    WebhookEventType["SyncFailed"] = "sync.failed";
    WebhookEventType["AccountConnected"] = "account.connected";
    WebhookEventType["AccountDisconnected"] = "account.disconnected";
    WebhookEventType["AccountError"] = "account.error";
    WebhookEventType["WebhookTest"] = "webhook.test";
})(WebhookEventType || (exports.WebhookEventType = WebhookEventType = {}));
/**
 * Per-account configuration
 */
exports.AccountConfigSchema = zod_1.z.object({
    id: zod_1.z.string().describe("Unique account identifier"),
    type: zod_1.z.nativeEnum(AccountType).describe("Account data source type"),
    name: zod_1.z.string().describe("Display name for the account"),
    enabled: zod_1.z.boolean().default(true).describe("Whether sync is enabled"),
    syncFrequency: zod_1.z.nativeEnum(SyncFrequency).default(SyncFrequency.Daily),
    lastSync: zod_1.z.string().datetime().optional().describe("Last successful sync timestamp"),
    lastStatus: zod_1.z.enum(["success", "error", "pending"]).optional(),
    // Plaid-specific
    plaidItemId: zod_1.z.string().optional().describe("Plaid item ID"),
    plaidAccessToken: zod_1.z.string().optional().describe("Encrypted Plaid access token"),
    // GoCardless-specific
    gocardlessRequisitionId: zod_1.z.string().optional().describe("GoCardless requisition ID"),
    gocardlessAccessToken: zod_1.z.string().optional().describe("Encrypted GoCardless access token"),
    // Gmail-specific
    gmailEmailAddress: zod_1.z.string().email().optional().describe("Gmail address for bill fetching"),
    gmailFilters: zod_1.z.array(zod_1.z.string()).optional().describe("Email filters/keywords for bill identification"),
});
/**
 * Webhook configuration
 */
exports.WebhookConfigSchema = zod_1.z.object({
    enabled: zod_1.z.boolean().default(false),
    url: zod_1.z.string().url().optional().describe("Webhook endpoint URL"),
    secret: zod_1.z.string().optional().describe("HMAC secret for signature verification"),
    retryPolicy: zod_1.z.object({
        maxRetries: zod_1.z.number().int().min(0).max(10).default(3),
        initialDelay: zod_1.z.number().int().min(1000).default(2000), // ms
        maxDelay: zod_1.z.number().int().min(5000).default(60000), // ms
    }),
    events: zod_1.z.array(zod_1.z.nativeEnum(WebhookEventType)).default([
        WebhookEventType.TransactionNew,
        WebhookEventType.TransactionUpdated,
        WebhookEventType.SyncFailed,
        WebhookEventType.AccountError,
    ]),
});
/**
 * Storage configuration
 */
exports.StorageConfigSchema = zod_1.z.object({
    path: zod_1.z.string().default("~/.openclaw/billclaw").describe("Base directory for data storage"),
    format: zod_1.z.enum(["json", "csv", "both"]).default("json").describe("Storage format"),
    encryption: zod_1.z.object({
        enabled: zod_1.z.boolean().default(false),
        keyPath: zod_1.z.string().optional().describe("Path to encryption key"),
    }),
});
/**
 * Plaid environment options
 */
var PlaidEnvironment;
(function (PlaidEnvironment) {
    PlaidEnvironment["Sandbox"] = "sandbox";
    PlaidEnvironment["Development"] = "development";
    PlaidEnvironment["Production"] = "production";
})(PlaidEnvironment || (exports.PlaidEnvironment = PlaidEnvironment = {}));
/**
 * Plaid configuration
 */
exports.PlaidConfigSchema = zod_1.z.object({
    clientId: zod_1.z.string().optional().describe("Plaid client ID"),
    secret: zod_1.z.string().optional().describe("Plaid secret"),
    environment: zod_1.z.nativeEnum(PlaidEnvironment).default(PlaidEnvironment.Sandbox).describe("Plaid API environment"),
    webhookUrl: zod_1.z.string().url().optional().describe("Webhook URL for Plaid events"),
});
/**
 * Main billclaw configuration
 */
exports.BillclawConfigSchema = zod_1.z.object({
    accounts: zod_1.z.array(exports.AccountConfigSchema).default([]).describe("Configured bank accounts"),
    webhooks: zod_1.z.array(exports.WebhookConfigSchema).default([]).describe("Webhook endpoints"),
    storage: exports.StorageConfigSchema.default({}).describe("Storage settings"),
    sync: zod_1.z.object({
        defaultFrequency: zod_1.z.nativeEnum(SyncFrequency).default(SyncFrequency.Daily),
        retryOnFailure: zod_1.z.boolean().default(true),
        maxRetries: zod_1.z.number().int().min(0).max(5).default(3),
    }),
    plaid: exports.PlaidConfigSchema.default({}).describe("Plaid API configuration"),
});
/**
 * UI hints for OpenClaw config interface
 */
exports.configUiHints = {
    accounts: {
        label: "Bank Accounts",
        description: "Configure your bank account connections",
        type: "array",
        itemType: "object",
        fields: {
            id: {
                label: "Account ID",
                type: "text",
                placeholder: "Auto-generated or custom ID",
                readonly: true,
            },
            type: {
                label: "Data Source",
                type: "select",
                options: [
                    { value: "plaid", label: "Plaid (US/Canada)" },
                    { value: "gocardless", label: "GoCardless (Europe)" },
                    { value: "gmail", label: "Gmail Bills" },
                ],
            },
            name: {
                label: "Account Name",
                type: "text",
                placeholder: "e.g., My Chase Checking",
            },
            enabled: {
                label: "Enable Sync",
                type: "boolean",
                default: true,
            },
            syncFrequency: {
                label: "Sync Frequency",
                type: "select",
                options: [
                    { value: "realtime", label: "Real-time (Webhook)" },
                    { value: "hourly", label: "Hourly" },
                    { value: "daily", label: "Daily" },
                    { value: "weekly", label: "Weekly" },
                    { value: "manual", label: "Manual Only" },
                ],
                default: "daily",
            },
        },
    },
    webhooks: {
        label: "Webhooks",
        description: "Configure real-time push notifications for transactions",
        type: "array",
        itemType: "object",
        fields: {
            enabled: {
                label: "Enable Webhook",
                type: "boolean",
                default: false,
            },
            url: {
                label: "Webhook URL",
                type: "url",
                placeholder: "https://your-server.com/webhook",
            },
            secret: {
                label: "HMAC Secret",
                type: "password",
                placeholder: "Optional: for signature verification",
                description: "Leave empty to auto-generate",
            },
            events: {
                label: "Events",
                type: "multiselect",
                options: [
                    { value: "transaction.new", label: "New Transaction" },
                    { value: "transaction.updated", label: "Updated Transaction" },
                    { value: "transaction.deleted", label: "Deleted Transaction" },
                    { value: "sync.failed", label: "Sync Failed" },
                    { value: "account.error", label: "Account Error" },
                ],
                default: ["transaction.new", "sync.failed", "account.error"],
            },
        },
    },
    storage: {
        label: "Storage",
        description: "Local data storage settings",
        type: "object",
        fields: {
            path: {
                label: "Storage Path",
                type: "text",
                placeholder: "~/.openclaw/billclaw",
                description: "Directory where transactions will be stored",
            },
            format: {
                label: "File Format",
                type: "select",
                options: [
                    { value: "json", label: "JSON (recommended)" },
                    { value: "csv", label: "CSV" },
                    { value: "both", label: "Both JSON and CSV" },
                ],
                default: "json",
            },
        },
    },
};
