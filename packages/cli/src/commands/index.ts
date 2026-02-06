/**
 * CLI commands module
 *
 * All available CLI commands.
 */

export {
  CommandRegistry,
  type CliCommand,
  type CliContext,
  type CliCommandHandler,
} from "./registry.js"
export { setupCommand } from "./setup.js"
export { syncCommand } from "./sync.js"
export { statusCommand } from "./status.js"
export { configCommand } from "./config.js"
export { exportCommand } from "./export.js"
/**
 * All commands to register
 */
export const allCommands = [
  { setup: () => import("./setup.js").then((m) => m.setupCommand) },
  { sync: () => import("./sync.js").then((m) => m.syncCommand) },
  { status: () => import("./status.js").then((m) => m.statusCommand) },
  { config: () => import("./config.js").then((m) => m.configCommand) },
  { export: () => import("./export.js").then((m) => m.exportCommand) },
]
