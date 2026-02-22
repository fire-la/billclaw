# Architecture

**Analysis Date:** 2026-02-22

## Pattern Overview

**Overall:** Framework-Independent Monorepo with Hexagonal Architecture (Ports and Adapters)

**Key Characteristics:**
- All business logic in framework-agnostic core package
- Adapters provide platform-specific I/O implementations
- pnpm workspace monorepo with 4 main packages
- ES Modules only with NodeNext module resolution

## Layers

**Core Business Layer (`packages/core/`):**
- Purpose: Framework-agnostic business logic
- Contains: Main `Billclaw` class, domain models, storage, sync orchestration
- Depends on: Runtime abstraction only (no external frameworks)
- Used by: CLI, OpenClaw, Connect adapters
- Key file: `packages/core/src/billclaw.ts`

**Runtime Abstraction Layer:**
- Purpose: Define adapter contract for I/O operations
- Contains: `RuntimeContext` interface with Logger, ConfigProvider, EventEmitter
- Key file: `packages/core/src/runtime/types.ts`
- Pattern: Dependency injection via constructor

**Data Source Layer (`packages/core/src/sources/`):**
- Purpose: External API integrations
- Contains: Plaid sync, Gmail fetch, email parsing
- Key files: `packages/core/src/sources/plaid/plaid-sync.ts`, `packages/core/src/sources/gmail/gmail-fetch.ts`

**Adapter Layer (`packages/cli/`, `packages/openclaw/`, `packages/connect/`):**
- Purpose: Platform-specific I/O implementations
- Contains: CLI commands, OpenClaw tools, Express OAuth server
- Implements: RuntimeContext interface for each platform

**Export Layer (`packages/core/src/exporters/`):**
- Purpose: Format-specific data export
- Contains: Beancount, Ledger exporters
- Key files: `packages/core/src/exporters/beancount.ts`, `packages/core/src/exporters/ledger.ts`

## Data Flow

**Sync Flow (Plaid Example):**
1. User triggers sync via CLI or OpenClaw tool
2. `Billclaw.syncAccount()` receives account ID
3. Looks up account config via `ConfigProvider`
4. Delegates to `syncPlaidAccount()` in `packages/core/src/sources/plaid/plaid-sync.ts`
5. Creates Plaid API client, fetches transactions
6. Converts transactions to internal format
7. Stores via `appendTransactions()` in `packages/core/src/storage/transaction-storage.ts`
8. Emits events via `emitEvent()` for webhooks

**Storage Pattern:**
- Monthly partitioning: `transactions/{accountId}/{year}/{month}.json`
- Deduplication: Based on `plaidTransactionId` with 24-hour window
- File locking: Uses `proper-lockfile` for concurrent access
- Atomic writes: Temp file + rename pattern

## Key Abstractions

**RuntimeContext (Core Pattern):**
```typescript
// packages/core/src/runtime/types.ts
interface RuntimeContext {
  readonly logger: Logger;
  readonly config: ConfigProvider;
  readonly events?: EventEmitter;
}
```
- Purpose: Enable framework independence
- Examples: `Billclaw` class receives RuntimeContext in constructor
- Pattern: Dependency injection, all I/O through context

**Connection Mode Selector:**
- Purpose: Auto-detect Direct/Relay/Polling modes for OAuth and webhooks
- Key file: `packages/core/src/connection/mode-selector.ts`
- Features: Health checks for mode availability, unified selection logic

**Error Handling:**
- Purpose: Dual-mode errors (machine + human readable)
- Key file: `packages/core/src/errors/errors.ts`
- Pattern: `UserError` type with `errorCode`, `category`, `severity`, `nextActions`

**Webhook Router Registry:**
- Key file: `packages/core/src/webhooks/router.ts`
- Pattern: Registry pattern with `register()`, `route()`, `getHandler()` methods

## Entry Points

**CLI Entry:**
- Location: `packages/cli/src/index.ts`
- Binary: `packages/cli/bin/billclaw.js`
- Triggers: User runs `billclaw <command>`
- Responsibilities: Parse args, route to command handlers

**OpenClaw Entry:**
- Location: `packages/openclaw/src/index.ts`
- Triggers: Plugin load by OpenClaw framework
- Responsibilities: Register tools, commands, OAuth providers, services

**Connect Entry:**
- Location: `packages/connect/src/server.ts`
- Triggers: Server startup (manual or service)
- Responsibilities: Express app, OAuth routes, webhook endpoints

## Error Handling

**Strategy:** Throw errors, catch at boundaries, provide user-friendly messages

**Patterns:**
- Services throw `UserError` with descriptive messages and error codes
- Command handlers catch errors, log to stderr, exit with status code
- Error parsing functions: `parsePlaidError()`, `parseOauthError()`, `parseRelayError()`

**Key file:** `packages/core/src/errors/errors.ts` (1611 lines - comprehensive error definitions)

## Cross-Cutting Concerns

**Logging:**
- Approach: Abstracted via `RuntimeContext.logger`
- CLI: Console-based logger with debug support
- OpenClaw: Uses OpenClaw's logger API
- Pattern: Never use `console.log` directly in core code

**Validation:**
- Approach: Zod schemas at configuration boundaries
- Key file: `packages/core/src/models/config.ts`
- Pattern: Runtime validation with type inference

**Security:**
- Audit logging: `packages/core/src/security/audit.ts`
- PKCE for OAuth: `packages/core/src/oauth/pkce.ts`
- Keychain integration: `packages/core/src/credentials/keychain.ts`

---

*Architecture analysis: 2026-02-22*
*Update when major patterns change*
