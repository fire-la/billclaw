/**
 * Tests for connect-gmail tool
 *
 * @packageDocumentation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { connectGmailTool } from "./connect-gmail.tool.js"

describe("connectGmailTool", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should have correct metadata", () => {
    expect(connectGmailTool.name).toBe("connect_gmail")
    expect(connectGmailTool.label).toBe("Connect Gmail Account")
    expect(connectGmailTool.description).toBe(
      "Connect Gmail account using Device Code Flow (RFC 8628) for OpenClaw",
    )
  })

  it("should have email parameter", () => {
    expect(connectGmailTool.parameters).toHaveProperty("properties")
    expect(connectGmailTool.parameters.properties).toHaveProperty("email")
    expect(connectGmailTool.parameters.properties.email.type).toBe("string")
    expect(connectGmailTool.parameters.properties.email.description).toBe(
      "Email address (optional, will be auto-detected)",
    )
  })

  it("should have timeout parameter", () => {
    expect(connectGmailTool.parameters.properties).toHaveProperty("timeout")
    expect(connectGmailTool.parameters.properties.timeout.type).toBe("number")
    expect(connectGmailTool.parameters.properties.timeout.description).toBe(
      "OAuth timeout in seconds (default: 600)",
    )
  })

  it("should have execute function", () => {
    expect(connectGmailTool.execute).toBeDefined()
    expect(typeof connectGmailTool.execute).toBe("function")
  })
})
