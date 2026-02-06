---
name: billclaw-architecture
description: Understanding BillClaw's multi-platform plugin architecture and monorepo design. Use this skill when working on the BillClaw codebase architecture, package organization, or when explaining the design decisions.
tags: [billclaw, architecture, monorepo, plugin-architecture, data-sovereignty]
---

# BillClaw - Multi-Platform Plugin Architecture

> **Your Financial Data, Your Control** - Multi-Platform Architecture

## Architecture Overview

BillClaw uses a **multi-platform plugin architecture** that separates core business logic from framework-specific integrations. This enables:

1. **Data Sovereignty** - Your access tokens stay on your device
2. **Framework Flexibility** - Use with OpenClaw, standalone CLI, or future platforms
3. **Code Reusability** - Core logic shared across all platforms

## Architecture Diagram

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                    billclaw-cli                             │
                    │                  (@fire-zu/billclaw-cli)                    │
                    │                                                              │
                    │  Standalone CLI - No OpenClaw required                            │
                    │  Dependencies: commander, inquirer, chalk, cli-table3, ora         │
                    └─────────────────────────────────────────────────────────┘
                                                 │
                                                 │ depends on
                                                 ▼

                    ┌─────────────────────────────────────────────────────────┐
                    │                   billclaw-openclaw                         │
                    │                (@fire-zu/billclaw-openclaw)                 │
                    │                                                              │
                    │  OpenClaw Plugin Adapter - Integrates into OpenClaw ecosystem        │
                    │  Dependencies: openclaw/plugin-sdk, @sinclair/typebox           │
                    └─────────────────────────────────────────────────────────┘
                                                 │
                                                 │ depends on
                                                 ▼


                    ┌───────────────────────────────────────────────────────────────┐
                    │                     billclaw-core                           │
                    │                  (@fire-zu/billclaw-core)                      │
                    │                                                              │
                    │  Pure Business Logic - Zero Framework Dependencies            │
                    │  Dependencies: plaid, googleapis, zod, proper-lockfile      │
                    │                                                              │
                    │  Features:                                                     │
                    │    - Plaid API integration (US/Canada banks)                        │
                    │    - Gmail API integration (bill fetching)                            │
                    │    - Local JSON storage (data sovereignty)                             │
                    │    - Beancount/Ledger export formats                                │
                    │    - Query indexes and streaming performance optimization             │
                    │    - Keychain credential storage                                      │
                    └───────────────────────────────────────────────────────────────┘
