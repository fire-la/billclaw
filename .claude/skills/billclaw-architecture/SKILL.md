# BillClaw Architecture Skill

Comprehensive knowledge about BillClaw's multi-platform plugin architecture and monorepo design.

## When to Use This Skill

Use this skill when:
- Understanding BillClaw's package organization and dependencies
- Adding new features to the core package
- Creating new adapters (CLI, OpenClaw, or future platforms)
- Debugging cross-package integration issues
- Explaining BillClaw's design decisions to others
- Planning architectural changes or refactoring

## Architecture Overview

BillClaw is a **framework-agnostic financial data sovereignty platform** built as a monorepo using pnpm workspaces.

### Core Design Principle

**Framework Independence**: The core package (`@fire-zu/billclaw-core`) has zero dependencies on any specific framework or runtime. It operates through abstraction interfaces, allowing it to be used in multiple contexts:

- **OpenClaw Plugin** - via `@fire-zu/billclaw-openclaw` adapter
- **Standalone CLI** - via `@fire-zu/billclaw-cli` application
- **Future** - potential web server, mobile app, desktop app, etc.

### Monorepo Structure

```
billclaw/
├── packages/
│   ├── core/           # Framework-agnostic core (published as @fire-zu/billclaw-core)
│   ├── cli/            # Standalone CLI application (published as @fire-zu/billclaw-cli)
│   └── openclaw/       # OpenClaw plugin adapter (published as @fire-zu/billclaw-openclaw)
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
└── vitest.config.ts
```

### Package Matrix

| Package | Type | Purpose | Dependencies |
|---------|------|---------|--------------|
| `core` | Library | Core business logic, framework-agnostic | None (except optional keytar) |
| `cli` | Application | Standalone CLI for end users | Depends on `core` |
| `openclaw` | Plugin | OpenClaw integration plugin | Depends on `core` + openclaw-sdk |

## Runtime Abstractions

The core package defines three interfaces that adapters must implement:

### 1. Logger Interface

```typescript
interface Logger {
  info(...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  debug(...args: unknown[]): void;
}
```

**Purpose**: Abstract logging so core doesn't depend on a specific logging implementation.

### 2. ConfigProvider Interface

```typescript
interface ConfigProvider {
  getConfig(): Promise<BillclawConfig>;
  getStorageConfig(): Promise<StorageConfig>;
  updateAccount(accountId: string, updates: Partial<AccountConfig>): Promise<void>;
  getAccount(accountId: string): Promise<AccountConfig | null>;
}
```

**Purpose**: Abstract configuration management for different runtime environments.

### 3. EventEmitter Interface

```typescript
interface EventEmitter {
  emit(event: string, data?: unknown): void;
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
}
```

**Purpose**: Abstract event system for broadcasting sync events.

### RuntimeContext

All three abstractions are combined into a single context object:

```typescript
interface RuntimeContext {
  readonly logger: Logger;
  readonly config: ConfigProvider;
  readonly events: EventEmitter;
}
```

## Core Package Structure

```
packages/core/src/
├── index.ts              # Main Billclaw class entry point
├── models/
│   ├── config.ts         # Zod schemas for configuration
│   ├── accounts.ts       # Account interfaces
│   └── transactions.ts   # Transaction interfaces
├── storage/
│   ├── transaction-storage.ts    # Transaction persistence
│   ├── cache.ts                 # In-memory caching with TTL
│   ├── locking.ts               # File locking utilities
│   └── indexes.ts               # Query indexes
├── credentials/
│   ├── keychain.ts              # Platform keychain storage (keytar)
│   └── encryption.ts            # Optional encryption utilities
├── security/
│   └── audit.ts                 # Audit logging for credential access
├── exports/
│   ├── beancount.ts             # Beancount format exporter
│   └── ledger.ts                # Ledger format exporter
├── runtime/
│   ├── index.ts                 # Runtime context types
│   └── defaults.ts              # Default implementations
└── tools/
    ├── plaid-sync.ts            # Plaid transaction sync
    ├── gmail-fetch.ts           # Gmail bill fetching
    └── bill-parse.ts            # Generic bill parsing
```

## Key Features

### 1. Transaction Storage

