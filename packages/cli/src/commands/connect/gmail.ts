/**
 * Gmail connect command
 *
 * Connect Gmail account via Device Code Flow (RFC 8628).
 * This flow is optimized for CLI environments where a browser redirect
 * may not be practical.
 */

import type { CliCommand, CliContext } from "../registry.js"
import { success } from "../../utils/format.js"
import { Spinner } from "../../utils/progress.js"
import { selectConnectionMode } from "@firela/billclaw-core/connection"
import type { AccountConfig } from "@firela/billclaw-core"

/**
 * Polling interval for token polling in milliseconds
 */
const POLL_INTERVAL = 5000

/**
 * Run Gmail connect command
 */
export async function runGmailConnect(
  context: CliContext,
  args: { email?: string; timeout?: number },
): Promise<void> {
  const { runtime } = context
  const email = args.email
  const timeoutMs = (args.timeout ?? 10) * 60 * 1000

  console.log("")
  console.log("Gmail Account Connection")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("")

  // Get Gmail OAuth config
  const config = await runtime.config.getConfig()
  const gmailConfig = config.gmail

  if (!gmailConfig?.clientId || !gmailConfig?.clientSecret) {
    console.log("Error: Gmail OAuth credentials not configured.")
    console.log("")
    console.log("Please add the following to your config:")
    console.log("  gmail:")
    console.log("    clientId: your-client-id")
    console.log("    clientSecret: your-client-secret")
    console.log("")
    console.log("You can obtain these from the Google Cloud Console:")
    console.log("  https://console.cloud.google.com/apis/credentials")
    process.exit(1)
  }

  // Check connection mode
  const modeSpinner = new Spinner({ text: "Detecting connection mode..." }).start()
  const modeSelection = await selectConnectionMode(runtime, "oauth")
  modeSpinner.succeed(`Using ${modeSelection.mode} mode`)

  // Start device code flow
  console.log("")
  console.log("Starting Device Code Flow...")
  console.log("")

  const deviceSpinner = new Spinner({ text: "Requesting device code..." }).start()

  try {
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
    }
    deviceSpinner.succeed("Device code obtained!")

    // Display user code
    const userCode = deviceData.user_code
    const verificationUrl = deviceData.verification_url
    const deviceCode = deviceData.device_code
    const expiresIn = deviceData.expires_in

    console.log("")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("")
    console.log(`  1. Go to: ${verificationUrl}`)
    console.log(`  2. Enter code: ${formatUserCode(userCode)}`)
    console.log("")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("")

    // Open browser
    const shouldOpenBrowser = process.env.BILLCLAW_OPEN_BROWSER !== "false"
    if (shouldOpenBrowser) {
      try {
        const { default: open } = await import("open")
        await open(verificationUrl)
        console.log("Browser opened. Please enter the code shown above.")
      } catch {
        console.log(`Please open: ${verificationUrl}`)
      }
    }

    console.log("")
    console.log(`Waiting for authorization (expires in ${Math.floor(expiresIn / 60)} minutes)...`)
    console.log("Press Ctrl+C to cancel")
    console.log("")

    // Poll for token
    const pollSpinner = new Spinner({ text: "Waiting for authorization..." }).start()
    const startTime = Date.now()
    const effectiveTimeout = Math.min(timeoutMs, expiresIn * 1000)

    let tokenData: {
      access_token: string
      refresh_token: string
      expires_in: number
    } | null = null

    while (Date.now() - startTime < effectiveTimeout) {
      try {
        const tokenResponse = await fetch(
          "https://oauth2.googleapis.com/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: gmailConfig.clientId,
              client_secret: gmailConfig.clientSecret,
              device_code: deviceCode,
              grant_type: "urn:ietf:params:oauth:grant-type:device_code",
            }).toString(),
            signal: AbortSignal.timeout(10000),
          },
        )

        if (tokenResponse.ok) {
          tokenData = (await tokenResponse.json()) as {
            access_token: string
            refresh_token: string
            expires_in: number
          }
          break
        }

        const errorData = (await tokenResponse.json()) as { error: string }
        if (errorData.error === "authorization_pending") {
          // User hasn't authorized yet, keep polling
        } else if (errorData.error === "slow_down") {
          // Increase poll interval
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL * 2))
          continue
        } else if (errorData.error === "expired_token") {
          throw new Error("Device code expired. Please try again.")
        } else if (errorData.error === "access_denied") {
          throw new Error("Access denied. Please authorize the application.")
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes("expired")) {
          throw err
        }
        // Ignore network errors, retry
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL))
    }

    if (!tokenData) {
      pollSpinner.fail("Authorization timed out")
      throw new Error("Authorization timed out. Please try again.")
    }

    pollSpinner.succeed("Authorization completed!")

    // Get email address from Gmail API
    let emailAddress = email
    if (!emailAddress) {
      const emailSpinner = new Spinner({ text: "Getting email address..." }).start()
      try {
        const profileResponse = await fetch(
          "https://gmail.googleapis.com/gmail/v1/users/me/profile",
          {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
            },
            signal: AbortSignal.timeout(10000),
          },
        )

        if (profileResponse.ok) {
          const profile = (await profileResponse.json()) as {
            emailAddress: string
          }
          emailAddress = profile.emailAddress
          emailSpinner.succeed(`Email: ${emailAddress}`)
        } else {
          emailSpinner.warn("Could not get email address, using default")
          emailAddress = "user@gmail.com"
        }
      } catch {
        emailSpinner.warn("Could not get email address, using default")
        emailAddress = "user@gmail.com"
      }
    }

    // Calculate token expiry
    const tokenExpiry = new Date(
      Date.now() + tokenData.expires_in * 1000,
    ).toISOString()

    // Save account configuration
    const account: AccountConfig = {
      id: `gmail-${Date.now()}`,
      type: "gmail",
      name: emailAddress ?? "Gmail Account",
      enabled: true,
      syncFrequency: "daily",
      gmailEmailAddress: emailAddress,
      gmailAccessToken: tokenData.access_token,
      gmailRefreshToken: tokenData.refresh_token,
      gmailTokenExpiry: tokenExpiry,
      lastSync: undefined,
      lastStatus: "pending",
    }

    await saveAccount(runtime, account)

    console.log("")
    success(`Gmail account "${emailAddress}" connected successfully!`)
    console.log("")
    console.log("Account Details:")
    console.log(`  ID: ${account.id}`)
    console.log(`  Type: ${account.type}`)
    console.log(`  Email: ${emailAddress}`)
    console.log("")
    console.log("Next steps:")
    console.log(`  billclaw sync --account ${account.id}  - Fetch bills from Gmail`)
    console.log(`  billclaw status                       - View all accounts`)
  } catch (err) {
    deviceSpinner.fail("Gmail connection failed")
    throw err
  }
}

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
 * Save account to configuration
 */
async function saveAccount(
  runtime: CliContext["runtime"],
  account: AccountConfig,
): Promise<void> {
  const config = await runtime.config.getConfig()
  config.accounts.push(account)
  await runtime.config.saveConfig(config)
}

/**
 * Gmail connect command definition
 */
export const gmailConnectCommand: CliCommand = {
  name: "connect-gmail",
  description: "Connect Gmail account for bill extraction",
  aliases: ["gmail"],
  options: [
    {
      flags: "-e, --email <email>",
      description: "Email address (auto-detected if not provided)",
    },
    {
      flags: "-t, --timeout <minutes>",
      description: "OAuth timeout in minutes (default: 10)",
    },
  ],
  handler: (context, args) =>
    runGmailConnect(context, args as { email?: string; timeout?: number }),
}
