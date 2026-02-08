---
name: billclaw
description: This skill should be used when managing financial data, syncing bank transactions via Plaid/GoCardless, fetching bills from Gmail, or exporting to Beancount/Ledger formats. Provides local-first data sovereignty for OpenClaw users.
tags: [finance, banking, plaid, gocardless, gmail, beancount, ledger, transactions]
---

# BillClaw - Financial Data Sovereignty for OpenClaw

Complete financial data management skill for OpenClaw with local-first architecture. Sync bank transactions, fetch bills from email, and export to accounting formats.

## When to Use This Skill

Use this skill when:
- Syncing bank transactions from Plaid (US/Canada) or GoCardless (Europe)
- Fetching and parsing bills from Gmail
- Exporting financial data to Beancount or Ledger formats
- Managing local transaction storage with caching and indexing
- Running financial data operations with full data sovereignty
- Setting up OAuth authentication with Connect service

## Package Information

- **Packages**: `@firela/billclaw-core`, `@firela/billclaw-cli`, `@firela/billclaw-openclaw`, `@firela/billclaw-connect`
- **Repository**: https://github.com/fire-la/billclaw
- **Version**: 0.1.5
- **License**: MIT

## Installation

### Via npm

```bash
# Core package (framework-agnostic)
npm install @firela/billclaw-core

# CLI application
npm install @firela/billclaw-cli

# OpenClaw plugin
npm install @firela/billclaw-openclaw
```

### Via pnpm

```bash
pnpm add @firela/billclaw-core
pnpm add @firela/billclaw-cli
pnpm add @firela/billclaw-openclaw
```

## Connect OAuth Service

The `@firela/billclaw-connect` package provides a web-based OAuth service for authentication.

### Local Development

```bash
cd packages/connect
pnpm build

# Configure ~/.billclaw/config.json
cat > ~/.billclaw/config.json << EOF
{
  "version": 1,
  "connect": {
    "port": 4456,
    "host": "localhost"
  },
  "plaid": {
    "clientId": "your_client_id",
    "secret": "your_secret",
    "environment": "sandbox"
  }
}
EOF

# Start service
node dist/server.js
# Visit http://localhost:4456
```

### Production Deployment

For real bank authentication, you need an external accessible URL:

```bash
# Using ngrok (for testing)
ngrok http 4456
# Configure publicUrl: "https://abc123.ngrok.io"

# VPS with HTTPS
{
  "connect": {
    "port": 4456,
    "host": "0.0.0.0",
    "publicUrl": "https://billclaw.yourdomain.com",
    "tls": {
      "enabled": true,
      "keyPath": "/etc/letsencrypt/live/.../privkey.pem",
      "certPath": "/etc/letsencrypt/live/.../fullchain.pem"
    }
  },
  "plaid": {
    "environment": "development"
  }
}
```

See README.md for detailed deployment scenarios.

## CLI Usage

### Setup Wizard

```bash
billclaw setup
```

Interactive wizard for:
- Linking Plaid accounts
- Configuring Gmail bill fetching
- Setting up local storage path

### Sync Transactions

```bash
# Sync all accounts
billclaw sync

# Sync specific account
billclaw sync --account <account-id>

# Sync with date range
billclaw sync --from 2024-01-01 --to 2024-12-31
```

### Status & Configuration

```bash
# View account status
billclaw status

# List all configuration
billclaw config --list

# View storage statistics
billclaw status --storage
```

### Export Data

```bash
# Export to Beancount
billclaw export --format beancount --output transactions.beancount

# Export to Ledger
billclaw export --format ledger --output transactions.ledger

# Export with date filter
billclaw export --from 2024-01-01 --format beancount
```

## OpenClaw Plugin Usage

When installed in OpenClaw, this skill provides:

### Tools

- `plaid_sync` - Sync bank transactions from Plaid
- `gmail_fetch` - Fetch bills from Gmail
- `conversational_sync` - Natural language sync interface
- `conversational_status` - Check sync status
- `conversational_help` - Get help with commands

### Commands

