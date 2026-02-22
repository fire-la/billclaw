# BillClaw

## What This Is

BillClaw is the data acquisition component of the [Firela](https://firela.io) ecosystem — an open-source, self-hosted financial data platform built on Beancount. It fetches bank transactions via Plaid API and bill information from Gmail, storing everything locally in plain text that users fully control.

Part of the Firela stack:
- **billclaw** (this repo) — Bank transaction and bill data import
- **firela** — Beancount mobile account management
- **firela-deploy** — Backend server for mobile app
- **landing** — Website landing page
- **docs** — Project documentation

## Core Value

**Reliable webhook relay for users without public IP.**

When tradeoffs arise, prioritize: Users should be able to receive webhooks (for real-time transaction updates) even without a public IP address, through the Firela Relay service.

## Requirements

### Validated

These capabilities exist in the codebase and are relied upon:

- ✓ Plaid bank transaction sync — existing (monthly partitioning, deduplication, checkpoint cursors)
- ✓ Gmail bill email fetch and parsing — existing (bill recognition, email parsing)
- ✓ Beancount and Ledger export formats — existing
- ✓ RuntimeContext abstraction layer — existing (framework-agnostic core)
- ✓ Connection mode selector — existing (Direct/Relay/Polling auto-detection)
- ✓ Webhook router and handlers — existing (Plaid, GoCardless stub)
- ✓ OAuth flows — existing (Plaid Link, Gmail PKCE)
- ✓ Firela Relay WebSocket client — existing (relay.firela.io)
- ✓ CLI commands — existing (setup, sync, connect, export)

### Active

Current scope being built toward:

- [ ] Eliminate duplicate code across packages (formatUserCode, RELAY_URL hardcoded in 25+ locations)
- [ ] Improve Relay service reconnection mechanism (exponential backoff, state recovery)
- [ ] Increase test coverage for critical paths (CLI: 8.7%, connect: 20% → target 80%)
- [ ] Unify connect package dependency versions (TypeScript 5.3.3→5.8.0, Vitest 1.1.0→3.0.0)

### Out of Scope

- Cloud data warehouse integration — Future phase, not this milestone. BillClaw → Firela cloud/self-hosted sync will be a separate feature.

## Context

### Technical Context

- **Architecture**: Hexagonal (Ports and Adapters) with RuntimeContext abstraction
- **Monorepo**: pnpm workspace with 4 packages (core, cli, openclaw, connect)
- **Stack**: TypeScript 5.8.0, Node.js 20+, ES Modules only
- **Testing**: Vitest 3.0+, target 80% coverage
- **Quality**: oxlint/oxfmt, Husky hooks, changesets for releases

### Codebase Analysis

Detailed analysis available in `.planning/codebase/`:
- `ARCHITECTURE.md` — Hexagonal architecture, RuntimeContext pattern
- `STACK.md` — Technology stack and dependencies
- `STRUCTURE.md` — Monorepo layout, package organization
- `CONVENTIONS.md` — Code style, naming patterns
- `TESTING.md` — Test patterns and coverage
- `INTEGRATIONS.md` — Plaid, Gmail, Relay integrations
- `CONCERNS.md` — Technical debt and issues

### Known Issues (from CONCERNS.md)

| Priority | Issue | Impact |
|----------|-------|--------|
| P0 | connect package dependency version mismatches | Potential runtime issues |
| P1 | Duplicate code (formatUserCode, RELAY_URL) | Maintenance burden |
| P1 | console.log instead of abstracted logger in connect | Inconsistent logging |
| P1 | Test coverage gaps | Low confidence in refactoring |
| P2 | Relay WebSocket client untested | Connection reliability risks |

## Constraints

- **None specified** — Open to any implementation approach that maintains backward compatibility with existing APIs.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Framework-agnostic core via RuntimeContext | Enable multiple adapters (CLI, OpenClaw, Connect) | ✓ Good |
| Monthly partitioned JSON storage | Simple, portable, no database dependency | ✓ Good |
| Three connection modes (Direct/Relay/Polling) | Support users with/without public IP | ✓ Good |
| ES Modules only with NodeNext | Modern module system, tree-shaking | ✓ Good |
| Zod for runtime validation | Type inference + validation | ✓ Good |

---
*Last updated: 2026-02-22 after initialization*
