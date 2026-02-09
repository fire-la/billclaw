---
name: billclaw
description: This skill should be used when managing financial data, syncing bank transactions via Plaid/GoCardless, fetching bills from Gmail, or exporting to Beancount/Ledger formats. Provides local-first data sovereignty for OpenClaw users.
tags: [finance, banking, plaid, gocardless, gmail, beancount, ledger, transactions]
---

# BillClaw - Financial Data Management for OpenClaw

Complete financial data management for OpenClaw with local-first architecture. Sync bank transactions, fetch bills from email, and export to accounting formats.

## Security & Privacy

BillClaw is designed with **security-first architecture** to protect your sensitive financial data:

- **Local-First Storage**: Your data never leaves your machine. All transactions are stored locally in `~/.billclaw/`
- **System Keychain**: Sensitive tokens (Plaid access tokens, Gmail refresh tokens) are stored in your platform's secure keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service)
- **No Cloud Dependency**: No external servers or databases. Your financial data stays under your control
- **Audit Logging**: All credential operations are logged locally for complete transparency
- **Open Source**: Fully auditable codebase at https://github.com/fire-la/billclaw
- **Minimal Permissions**: Only accesses `~/.billclaw/` directory for data storage

**Credential Storage Summary:**

| Credential Type | Storage Location |
|----------------|------------------|
| Plaid API keys | `~/.billclaw/config.json` (user-provided) |
| Plaid access tokens | System Keychain (encrypted) |
| Gmail refresh tokens | System Keychain (encrypted) |
| Transaction data | `~/.billclaw/transactions/` (local JSON) |

## What is BillClaw?

BillClaw gives you **complete control over your financial data**:
- Your bank credentials stay on your machine (not stored on third-party servers)
- Transactions sync directly to your local storage
- Support for US/Canada banks (Plaid) and European banks (GoCardless)
- Gmail bill fetching for automatic expense tracking
- Export to Beancount or Ledger for accounting

## When to Use This Skill

Use this skill when:
- Syncing bank transactions from Plaid (US/Canada) or GoCardless (Europe)
- Fetching and parsing bills from Gmail
- Exporting financial data to Beancount or Ledger formats
- Managing local transaction storage
- Setting up bank account connections

## Installation

### For OpenClaw Users (Recommended)

This skill is designed for OpenClaw. Install directly from ClawHub:

```bash
clawhub install billclaw
```

Once installed, you can use BillClaw tools and commands directly within OpenClaw without any additional installation.

**No external packages required** - the skill includes all necessary functionality.

### For Standalone CLI Users

If you prefer to use BillClaw as a command-line tool outside of OpenClaw:

```bash
npm install -g @firela/billclaw-cli
billclaw setup
```

The CLI package provides the same functionality as the OpenClaw skill, but through a terminal interface.

## Quick Start (OpenClaw)

### 1. Setup Your Accounts

Use the setup command within OpenClaw:

```
/billclaw-setup
```

Interactive wizard will guide you through:
- Connecting bank accounts (Plaid/GoCardless)
- Configuring Gmail for bill fetching
- Setting local storage location

### 2. Sync Your Data

```
You: Sync my bank transactions for last month

OpenClaw: [Uses plaid_sync tool]
✓ Synced 127 transactions from checking account
```

Or use the command directly:
```
/billclaw-sync --from 2024-01-01 --to 2024-12-31
```

### 3. Export to Accounting Formats

```
/billclaw-export --format beancount --output 2024.beancount
```

## Quick Start (CLI)

If using the standalone CLI:

### 1. Install BillClaw CLI

```bash
npm install -g @firela/billclaw-cli
```

### 2. Setup Your Accounts

```bash
billclaw setup
```

### 3. Sync Your Data

```bash
# Sync all configured accounts
billclaw sync

# Sync specific account
billclaw sync --account <account-id>

# Sync with date range
billclaw sync --from 2024-01-01 --to 2024-12-31
```

### 4. Export to Accounting Formats

```bash
# Export to Beancount
billclaw export --format beancount --output 2024.beancount

# Export to Ledger
billclaw export --format ledger --output 2024.ledger
```

## CLI Commands Reference

### Setup & Configuration

```bash
billclaw setup                          # Interactive setup wizard
billclaw status                          # View account status
billclaw config --list                     # List all configuration
```

