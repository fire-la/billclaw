/**
 * Adapter Factory
 *
 * Creates the appropriate UIAdapter based on the runtime environment.
 */
import type { UIAdapter } from "./types"
import { BrowserAdapter } from "./browser"

/**
 * Create an adapter for the current environment
 *
 * Auto-detects the runtime and returns the appropriate adapter implementation.
 */
export function createAdapter(): UIAdapter {
  // Browser environment
  if (typeof window !== "undefined") {
    return new BrowserAdapter()
  }

  throw new Error("No adapter available for this environment")
}

// Re-export types
export * from "./types"
export { BrowserAdapter } from "./browser"
