/**
 * BillClaw CLI
 *
 * Standalone command-line interface for financial data management.
 */

import { Command } from "commander"
import { CommandRegistry } from "./commands/registry.js"
import { allCommands } from "./commands/index.js"

/**
 * CLI version
 */
const VERSION = "0.0.1"

/**
 * Create and configure the CLI program
 */
export async function createProgram(): Promise<Command> {
  const program = new Command()

  program
    .name("billclaw")
    .description(
      "BillClaw - Financial data sovereignty with multi-platform support",
    )
    .version(VERSION)

  const registry = new CommandRegistry(program)

  // Register all commands
  for (const commandLoader of allCommands) {
    const commandName = Object.keys(commandLoader)[0]
    const loadCommand = Object.values(commandLoader)[0] as () => Promise<any>
    const command = await loadCommand()
    registry.register(command)
  }

  return program
}

/**
 * Main entry point
 */
export async function main(args: string[] = process.argv): Promise<void> {
  try {
    const program = await createProgram()
    await program.parseAsync(args)
  } catch (error) {
    console.error("CLI error:", error)
    process.exit(1)
  }
}
