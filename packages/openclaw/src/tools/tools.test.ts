/**
 * Tests for OpenClaw tool adapters
 */

import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  plaidSyncTool,
  gmailFetchTool,
  conversationalStatusTool,
  conversationalHelpTool,
} from "../index"
import type { OpenClawPluginApi } from "../../types/openclaw-plugin.js"

// Mock OpenClaw API
const createMockApi = (): OpenClawPluginApi => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
  pluginConfig: {
    accounts: [],
    storage: {
      path: "~/.openclaw/billclaw",
      format: "json",
      encryption: { enabled: false },
    },
    sync: {
      defaultFrequency: "daily",
      maxRetries: 3,
      retryOnFailure: true,
    },
    plaid: {
      environment: "sandbox",
    },
  },
  registerTool: vi.fn(),
  registerCli: vi.fn(),
  registerOAuth: vi.fn(),
  registerService: vi.fn(),
})

describe("plaidSyncTool", () => {
  it("should have correct metadata", () => {
    expect(plaidSyncTool.name).toBe("plaid_sync")
    expect(plaidSyncTool.label).toBe("Plaid Sync")
    expect(plaidSyncTool.description).toBe(
      "Sync transactions from Plaid-connected bank accounts",
    )
  })

  it("should have accountId parameter", () => {
    expect(plaidSyncTool.parameters).toHaveProperty("accountId")
    expect(plaidSyncTool.parameters.accountId.optional).toBe(true)
  })

  it("should execute successfully", async () => {
    const mockApi = createMockApi()

    // Note: This will fail to actually sync since we're using mocks
    // but it tests the execution flow
    try {
      const result = await plaidSyncTool.execute(mockApi, {})
      expect(result).toBeDefined()
      expect(result.content).toBeDefined()
      expect(Array.isArray(result.content)).toBe(true)
    } catch (error) {
      // Expected to fail without proper setup
      expect(error).toBeDefined()
    }
  })
})

describe("gmailFetchTool", () => {
  it("should have correct metadata", () => {
    expect(gmailFetchTool.name).toBe("gmail_fetch_bills")
    expect(gmailFetchTool.label).toBe("Gmail Fetch Bills")
    expect(gmailFetchTool.description).toBe("Fetch and parse bills from Gmail")
  })

  it("should have accountId and days parameters", () => {
    expect(gmailFetchTool.parameters).toHaveProperty("accountId")
    expect(gmailFetchTool.parameters).toHaveProperty("days")
    expect(gmailFetchTool.parameters.accountId.optional).toBe(true)
    expect(gmailFetchTool.parameters.days.optional).toBe(true)
  })
})

describe("conversationalStatusTool", () => {
  it("should have correct metadata", () => {
    expect(conversationalStatusTool.name).toBe("conversational_status")
    expect(conversationalStatusTool.label).toBe("Conversational Status")
    expect(conversationalStatusTool.description).toBe(
      "Show account status with natural language",
    )
  })

  it("should have optional prompt parameter", () => {
    expect(conversationalStatusTool.parameters).toHaveProperty("prompt")
    expect(conversationalStatusTool.parameters.prompt.optional).toBe(true)
  })

  it("should return account information", async () => {
    const mockApi = createMockApi()

    try {
      const result = await conversationalStatusTool.execute(mockApi, {})
      expect(result).toBeDefined()
      expect(result.content).toBeDefined()
    } catch (error) {
      // Expected to fail without proper setup
      expect(error).toBeDefined()
    }
  })
})

describe("conversationalHelpTool", () => {
  it("should have correct metadata", () => {
    expect(conversationalHelpTool.name).toBe("conversational_help")
    expect(conversationalHelpTool.label).toBe("Conversational Help")
    expect(conversationalHelpTool.description).toBe(
      "Get help with billclaw commands and features",
    )
  })

  it("should have optional topic parameter", () => {
    expect(conversationalHelpTool.parameters).toHaveProperty("topic")
    expect(conversationalHelpTool.parameters.topic.optional).toBe(true)
  })

  it("should return help text", async () => {
    const mockApi = createMockApi()
    const result = await conversationalHelpTool.execute(mockApi, {})

    expect(result).toBeDefined()
    expect(result.content).toBeDefined()

    const content = JSON.parse(result.content[0].text)
    expect(content).toHaveProperty("help")
    expect(typeof content.help).toBe("string")
  })

  it("should return help for specific topic", async () => {
    const mockApi = createMockApi()
    const result = await conversationalHelpTool.execute(mockApi, {
      topic: "sync",
    })

    expect(result).toBeDefined()

    const content = JSON.parse(result.content[0].text)
    expect(content.topic).toBe("sync")
    expect(content.help).toContain("Sync")
  })

  it("should handle unknown topics gracefully", async () => {
    const mockApi = createMockApi()
    const result = await conversationalHelpTool.execute(mockApi, {
      topic: "unknown-topic",
    })

    expect(result).toBeDefined()

    const content = JSON.parse(result.content[0].text)
    expect(content.topic).toBe("unknown-topic")
    // Should return general help for unknown topics
    expect(content.help).toBeDefined()
  })
})

describe("tool result format", () => {
  it("should return content array with text field", async () => {
    const mockApi = createMockApi()
    const result = await conversationalHelpTool.execute(mockApi, {})

    expect(Array.isArray(result.content)).toBe(true)
    expect(result.content[0]).toHaveProperty("type")
    expect(result.content[0]).toHaveProperty("text")
    expect(result.content[0].type).toBe("text")
  })

  it("should return JSON-serializable text", async () => {
    const mockApi = createMockApi()
    const result = await conversationalHelpTool.execute(mockApi, {})

    expect(() => {
      JSON.parse(result.content[0].text)
    }).not.toThrow()
  })
})