- `/billclaw-setup` - Configure accounts
- `/billclaw-sync` - Sync transactions
- `/billclaw-status` - View status
- `/billclaw-config` - Manage configuration

### OAuth Providers

- Plaid Link integration for bank account linking
- Gmail OAuth for bill fetching

## Features

### Data Sources

| Source | Description | Regions |
|--------|-------------|---------|
| **Plaid** | Bank transaction sync | US, Canada |
| **GoCardless** | European bank integration | Europe |
| **Gmail** | Bill fetching via email | Global |

### Storage Architecture

- **Location**: `~/.billclaw/` (configurable)
- **Format**: Monthly partitioned JSON files
- **Caching**: TTL-based in-memory cache with mtime validation
- **Deduplication**: 24-hour window based on transaction ID
- **Streaming**: Efficient handling of large datasets
- **File Locking**: Concurrent access safety with proper-lockfile

### Export Formats

- **Beancount**: Double-entry accounting format
- **Ledger**: CLI accounting tool format

### Security

- Platform keychain storage for credentials (keytar)
- Audit logging for all credential access
- Optional AES-256-GCM encryption
- Local-first architecture - your data never leaves your control

## Configuration

### Unified ConfigManager

BillClaw uses a unified `ConfigManager` for all components (CLI, Connect, OpenClaw):

- **File**: `~/.billclaw/config.json`
- **Format**: JSON with Zod schema validation
- **Caching**: 5-minute TTL + mtime validation
- **File Locking**: Concurrent write safety
- **Environment Variables**: Override config file values

### Configuration Structure

```json
{
  "version": 1,
  "connect": {
    "port": 4456,
    "host": "localhost",
    "publicUrl": "https://billclaw.yourdomain.com",
    "tls": {
      "enabled": false,
      "keyPath": "/path/to/key.pem",
      "certPath": "/path/to/cert.pem"
    }
  },
  "plaid": {
    "clientId": "your_client_id",
    "secret": "your_secret",
    "environment": "sandbox",
    "webhookUrl": "https://your-domain.com/webhook/plaid"
  },
  "gmail": {
    "clientId": "your_gmail_client_id",
    "clientSecret": "your_gmail_client_secret",
    "senderWhitelist": ["billing@service.com"]
  },
  "storage": {
    "path": "~/.billclaw",
    "format": "json",
    "encryption": { "enabled": false }
  },
  "sync": {
    "defaultFrequency": "daily",
    "retryOnFailure": true,
    "maxRetries": 3
  },
  "accounts": [],
  "webhooks": []
}
```

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `PORT`, `HOST` | Connect service settings |
| `PUBLIC_URL` | External URL for OAuth (production) |
| `TLS_ENABLED`, `TLS_KEY_PATH`, `TLS_CERT_PATH` | HTTPS configuration |
| `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENVIRONMENT` | Plaid settings |
| `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET` | Gmail settings |

**Priority**: Environment variables > Config file > Defaults

## Runtime Abstractions

The core package is framework-agnostic and uses runtime abstractions:

- **Logger**: Abstract logging interface
- **ConfigProvider**: Configuration management (ConfigManager)
- **EventEmitter**: Event system for sync operations

This allows BillClaw to work across different environments (CLI, OpenClaw plugin, Connect service).

## Event System

BillClaw emits events for important operations:

- `transaction.added` - New transactions added
- `transaction.updated` - Existing transactions updated
- `sync.started` - Sync operation started
- `sync.completed` - Sync operation completed
- `sync.failed` - Sync operation failed
- `account.connected` - Account successfully connected
- `account.disconnected` - Account disconnected
- `account.error` - Account error occurred

## Architecture

### Framework-Agnostic Core

