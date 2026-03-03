/**
 * Credential storage and polling API for Direct Mode
 *
 * Provides in-memory session storage for OAuth credentials,
 * enabling CLI to poll for credentials after OAuth completion.
 *
 * API compatible with Relay service for seamless mode switching.
 *
 * @module routes/credentials
 */

import express, { type Router } from "express"
import { randomUUID } from "crypto"

/**
 * Session TTL in milliseconds (10 minutes)
 */
const SESSION_TTL = 10 * 60 * 1000

/**
 * Maximum long-polling timeout in seconds
 */
const MAX_POLL_TIMEOUT = 60

/**
 * Polling interval in milliseconds
 */
const POLL_INTERVAL = 500

/**
 * Credential session stored in memory
 */
interface CredentialSession {
  /** Unique session identifier */
  sessionId: string
  /** Optional PKCE code challenge */
  codeChallenge?: string
  /** PKCE method: "S256" or "plain" */
  codeChallengeMethod?: string
  /** OAuth provider: "plaid" or "gmail" */
  provider?: "plaid" | "gmail"
  /** OAuth token (public_token or access_token) */
  publicToken?: string
  /** Additional metadata (itemId, email, etc.) */
  metadata?: string
  /** Session creation timestamp */
  createdAt: number
  /** Session expiration timestamp */
  expiresAt: number
}

/**
 * In-memory session store
 *
 * Sessions are short-lived (10 minutes), so memory storage is sufficient.
 * For multi-instance deployments, consider using Redis.
 */
const sessionStore = new Map<string, CredentialSession>()

/**
 * Clean up expired sessions
 */
function cleanupExpiredSessions(): void {
  const now = Date.now()
  for (const [sessionId, session] of sessionStore.entries()) {
    if (session.expiresAt < now) {
      sessionStore.delete(sessionId)
    }
  }
}

// Run cleanup every minute
setInterval(cleanupExpiredSessions, 60 * 1000)

export const credentialsRouter: Router = express.Router()

/**
 * POST /api/connect/session
 *
 * Initialize a new credential session.
 * Optional PKCE parameters for API compatibility with Relay.
 *
 * Request body:
 * - code_challenge: Optional PKCE challenge
 * - code_challenge_method: "S256" or "plain"
 *
 * Response:
 * - success: boolean
 * - data.session_id: string
 * - data.expires_in: number (seconds)
 */
credentialsRouter.post("/session", (req, res) => {
  const { code_challenge, code_challenge_method } = req.body

  const sessionId = randomUUID()
  const now = Date.now()

  const session: CredentialSession = {
    sessionId,
    codeChallenge: code_challenge,
    codeChallengeMethod: code_challenge_method || "S256",
    createdAt: now,
    expiresAt: now + SESSION_TTL,
  }

  sessionStore.set(sessionId, session)

  res.json({
    success: true,
    message: "Session initialized",
    data: {
      session_id: sessionId,
      expires_in: Math.floor(SESSION_TTL / 1000),
    },
  })
})

/**
 * GET /api/connect/credentials/:sessionId
 *
 * Poll for credential completion.
 * Supports long-polling for efficient waiting.
 *
 * Query parameters:
 * - wait: "true" to enable long-polling
 * - timeout: Polling timeout in seconds (default: 30, max: 60)
 *
 * Response (pending):
 * - success: true
 * - data: null
 *
 * Response (ready):
 * - success: true
 * - data.session_id: string
 * - data.provider: string
 * - data.public_token: string
 * - data.metadata?: string
 *
 * Note: For Direct mode (no PKCE), returns pending status even for non-existent
 * sessions, allowing CLI to poll before OAuth completion creates the session.
 */