```

---

## Package Structure

```
billclaw/
├── packages/
│   ├── core/                         # @fire-zu/billclaw-core
│   │   ├── src/
│   │   │   ├── models/              # Data models (Transaction, Account, Sync)
│   │   │   ├── storage/            # Local JSON storage + cache/indexes/streaming
│   │   │   ├── sync/               # Sync orchestration
│   │   │   ├── sources/            # Data source adapters (Plaid, Gmail)
│   │   │   ├── parsers/            # Bill/email parsers
│   │   │   ├── exporters/          # Beancount, Ledger export
│   │   │   ├── credentials/        # Keychain integration
│   │   │   ├── security/           # Audit logging
│   │   │   ├── errors/             # Error handling
│   │   │   └── runtime/            # Framework-agnostic abstractions
│   │   └── package.json
│   │
│   ├── openclaw/                     # @fire-zu/billclaw-openclaw
│   │   ├── src/
│   │   │   ├── plugin.ts           # OpenClaw plugin registration
│   │   │   ├── tools/              # Agent tools (plaid_sync, gmail_fetch_bills, etc.)
│   │   │   ├── commands/           # CLI command registration
│   │   │   ├── oauth/              # OAuth providers (Plaid Link, Gmail)
│   │   │   ├── config.ts           # Config schema with UI hints
│   │   │   └── openclaw.plugin.json  # Plugin manifest
│   │   └── package.json
│   │
│   └── cli/                          # @fire-zu/billclaw-cli
│       ├── src/
│       │   ├── commands/           # CLI commands (setup, sync, status, etc.)
│       │   ├── runtime/            # CLI-specific runtime adapters
│       │   └── utils/              # CLI utilities
│       ├── bin/
│       │   └── billclaw.js         # Executable
│       └── package.json
│
├── skills/
│   └── billclaw/
│       └── SKILL.md               # User-facing documentation
├── pnpm-workspace.yaml
└── package.json                         # Root monorepo configuration
```

---

## Design Decisions & Rationale

### Q: Why split into multiple packages?

**A:** Three key reasons:

1. **Data Sovereignty** - Core holds sensitive logic without framework coupling
2. **Independent Usage** - CLI can run without OpenClaw installed
3. **Framework Flexibility** - Easy to add new platforms (OpenHands, Goose, etc.)

### Q: Why not keep everything in one package?

**A:** Monolithic packages create tight coupling:
- Hard to reuse core logic in other contexts
- Framework dependencies bloat the package
- Can't ship standalone tools

### Q: What is the "Multi-Platform Plugin Architecture"?

**A:** Each platform has its own integration layer:

| Package Type | Purpose | Example |
|---------------|---------|---------|
| **Core** | Framework-agnostic business logic | Plaid API calls, storage, parsing |
| **Adapter** | Framework-specific integration | OpenClaw tool registration, CLI command binding |

**Key Insight**: Adapters are **thin wrappers** around core. They don't contain business logic - they just translate between the framework's API and core's interface.

### Q: How do adapters share data?

**A:** All adapters use the same core package and data:

```
~/.billclaw/                    # Shared data directory
├── accounts.json               # Account registry
├── transactions/{id}/YYYY/MM.json
├── accounts/{id}.json          # Credentials stored via keychain
└── audit.log                   # Security audit trail
```

### Q: Can I use billclaw without OpenClaw?

**A:** Yes! Install the CLI globally:

```bash
npm install -g @fire-zu/billclaw-cli
billclaw sync
```

---

## Core Package: Framework-Agnostic Design

### Responsibility Breakdown

| Module | Responsibility | Dependencies |
|--------|---------------|------------|
| **models** | Data structures, validation schemas | zod |
| **storage** | File I/O, caching, indexing | proper-lockfile |
| **sources** | Plaid/Gmail API clients | plaid, googleapis |
| **parsers** | Bill/email extraction | None (pure logic) |
| **exporters** | Beancount/Ledger format | None |
| **credentials** | Keychain integration | keytar (optional) |
| **security** | Audit logging | None |
| **runtime** | Framework abstractions | None |

### Why Framework-Agnostic Matters

**Benefits**:
1. **Portability** - Core can be embedded in any JavaScript runtime
2. **Testability** - Test core without OpenCl dependencies
3. **Performance** - Optimize core without framework overhead
4. **Future-Proof** - Easy to add new platforms

### Example: Core Usage in Different Contexts

```typescript
// In OpenClaw plugin
import { BillClaw } from '@fire-zu/billclaw-core';
const billclaw = new BillClaw(openClawRuntime);

// In standalone CLI
import { BillClaw } from '@fire-zu/billclaw-core';
const billclaw = new BillClaw(cliRuntime);

// In a future web service
import { BillClaw } from '@fire-zu/billclaw-core';
const billclaw = new BillClaw(webRuntime);
```

---

## OpenClaw Adapter: Plugin Integration

### What the Adapter Does

The OpenClaw adapter (`@fire-zu/billclaw-openclaw`) translates BillClaw's core functionality into OpenClaw's native concepts:

| BillClaw Core | OpenClaw Plugin |
|----------------|----------------|
| `BillClaw.sync()` | Register `plaid_sync` tool |
| `BillClaw.query()` | Register `bill_query` tool |
| `BillClaw.export()` | Register `bill_export` tool |
| BillClaw.addAccount()` | Register CLI `bills setup` command |
| `BillClaw.on()` | Register event handlers |

### Key Files

| File | Purpose |
|------|---------|
| `plugin.ts` | Plugin registration |
| `tools/` | Agent tool wrappers |
| `commands/` | CLI command handlers |
| `oauth/plaid.ts` | Plaid Link OAuth flow |
| `config.ts` | Config schema + UI hints |
| `openclaw.plugin.json` | Plugin manifest |

