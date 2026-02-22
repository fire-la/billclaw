# Technology Stack

**Analysis Date:** 2026-02-22

## Languages

**Primary:**
- TypeScript 5.8.0 - All application code across packages (core, cli, openclaw, connect uses 5.3.3)

**Secondary:**
- JavaScript (ES2022) - Build output and config files

## Runtime

**Environment:**
- Node.js >= 20.0.0 - Required engine version
- ES Modules only (`"type": "module"`)
- NodeNext module resolution

**Package Manager:**
- pnpm 10.12.4+ (workspace protocol)
- Lockfile: `pnpm-lock.yaml` present

## Frameworks

**Core:**
- None (vanilla Node.js) - Framework-agnostic by design

**Testing:**
- Vitest 3.0+ - Unit tests (connect uses 1.1.0, needs update)
- V8 coverage provider

**Build/Dev:**
- TypeScript Compiler (tsc) - Compilation to JavaScript
- ES2022 target output

## Key Dependencies

**Critical:**
- `plaid: ^32.0.0` - Bank transaction sync via Plaid API - `packages/core/src/sources/plaid/plaid-sync.ts`
- `zod: ^3.25.0` - Runtime schema validation - `packages/core/src/models/config.ts`
- `ws: ^8.19.0` - WebSocket client for relay service - `packages/core/src/relay/client.ts`
- `proper-lockfile: ^4.1.2` - File locking for concurrent access - `packages/core/src/storage/`

**Infrastructure:**
- `commander: ^13.1.0` - CLI framework - `packages/cli/src/index.ts`
- `express: ^4.18.2` - OAuth web server - `packages/connect/src/server.ts`
- `express-rate-limit: ^7.0.0` - Rate limiting middleware - `packages/connect/src/server.ts`
- `inquirer: ^12.0.0` - Interactive CLI prompts - `packages/cli/src/commands/setup.ts`
- `keytar: ^6.0.1` (optional) - System keychain integration - `packages/core/src/credentials/keychain.ts`

## Configuration

**Environment:**
- Config file: `~/.firela/billclaw/config.json`
- Environment variables as fallbacks
- Key configs: `PLAID_CLIENT_ID`, `PLAID_SECRET`, `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`

**Build:**
- `tsconfig.base.json` - Shared TypeScript config
- `packages/*/tsconfig.json` - Package-specific config
- `vitest.config.ts` - Test runner configuration

## Platform Requirements

**Development:**
- Any platform with Node.js 20+
- pnpm workspace support required

**Production:**
- Distributed as npm packages
- `@firela/billclaw-core` - Core library
- `@firela/billclaw-cli` - Standalone CLI
- `@firela/billclaw-openclaw` - OpenClaw plugin
- `@firela/billclaw-connect` - OAuth web service

---

*Stack analysis: 2026-02-22*
*Update after major dependency changes*
