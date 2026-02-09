# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BillClaw is a **financial data sovereignty platform** built as a monorepo using **pnpm workspaces**. The core design principle is **framework independence** - all business logic lives in `core`, while adapters (CLI, OpenClaw plugin) provide platform-specific I/O.

```
openclaw ──depends on──> core
cli ──────depends on──> core
```

## Development Commands

```bash
# Build all packages (required before testing)
pnpm build

# Development with watch mode
pnpm dev

# Run all tests (Vitest)
pnpm test
pnpm test:coverage

# Code quality
pnpm lint          # oxlint
pnpm format        # oxfmt

# Clean build artifacts
pnpm clean
```

Each package also supports these commands individually when run from the package directory.

## Architecture Patterns

### Runtime Abstraction Layer

The core package (`packages/core/src/runtime/types.ts`) defines `RuntimeContext` interface that all adapters must implement:

```typescript
interface RuntimeContext {
  readonly logger: Logger;        // Abstract logging
  readonly config: ConfigProvider; // Abstract configuration
  readonly events?: EventEmitter; // Optional event system
}
```

This is the **key pattern** that enables framework independence. When adding new features to core, always use `this.context.logger` (not console.log) and `this.context.config` (not direct file access).

### Package Entry Points

Each package exports its public API through a single `index.ts` file:
- `packages/core/src/index.ts` - Main `Billclaw` class
- `packages/openclaw/src/index.ts` - Plugin registration
- `packages/cli/src/index.ts` - CLI entry point

### Module System

- **ES modules only** (`"type": "module"`)
- Use `.js` extensions in all imports (TypeScript requirement for NodeNext)
- Node.js native ESM with NodeNext module resolution

### Configuration Pattern

All configuration uses **Zod schemas** (`packages/core/src/models/config.ts`):
- Runtime validation
- Type inference from schemas
- Per-account and global settings
- Environment variable fallbacks

### Storage Architecture

Transaction storage (`packages/core/src/storage/`):
- Monthly partitioning: `transactions/{accountId}/{year}/{month}.json`
- Deduplication based on `plaidTransactionId` with 24-hour window
- Idempotent sync using checkpoint-based cursors
- File locking with `proper-lockfile`
- TTL-based memory caching

## Package Structure

### `@firela/billclaw-core` (Framework-Agnostic Core)

```
packages/core/src/
├── billclaw.ts              # Main Billclaw class - entry point
├── runtime/types.ts         # RuntimeContext interface - adapter contract
├── models/config.ts         # Zod schemas for all configuration
├── storage/                 # Transaction persistence layer
├── sources/                 # Data source integrations (Plaid, Gmail)
├── exporters/               # Beancount, Ledger export
├── credentials/             # Keychain integration (optional keytar)
├── security/                # Audit logging
└── sync/                    # Sync orchestration
```

### `@firela/billclaw-openclaw` (OpenClaw Plugin)

```
packages/openclaw/src/
├── plugin.ts                # Plugin registration - register tools/commands/OAuth
├── runtime/context.ts       # OpenClaw runtime adapter implementation
├── tools/                   # Agent tools (plaidSyncTool, gmailFetchTool, etc.)
├── oauth/                   # OAuth providers (Plaid, Gmail)
└── services/                # Background services (webhook-handler)
```

### `@firela/billclaw-cli` (Standalone CLI)

```
packages/cli/src/
├── index.ts                 # CLI entry point
├── commands/                # CLI commands (setup, sync, status, config, export)
├── runtime/                 # CLI runtime adapter implementation
└── utils/                   # CLI utilities (progress, format)
```

## Key Files to Understand

- `packages/core/src/billclaw.ts` - Main API: `getAccounts()`, `getTransactions()`, `syncPlaid()`, `syncGmail()`, `exportToBeancount()`
- `packages/core/src/runtime/types.ts` - Adapter interface definition
- `packages/core/src/models/config.ts` - All configuration schemas
- `packages/openclaw/src/plugin.ts` - OpenClaw integration (6 tools, 4 commands, 2 OAuth, 2 services)
- `packages/cli/src/commands/setup.ts` - Interactive setup wizard pattern

## Testing

- Tests colocated with source: `*.test.ts`
- Vitest with globals enabled
- Run `pnpm build` before testing (TypeScript compilation required)

## Workspace Dependencies

Inter-package references use `workspace:*` protocol:
```json
{
  "dependencies": {
    "@firela/billclaw-core": "workspace:*"
  }
}
```

## Event System

Events emitted by core (optional, handled by EventEmitter adapter):
- `transaction.added`, `transaction.updated`
- `sync.started`, `sync.completed`, `sync.failed`
- `account.connected`, `account.disconnected`, `account.error`

## Release Workflow

**Use git tags to trigger automated releases (npm + ClawHub):**

```bash
# Commit changes
git add . && git commit -m "feat: description"

# Create tag (triggers CI)
git tag v0.1.5 && git push origin main && git push origin v0.1.5
```

**Manual publish** (local testing only, NO ClawHub):
```bash
pnpm build && cd packages/core && npm publish --access public
```


## 语言规范

- **claude回答** 始终使用中文回答

**仓库中所有代码和文档必须使用纯英文。**

| 类型 | 语言 |
|------|------|
| 代码注释 | 英文 |
| 变量/函数名 | 英文 |
| 提交消息 | 英文 |
| 文档 | 英文 |
| 错误消息 | 英文 |

由以下机制强制执行：
- **Pre-commit 钩子**：拒绝包含中文字符的代码提交
- **Commit-msg 钩子**：拒绝包含中文的提交消息
- 详见 `.claude/hooks/naming.md` 详细命名规范

**注意**：`.claude/` 目录和 `CLAUDE.md` 本身使用中文作为 AI 开发指导，但所有项目代码和面向用户的文档必须使用英文。