### OpenClaw Integration Points

1. **Tools** - AI agents can call billclaw functions
2. **CLI Commands** - Users run `openclaw bills ...`
3. **OAuth Providers** - Plaid Link and Gmail OAuth flows
4. **Background Services** - Auto-sync and webhook handling
5. **HTTP Routes** - Webhook endpoints for real-time updates

---

## CLI Package: Standalone Tool

### Why a Separate CLI?

Even with the OpenClaw plugin, a standalone CLI provides:

1. **No OpenClaw Required** - Run on any machine
2. **Lightweight** - Faster startup for power users
3. **Scripting** - Easier for automation/cron jobs
4. **Debugging** - Direct access without OpenClaw layers

### Usage Examples

```bash
# Interactive setup
billclaw setup

# Sync all accounts
billclaw sync

# Check status
billclaw status

# Export to Beancount
billclaw export --format beancount --output beancount.beancount

# Query transactions
billclaw query --date-from 2024-01-01 --category food
```

### CLI vs Plugin Trade-offs

| Feature | CLI | Plugin |
|--------|-----|--------|
| **Startup Time** | Fast | Slower (OpenClaw overhead) |
| **Setup** | Manual install | OpenClaw extension install |
| **Agent Access** | No | Yes (via tools) |
| **Automation** | Cron jobs | Possible (via gateway) |
| **Debugging** | Direct access | Through OpenClaw logs |

**Recommendation**: Use **both** - CLI for automation/development, Plugin for agent interactions.

---

## Security Architecture

### Credential Storage

**Problem**: Plaid access tokens and Gmail refresh tokens must be protected.

**Solution**: Platform keychains via `keytar`

```
┌──────────────────────────────────────────────────────────────┐
│ Platform | Keychain Location                                   │
├──────────────────────────────────────────────────────────────┤
│ macOS   | /Users/xxx/Library/Keychains/                         │
│ Windows | Windows Credential Manager (encrypted storage)             │
│ Linux   | Secret Service API / KWallet (gnome-keyring, kwallet)     │
└──────────────────────────────────────────────────────────────┘

billclaw → keytar → platform keychain → encrypted storage
```

**Storage Pattern**:
```typescript
// accounts/{id}.json - metadata only (no sensitive data)
{
  "id": "uuid",
  "label": "Chase Checking",
  "provider": "plaid",
  "credentialRef": "billclaw.plaid.uuid.accessToken"  // keychain ref
}

// Keychain entry:
// Service: "billclaw"
// Account: "plaid.uuid.accessToken"
// Password: "access-sandbox-xxxx"
```

### Audit Logging

All credential operations are logged to `~/.billclaw/audit.log`:

```
2025-02-06T09:00:00.000Z credential.created Plaid account123
2025-02-06T09:00:05.000Z credential.read Plaid account123
2025-02-06T09:00:10.000Z account.synced account123
2025-02-06T09:00:15.000Z auth.failed Plaid account123
```

This provides:
- **Compliance** - GLBA/PCI DSS audit trails
- **Forensics** - Investigation evidence
- **Monitoring** - Security event tracking

---

## Performance Optimizations

### Memory Cache

**Problem**: Repeated file I/O for frequently accessed data.

**Solution**: TTL-based in-memory cache

```typescript
const cache = new MemoryCache({ defaultTtl: 300000 }); // 5 minutes

// First call - reads from file
const transactions1 = await loadTransactions(accountId); // Disk I/O

// Second call within TTL - serves from cache
const transactions2 = await cache.get(`tx:${accountId}`); // Memory ✅
```

### Query Indexes

**Problem**: Scanning all transactions to filter by category = O(n) performance.

**Solution**: In-memory indexes provide O(1) lookup

```typescript
// Without index: O(n) - scan all transactions
const foodTxns = transactions.filter(t => t.category.includes('food'));

// With index: O(1) - direct lookup
const foodTxnIds = indexes.query(IndexType.CATEGORY);
```

