/**
 * E2E tests for billclaw plugin registration
 *
 * These tests verify that the plugin properly integrates with OpenClaw
 * and all components are registered correctly.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import billclawPlugin from "./index.ts";

// Mock OpenClaw API
const createMockApi = () => ({
  pluginConfig: {
    accounts: [],
    webhooks: [],
    storage: {
      path: "~/.openclaw/billclaw",
      format: "json" as const,
      encryption: { enabled: false },
    },
    sync: {
      defaultFrequency: "daily" as const,
      retryOnFailure: true,
      maxRetries: 3,
    },
    plaid: {
      environment: "sandbox" as const,
    },
  },
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
  registerTool: vi.fn(),
  registerCli: vi.fn(),
  registerOAuth: vi.fn(),
  registerService: vi.fn(),
});

describe("billclaw plugin registration", () => {
  it("should have correct plugin metadata", () => {
    expect(billclawPlugin.id).toBe("billclaw");
    expect(billclawPlugin.name).toBe("BillClaw");
    expect(billclawPlugin.kind).toBe("integrations");
    expect(billclawPlugin.description).toBe(
      "Bank transaction and bill data import with data sovereignty"
    );
  });

  it("should have a configSchema with parse method", () => {
    expect(billclawPlugin.configSchema).toBeDefined();
    expect(typeof billclawPlugin.configSchema.parse).toBe("function");
    expect(billclawPlugin.configSchema.uiHints).toBeDefined();
  });

  it("should have a register function", () => {
    expect(typeof billclawPlugin.register).toBe("function");
  });

  it("should register tools when register() is called", () => {
    const mockApi = createMockApi();

    billclawPlugin.register(mockApi);

    // Should register 3 tools
    expect(mockApi.registerTool).toHaveBeenCalledTimes(3);

    // Check tool registrations
    const toolCalls = mockApi.registerTool.mock.calls;

    // First tool: plaid_sync
    expect(toolCalls[0]?.[0]?.name).toBe("plaid_sync");
    expect(toolCalls[0]?.[0]?.label).toBe("Plaid Sync");
    expect(toolCalls[0]?.[0]?.parameters).toBeDefined();
    expect(typeof toolCalls[0]?.[0]?.execute).toBe("function");

    // Second tool: gmail_fetch_bills
    expect(toolCalls[1]?.[0]?.name).toBe("gmail_fetch_bills");
    expect(toolCalls[1]?.[0]?.label).toBe("Gmail Fetch Bills");
    expect(typeof toolCalls[1]?.[0]?.execute).toBe("function");

    // Third tool: bill_parse
    expect(toolCalls[2]?.[0]?.name).toBe("bill_parse");
    expect(toolCalls[2]?.[0]?.label).toBe("Bill Parse");
    expect(typeof toolCalls[2]?.[0]?.execute).toBe("function");
  });

  it("should register CLI commands when register() is called", () => {
    const mockApi = createMockApi();

    billclawPlugin.register(mockApi);

    expect(mockApi.registerCli).toHaveBeenCalledTimes(1);

    const cliCall = mockApi.registerCli.mock.calls[0];
    expect(typeof cliCall?.[0]).toBe("function");
    expect(cliCall?.[1]?.commands).toEqual([
      "bills",
      "bills:setup",
      "bills:sync",
      "bills:status",
      "bills:config",
    ]);
  });

  it("should register OAuth provider when register() is called", () => {
    const mockApi = createMockApi();

    billclawPlugin.register(mockApi);

    expect(mockApi.registerOAuth).toHaveBeenCalledTimes(1);

    const oauthCall = mockApi.registerOAuth.mock.calls[0];
    expect(oauthCall?.[0]?.name).toBe("plaid");
    expect(oauthCall?.[0]?.description).toBe(
      "Plaid Link OAuth flow for connecting bank accounts"
    );
    expect(typeof oauthCall?.[0]?.handler).toBe("function");
  });

  it("should register services when register() is called", () => {
    const mockApi = createMockApi();

    billclawPlugin.register(mockApi);

    expect(mockApi.registerService).toHaveBeenCalledTimes(2);

    const serviceCalls = mockApi.registerService.mock.calls;

    // First service: billclaw-sync
    expect(serviceCalls[0]?.[0]?.id).toBe("billclaw-sync");
    expect(typeof serviceCalls[0]?.[0]?.start).toBe("function");
    expect(typeof serviceCalls[0]?.[0]?.stop).toBe("function");

    // Second service: billclaw-webhook
    expect(serviceCalls[1]?.[0]?.id).toBe("billclaw-webhook");
    expect(typeof serviceCalls[1]?.[0]?.start).toBe("function");
    expect(typeof serviceCalls[1]?.[0]?.stop).toBe("function");
  });

  it("should parse config with valid data", () => {
    const validConfig = {
      accounts: [],
      webhooks: [],
      storage: {
        path: "~/.openclaw/billclaw",
        format: "json" as const,
        encryption: { enabled: false },
      },
      sync: {
        defaultFrequency: "daily" as const,
        retryOnFailure: true,
        maxRetries: 3,
      },
      plaid: {
        environment: "sandbox" as const,
      },
    };

    const result = billclawPlugin.configSchema.parse(validConfig);

    expect(result).toEqual(validConfig);
  });

  it("should provide defaults for missing config values", () => {
    const minimalConfig = {
      accounts: [],
      webhooks: [],
    };

    const result = billclawPlugin.configSchema.parse(minimalConfig);

    expect(result.storage.path).toContain(".openclaw");
    expect(result.storage.format).toBe("json");
    expect(result.sync.defaultFrequency).toBe("daily");
    expect(result.plaid.environment).toBe("sandbox");
  });

  it("should have embedded uiHints for config", () => {
    const uiHints = billclawPlugin.configSchema.uiHints;

    expect(uiHints).toBeDefined();
    expect(uiHints["plaid.clientId"]).toBeDefined();
    expect(uiHints["plaid.secret"]).toBeDefined();
    expect(uiHints["plaid.environment"]).toBeDefined();
    expect(uiHints["accounts"]).toBeDefined();
    expect(uiHints["webhooks"]).toBeDefined();
    expect(uiHints["storage"]).toBeDefined();
  });

  it("should log plugin registration", () => {
    const mockApi = createMockApi();

    billclawPlugin.register(mockApi);

    expect(mockApi.logger.info).toHaveBeenCalledWith(
      expect.stringContaining("billclaw: plugin registered")
    );
  });

  it("should register services with lifecycle methods", () => {
    const mockApi = createMockApi();

    billclawPlugin.register(mockApi);

    expect(mockApi.registerService).toHaveBeenCalledTimes(2);

    const serviceCalls = mockApi.registerService.mock.calls;

    // First service: billclaw-sync
    expect(serviceCalls[0]?.[0]?.id).toBe("billclaw-sync");
    expect(typeof serviceCalls[0]?.[0]?.start).toBe("function");
    expect(typeof serviceCalls[0]?.[0]?.stop).toBe("function");

    // Second service: billclaw-webhook
    expect(serviceCalls[1]?.[0]?.id).toBe("billclaw-webhook");
    expect(typeof serviceCalls[1]?.[0]?.start).toBe("function");
    expect(typeof serviceCalls[1]?.[0]?.stop).toBe("function");
  });
});
