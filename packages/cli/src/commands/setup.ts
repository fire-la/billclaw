/**
 * Setup command
 *
 * Interactive setup wizard for connecting accounts.
 */

import type { CliCommand, CliContext } from "./registry.js";
import inquirer from "inquirer";
import { success, error } from "../utils/format.js";

/**
 * Account type prompt answers
 */
interface AccountTypeAnswers {
  accountType: "plaid" | "gmail" | "gocardless";
}

/**
 * Plaid setup answers
 */
interface PlaidAnswers {
  clientId: string;
  secret: string;
  environment: "sandbox" | "development" | "production";
}

/**
 * Gmail setup answers
 */
interface GmailAnswers {
  credentialsPath: string;
}

/**
 * Run setup wizard
 */
async function runSetup(context: CliContext): Promise<void> {
  const { runtime } = context;
  const config = await runtime.config.getConfig();

  console.log("BillClaw Account Setup");
  console.log("");

  const { accountType } = await inquirer.prompt<AccountTypeAnswers>([
    {
      type: "list",
      name: "accountType",
      message: "What type of account would you like to add?",
      choices: [
        { name: "Plaid (Bank accounts via Plaid Link)", value: "plaid" },
        { name: "Gmail (Email bills)", value: "gmail" },
        { name: "GoCardless (Bank accounts via open banking)", value: "gocardless" },
      ],
    },
  ]);

  try {
    switch (accountType) {
      case "plaid":
        await setupPlaid(context);
        break;
      case "gmail":
        await setupGmail(context);
        break;
      case "gocardless":
        await setupGoCardless(context);
        break;
    }

    success("Account added successfully!");
  } catch (err) {
    error("Failed to add account: " + (err as Error).message);
    throw err;
  }
}

/**
 * Setup Plaid account
 */
async function setupPlaid(context: CliContext): Promise<void> {
  const answers = await inquirer.prompt<PlaidAnswers>([
    {
      type: "input",
      name: "clientId",
      message: "Plaid Client ID:",
      validate: (input: string) => input.length > 0 || "Client ID is required",
    },
    {
      type: "password",
      name: "secret",
      message: "Plaid Secret:",
      mask: "*",
      validate: (input: string) => input.length > 0 || "Secret is required",
    },
    {
      type: "list",
      name: "environment",
      message: "Plaid Environment:",
      choices: [
        { name: "Sandbox (testing)", value: "sandbox" },
        { name: "Development (testing)", value: "development" },
        { name: "Production (live)", value: "production" },
      ],
      default: "sandbox",
    },
  ]);

  const accountId = `plaid-${Date.now()}`;
  
  // TODO: Store credentials securely using keychain
  // TODO: Add account to config
  
  context.runtime.logger.info("Plaid account configured:", accountId);
}

/**
 * Setup Gmail account
 */
async function setupGmail(context: CliContext): Promise<void> {
  const answers = await inquirer.prompt<GmailAnswers>([
    {
      type: "input",
      name: "credentialsPath",
      message: "Path to Gmail credentials JSON:",
      default: "~/.gmail-credentials.json",
    },
  ]);

  const accountId = `gmail-${Date.now()}`;
  
  // TODO: Store credentials securely
  // TODO: Add account to config
  
  context.runtime.logger.info("Gmail account configured:", accountId);
}

/**
 * Setup GoCardless account
 */
async function setupGoCardless(context: CliContext): Promise<void> {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "clientId",
      message: "GoCardless Client ID:",
      validate: (input: string) => input.length > 0 || "Client ID is required",
    },
    {
      type: "password",
      name: "secret",
      message: "GoCardless Secret:",
      mask: "*",
      validate: (input: string) => input.length > 0 || "Secret is required",
    },
    {
      type: "list",
      name: "environment",
      message: "GoCardless Environment:",
      choices: [
        { name: "Sandbox (testing)", value: "sandbox" },
        { name: "Production (live)", value: "live" },
      ],
      default: "sandbox",
    },
  ]);

  const accountId = `gocardless-${Date.now()}`;
  
  // TODO: Store credentials securely
  // TODO: Add account to config
  
  context.runtime.logger.info("GoCardless account configured:", accountId);
}

/**
 * Setup command definition
 */
export const setupCommand: CliCommand = {
  name: "setup",
  description: "Interactive setup wizard for connecting accounts",
  aliases: ["init"],
  handler: runSetup,
};