```
┌─────────────────────────────────────────────────────────────┐
│                      BillClaw Monorepo                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  OpenClaw Plugin │  │   Standalone CLI │               │
│  │  (AI Framework)  │  │   (Terminal)     │               │
│  └────────┬─────────┘  └────────┬─────────┘               │
│           │                      │                          │
│           └──────────┬───────────┘                          │
│                      ▼                                      │
│           ┌────────────────────┐                           │
│           │  @firela/billclaw-core  │                     │
│           │  (Framework-Agnostic) │                         │
│           │  ├─ ConfigManager    │                         │
│           │  ├─ OAuth Core       │                         │
│           │  ├─ Storage          │                         │
│           │  └─ Sources          │                         │
│           └────────┬────────────┘                           │
│                      │                                      │
│           ┌──────────┴──────────────────────┐             │
│           ▼                                 ▼             │
│    ┌──────────────┐              ┌──────────────┐       │
│    │  OpenClaw    │              │     CLI      │       │
│    │  Adapter     │              │   Adapter    │       │
│    └──────────────┘              └──────────────┘       │
│           │                                 │             │
│           └──────────┬──────────────────────────┘             │
│                      ▼                                        │
│           ┌────────────────────┐                             │
│           │  @firela/            │                             │
│           │  billclaw-connect    │                             │
│           │  (OAuth Service)      │                             │
│           └────────────────────┘                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Framework-Agnostic** - Core business logic independent of AI frameworks
2. **Adapter Pattern** - Each framework uses adapters to call core
3. **Local-First** - Service runs on user's machine
4. **Data Sovereignty** - User owns their data

## Scripts

### Validate Skill

Run validation before publishing:

```bash
./skills/billclaw/scripts/validate-skill.sh skills/billclaw
```

This checks:
- SKILL.md format and required fields
- File size limits
- Directory structure
- Description quality

## Troubleshooting

### Issue: Plaid Link fails

**Solution**: Ensure Plaid credentials are configured in `~/.billclaw/config.json`:
```json
{
  "plaid": {
    "clientId": "your_client_id",
    "secret": "your_secret",
    "environment": "sandbox"
  }
}
```

### Issue: Production OAuth callback fails

**Solution**: Configure `publicUrl` for external access:
```json
{
  "connect": {
    "publicUrl": "https://billclaw.yourdomain.com"
  }
}
```

Add the redirect URI in Plaid Dashboard: `https://billclaw.yourdomain.com/oauth/plaid/callback`

### Issue: Gmail fetch returns no bills

**Solution**: Check Gmail filters and sender whitelist in config:
```json
{
  "gmail": {
    "senderWhitelist": ["billing@service.com"]
  }
}
```

### Issue: Export format incorrect

**Solution**: Verify account mappings:
```bash
billclaw export --format beancount --show-mappings
```

### Issue: Concurrent config access errors

**Solution**: ConfigManager uses file locking automatically. If errors persist, check file permissions:
```bash
ls -la ~/.billclaw/config.json
chmod 600 ~/.billclaw/config.json
```

## Resources

- **Documentation**: https://github.com/fire-la/billclaw
- **Architecture**: docs/architecture.md
- **Deployment Guide**: README.md#production-deployment
- **npm packages**: https://www.npmjs.com/org/firela
- **Issues**: https://github.com/fire-la/billclaw/issues

## Contributing

Contributions are welcome! Please see CONTRIBUTING.md in the repository.

## License

MIT License - See LICENSE file for details.

## Changelog

### 0.1.5 (2026-02-08)

Phase 0 Architecture Refactoring:
- ✅ Added unified ConfigManager for centralized configuration
- ✅ Created `@firela/billclaw-connect` OAuth service package
- ✅ Implemented adapter pattern for OpenClaw/CLI/Connect
- ✅ Added complete OAuth flow with web UI
- ✅ Added publicUrl and HTTPS/TLS support for production deployment
- ✅ Refactored CLI to use ConfigManager internally
- ✅ Added comprehensive deployment documentation

### 0.0.1 (2025-02-07)

Initial release:
- Plaid integration for US/Canada banks
- GoCardless integration for European banks
- Gmail bill fetching and parsing
- Local token storage with keychain
- Beancount and Ledger export
- CLI with setup wizard
- OpenClaw plugin with tools and commands
- GitHub Actions publishing workflow
