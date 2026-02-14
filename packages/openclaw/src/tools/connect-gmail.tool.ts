/**
 * Gmail connection tool for OpenClaw
 *
 * Initiates Gmail OAuth connection using Device Code Flow (RFC 8628).
 * This flow is optimized for CLI/OpenClaw environments where
 * browser redirects may not be practical.
 *
 * @packageDocumentation
 */

import type { OpenClawPluginApi } from "../types/openclaw-plugin.js"
import { parseOauthError, logError } from "@firela/billclaw-core/errors"

/**
 * Polling interval for token polling in milliseconds
 */
const POLL_INTERVAL = 5000

/**
 * Default OAuth timeout in milliseconds (10 minutes)
 */
const DEFAULT_OAUTH_TIMEOUT = 10 * 60 * 1000

/**
 * Format user code for display (XXXX-XXXX-XXXX)
 */
function formatUserCode(code: string): string {
  // Google's user codes are typically 8 characters
  if (code.length === 8) {
    return `${code.slice(0, 4)}-${code.slice(4)}`
  }
  return code
}

/**
 * Format time duration for display
 */
function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}m ${seconds}s`
}

/**
 * Gmail connection tool
 */
export const connectGmailTool = {
  name: "connect_gmail",
  label: "Connect Gmail Account",
  description:
    "Connect Gmail account using Device Code Flow (RFC 8628) for OpenClaw",
  parameters: {
    type: "object",
    properties: {
      email: {
        type: "string",
        description: "Email address (optional, will be auto-detected)",
      },
      timeout: {
        type: "number",
        description: "OAuth timeout in seconds (default: 600)",
      },
    },
  },
  execute: async (
    api: OpenClawPluginApi,
    params: { email?: string; timeout?: number },
  ) => {
    try {
      const { getConfig } = await import("@firela/billclaw-core")
      const config = await getConfig()
      const gmailConfig = config.gmail

      // Check Gmail OAuth configuration
      if (!gmailConfig?.clientId || !gmailConfig?.clientSecret) {
        const error = parseOauthError(
          {
            message: "Gmail OAuth credentials not configured",
            code: "GMAIL_OAUTH_NOT_CONFIGURED",
          },
          { provider: "gmail", operation: "auth_url" },
        )
        logError(api.logger, error, { tool: "connect_gmail" })

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  machineReadable: {
                    success: false,
                    error: {
                      errorCode: error.errorCode,
                      category: error.category,
                      recoverable: error.recoverable,
                    },
                  },
                  humanReadable: {
                    title: "Gmail OAuth Not Configured",
                    message:
                      "Gmail OAuth credentials (clientId and clientSecret) must be configured",
                    instructions: [
                      "Add to your config:",
                      "  gmail:",
                      "    clientId: your-client-id",
                      "    clientSecret: your-client-secret",
                      "",
                      "You can obtain these from Google Cloud Console:",
                      "  https://console.cloud.google.com/apis/credentials",
                    ],
                  },
                },
                null,
                2,
              ),
            },
          ],
        }
      }

      const timeoutMs = (params?.timeout ?? 600) * 1000

      // Request device code from Google
      const deviceCodeResponse = await fetch(
        "https://oauth2.googleapis.com/device/code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: gmailConfig.clientId,
            scope: "https://www.googleapis.com/auth/gmail.readonly",
          }).toString(),
          signal: AbortSignal.timeout(10000),
        },
      )

      if (!deviceCodeResponse.ok) {
        const errorText = await deviceCodeResponse.text()
        throw new Error(`Failed to get device code: ${errorText}`)
      }

      const deviceData = (await deviceCodeResponse.json()) as {
        user_code: string
        verification_url: string
        device_code: string
        expires_in: number
        interval: number
      }

      const userCode = deviceData.user_code
      const verificationUrl = deviceData.verification_url
      const deviceCode = deviceData.device_code
      const expiresIn = deviceData.expires_in * 1000 // Convert to ms
      const pollInterval = (deviceData.interval ?? 5) * 1000

      api.logger?.info?.(
        `Gmail Device Code Flow: user_code=${userCode}, expires_in=${expiresIn}ms`,
      )

      // Return machine-readable and human-readable output
      const machineReadable = {
        success: true,
        status: "pending_user_authorization",
        userCode,
        formattedUserCode: formatUserCode(userCode),
        verificationUrl,
        deviceCode,
        expiresIn,
        timeoutMs: Math.min(timeoutMs, expiresIn),
        pollInterval,
        nextActions: [
          `Go to ${verificationUrl}`,
          `Enter code: ${formatUserCode(userCode)}`,
          "Wait for authorization to complete",
        ],
      }

      const humanReadable = {
        title: "Gmail Account Connection - Device Code Flow",
        status: "Device Code Generated",
        instructions: [
          `1. Go to: ${verificationUrl}`,
          `2. Enter code: ${formatUserCode(userCode)}`,
          `3. Authorize the application`,
          `4. Wait for authorization (expires in ${formatDuration(expiresIn)})`,
        ],
        verificationUrl,
        userCode: formatUserCode(userCode),
        expiresInMinutes: Math.floor(expiresIn / 60000),
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                machineReadable,
                humanReadable,
              },
              null,
              2,
            ),
          },
        ],
      }
    } catch (error) {
      const userError = parseOauthError(
        error as Error | { code?: string; message?: string },
        { provider: "gmail", operation: "auth_url" },
      )
      logError(api.logger, userError, { tool: "connect_gmail" })

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                machineReadable: {
                  success: false,
                  error: {
                    errorCode: userError.errorCode,
                    category: userError.category,
                    severity: userError.severity,
                    recoverable: userError.recoverable,
                  },
                },
                humanReadable: {
                  title: "Gmail Connection Failed",
                  message: userError.humanReadable.message,
                  suggestions: userError.humanReadable.suggestions,
                },
              },
              null,
              2,
            ),
          },
        ],
      }
    }
  },
}

/**
 * Poll for Gmail token completion (can be used by background service)
 *
 * This is a helper function that can be called by a background
 * service to continuously poll for token completion after device code
 * has been authorized by the user.
 */
export async function pollForGmailToken(
  clientId: string,
  clientSecret: string,
  deviceCode: string,
  timeout: number = DEFAULT_OAUTH_TIMEOUT,
): Promise<{
  accessToken: string
  refreshToken: string
  expiresIn: number
} | null> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    try {
      const tokenResponse = await fetch(
        "https://oauth2.googleapis.com/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            device_code: deviceCode,
            grant_type: "urn:ietf:params:oauth:grant-type:device_code",
          }).toString(),
          signal: AbortSignal.timeout(10000),
        },
      )

      if (tokenResponse.ok) {
        const tokenData = (await tokenResponse.json()) as {
          access_token: string
          refresh_token: string
          expires_in: number
        }
        return {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresIn: tokenData.expires_in,
        }
      }

      const errorData = (await tokenResponse.json()) as { error: string }
      if (errorData.error === "authorization_pending") {
        // User hasn't authorized yet, keep polling
      } else if (errorData.error === "slow_down") {
        // Poll too fast, increase interval
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL * 2))
        continue
      } else if (errorData.error === "expired_token") {
        // Device code expired
        return null
      } else if (errorData.error === "access_denied") {
        // User denied access
        return null
      }
    } catch {
      // Ignore network errors, retry
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL))
  }

  return null
}

/**
 * Get email address from Gmail API using access token
 */
export async function getGmailEmailAddress(
  accessToken: string,
): Promise<string | null> {
  try {
    const profileResponse = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/profile",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal: AbortSignal.timeout(10000),
      },
    )

    if (profileResponse.ok) {
      const profile = (await profileResponse.json()) as {
        emailAddress: string
      }
      return profile.emailAddress
    }
    return null
  } catch {
    return null
  }
}
