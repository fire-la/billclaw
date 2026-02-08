/**
 * Sync rate limiter (P0)
 *
 * Prevents Plaid API bans from webhook-triggered sync floods.
 * Implements separate rate limit buckets for manual vs webhook-triggered syncs.
 *
 * Design:
 * - Separate rate limit buckets: manual vs webhook-triggered
 * - Circuit breaker to disable webhook syncs when rate limit near
 * - Sliding window for accurate rate limiting
 */

import type { Logger } from "../errors/errors.js"

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed
   */
  requests: number

  /**
   * Time window in milliseconds
   */
  window: number
}

/**
 * Sync rate limiter configuration
 */
export interface SyncRateLimiterConfig {
  /**
   * Rate limit for manual syncs
   */
  manual: RateLimitConfig

  /**
   * Rate limit for webhook-triggered syncs
   */
  webhook: RateLimitConfig

  /**
   * Circuit breaker threshold (0-1)
   * Disable webhook syncs when usage exceeds this ratio
   */
  circuitThreshold?: number

  /**
   * Logger instance
   */
  logger: Logger
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<Omit<SyncRateLimiterConfig, "logger">> = {
  manual: {
    requests: 10,
    window: 60_000, // 1 minute
  },
  webhook: {
    requests: 3,
    window: 60_000, // 1 minute
  },
  circuitThreshold: 0.8, // 80%
}

/**
 * Request entry for sliding window
 */
interface RequestEntry {
  timestamp: number
  type: "manual" | "webhook"
}

/**
 * Sync rate limiter
 *
 * Tracks sync requests and enforces rate limits separately for
 * manual and webhook-triggered syncs.
 */
export class SyncRateLimiter {
  private readonly config: Required<Omit<SyncRateLimiterConfig, "logger">>
  private readonly logger: Logger
  private readonly requests: RequestEntry[] = []
  private circuitOpen = false
  private circuitOpenUntil = 0

  constructor(config: SyncRateLimiterConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.logger = config.logger
  }

  /**
   * Record a manual sync request
   *
   * @param accountId - Account ID for the sync
   */
  recordManualSync(accountId: string): void {
    this.recordRequest("manual", accountId)
  }

  /**
   * Record a webhook-triggered sync request
   *
   * @param accountId - Account ID for the sync
   */
  recordWebhookSync(accountId: string): void {
    this.recordRequest("webhook", accountId)
  }

  /**
   * Check if webhook sync is allowed
   *
   * @param accountId - Account ID for the sync
   * @returns True if sync is allowed
   */
  isWebhookSyncAllowed(accountId: string): boolean {
    // Check circuit breaker
    if (this.isCircuitOpen()) {
      this.logger.warn?.(
        `Webhook sync blocked for ${accountId}: circuit breaker open`,
      )
      return false
    }

    // Check rate limit
    const now = Date.now()
    const windowStart = now - this.config.webhook.window

    // Count webhook requests in window
    const webhookCount = this.requests.filter(
      (r) => r.type === "webhook" && r.timestamp >= windowStart,
    ).length

    if (webhookCount >= this.config.webhook.requests) {
      this.logger.warn?.(
        `Webhook sync blocked for ${accountId}: rate limit exceeded (${webhookCount}/${this.config.webhook.requests})`,
      )
      return false
    }

    // Check if we should open circuit breaker
    const totalCount = this.requests.filter((r) => r.timestamp >= windowStart).length
    const totalLimit = this.config.manual.requests + this.config.webhook.requests
    const usageRatio = totalCount / totalLimit

    if (usageRatio >= this.config.circuitThreshold) {
      this.openCircuit()
      this.logger.warn?.(
        `Circuit breaker opened: usage at ${Math.round(usageRatio * 100)}%`,
      )
      return false
    }

    return true
  }

