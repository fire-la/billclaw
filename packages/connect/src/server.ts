/**
 * BillClaw Connect - OAuth Service Server
 *
 * Provides a web interface for OAuth authentication with financial data providers.
 *
 * @packageDocumentation
 */

import express from "express"
import https from "https"
import path from "path"
import { fileURLToPath } from "url"
import { readFileSync } from "fs"
import { ConfigManager } from "@firela/billclaw-core"
import { plaidRouter } from "./routes/plaid.js"
import { gmailRouter } from "./routes/gmail.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Start the Connect server
 */
async function startServer() {
  const configManager = ConfigManager.getInstance()
  const connectConfig = await configManager.getServiceConfig("connect")

  const PORT = connectConfig.port
  const HOST = connectConfig.host
  const PUBLIC_URL = connectConfig.publicUrl || `http://${HOST}:${PORT}`
  const tls = connectConfig.tls

  const app = express()

  // Middleware
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Make publicUrl available to all routes
  app.use((req, _res, next) => {
    ;(req as any).publicUrl = PUBLIC_URL
    next()
  })

  // Serve static files (HTML pages) - use src/public for development
  app.use(express.static(path.join(__dirname, "../src/public")))

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "billclaw-connect" })
  })

  // OAuth routes
  app.use("/oauth/plaid", plaidRouter)
  app.use("/oauth/gmail", gmailRouter)

  // Default route
  app.get("/", (_req, res) => {
    res.json({
      service: "BillClaw Connect",
      version: "0.1.0",
      publicUrl: PUBLIC_URL,
      tlsEnabled: tls?.enabled || false,
      endpoints: {
        health: "/health",
        plaid: "/oauth/plaid",
        gmail: "/oauth/gmail",
      },
    })
  })

  // Start server with optional HTTPS
  if (tls?.enabled) {
    if (!tls.keyPath || !tls.certPath) {
      throw new Error(
        "TLS is enabled but keyPath or certPath is missing in config",
      )
    }

    const httpsOptions = {
      key: readFileSync(tls.keyPath),
      cert: readFileSync(tls.certPath),
    }

    https.createServer(httpsOptions, app).listen(PORT, HOST, () => {
      console.log(`BillClaw Connect server running on https://${HOST}:${PORT}`)
      console.log(`- Public URL: ${PUBLIC_URL}`)
      console.log(`- Plaid OAuth: ${PUBLIC_URL}/oauth/plaid`)
      console.log(`- Gmail OAuth: ${PUBLIC_URL}/oauth/gmail`)
    })
  } else {
    app.listen(PORT, HOST, () => {
      console.log(`BillClaw Connect server running on http://${HOST}:${PORT}`)
      console.log(`- Public URL: ${PUBLIC_URL}`)
      console.log(`- Plaid OAuth: http://${HOST}:${PORT}/oauth/plaid`)
      console.log(`- Gmail OAuth: http://${HOST}:${PORT}/oauth/gmail`)
    })
  }
}

// Start the server
startServer().catch((error) => {
  console.error("Failed to start Connect server:", error)
  process.exit(1)
})
