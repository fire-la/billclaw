/**
 * BillClaw Cloudflare Worker - Main entry point
 *
 * Self-hosted financial data service running on Cloudflare Workers
 * with D1 storage and Hono web framework.
 *
 * @packageDocumentation
 */

import { Hono } from "hono"
import type { Env } from "./types/env.js"

/**
 * Main Hono application with type bindings
 */
const app = new Hono<{ Bindings: Env }>()

/**
 * Health check endpoint
 */
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "billclaw-worker",
    version: "0.0.1",
  })
})

/**
 * Root endpoint with service info
 */
app.get("/", (c) => {
  return c.json({
    service: "BillClaw Worker",
    version: "0.0.1",
    description: "Self-hosted financial data service",
    endpoints: {
      health: "/health",
      auth: "/auth",
      oauth: "/api/oauth",
      webhook: "/webhook",
    },
  })
})

/**
 * Export the Hono app for Cloudflare Workers runtime
 *
 * Note: Routes will be added in subsequent tasks
 * - Auth routes: /auth/*
 * - OAuth routes: /api/oauth/*
 * - Webhook routes: /webhook/*
 */
export default app

/**
 * Export types for consumers
 */
export type { Env } from "./types/env.js"
export type AppType = typeof app