  /**
   * Check if manual sync is allowed
   *
   * @param accountId - Account ID for the sync
   * @returns True if sync is allowed
   */
  isManualSyncAllowed(accountId: string): boolean {
    const now = Date.now()
    const windowStart = now - this.config.manual.window

    // Count manual requests in window
    const manualCount = this.requests.filter(
      (r) => r.type === "manual" && r.timestamp >= windowStart,
    ).length

    if (manualCount >= this.config.manual.requests) {
      this.logger.warn?.(
        `Manual sync blocked for ${accountId}: rate limit exceeded (${manualCount}/${this.config.manual.requests})`,
      )
      return false
    }

    return true
  }

  /**
   * Check if circuit breaker is open
   */
  isCircuitOpen(): boolean {
    if (!this.circuitOpen) {
      return false
    }

    // Check if circuit should close
    if (Date.now() > this.circuitOpenUntil) {
      this.closeCircuit()
      return false
    }

    return true
  }

  /**
   * Open circuit breaker
   *
   * Disables webhook syncs for a cooldown period.
   */
  openCircuit(): void {
    this.circuitOpen = true
    this.circuitOpenUntil = Date.now() + this.config.manual.window // Open for 1 window period
  }

  /**
   * Close circuit breaker
   */
  closeCircuit(): void {
    this.circuitOpen = false
    this.circuitOpenUntil = 0
    this.logger.info?.("Circuit breaker closed")
  }

  /**
   * Get rate limiter statistics
   */
  getStats(): {
    manualCount: number
    webhookCount: number
    circuitOpen: boolean
    usageRatio: number
  } {
    const now = Date.now()
    const windowStart = now - this.config.manual.window

    const manualCount = this.requests.filter(
      (r) => r.type === "manual" && r.timestamp >= windowStart,
    ).length
    const webhookCount = this.requests.filter(
      (r) => r.type === "webhook" && r.timestamp >= windowStart,
    ).length

    const totalLimit = this.config.manual.requests + this.config.webhook.requests
    const usageRatio = (manualCount + webhookCount) / totalLimit

    return {
      manualCount,
      webhookCount,
      circuitOpen: this.isCircuitOpen(),
      usageRatio,
    }
  }

  /**
   * Reset rate limiter (for testing)
   */
  reset(): void {
    this.requests.splice(0, this.requests.length)
    this.closeCircuit()
  }

  /**
   * Clean up old requests
   */
  cleanup(): void {
    const now = Date.now()
    const windowStart = now - this.config.manual.window

    const initialLength = this.requests.length
    const toKeep: RequestEntry[] = []
    for (const req of this.requests) {
      if (req.timestamp >= windowStart) {
        toKeep.push(req)
      }
    }
    this.requests.splice(0, this.requests.length, ...toKeep)

    const removed = initialLength - this.requests.length
    if (removed > 0) {
      this.logger.debug?.(`Cleaned up ${removed} old request entries`)
    }
  }

  /**
   * Record a request
   */
  private recordRequest(type: "manual" | "webhook", _accountId: string): void {
    this.requests.push({
      timestamp: Date.now(),
      type,
    })

    // Cleanup old entries periodically
    if (this.requests.length > 1000) {
      this.cleanup()
    }
  }
}

/**
 * Create a sync rate limiter with default configuration
 */
export function createSyncRateLimiter(
  logger: Logger,
  config?: Partial<SyncRateLimiterConfig>,
): SyncRateLimiter {
  return new SyncRateLimiter({
    manual: { requests: 10, window: 60_000 },
    webhook: { requests: 3, window: 60_000 },
    circuitThreshold: 0.8,
    logger,
    ...config,
  })
}

/**
 * In-memory rate limiter for testing
 */
export class InMemoryRateLimiter {
  private readonly counters = new Map<string, number>()

  constructor(
    private readonly config: RateLimitConfig,
    _logger: Logger,
  ) {}

  async recordRequest(identifier: string): Promise<void> {
    const count = (this.counters.get(identifier) || 0) + 1
    this.counters.set(identifier, count)
  }

  async isRateLimited(identifier: string): Promise<boolean> {
    const count = this.counters.get(identifier) || 0
    return count >= this.config.requests
  }

  reset(): void {
    this.counters.clear()
  }
}