credentialsRouter.get("/credentials/:sessionId", async (req, res) => {
  const { sessionId } = req.params
  const wait = req.query.wait === "true"
  const timeout = Math.min(
    parseInt(req.query.timeout as string, 10) || 30,
    MAX_POLL_TIMEOUT
  )

  // Check if session exists
  let session = sessionStore.get(sessionId)

  if (!session) {
    // For Direct mode: session may not exist yet (created by storeCredential)
    // Return pending status instead of 404 to allow CLI to keep polling
    if (!wait) {
      return res.json({
        success: true,
        data: null,
      })
    }

    // For long-polling with non-existent session, wait for it to be created
    const startTime = Date.now()
    const timeoutMs = timeout * 1000

    while (Date.now() - startTime < timeoutMs) {
      session = sessionStore.get(sessionId)

      if (session?.publicToken) {
        // Session created and credential ready
        sessionStore.delete(sessionId)

        return res.json({
          success: true,
          data: {
            session_id: session.sessionId,
            provider: session.provider,
            public_token: session.publicToken,
            metadata: session.metadata,
          },
        })
      }

      // Wait before next check
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL))
    }

    // Timeout: return pending status
    return res.json({
      success: true,
      data: null,
    })
  }

  // Check if session is expired
  if (session.expiresAt < Date.now()) {
    sessionStore.delete(sessionId)
    return res.status(410).json({
      success: false,
      message: "Session expired",
    })
  }

  // If credential is ready, return immediately
  if (session.publicToken) {
    // Remove session after successful retrieval (one-time read)
    sessionStore.delete(sessionId)

    return res.json({
      success: true,
      data: {
        session_id: session.sessionId,
        provider: session.provider,
        public_token: session.publicToken,
        metadata: session.metadata,
      },
    })
  }

  // If not waiting, return pending status
  if (!wait) {
    return res.json({
      success: true,
      data: null,
    })
  }

  // Long-polling: wait for credential to be stored
  const startTime = Date.now()
  const timeoutMs = timeout * 1000

  while (Date.now() - startTime < timeoutMs) {
    // Re-fetch session (may have been updated)
    session = sessionStore.get(sessionId)

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      })
    }

    if (session.publicToken) {
      // Remove session after successful retrieval
      sessionStore.delete(sessionId)

      return res.json({
        success: true,
        data: {
          session_id: session.sessionId,
          provider: session.provider,
          public_token: session.publicToken,
          metadata: session.metadata,
        },
      })
    }

    // Wait before next check
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL))
  }

  // Timeout: return pending status
  return res.json({
    success: true,
    data: null,
  })
})

/**
 * POST /api/connect/credentials/:sessionId
 *
 * Store credential after OAuth completion.
 * Called internally by OAuth exchange endpoints.
 *
 * Request body:
 * - provider: "plaid" | "gmail"
 * - public_token: OAuth token
 * - metadata?: Additional data (itemId, email, etc.)
 */
credentialsRouter.post("/credentials/:sessionId", (req, res) => {
  const { sessionId } = req.params
  const { provider, public_token, metadata } = req.body

  // Validate required fields
  if (!provider || !public_token) {
    return res.status(400).json({
      success: false,
      message: "provider and public_token are required",
    })
  }

  // Check if session exists
  const session = sessionStore.get(sessionId)

  if (!session) {
    return res.status(404).json({
      success: false,
      message: "Session not found",
    })
  }

  // Update session with credential
  session.provider = provider
  session.publicToken = public_token
  session.metadata = metadata

  // Store updated session
  sessionStore.set(sessionId, session)

  res.json({
    success: true,
    message: "Credential stored",
  })
})

/**
 * DELETE /api/connect/credentials/:sessionId
 *
 * Confirm credential deletion (cleanup).
 * Optional cleanup after successful retrieval.
 */
credentialsRouter.delete("/credentials/:sessionId", (req, res) => {
  const { sessionId } = req.params

  if (sessionStore.has(sessionId)) {
    sessionStore.delete(sessionId)
  }

  res.json({
    success: true,
    message: "Session deleted",
  })
})

/**
 * Store credential in session (for use by other routes)
 *
 * This function is called by OAuth exchange endpoints to store
 * credentials after successful token exchange.
 *
 * @param sessionId - Session identifier
 * @param credential - Credential data to store
 */
export function storeCredential(
  sessionId: string,
  credential: {
    provider: "plaid" | "gmail"
    publicToken: string
    metadata?: string
  }
): boolean {
  const session = sessionStore.get(sessionId)

  if (!session) {
    // Session doesn't exist, create it (for Direct mode without explicit session init)
    const now = Date.now()
    const newSession: CredentialSession = {
      sessionId,
      provider: credential.provider,
      publicToken: credential.publicToken,
      metadata: credential.metadata,
      createdAt: now,
      expiresAt: now + SESSION_TTL,
    }
    sessionStore.set(sessionId, newSession)
    return true
  }

  // Update existing session
  session.provider = credential.provider
  session.publicToken = credential.publicToken
  session.metadata = credential.metadata
  sessionStore.set(sessionId, session)

  return true
}

/**
 * Get session store stats (for debugging)
 */
export function getSessionStats(): {
  total: number
  withCredentials: number
  expired: number
} {
  const now = Date.now()
  let withCredentials = 0
  let expired = 0

  for (const session of sessionStore.values()) {
    if (session.publicToken) withCredentials++
    if (session.expiresAt < now) expired++
  }

  return {
    total: sessionStore.size,
    withCredentials,
    expired,
  }
}
