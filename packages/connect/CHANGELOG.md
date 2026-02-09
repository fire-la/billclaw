# @firela/billclaw-connect

## 0.3.0

### Minor Changes

- 7ca5691: Add AI-friendly error handling with dual-mode output optimized for AI agents

  - Enhanced UserError interface with machine-readable fields (errorCode, severity, recoverable, nextActions, entities)
  - Added ERROR_CODES constant with 30+ error codes for programmatic handling
  - Updated all Result interfaces to use UserError[] instead of string[]
  - Implemented dual-mode output in OpenClaw tools (machine-readable + human-readable)
  - Added exponential backoff retry for Plaid API calls (retryPlaidCall)
  - Updated all error parsers (parsePlaidError, parseGmailError, parseNetworkError, parseFileSystemError)
  - Added formatError() utility for CLI display

### Patch Changes

- Updated dependencies [7ca5691]
  - @firela/billclaw-core@0.3.0

## 0.2.0

### Minor Changes

- f46be36: Add BillClaw Connect OAuth server and webhook support

### Patch Changes

- Updated dependencies [f46be36]
  - @firela/billclaw-core@0.2.0
