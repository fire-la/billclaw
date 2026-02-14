/**
 * Tests for connect-status tool
 *
 * @packageDocumentation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { connectStatusTool } from "./connect-status.tool.js"

describe("connectStatusTool", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should have correct metadata", () => {
    expect(connectStatusTool.name).toBe("connect_status")
    expect(connectStatusTool.label).toBe("Connection Status")
    expect(connectStatusTool.description).toBe(
      "Get current status of unified connection mode (Direct/Relay/Polling) for webhooks and OAuth",
    )
  })

  it("should have purpose parameter with properties", () => {
    expect(connectStatusTool.parameters).toHaveProperty("properties")
    expect(connectStatusTool.parameters.properties).toHaveProperty("purpose")
    expect(connectStatusTool.parameters.properties.purpose.type).toBe("string")
    expect(connectStatusTool.parameters.properties.purpose.description).toBe(
      "Connection purpose to check: 'webhook' or 'oauth' (default: both)",
    )
    expect(connectStatusTool.parameters.properties.purpose.enum).toEqual([
      "webhook",
      "oauth",
      "both",
    ])
  })

  it("should have execute function", () => {
    expect(connectStatusTool.execute).toBeDefined()
    expect(typeof connectStatusTool.execute).toBe("function")
  })
})
