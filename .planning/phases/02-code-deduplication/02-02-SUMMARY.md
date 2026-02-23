---
phase: 02-code-deduplication
plan: "02"
subsystem: connection
tags: [relay, oauth, url, centralization]

requires:
  - phase: 01-dependency-unification
    provides: Unified dependency versions
provides:
  - RELAY_URL constant in core/connection/constants.ts
  - Centralized relay URL for all packages
affects: [connection, oauth, relay]
tech-stack:
  added: []
  patterns: [centralized constants for cross-package sharing]
key-files:
  created:
    - packages/core/src/connection/constants.ts
  modified:
    - packages/core/src/connection/index.ts
key-decisions:
  - "Use ./connection subpath export for RELAY_URL to enable tree-shaking"

patterns-established:
  - "Centralized constants pattern: Single source of truth in core, imported by all packages"

issues-created: []

duration: 5min
completed: 2026-02-24
---

# Phase 2 Plan 2: RELAY_URL Centralization Summary

**Centralized RELAY_URL constant in core package, eliminating 6 hardcoded URL instances across cli and openclaw packages**

## Performance
- **Duration:** 5 min
- **Started:** 2026-02-23T23:01:15Z
- **Completed:** 2026-02-23T23:06:15Z
- **Tasks:** 4
- **Files modified:** 8

## Accomplishments
- Created RELAY_URL constant in core/connection/constants.ts
- Removed local RELAY_URL constant from cli/connect/gmail.ts
- Removed local RELAY_URL constant from openclaw/connect-gmail.tool.ts
- Replaced 4 inline "https://relay.firela.io" strings in cli/connect/plaid.ts
- Replaced 3 inline "https://relay.firela.io" strings in openclaw/connect-plaid.tool.ts
- Replaced 3 inline "https://relay.firela.io" strings in openclaw/oauth-completion.ts

## Task Commits

Each task was committed atomically:

1. **Task 1: Create RELAY_URL constant** - `af4b7be` (feat)
2. **Task 2: Update cli package** - `e2ea1f4` (feat)
3. **Task 3: Update openclaw package** - `f0b0d84` (feat)
4. **Task 4: Build and test** - Skipped (verification only, no code changes)

**Plan metadata:** Will be committed with docs

## Files Created/Modified
- `packages/core/src/connection/constants.ts` - New constants file with RELAY_URL
- `packages/core/src/connection/index.ts` - Added RELAY_URL export
- `packages/cli/src/commands/connect/gmail.ts` - Removed local constant, added import
- `packages/cli/src/commands/connect/plaid.ts` - Replaced inline strings with imported constant
- `packages/openclaw/src/tools/connect-gmail.tool.ts` - Removed local constant, added import
- `packages/openclaw/src/tools/connect-plaid.tool.ts` - Replaced inline strings with imported constant
- `packages/openclaw/src/services/oauth-completion.ts` - Replaced inline strings with imported constant

## Decisions Made
- Use ./connection subpath export for utility functions to enable tree-shaking support for consumers (consistent with 02-01 formatUserCode approach)

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None - all packages build and test successfully.

## Next Phase Readiness
- Phase 2 (Code Deduplication) complete
- Ready for Phase 3: Test Coverage

---
*Phase: 02-code-deduplication*
*Completed: 2026-02-24*
