# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of @fire-zu/billclaw-cli
- Standalone CLI tool for financial data management
- Interactive setup wizard (billclaw setup)
- Manual sync command (billclaw sync)
- Status monitoring command (billclaw status)
- Configuration management (billclaw config)
- Export to Beancount and Ledger (billclaw export)
- Import from CSV/OFX/QFX (billclaw import)
- Colored console output with status badges
- Progress spinners for async operations
- Table formatting for account display
- File-based configuration at ~/.billclaw/config.json
- CLI runtime adapter with console logger
- In-memory event emitter for CLI usage
