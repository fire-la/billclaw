# Codebase Structure

**Analysis Date:** 2026-02-22

## Directory Layout

```
/Users/xiafang/Documents/billclaw/main/
├── packages/              # Main packages (monorepo)
│   ├── core/             # Framework-agnostic business logic
│   ├── cli/              # Standalone CLI
│   ├── openclaw/         # OpenClaw plugin
│   └── connect/          # OAuth web service
├── skills/                # OpenClaw skill definitions for ClawHub
│   └── billclaw/         # BillClaw skill package
├── billclaw-docs/         # Documentation site
├── .changeset/            # Changeset version management
├── .github/               # GitHub Actions workflows
├── .husky/                # Git hooks
├── package.json           # Monorepo root config
├── pnpm-workspace.yaml    # Workspace definition
├── pnpm-lock.yaml         # Lockfile
├── tsconfig.base.json     # Shared TypeScript config
└── vitest.config.ts       # Test configuration
```

## Directory Purposes

**packages/core/**
- Purpose: Framework-agnostic business logic
- Contains: TypeScript source files (*.ts)
- Key files: `src/billclaw.ts` (main class), `src/runtime/types.ts` (abstraction), `src/models/config.ts` (schemas)
- Subdirectories: `src/runtime/`, `src/models/`, `src/config/`, `src/connection/`, `src/storage/`, `src/sync/`, `src/sources/`, `src/exporters/`, `src/webhooks/`, `src/webhook/`, `src/oauth/`, `src/relay/`, `src/credentials/`, `src/errors/`, `src/security/`

**packages/cli/**
- Purpose: Standalone command-line interface
- Contains: CLI commands and utilities
- Key files: `src/index.ts` (entry), `src/commands/setup.ts` (wizard)
- Subdirectories: `src/commands/`, `src/runtime/`, `src/utils/`
- Binary: `bin/billclaw.js`

**packages/openclaw/**
- Purpose: OpenClaw AI framework plugin
- Contains: Tools, commands, OAuth providers, services
- Key files: `src/plugin.ts` (registration), `src/runtime/context.ts` (adapter)
- Subdirectories: `src/tools/`, `src/oauth/`, `src/services/`, `src/runtime/`, `src/types/`

**packages/connect/**
- Purpose: OAuth web service (Express)
- Contains: Server and route handlers
- Key files: `src/server.ts` (entry), `src/routes/webhooks.ts` (webhooks)
- Subdirectories: `src/routes/`, `src/public/`

**skills/billclaw/**
- Purpose: ClawHub skill package
- Contains: Skill metadata and documentation
- Key files: `SKILL.md` (skill definition)

## Key File Locations

**Entry Points:**
- `packages/core/src/index.ts` - Core public API exports
- `packages/cli/src/index.ts` - CLI entry (Commander)
- `packages/cli/bin/billclaw.js` - CLI binary
- `packages/openclaw/src/index.ts` - Plugin default export
- `packages/connect/src/server.ts` - Express server

**Configuration:**
- `pnpm-workspace.yaml` - Workspace packages definition
- `tsconfig.base.json` - Shared TypeScript config
- `packages/*/package.json` - Package-specific config and exports
- `vitest.config.ts` - Test configuration
- `.changeset/config.json` - Version management

**Core Logic:**
- `packages/core/src/billclaw.ts` - Main API class
- `packages/core/src/models/config.ts` - Zod configuration schemas
- `packages/core/src/runtime/types.ts` - RuntimeContext interface
- `packages/core/src/storage/transaction-storage.ts` - Transaction persistence
- `packages/core/src/connection/mode-selector.ts` - Connection mode logic

**Testing:**
- Tests co-located with source: `*.test.ts`
- 20 test files across packages
- Config: `vitest.config.ts` in root and each package

**Documentation:**
- `CLAUDE.md` - AI developer instructions
- `skills/billclaw/SKILL.md` - ClawHub skill definition
- `billclaw-docs/` - Full documentation site

## Naming Conventions

**Files:**
- Source files: `kebab-case.ts` (e.g., `transaction-storage.ts`, `mode-selector.ts`)
- Test files: `*.test.ts` (e.g., `billclaw.test.ts`, `cache.test.ts`)
- Index files: `index.ts` for barrel exports
- Type definitions: `*.d.ts` (e.g., `openclaw-plugin.d.ts`)

**Directories:**
- All directories: `kebab-case` (e.g., `transaction-storage/`, `mode-selector/`)
- Plural for collections: `sources/`, `exporters/`, `credentials/`

**Code:**
- Classes/Interfaces/Types/Enums: `PascalCase`
- Functions/Variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`

## Where to Add New Code

**New Feature (Business Logic):**
- Primary code: `packages/core/src/`
- Types: `packages/core/src/models/` or feature directory
- Tests: Same directory as source (`*.test.ts`)

**New CLI Command:**
- Definition: `packages/cli/src/commands/`
- Registration: `packages/cli/src/commands/index.ts`
- Tests: `packages/cli/src/commands/*.test.ts`

**New OpenClaw Tool:**
- Implementation: `packages/openclaw/src/tools/`
- Registration: `packages/openclaw/src/plugin.ts`
- Types: `packages/openclaw/src/types/`

**New OAuth Provider:**
- Core logic: `packages/core/src/oauth/providers/`
- OpenClaw handler: `packages/openclaw/src/oauth/`
- Connect routes: `packages/connect/src/routes/`

**New Data Source:**
- Implementation: `packages/core/src/sources/{source-name}/`
- Types: Same directory
- Tests: `packages/core/src/sources/{source-name}/*.test.ts`

## Special Directories

**`.changeset/`**:
- Purpose: Version management for releases
- Source: Changeset files created during development
- Committed: Yes

**`skills/`**:
- Purpose: ClawHub skill packages (OpenClaw integration)
- Source: Published to ClawHub registry
- Committed: Yes

**`billclaw-docs/`**:
- Purpose: Documentation site
- Source: Markdown files for user/developer guides
- Committed: Yes

---

*Structure analysis: 2026-02-22*
*Update when directory structure changes*