Supported indexes:
- **Date** - Group transactions by date
- **Category** - Primary category (food, transport, etc.)
- **Merchant** - Merchant name search
- **Amount Range** - Bucketed ranges ($0-10, $10-50, etc.)
- **Pending** - Posted vs pending transactions

### Streaming JSON

**Problem**: Loading large transaction files into memory is expensive.

**Solution**: Stream JSON parsing

```typescript
// Bad: Load entire file into memory
const all = JSON.parse(readFileSync('large-file.json')); // 500MB

// Good: Process incrementally
for await const tx of streamJSON('large-file.json')) {
  if (tx.amount > 1000) process.stdout.write(JSON.stringify(tx));
}
```

---

## Extension Points: Future Platforms

The architecture supports adding new platform adapters without modifying core:

```
packages/
├── core/                  # Unchanged
├── openclaw/             # Existing
├── cli/                  # Existing
├── openhands/            # Future - OpenHands integration
└── goose/                # Future - Goose integration
```

### OpenHands Adapter (Future)

**What it would do**:
- Register OpenHands tools wrapping core functions
- Implement OpenHands-specific configuration UI
- Translate OpenHands events to core operations

### Goose Adapter (Future)

**What it would do**:
- Expose core functions as Goose skills
- Handle Goose-specific scheduling/formatting
- Integrate with Goose's security model

---

## Development Workflow

### Adding Core Functionality

1. **Identify need** - What new functionality is required?
2. **Implement in core** - Add to appropriate `packages/core/src/` module
3. **Export from core** - Add to `packages/core/src/index.ts`
4. **Update adapters** - Call core function from adapter code

### Adding New Adapter

1. **Create package** - `packages/newplatform/` with `package.json`
2. **Implement adapter** - Wrap core functions per platform conventions
3. **Register tools/commands** - Use platform's registration API
4. **Test integration** - Ensure core functions work correctly

---

## Common Pitfalls to Avoid

### 1. Don't Leak Framework Details into Core

❌ **Wrong** - Core imports OpenClaw types:
```typescript
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
```

✅ **Correct** - Core defines its own abstractions:
```typescript
import type { RuntimeContext, Logger, EventEmitter } from "./runtime";
```

### 2. Don't Hardcode Platform-Specific Paths

❌ **Wrong**:
```typescript
const configPath = "~/.openclaw/billclaw/";
```

✅ **Correct**:
```typescript
const configPath = runtime.config.getDataDir(); // Platform-agnostic
```

### 3. Don't Ignore Security in Core

❌ **Wrong**:
```typescript
// Store tokens in plaintext JSON
const token = await getPlaidToken();
await fs.writeFile('tokens.json', JSON.stringify({ token }));
```

✅ **Correct**:
```typescript
// Use keychain for sensitive data
await setCredential(`plaid_access_token:${accountId}`, token);
```

### 4. Don't Skip Abstractions

❌ **Wrong**:
```typescript
// Direct console logging everywhere
console.log('Syncing', accountId);
```

✅ **Correct**:
```typescript
// Use runtime logger for consistency
runtime.logger.info?.('Syncing', accountId);
```

---

## Migration Strategy

### From Old Extension to New Structure

**Before** (single extension):
```
extensions/billclaw/
├── index.ts              # All code mixed together
├── config.ts             # OpenClaw-specific config
└── src/
    ├── tools/             # Tools + CLI mixed
    ├── services/          # Services + CLI mixed
    └── oauth/             # OAuth + CLI mixed
```

**After** (monorepo):
```
packages/
├── core/
│   └── src/
│       ├── tools/         # Pure tool logic
│       ├── services/      # Core service logic
│       └── oauth/         # OAuth flow definitions
├── openclaw/
│   └── src/
│       ├── adapter/       # Wraps core tools as OpenClaw tools
│       ├── commands/      # Wraps core logic as CLI commands
│       └── oauth/         # OpenClaw OAuth integration
└── cli/
    └── src/
        ├── commands/     # CLI commands
        └── oauth/         # CLI OAuth flow
```

