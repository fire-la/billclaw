/**
 * Gmail data source for BillClaw - Framework-agnostic Gmail integration
 *
 * This is a stub implementation. The full implementation requires OAuth flow
 * and Gmail API integration which will be provided by the adapter layer.
 */

import type { Logger } from "../../errors/errors.js";
import type { StorageConfig } from "../../models/config.js";
import type { Transaction } from "../../storage/transaction-storage.js";
import { appendTransactions } from "../../storage/transaction-storage.js";

export interface GmailConfig {
  clientId?: string;
  clientSecret?: string;
  historyId?: string;
  pubsubTopic?: string;
  senderWhitelist: string[];
  keywords: string[];
  confidenceThreshold: number;
  requireAmount: boolean;
  requireDate: boolean;
}

export interface GmailAccount {
  id: string;
  gmailEmailAddress: string;
}

export interface EmailContent {
  id: string;
  subject: string;
  from: string;
  date: string;
  body: string;
  attachments?: Array<{
    filename: string;
    contentType: string;
    data?: string;
  }>;
}

export interface BillRecognition {
  isBill: boolean;
  confidence: number;
  amount?: number;
  currency?: string;
  dueDate?: string;
  billType?: string;
  merchant?: string;
}

export interface GmailFetchResult {
  success: boolean;
  accountId: string;
  emailsProcessed: number;
  billsExtracted: number;
  transactionsAdded: number;
  transactionsUpdated: number;
  errors?: string[];
}

/**
 * Fetch bill emails from Gmail
 *
 * This is a stub implementation. The actual implementation requires:
 * - OAuth token management (provided by adapter)
 * - Gmail API client initialization
 * - Email fetching with filters
 */
export async function fetchBillEmails(
  accountId: string,
  days: number,
  _gmailConfig: GmailConfig,
  logger: Logger,
  // OAuth token would be provided by adapter
  _accessToken?: string
): Promise<EmailContent[]> {
  logger.info?.(`Fetching emails from last ${days} days for account ${accountId}...`);

  // TODO: Implement actual Gmail API fetching
  // This requires:
  // 1. OAuth token validation
  // 2. Gmail API client setup
  // 3. Query building with filters
  // 4. Email parsing

  return [];
}

/**
 * Recognize whether an email is a bill
 *
 * This is a stub implementation. The actual implementation uses:
 * - Sender whitelist matching
 * - Keyword detection in subject/body
 * - Machine learning model for confidence scoring
 */
export function recognizeBill(
  _email: EmailContent,
  _gmailConfig: GmailConfig
): BillRecognition {
  // TODO: Implement actual bill recognition
  // This would use:
  // 1. Sender whitelist matching
  // 2. Keyword detection (invoice, statement, bill due, etc.)
  // 3. Amount extraction with regex
  // 4. Date extraction with regex
  // 5. Confidence scoring

  return {
    isBill: false,
    confidence: 0,
  };
}

/**
 * Parse bill email into transactions
 *
 * This is a stub implementation. The actual implementation uses:
 * - Email content parsing
 * - Amount extraction
 * - Date extraction
 * - Merchant recognition
 */
export function parseBillToTransaction(
  accountId: string,
  email: EmailContent,
  recognition: BillRecognition
): Transaction {
  // TODO: Implement actual parsing
  return {
    transactionId: `${accountId}_email_${email.id}`,
    accountId,
    date: recognition.dueDate || email.date,
    amount: recognition.amount ? Math.round(recognition.amount * 100) : 0,
    currency: recognition.currency || "USD",
    category: ["bills"],
    merchantName: recognition.merchant || email.from,
    paymentChannel: "email",
    pending: false,
    plaidTransactionId: `${accountId}_email_${email.id}`,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Fetch bills from Gmail
 */
export async function fetchGmailBills(
  account: GmailAccount,
  days: number,
  gmailConfig: GmailConfig,
  _storageConfig: StorageConfig,
  logger: Logger,
  accessToken?: string
): Promise<GmailFetchResult> {
  try {
    // Step 1: Fetch emails
    const emails = await fetchBillEmails(
      account.id,
      days,
      gmailConfig,
      logger,
      accessToken
    );

    logger.info?.(`Found ${emails.length} emails`);

    if (emails.length === 0) {
      return {
        success: true,
        accountId: account.id,
        emailsProcessed: 0,
        billsExtracted: 0,
        transactionsAdded: 0,
        transactionsUpdated: 0,
      };
    }

    // Step 2: Recognize bills
    const emailsWithRecognition = emails.map((email) => ({
      email,
      recognition: recognizeBill(email, gmailConfig),
    }));

    const bills = emailsWithRecognition.filter(
      ({ recognition }) => recognition.isBill
    );

    logger.info?.(`Identified ${bills.length} bill emails`);

    if (bills.length === 0) {
      return {
        success: true,
        accountId: account.id,
        emailsProcessed: emails.length,
        billsExtracted: 0,
        transactionsAdded: 0,
        transactionsUpdated: 0,
      };
    }

    // Step 3: Parse and store transactions
    const transactions = bills.map(({ email, recognition }) =>
      parseBillToTransaction(account.id, email, recognition)
    );

    const now = new Date();
    const storageResult = await appendTransactions(
      account.id,
      now.getFullYear(),
      now.getMonth() + 1,
      transactions
    );

    return {
      success: true,
      accountId: account.id,
      emailsProcessed: emails.length,
      billsExtracted: bills.length,
      transactionsAdded: storageResult.added,
      transactionsUpdated: storageResult.updated,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    logger.error?.(`Gmail fetch failed: ${errorMsg}`);
    return {
      success: false,
      accountId: account.id,
      emailsProcessed: 0,
      billsExtracted: 0,
      transactionsAdded: 0,
      transactionsUpdated: 0,
      errors: [errorMsg],
    };
  }
}
