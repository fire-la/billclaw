/**
 * Tests for connect-plaid tool
 *
 * @packageDocumentation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { connectPlaidTool } from "./connect-plaid.tool.js"

describe("connectPlaidTool", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should have correct metadata", () => {
    expect(connectPlaidTool.name).toBe("connect_plaid")
    expect(connectPlaidTool.label).toBe("Connect Plaid Account")
    expect(connectPlaidTool.description).toBe(
      "Connect a bank account via Plaid OAuth using unified connection mode (Direct/Relay)",
    )
  })

  it("should have accountName parameter", () => {
    expect(connectPlaidTool.parameters).toHaveProperty("properties")
    expect(connectPlaidTool.parameters.properties).toHaveProperty("accountName")
    expect(connectPlaidTool.parameters.properties.accountName.type).toBe("string")
    expect(connectPlaidTool.parameters.properties.accountName.description).toBe(
      "Account name (default: 'Bank Account')",
    )
  })

  it("should have timeout parameter", () => {
    expect(connectPlaidTool.parameters.properties).toHaveProperty("timeout")
    expect(connectPlaidTool.parameters.properties.timeout.type).toBe("number")
    expect(connectPlaidTool.parameters.properties.timeout.description).toBe(
      "OAuth timeout in seconds (default: 600)",
    )
  })

  it("should have mode parameter with enum values", () => {
    expect(connectPlaidTool.parameters.properties).toHaveProperty("mode")
    expect(connectPlaidTool.parameters.properties.mode.type).toBe("string")
    expect(connectPlaidTool.parameters.properties.mode.enum).toEqual([
      "auto",
      "direct",
      "relay",
    ])
  })

  it("should have mode parameter with correct description", () => {
    expect(connectPlaidTool.parameters.properties.mode.description).toBe(
      "Force connection mode: 'direct', 'relay', or 'auto' (default: 'auto')",
    )
  })

  it("should have execute function", () => {
    expect(connectPlaidTool.execute).toBeDefined()
    expect(typeof connectPlaidTool.execute).toBe("function")
  })
})
