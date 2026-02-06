# BillClaw API Documentation

This document describes the public API of BillClaw core package.

## Table of Contents

- [Billclaw](#billclaw)
- [TransactionStorage](#transactionstorage)
- [Models](#models)
- [Exporters](#exporters)
- [Runtime Abstractions](#runtime-abstractions)

## Billclaw

The main class for interacting with BillClaw functionality.

### Constructor

```typescript
constructor(context: RuntimeContext)
```

Creates a new BillClaw instance.

**Parameters:**
- `context` - Runtime context with logger, config, and events

### Methods

#### getAccounts

```typescript
getAccounts(): Promise<AccountConfig[]>
```

Retrieves all configured accounts.

**Returns:** Array of account configurations

#### syncPlaid

```typescript
syncPlaid(accountIds?: string[]): Promise<PlaidSyncResult[]>
```

Syncs transactions from Plaid-connected accounts.

**Parameters:**
- `accountIds` - Optional array of account IDs to sync (syncs all if omitted)

**Returns:** Array of sync results with transaction counts

#### syncGmail

```typescript
syncGmail(accountIds?: string[], days?: number): Promise<GmailFetchResult[]>
```

Fetches and parses bills from Gmail accounts.

**Parameters:**
- `accountIds` - Optional array of account IDs to sync
- `days` - Number of days to look back (default: 30)

**Returns:** Array of fetch results with bill counts

#### getTransactions

```typescript
getTransactions(accountId: string, year: number, month: number): Promise<Transaction[]>
```

Retrieves transactions for a specific account and period.

**Parameters:**
- `accountId` - Account ID or "all" for all accounts
- `year` - Year (e.g., 2024)
- `month` - Month (1-12)

**Returns:** Array of transactions

## TransactionStorage

Handles transaction persistence and queries.

### Constructor

```typescript
constructor(config: StorageConfig, logger?: Logger)
```

### Methods

#### addTransactions

```typescript
async addTransactions(accountId: string, transactions: Transaction[]): Promise<AddResult>
```

Adds transactions for an account with deduplication.

**Returns:** Object with counts of added and updated transactions

#### getTransactions

```typescript
async getTransactions(query: TransactionQuery): Promise<Transaction[]>
```

Queries transactions with filters.

**Query Parameters:**
```typescript
interface TransactionQuery {
  accountId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}
```

## Models

### Transaction

```typescript
interface Transaction {
  id: string;
  accountId: string;
  date: string;
  amount: number;
  currency: string;
  category?: string[];
  merchantName?: string;
  paymentChannel?: string;
  pending?: boolean;
  transactionId?: string;
  memo?: string;
}
```

### AccountConfig

```typescript
interface AccountConfig {
  id: string;
  type: "plaid" | "gmail" | "gocardless";
  name: string;
  enabled: boolean;
  syncFrequency: "realtime" | "hourly" | "daily" | "weekly" | "manual";
  lastSync?: string;
  lastStatus?: "success" | "error" | "pending";
  
  // Plaid-specific
  plaidItemId?: string;
  plaidAccessToken?: string;
  
  // Gmail-specific
  gmailEmailAddress?: string;
  gmailFilters?: string[];
}
```

## Exporters

### exportToBeancount

```typescript
async function exportToBeancount(
  transactions: Transaction[],
  options: BeancountExportOptions
): Promise<string>
```

Exports transactions to Beancount format.

**Options:**
```typescript
interface BeancountExportOptions {
  accountId: string;
  year: number;
  month: number;
  commodity?: string;
  payeeAccount?: string;
  tagAccounts?: Record<string, string>;
  includeTags?: boolean;
}
```

### exportToLedger

```typescript
async function exportToLedger(
  transactions: Transaction[],
  options: LedgerExportOptions
): Promise<string>
```

Exports transactions to Ledger format.

**Options:**
```typescript
interface LedgerExportOptions {
  accountId: string;
  year: number;
  month: number;
  commodity?: string;
  payeeAccount?: string;
}
```

## Runtime Abstractions

### Logger

```typescript
interface Logger {
  info(...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  debug(...args: unknown[]): void;
}
```

### ConfigProvider

```typescript
interface ConfigProvider {
  getConfig(): Promise<BillclawConfig>;
  getStorageConfig(): Promise<StorageConfig>;
  updateAccount(accountId: string, updates: Partial<any>): Promise<void>;
  getAccount(accountId: string): Promise<any | null>;
}
```

### EventEmitter

```typescript
interface EventEmitter {
  emit(event: string, data?: unknown): void;
  on(event: string, handler: (...args: any[]) => void): void;
  off(event: string, handler: (...args: any[]) => void): void;
}
```

### RuntimeContext

```typescript
interface RuntimeContext {
  readonly logger: Logger;
  readonly config: ConfigProvider;
  readonly events: EventEmitter;
}
```

## Security

### Credential Store

```typescript
// Set credential
await setCredential(key: string, value: string, logger?: Logger): Promise<void>

// Get credential
await getCredential(key: string, logger?: Logger): Promise<string | null>

// Delete credential
await deleteCredential(key: string, logger?: Logger): Promise<void>

// Check if credential exists
await hasCredential(key: string, logger?: Logger): Promise<boolean>
```

### Audit Logging

```typescript
class AuditLogger {
  async log(
    type: AuditEventType,
    message: string,
    details?: Record<string, unknown>,
    severity: AuditSeverity
  ): Promise<void>
  
  async readEvents(limit?: number): Promise<AuditEvent[]>
  async queryByType(type: AuditEventType): Promise<AuditEvent[]>
  async clear(): Promise<void>
}
```

## Events

BillClaw emits the following events through the EventEmitter:

- `transaction.added` - New transactions added
- `transaction.updated` - Existing transactions updated
- `sync.started` - Sync operation started
- `sync.completed` - Sync operation completed
- `sync.failed` - Sync operation failed
- `account.connected` - Account successfully connected
- `account.disconnected` - Account disconnected
- `account.error` - Account error occurred
