/**
 * Import command
 *
 * Import transactions from external files (CSV, OFX, QFX).
 */

import type { CliCommand, CliContext } from "./registry.js";
import { Spinner } from "../utils/progress.js";
import { success, error } from "../utils/format.js";
import { Billclaw } from "@fire-zu/billclaw-core";
import * as fs from "node:fs/promises";

/**
 * Supported import formats
 */
type ImportFormat = "csv" | "ofx" | "qfx";

/**
 * Run import command
 */
async function runImport(context: CliContext, args: {
  file: string;
  format?: ImportFormat;
  accountId?: string;
}): Promise<void> {
  const { runtime } = context;
  const billclaw = new Billclaw(runtime);

  const filePath = args.file;
  const format = args.format ?? detectFormat(filePath);
  const accountId = args.accountId ?? generateAccountId(filePath);

  const spinner = new Spinner({
    text: `Importing transactions from ${filePath}...`,
  }).start();

  try {
    // Read file content
    const content = await fs.readFile(filePath, "utf-8");

    // Parse based on format
    let transactions;
    switch (format) {
      case "csv":
        // TODO: Implement CSV parsing
        throw new Error("CSV import not yet implemented");
      case "ofx":
      case "qfx":
        // TODO: Implement OFX/QFX parsing
        throw new Error("OFX/QFX import not yet implemented");
      default:
        throw new Error(`Unknown import format: ${format}`);
    }

    spinner.succeed(`Imported ${transactions.length} transactions`);
    success(`Imported to account: ${accountId}`);
  } catch (err) {
    spinner.fail(`Import failed: ${(err as Error).message}`);
    throw err;
  }
}

/**
 * Detect format from file extension
 */
function detectFormat(filePath: string): ImportFormat {
  const ext = filePath.split(".").pop()?.toLowerCase();
  
  switch (ext) {
    case "csv":
      return "csv";
    case "ofx":
      return "ofx";
    case "qfx":
      return "qfx";
    default:
      throw new Error(`Cannot detect format from file extension: ${ext}`);
  }
}

/**
 * Generate account ID from file path
 */
function generateAccountId(filePath: string): string {
  const filename = filePath.split("/").pop() ?? "import";
  return `import-${filename.replace(/[^a-z0-9]/gi, "-")}-${Date.now()}`;
}

/**
 * Import command definition
 */
export const importCommand: CliCommand = {
  name: "import",
  description: "Import transactions from external files (CSV, OFX, QFX)",
  arguments: "<file>",
  options: [
    {
      flags: "-f, --format <format>",
      description: "Import format: csv, ofx, or qfx (auto-detect if not specified)",
    },
    {
      flags: "-a, --account <id>",
      description: "Target account ID (generates one if not specified)",
    },
  ],
  handler: (context, args) => runImport(context, args as {
    file: string;
    format?: ImportFormat;
    accountId?: string;
  }),
};