### Sync Commands

```bash
billclaw sync                            # Sync all accounts
billclaw sync --account <id>               # Sync specific account
billclaw sync --from YYYY-MM-DD            # Sync from date
billclaw sync --to YYYY-MM-DD              # Sync to date
```

### Export Commands

```bash
billclaw export --format beancount        # Export to Beancount
billclaw export --format ledger           # Export to Ledger
billclaw export --from YYYY-MM-DD          # Export date range
```

## OpenClaw Integration

When installed in OpenClaw, you get these tools:

### Agent Tools

- `plaid_sync` - Sync bank transactions from Plaid
- `gmail_fetch` - Fetch bills from Gmail
- `conversational_sync` - Natural language sync interface
- `conversational_status` - Check sync status

### Commands

- `/billclaw-setup` - Configure accounts
- `/billclaw-sync` - Sync transactions
- `/billclaw-status` - View status
- `/billclaw-config` - Manage configuration

### Example Usage in OpenClaw

```
You: Sync my bank transactions for last month

OpenClaw: [Uses plaid_sync tool]
✓ Synced 127 transactions from checking account
```

## Connect OAuth Service

For secure bank authentication, BillClaw uses the Connect OAuth service.

### Quick Start (Local Development)

```bash
# 1. Start Connect service
cd packages/connect
pnpm build
node dist/server.js
# Visit http://localhost:4456

# 2. Configure ~/.billclaw/config.json
{
  "version": 1,
  "connect": { "port": 4456, "host": "localhost" },
  "plaid": {
    "clientId": "your_client_id",
    "secret": "your_secret",
    "environment": "sandbox"
  }
}
```

### Production Deployment

For real bank authentication, you need an external URL:

```bash
# Using ngrok for testing
ngrok http 4456
# Add to config: "publicUrl": "https://abc123.ngrok.io"

# Or deploy to VPS with HTTPS
{
  "connect": {
    "publicUrl": "https://yourdomain.com",
    "tls": {
      "enabled": true,
      "keyPath": "/path/to/key.pem",
      "certPath": "/path/to/cert.pem"
    }
  }
}
```

**Important**: Add your public URL as a redirect URI in Plaid Dashboard:
```
https://yourdomain.com/oauth/plaid/callback
```

## Data Sources

| Source | Description | Regions |
|--------|-------------|---------|
| **Plaid** | Bank transaction sync | US, Canada |
| **GoCardless** | European bank integration | Europe |
| **Gmail** | Bill fetching via email | Global |

## Storage

- **Location**: `~/.billclaw/` (your home directory)
- **Format**: JSON files with monthly partitioning
- **Security**: Local-only storage with optional encryption

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
  },
  "storage": {
    "path": "~/.billclaw",
    "format": "json"
  }
}
```

### Environment Variables (Optional)

You can override config with environment variables:

```bash
PORT=4456
HOST=localhost
PUBLIC_URL=https://yourdomain.com
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
```

**Priority**: Environment variables > Config file > Defaults

## Common Issues

### Issue: Plaid Link fails

**Solution**: Ensure Plaid credentials are configured
```bash
billclaw config --list
# Check that plaid.clientId and plaid.secret are set
```

### Issue: Production OAuth callback fails

**Solution**: Configure publicUrl for external access
```json
{ "connect": { "publicUrl": "https://yourdomain.com" } }
```

Add redirect URI in Plaid Dashboard: `https://yourdomain.com/oauth/plaid/callback`

### Issue: Gmail fetch returns no bills

**Solution**: Check sender whitelist in config
```json
{ "gmail": { "senderWhitelist": ["billing@service.com"] } }
```

### Issue: Export format incorrect

**Solution**: Verify with format mapping
```bash
billclaw export --format beancount --show-mappings
```

## Getting Help

- **Documentation**: https://github.com/fire-la/billclaw
- **Issues**: https://github.com/fire-la/billclaw/issues
- **Security**: Report security vulnerabilities privately at security@fire-la.dev
- **npm packages**: https://www.npmjs.com/org/firela

## Security Disclosure

BillClaw is an open-source project. You can review the complete source code at:
- **Repository**: https://github.com/fire-la/billclaw
- **License**: MIT

For security researchers: If you discover a security vulnerability, please disclose it responsibly by emailing security@fire-la.dev before public disclosure.

