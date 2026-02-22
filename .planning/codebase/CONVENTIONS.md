# Coding Conventions

**Analysis Date:** 2026-02-22

## Naming Patterns

**Files:**
- `kebab-case.ts` for all source files (e.g., `transaction-storage.ts`, `mode-selector.ts`)
- `*.test.ts` for test files, co-located with source
- `index.ts` for barrel exports
- `*.d.ts` for type definition files

**Functions:**
- `camelCase` for all functions (e.g., `syncPlaidAccount`, `appendTransactions`)
- No special prefix for async functions
- Handler pattern: `handleEventName` (e.g., `handleClose`, `handleMessage`)

**Variables:**
- `camelCase` for variables and parameters
- `UPPER_SNAKE_CASE` for constants (e.g., `ERROR_CODES`, `DEFAULT_OAUTH_TIMEOUT`)
- No underscore prefix for private members

**Types:**
- `PascalCase` for interfaces, no `I` prefix (e.g., `RuntimeContext`, `ConfigProvider`)
- `PascalCase` for type aliases (e.g., `ErrorCode`, `ErrorSeverity`)
- `PascalCase` for enum names, `UPPER_CASE` for values (e.g., `ErrorCategory.PLAID_API`)

## Code Style

**Formatting:**
- Formatter: `oxfmt` (Oxidation Formatter)
- Linter: `oxlint` (Oxidation Linter)
- Config: `.oxlintrc.json`
- Indentation: 2 spaces
- Quotes: Double quotes for strings
- No semicolons at end of statements

**Linting:**
- Tool: `oxlint`
- Rules of note: `no-console: off`, `no-unused-vars: warn`, `prefer-const: error`
- Run: `pnpm lint` in root or package

## Import Organization

**Order:**
1. Node.js built-ins (e.g., `crypto`, `path`, `fs`)
2. External packages (e.g., `zod`, `express`, `commander`)
3. Internal modules (using subpath exports)
4. Relative imports (./, ../)
5. Type imports (`import type { ... }`)

**ES Module Requirement:**
- ALL imports must include `.js` extension (TypeScript NodeNext requirement)
- Example: `import { Billclaw } from "./billclaw.js"`

**Path Aliases:**
- Not used in this codebase
- All imports use relative paths with `.js` extension

## Error Handling

**Patterns:**
- Strategy: Throw `UserError` with error codes, catch at boundaries
- Custom errors: Extend error categories via `ErrorCategory` enum
- Async functions: Use `try/catch`, no `.catch()` chains preferred

**Error Types:**
- Throw on: Invalid input, missing dependencies, invariant violations
- Log error with context before throwing: `logError(logger, error, { context })`
- Include cause in error message: `new Error('Failed to X', { cause: originalError })`

**Key file:** `packages/core/src/errors/errors.ts`

## Logging

**Framework:**
- Abstracted via `RuntimeContext.logger` interface
- CLI: Console-based logger with debug support (`DEBUG=1` env var)
- OpenClaw: Uses OpenClaw's logger API

**Patterns:**
- Never use `console.log` or `console.error` directly in core code
- Log at service boundaries, not in utility functions
- Structured logging with context: `logger.info({ userId, action }, 'User action')`

## Comments

**When to Comment:**
- Explain why, not what: `// Retry 3 times because API has transient failures`
- Document business rules: `// Users must verify email within 24 hours`
- Explain non-obvious algorithms or workarounds
- Avoid obvious comments: `// set count to 0`

**JSDoc/TSDoc:**
- Required for public API functions
- Optional for internal functions if signature is self-explanatory
- Use `@param`, `@returns`, `@throws` tags
- Use `@packageDocumentation` for module-level docs

**TODO Comments:**
- Format: `// TODO: description` (no username, using git blame)
- Link to issue if exists: `// TODO: Fix race condition (issue #123)`

## Function Design

**Size:**
- Keep functions under 50 lines when possible
- Extract helpers for complex logic
- One level of abstraction per function

**Parameters:**
- Max 3 parameters preferred
- Use options object for 4+ parameters: `function create(options: CreateOptions)`
- Destructure in parameter list: `function process({ id, name }: ProcessParams)`

**Return Values:**
- Explicit return statements
- Return early for guard clauses
- Use `Result<T, E>` pattern for expected failures (in some modules)

## Module Design

**Exports:**
- Named exports preferred
- Default exports only for plugin entry points
- Export public API from `index.ts` barrel files

**Barrel Files:**
- `index.ts` re-exports public API
- Keep internal helpers private (don't export from index)
- Avoid circular dependencies

**Subpath Exports (Core Package):**
```json
{
  ".": "Main Billclaw class and types",
  "./errors": "Error handling utilities",
  "./webhook": "Webhook configuration and management",
  "./connection": "Connection mode selector",
  "./relay": "WebSocket relay client",
  "./oauth": "OAuth utilities (PKCE, providers)"
}
```

---

*Convention analysis: 2026-02-22*
*Update when patterns change*
