# Testing Patterns

**Analysis Date:** 2026-02-22

## Test Framework

**Runner:**
- Vitest 3.0+ (core, cli, openclaw)
- Vitest 1.1.0 (connect - needs update)
- Config: `vitest.config.ts` in root and each package

**Assertion Library:**
- Vitest built-in `expect`
- Matchers: `toBe`, `toEqual`, `toThrow`, `toMatchObject`, `resolves`, `rejects`

**Run Commands:**
```bash
pnpm test                              # Run all tests
pnpm test -- --watch                   # Watch mode
pnpm test -- path/to/file.test.ts      # Single file
pnpm test:coverage                     # Coverage report
```

## Test File Organization

**Location:**
- `*.test.ts` alongside source files (co-located)
- No separate `tests/` or `__tests__/` directories

**Naming:**
- `module-name.test.ts` for all test files
- No distinction between unit/integration in filename

**Structure:**
```
packages/core/src/
├── storage/
│   ├── transaction-storage.ts
│   ├── transaction-storage.test.ts
│   ├── cache.ts
│   └── cache.test.ts
├── connection/
│   ├── mode-selector.ts
│   └── mode-selector.test.ts
```

**Test Count by Package:**
- core: 65 source files, 10 test files (15% coverage)
- cli: 23 source files, 2 test files (8.7% coverage)
- openclaw: 21 source files, 7 test files (33% coverage)
- connect: 5 source files, 1 test file (20% coverage)

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('ModuleName', () => {
  describe('functionName', () => {
    beforeEach(() => {
      // reset state
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should handle valid input', () => {
      // arrange
      const input = createTestInput()

      // act
      const result = functionName(input)

      // assert
      expect(result).toEqual(expectedOutput)
    })

    it('should throw on invalid input', () => {
      expect(() => functionName(null)).toThrow('Invalid input')
    })
  })
})
```

**Patterns:**
- Use `beforeEach` for per-test setup
- Use `afterEach` to restore mocks: `vi.restoreAllMocks()`
- Arrange/Act/Assert pattern in complex tests

## Mocking

**Framework:**
- Vitest built-in mocking (`vi`)
- Module mocking via `vi.mock()` at top of test file

**Patterns:**
```typescript
import { vi } from 'vitest'

// Mock module
vi.mock('./external', () => ({
  externalFunction: vi.fn()
}))

// Mock global
vi.stubGlobal('fetch', vi.fn(() =>
  Promise.resolve({ ok: true, status: 200 } as Response)
))

// In test
const mockFn = vi.mocked(externalFunction)
mockFn.mockReturnValue('mocked result')

expect(mockFn).toHaveBeenCalledWith('expected arg')
```

**What to Mock:**
- File system operations (`fs-extra`)
- Child process execution (`child_process.exec`)
- External API calls (fetch, Plaid SDK)
- Environment variables (`process.env`)

**What NOT to Mock:**
- Internal pure functions
- Simple utilities (string manipulation, array helpers)
- TypeScript types

## Fixtures and Factories

**Test Data:**
```typescript
// Factory functions in test file
function createTestConfig(overrides?: Partial<Config>): Config {
  return {
    targetDir: '/tmp/test',
    global: false,
    ...overrides
  }
}

// Mock classes
class MockLogger {
  info = vi.fn()
  error = vi.fn()
  warn = vi.fn()
  debug = vi.fn()
}

class MockConfigProvider {
  private config: BillclawConfig = { /* ... */ }
  async getConfig(): Promise<BillclawConfig> { return this.config }
}
```

**Location:**
- Factory functions: Define in test file near usage
- Mock classes: In test file or shared across tests

**Temp Directory Pattern:**
```typescript
beforeEach(async () => {
  tempDir = path.join(os.tmpdir(), `billclaw-test-${Date.now()}`)
  await fs.mkdir(tempDir, { recursive: true })
})

afterEach(async () => {
  try {
    await fs.rm(tempDir, { recursive: true, force: true })
  } catch {
    // Ignore cleanup errors
  }
})
```

## Coverage

**Requirements:**
- Target: 80%+ coverage (from CONTRIBUTING.md)
- Enforcement: Pre-commit hooks run tests

**Configuration:**
- Provider: v8 (built-in)
- Reporters: text, json, html, lcov
- Excludes: `node_modules`, `dist`, `**/*.test.ts`

**View Coverage:**
```bash
pnpm test:coverage
open coverage/index.html
```

## Test Types

**Unit Tests:**
- Test single function/class in isolation
- Mock all external dependencies
- Fast: Each test should be <100ms

**Integration Tests:**
- Test multiple modules together
- Mock only external boundaries
- Examples: `mode-selector.test.ts` tests connection mode logic

**E2E Tests:**
- Not currently implemented
- CLI integration tested manually

## Common Patterns

**Async Testing:**
```typescript
it('should handle async operation', async () => {
  const result = await asyncFunction()
  expect(result).toBe('expected')
})

it('should reject on failure', async () => {
  await expect(asyncCall()).rejects.toThrow('error message')
})
```

**Error Testing:**
```typescript
it('should throw on invalid input', () => {
  expect(() => parse(null)).toThrow('Cannot parse null')
})
```

**File System Mocking:**
```typescript
vi.mock('fs-extra')

it('mocks file system', () => {
  vi.mocked(fs.readFile).mockResolvedValue('file content')
  // test code
})
```

**Snapshot Testing:**
- Not used in this codebase
- Prefer explicit assertions for clarity

---

*Testing analysis: 2026-02-22*
*Update when test patterns change*
