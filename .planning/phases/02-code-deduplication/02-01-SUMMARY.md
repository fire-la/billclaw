---
phase: 02-code-deduplication
plan: "01"
subsystem: utils
tags: [refactor, deduplication, formatUserCode, utils]

# Dependency graph
requires:
  - phase: 01-dependency-unification
    provides: Unified TypeScript 5.8.0 and Vitest 3.0.0 versions
provides:
  - Centralized formatUserCode utility function in core package
  - ./utils subpath export in @firela/billclaw-core
affects: [cli, openclaw, gmail-connect]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Subpath export pattern for utility functions
    - Centralized shared utilities in core package

key-files:
  created:
    - packages/core/src/utils/format.ts
    - packages/core/src/utils/index.ts
  modified:
    - packages/core/package.json
    - packages/cli/src/commands/connect/gmail.ts
    - packages/openclaw/src/tools/connect-gmail.tool.ts

key-decisions:
  - "Use ./utils subpath export for tree-shaking support"

patterns-established:
  - "Utility functions shared across packages live in core/src/utils/"
  - "Subpath exports follow pattern: ./utils -> dist/utils/index.js"

issues-created: []

# Metrics
duration: 12 min
completed: 2026-02-23
---

# Phase 2 Plan 1: formatUserCode Centralization Summary

**Centralized formatUserCode utility in core package, eliminating duplicate implementations in cli and openclaw**

## Performance

- **Duration:** 12 min
- **Started:** 2026-02-23T15:03:00Z
- **Completed:** 2026-02-23T15:15:00Z
- **Tasks:** 4
- **Files modified:** 5

## Accomplishments

- Created formatUserCode utility in core/utils/format.ts with JSDoc documentation
- Added ./utils subpath export to @firela/billclaw-core for tree-shaking support
- Removed duplicate formatUserCode functions from cli and openclaw packages
- Updated both packages to import formatUserCode from centralized location

## Task Commits

Each task was committed atomically:

1. **Task 1: Create formatUserCode utility in core package** - `009a204` (feat)
2. **Task 2: Update cli package to use centralized formatUserCode** - `3aa1153` (refactor)
3. **Task 3: Update openclaw package to use centralized formatUserCode** - `ffccc6b` (refactor)
4. **Task 4: Build and test to verify no regressions** - No code changes, verification only

**Plan metadata:** (pending)

## Files Created/Modified

- `packages/core/src/utils/format.ts` - New utility file with formatUserCode function
- `packages/core/src/utils/index.ts` - Barrel export for utils module
- `packages/core/package.json` - Added ./utils subpath export
- `packages/cli/src/commands/connect/gmail.ts` - Removed local function, added import from core
- `packages/openclaw/src/tools/connect-gmail.tool.ts` - Removed local function, added import from core

## Decisions Made

- Used subpath export (./utils) instead of main export to support tree-shaking for consumers who don't need utility functions
- Followed existing export patterns in core package (./errors, ./oauth, ./relay, etc.)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all builds and tests passed on first attempt.

## Next Phase Readiness

- formatUserCode centralization complete
- Pattern established for future utility centralization (e.g., RELAY_URL in next plan)
- Ready for 02-02-PLAN.md (RELAY_URL centralization)

---
*Phase: 02-code-deduplication*
*Completed: 2026-02-23*
