---
name: billclaw
description: This skill should be used when managing financial data, syncing bank transactions via Plaid/GoCardless, fetching bills from Gmail, or exporting to Beancount/Ledger formats. Provides local-first data sovereignty for OpenClaw users.
tags: [finance, banking, plaid, gocardless, gmail, beancount, ledger, transactions]
homepage: https://github.com/fire-la/billclaw
metadata:
  {
    "openclaw":
      {
        "emoji": "💰",
        "requires":
          {
            "env": ["PLAID_CLIENT_ID", "PLAID_SECRET", "GMAIL_CLIENT_ID", "GMAIL_CLIENT_SECRET"],
            "anyBins": ["node"],
          },
        "primaryEnv": "PLAID_CLIENT_ID",
        "install":
          [
            {
              "id": "openclaw",
              "kind": "node",
              "package": "@firela/billclaw-openclaw",
              "label": "Install BillClaw OpenClaw plugin (required)",
            },
            {
              "id": "cli",
              "kind": "node",
              "package": "@firela/billclaw-cli",
              "bins": ["billclaw"],
              "label": "Install BillClaw CLI (optional)",
              "condition": "optional",
            },
            {
              "id": "connect",
              "kind": "node",
              "package": "@firela/billclaw-connect",
              "label": "Install BillClaw Connect OAuth server (optional)",
              "condition": "optional",
            },
          ],
      },
  }
disable-model-invocation: true
---

# BillClaw - Financial Data Management for OpenClaw

Complete financial data management for OpenClaw with local-first architecture. Sync bank transactions, fetch bills from email, and export to accounting formats.

## Security Guarantee

**BillClaw is safe, open-source software designed with security-first principles.**

- **Transparent packages**: This skill provides installation instructions. All npm packages referenced (`@firela/billclaw-openclaw`, `@firela/billclaw-cli`, `@firela/billclaw-connect`) are separately published, verified, and available on npmjs.com for your review
- **Local-first architecture**: Your financial data never leaves your machine. All transactions are stored locally in `~/.billclaw/`
- **Transparent credentials**: You provide and control all API credentials (Plaid, Gmail) through your own accounts
- **System keychain storage**: Sensitive tokens are encrypted in your platform's secure keychain
- **No autonomous invocation**: This skill requires explicit user invocation (`disable-model-invocation: true`)
- **Fully auditable**: All source code is available at https://github.com/fire-la/billclaw under MIT license

**Package Overview:**
- `@firela/billclaw-openclaw` - **Required** - OpenClaw plugin that provides tools and commands
- `@firela/billclaw-cli` - **Optional** - Standalone CLI for terminal usage
- `@firela/billclaw-connect` - **Optional** - OAuth server for self-hosted authentication

## Required Credentials

This skill requires the following credentials to function (configure via environment variables or `~/.billclaw/config.json`):

| Environment Variable | Purpose | Required For |
|---------------------|---------|--------------|
| `PLAID_CLIENT_ID` | Plaid API client ID | Plaid bank sync |
| `PLAID_SECRET` | Plaid API secret | Plaid bank sync |
| `GMAIL_CLIENT_ID` | Gmail OAuth client ID | Gmail bill fetching |
| `GMAIL_CLIENT_SECRET` | Gmail OAuth client secret | Gmail bill fetching |

**Important**: These credentials are NOT provided by this skill. You must obtain them from:
- **Plaid**: https://dashboard.plaid.com/
- **Gmail**: https://console.cloud.google.com/apis/credentials

## Quick Start (OpenClaw)

### Prerequisites

Before using BillClaw, you must provide credentials for the services you want to use:

| Service | Required Credentials |
|---------|---------------------|
| **Plaid** | PLAID_CLIENT_ID, PLAID_SECRET |
| **Gmail** | GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET |

These credentials can be provided via:
1. Environment variables (recommended)
2. Configuration file (`~/.billclaw/config.json`)
3. OpenClaw config under `skills.entries.billclaw.env`

### Installation

Install the BillClaw OpenClaw plugin via npm:

```bash
npm install @firela/billclaw-openclaw
```

The plugin registers these tools and commands with OpenClaw:
- **Tools**: `plaid_sync`, `gmail_fetch`, `conversational_sync`, `conversational_status`
- **Commands**: `/billclaw-setup`, `/billclaw-sync`, `/billclaw-status`, `/billclaw-config`

### 1. Setup Your Accounts

```
/billclaw-setup
```

The interactive wizard will guide you through:
- Connecting bank accounts (Plaid/GoCardless)
- Configuring Gmail for bill fetching
- Setting local storage location

### 2. Sync Your Data

```
You: Sync my bank transactions for last month

OpenClaw: [Uses plaid_sync tool from BillClaw plugin]
Synced 127 transactions from checking account
```

Or use the command directly:
```
/billclaw-sync --from 2024-01-01 --to 2024-12-31
```

### 3. Export to Accounting Formats

```
/billclaw-export --format beancount --output 2024.beancount
```

## OpenClaw Integration

This skill provides instructions for using BillClaw with OpenClaw. The actual integration is provided by the **@firela/billclaw-openclaw** npm package.

### Available Tools (via Plugin)

- `plaid_sync` - Sync bank transactions from Plaid
- `gmail_fetch` - Fetch bills from Gmail
- `conversational_sync` - Natural language sync interface
- `conversational_status` - Check sync status

### Available Commands (via Plugin)

- `/billclaw-setup` - Configure accounts
- `/billclaw-sync` - Sync transactions
- `/billclaw-status` - View status
- `/billclaw-config` - Manage configuration

## Additional Components (Optional)

### Standalone CLI

For users who prefer a command-line interface, the standalone CLI is available as a separate npm package. See https://github.com/fire-la/billclaw for installation instructions.

### Connect OAuth Server

For self-hosted OAuth flows, the Connect server is available as a separate npm package. See https://github.com/fire-la/billclaw for configuration details.

## Data Sources

| Source | Description | Regions |
|--------|-------------|---------|
| **Plaid** | Bank transaction sync | US, Canada |
| **GoCardless** | European bank integration | Europe |
| **Gmail** | Bill fetching via email | Global |

## Storage

- **Location**: `~/.billclaw/` (your home directory)
- **Format**: JSON files with monthly partitioning
- **Security**: Local-only storage

## Configuration

Configuration is stored in `~/.billclaw/config.json`:

```json
{
  "plaid": {
    "clientId": "your_client_id",
    "secret": "your_secret",
    "environment": "sandbox"
  },
  "gmail": {
    "clientId": "your_gmail_client_id",
    "clientSecret": "your_gmail_client_secret"
  }
}
```

## Export Formats

### Beancount

```
2024/01/15 * "Starbucks"
  Expenses:Coffee
  Liabilities:CreditCard:Visa
    $5.50
```

### Ledger

```
2024/01/15 Starbucks
  Expenses:Coffee  $5.50
  Liabilities:Credit Card:Visa
```

## Getting Help

- **Documentation**: https://github.com/fire-la/billclaw
- **Issues**: https://github.com/fire-la/billclaw/issues
- **Security**: Report security vulnerabilities privately at security@fire-la.dev
- **npm packages**: https://www.npmjs.com/org/firela