---

## Testing Strategy

### Core Package Tests

Test core logic **in isolation** without OpenClaw:

```typescript
// packages/core/src/storage/transaction-storage.test.ts
import { describe, it, expect } from 'vitest';

describe('TransactionStorage', () => {
  it('should store and retrieve transactions', async () => {
    const storage = new TransactionStorage({ path: '/tmp/test' });
    await storage.append(accountId, 2024, 1, [
      { transactionId: 'tx1', amount: 1000, date: '2024-01-01' }
    ]);
    const loaded = await storage.load(accountId, 2024, 1);
    expect(loaded).toHaveLength(1);
  });
});
```

### Adapter Tests

Test adapter wraps core correctly:

```typescript
// packages/openclaw/src/tools/plaid-sync.test.ts
import { describe, expect } from 'vitest';

describe('Plaid Sync Tool', () => {
  it('should register as OpenClaw tool', async () => {
    const tool = plaidSyncTool;  // Core function
    const mockApi = createMockOpenClawApi();

    const result = await tool.execute(mockApi, { accountId: 'test' });

    expect(result).toMatchObject({
      content: [{ type: 'text' }]
    });
  });
});
```

### Integration Tests

Test full workflow with real OpenClaw:

```typescript
// Integration test with OpenClaw Gateway
// Tests: plugin registration, tool invocation, CLI commands
```

---

## Build & Release Process

### Local Development

```bash
# Build all packages
pnpm build

# Watch mode for development
pnpm dev

# Run tests
pnpm test

# Run linter
pnpm lint
```

### Publishing Packages

Each package is published independently to npm:

```bash
# Core package
cd packages/core && pnpm publish

# OpenClaw adapter
cd packages/openclaw && pnpm publish

# CLI tool
cd packages/cli && pnpm publish --tag latest
```

### Version Management

Use **changesets** for coordinated releases:

```bash
# Add a changeset
pnpm changeset

# Bump versions (all packages together)
pnpm changeset version

# Publish all packages
pnpm changeset publish
```

---

## Troubleshooting

### Module Resolution Issues

**Problem**: Import errors in TypeScript

**Solution**:
1. Check `tsconfig.json` - Ensure `moduleResolution: "NodeNext"`
2. Check `package.json` - Ensure `exports` field includes proper paths
3. Check dependency versions - Run `pnpm install`

### Keychain Issues

**Problem**: `keytar` module not found

**Solution**:
1. Keytar is an **optional dependency** in core
2. Install with: `pnpm install -D keytar` in the adapter package
3. Adapter handles keytar as missing gracefully

### Build Failures

**Problem**: Build fails with cryptic TypeScript errors

**Solution**:
1. Clean dist folders: `pnpm clean`
2. Check circular dependencies: `pnpm why <package>`
3. Verify `tsconfig.json` `paths` and `references` are correct

---

## Example: Adding a New Data Source

### Step 1: Extend Core

```typescript
// packages/core/src/sources/stripe.ts
export async function syncStripeTransactions(
  apiKey: string,
  logger: Logger
): Promise<Transaction[]> {
  // Stripe API integration logic
}
```

### Step 2: Export from Core

```typescript
// packages/core/src/index.ts
export * from './sources/stripe.js';
```

### Step 3: Use in OpenClaw Adapter

```typescript
// packages/openclaw/src/tools/stripe-sync.ts
export const stripeSyncTool = {
  name: 'stripe_sync',
  execute: async (api, params) => {
    const core = getBillClawCore(api);
    return core.syncStripeTransactions(params.apiKey, api.logger);
  }
};
```

---

## Summary

BillClaw's multi-platform architecture enables:

1. **Data Sovereignty** - You control your access tokens
2. **Flexibility** - Use with OpenClaw, CLI, or future platforms
3. **Code Reusability** - Core logic shared across all platforms
4. **Maintainability** - Clear separation of concerns
5. **Extensibility** - Easy to add new platforms

The architecture is designed to be **evolutionary** - start with core + CLI, add OpenClaw plugin, expand to more platforms as needed.