- **Monthly partitioning**: `transactions/{accountId}/{year}/{month}.json`
- **Deduplication**: Based on `plaidTransactionId` with 24-hour window
- **Idempotent sync**: Using checkpoint-based cursors
- **Streaming JSON**: For large dataset handling

### 2. Security

- **Platform keychain**: Uses `keytar` for secure credential storage (optional)
- **Audit logging**: All credential access logged with timestamps and event types
- **Encryption**: Optional AES-256-GCM for stored data

### 3. Performance

- **Memory cache**: TTL-based caching with max-size eviction
- **Query indexes**: Pre-built indexes for common queries
- **File locking**: Prevents concurrent write conflicts
- **Streaming**: Efficient handling of large transaction sets

### 4. Data Export

- **Beancount**: Double-entry accounting format
- **Ledger**: CLI accounting tool format
- **CSV**: Spreadsheet-compatible format

## Adapter Patterns

### OpenClaw Adapter Pattern

```typescript
// packages/openclaw/src/plugin.ts
export function createPlugin(logger: Logger, config: Config, events: EventEmitter) {
  const context: RuntimeContext = { logger, config, events };

  return {
    id: "billclaw",
    name: "BillClaw Financial Sync",
    version: packageJson.version,

    // Adapter wraps core functionality
    registerCLI() { /* CLI commands */ },
    registerTools() { /* Agent tools */ },
    registerOAuth() { /* OAuth providers */ },
    registerServices() { /* Background services */ },
  };
}
```

### CLI Application Pattern

```typescript
// packages/cli/src/index.ts
import { Billclaw } from "@fire-zu/billclaw-core";
import { createLogger, createConfigProvider, createEventEmitter } from "./runtime";

async function main() {
  const runtime = {
    logger: createLogger(),
    config: createConfigProvider(),
    events: createEventEmitter(),
  };

  const billclaw = new Billclaw(runtime);
  // Use billclaw...
}
```

## Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Plaid     │────▶│ BillClaw Core│────▶│ Transaction │
│   API       │     │ (framework   │     │   Storage   │
└─────────────┘     │  agnostic)  │     └─────────────┘
                    └──────────────┘             │
                          │                      ▼
┌─────────────┐          │              ┌─────────────┐
│   Gmail     │──────────┘              │   Export    │
│   API       │                         │  (Beancount │
└─────────────┘                         │   Ledger)   │
                                         └─────────────┘

        ┌───────────────┐
        │   Adapters    │
        ├───────────────┤
        │  OpenClaw     │◀─── Plugin
        │  CLI          │◀─── Standalone
        │  (future)     │◀─── Web, Mobile
        └───────────────┘
```

## Configuration Schema

Configuration uses **Zod** for runtime validation:

```typescript
const BillclawConfigSchema = z.object({
  accounts: z.array(AccountConfigSchema),
  webhooks: z.array(WebhookConfigSchema),
  storage: StorageConfigSchema,
  sync: SyncConfigSchema,
  plaid: PlaidConfigSchema,
});
```

All configuration changes are validated at runtime, providing early error detection.

## Testing Strategy

- **Unit tests**: Each package has its own test suite
- **Integration tests**: Cross-package interaction tests
- **E2E tests**: Full workflow tests
- **Test count**: 91 tests total (core + cli + openclaw)
- **Framework**: Vitest with globals enabled

## Build & Release

```bash
# Build all packages
pnpm build

# Run tests
pnpm test

# Create changeset
pnpm changeset

# Version packages
pnpm version-packages

# Publish to npm
pnpm release
```

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

## Dependencies

### Core Package
- **Runtime dependencies**: None (100% framework-agnostic)
- **Optional**: `keytar` (platform keychain storage)

### CLI Package
- `@fire-zu/billclaw-core`
- `commander` - CLI framework
- `inquirer` - Interactive prompts
- `chalk` - Terminal colors

### OpenClaw Package
- `@fire-zu/billclaw-core`
- `@openclaw/sdk` - OpenClaw plugin API

## Related Projects

- **beanclaw** - Flutter app for account management
- **ign** - Beancount SaaS backend (NestJS + Prisma)

BillClaw pushes transaction data to ign backend API, beanclaw reads from there.

## License

MIT License - See LICENSE file for details.

## Repository

https://github.com/fire-zu/billclaw
