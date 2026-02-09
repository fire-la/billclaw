# Changelog

## 0.4.0

### Minor Changes

- e871be0: Add security declaration and clarify installation for OpenClaw users:

  - Add Security & Privacy section with keychain storage explanation
  - Add Credential Storage Summary table
  - Split Installation into OpenClaw and CLI sections
  - Clarify OpenClaw users don't need external npm packages
  - Add Security Disclosure section with vulnerability reporting

  This addresses the 'Suspicious' security scan label by providing
  transparency about security architecture and data handling practices.

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

## 0.2.0

### Minor Changes

- f46be36: Add BillClaw Connect OAuth server and webhook support

## 0.1.3

### Patch Changes

- Restore original publish workflow configuration to fix npm publishing.

## 0.1.2

### Patch Changes

- Update npm token and test publishing version 0.1.2.

## 0.1.1

### Patch Changes

- Fix npm publish workflow and release version 0.1.1.

## 0.1.0

### Minor Changes

- 12a088e: Implement automated version management with changesets. Added GitHub Actions workflow for automatic version PRs and publishing.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial release of @fire-zu/billclaw-core
- Framework-agnostic core business logic
- Data models with Zod validation
- Transaction storage with JSON/CSV support
- File locking for concurrent access safety
- Streaming JSON support for large datasets
- Memory cache with TTL-based expiration
- Query indexes for improved performance
- Plaid integration for bank transactions
- Gmail integration for bill parsing
- Beancount and Ledger exporters
- Platform keychain integration
- Audit logging for security events
- Runtime abstractions (Logger, ConfigProvider, EventEmitter)

### Security

- Platform keychain storage for credentials
- HMAC signing for webhook verification
- Audit logging for credential operations
