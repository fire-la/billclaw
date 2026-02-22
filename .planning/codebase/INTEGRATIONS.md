# External Integrations

**Analysis Date:** 2026-02-22

## APIs & External Services

**Payment/Bank Data:**
- **Plaid API** - Bank transaction sync (US, Canada)
  - SDK/Client: `plaid` npm package v32.0
  - Auth: Client ID + Secret (`PLAID_CLIENT_ID`, `PLAID_SECRET`)
  - Key files: `packages/core/src/sources/plaid/plaid-sync.ts`, `packages/core/src/oauth/providers/plaid.ts`
  - Endpoints: `transactionsSync`, `linkTokenCreate`, `itemPublicTokenExchange`

**Email/Bill Data:**
- **Gmail API** - Bill fetching via email
  - Integration: REST API (not googleapis library)
  - Auth: OAuth 2.0 with PKCE
  - Key files: `packages/core/src/sources/gmail/gmail-fetch.ts`, `packages/core/src/oauth/providers/gmail.ts`
  - Scope: `https://www.googleapis.com/auth/gmail.readonly`

**European Banking (Stub):**
- **GoCardless Bank Account Data API** - European bank integration
  - Key file: `packages/core/src/webhooks/handlers/gocardless.ts`
  - Status: Stub implementation, not fully integrated

## Data Storage

**Local File Storage:**
- Type: JSON files with monthly partitioning
- Location: `~/.firela/billclaw/`
- Pattern: `transactions/{accountId}/{year}/{month}.json`
- Key file: `packages/core/src/storage/transaction-storage.ts`
- Features: Deduplication, file locking with `proper-lockfile`, TTL-based caching

**System Keychain (Optional):**
- Service: Platform-native keychain
- SDK: `keytar` npm package (optional dependency)
- Key file: `packages/core/src/credentials/keychain.ts`

## Authentication & Identity

**OAuth Providers:**
- **Plaid Link** - Bank connection OAuth
  - Implementation: Link token creation + public token exchange
  - Key files: `packages/core/src/oauth/providers/plaid.ts`, `packages/openclaw/src/oauth/plaid.ts`

- **Gmail OAuth 2.0** - Email access authorization
  - Implementation: PKCE flow for security
  - Key files: `packages/core/src/oauth/providers/gmail.ts`, `packages/openclaw/src/oauth/gmail.ts`

## Webhook Infrastructure

**Inbound Webhooks:**
- **Connect Service** - Express server for receiving webhooks
  - Endpoints: `/webhook/plaid`, `/webhook/gocardless`, `/webhook/test`
  - Rate limiting: Plaid (100/min), GoCardless (50/min)
  - Key file: `packages/connect/src/routes/webhooks.ts`

**Webhook Relay:**
- **Firela Relay Service** (`relay.firela.io`)
  - Purpose: Webhook delivery without public IP
  - Protocol: WebSocket for real-time delivery
  - Key files: `packages/core/src/relay/client.ts`, `packages/core/src/webhook/config.ts`
  - Auth: webhookId + apiKey via OAuth

## Export Formats

**Beancount:**
- Plain text accounting format
- Key file: `packages/core/src/exporters/beancount.ts`
- Features: Category-to-account mappings, source tagging

**Ledger:**
- Ledger-cli compatible format
- Key file: `packages/core/src/exporters/ledger.ts`

## OpenClaw Integration

**Plugin System:**
- Package: `@firela/billclaw-openclaw`
- Key file: `packages/openclaw/src/plugin.ts`
- Tools: `plaid_sync`, `gmail_fetch`, `connect_plaid`, `connect_gmail`, `webhook_status`
- Commands: `/billclaw-setup`, `/billclaw-sync`, `/billclaw-status`, `/billclaw-config`

## Connect OAuth Server

**Endpoints:**
- `GET /health` - Health check
- `GET /oauth/plaid/link-token` - Create Plaid Link token
- `POST /oauth/plaid/exchange` - Exchange Plaid public token
- `GET /oauth/gmail/authorize` - Generate Gmail auth URL
- `POST /oauth/gmail/exchange` - Exchange Gmail auth code
- `POST /webhook/*` - Webhook handlers

**Key file:** `packages/connect/src/server.ts`

## Environment Configuration

**Development:**
- Required env vars: `PLAID_CLIENT_ID`, `PLAID_SECRET` (for Plaid), `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET` (for Gmail)
- Config file: `~/.firela/billclaw/config.json`
- Example: `packages/connect/.env.example`

**Production:**
- Secrets managed via environment variables
- TLS/HTTPS support with configurable certificates

---

*Integration audit: 2026-02-22*
*Update when adding/removing external services*
