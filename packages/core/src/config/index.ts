/**
 * Configuration management module
 *
 * Provides unified configuration management for BillClaw with:
 * - Singleton ConfigManager
 * - Environment variable overrides
 * - File locking for concurrent access
 * - Hybrid caching (TTL + mtime validation)
 *
 * @packageDocumentation
 */

import type { BillclawConfig } from "../models/config.js"
import { ConfigManager } from "./config-manager.js"

export {
  ConfigManager,
  type ConfigManagerOptions,
} from "./config-manager.js"

export {
  loadEnvOverrides,
  getEnvValue,
  hasEnvOverrides,
  getEnvMappings,
} from "./env-loader.js"

// Convenience functions for common operations
const defaultManager = ConfigManager.getInstance()

/**
 * Get configuration using the default ConfigManager instance
 *
 * This is a convenience function for quick access to configuration.
 * For advanced use cases, create your own ConfigManager instance.
 */
export async function getConfig(): Promise<BillclawConfig> {
  return defaultManager.getConfig()
}

/**
 * Update configuration using the default ConfigManager instance
 *
 * This is a convenience function for quick config updates.
 * For advanced use cases, create your own ConfigManager instance.
 */
export async function updateConfig(updates: Partial<BillclawConfig>): Promise<void> {
  return defaultManager.updateConfig(updates)
}
