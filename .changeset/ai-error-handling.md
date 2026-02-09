---
"@firela/billclaw-core": minor
"@firela/billclaw-cli": minor
"@firela/billclaw-openclaw": minor
"@firela/billclaw-connect": minor
---

Add AI-friendly error handling with dual-mode output optimized for AI agents

- Enhanced UserError interface with machine-readable fields (errorCode, severity, recoverable, nextActions, entities)
- Added ERROR_CODES constant with 30+ error codes for programmatic handling
- Updated all Result interfaces to use UserError[] instead of string[]
- Implemented dual-mode output in OpenClaw tools (machine-readable + human-readable)
- Added exponential backoff retry for Plaid API calls (retryPlaidCall)
- Updated all error parsers (parsePlaidError, parseGmailError, parseNetworkError, parseFileSystemError)
- Added formatError() utility for CLI display
