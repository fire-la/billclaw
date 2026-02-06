/**
 * Bill parser for BillClaw - Framework-agnostic bill parsing utilities
 *
 * This module provides utilities for parsing bills from various sources:
 * - Email content (Gmail, etc.)
 * - File formats (PDF, CSV, OFX, QIF)
 * - Plaid transaction data
 */

import type { Transaction } from "../storage/transaction-storage.js";
import type { Logger } from "../errors/errors.js";

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

export interface ParsedTransaction {
  transactionId: string;
  accountId: string;
  date: string;
  amount: number;
  currency: string;
  category: string[];
  merchantName: string;
  paymentChannel: string;
  pending: boolean;
}

export interface ParserResult {
  success: boolean;
  transactions: ParsedTransaction[];
  errors?: string[];
}

/**
 * Parse email content to extract bill data
 *
 * This is a stub implementation. The full implementation would:
 * - Use regex patterns to extract amounts
 * - Use date parsing to extract due dates
 * - Use machine learning for bill type classification
 * - Handle merchant name extraction
 */
export function parseEmailBill(
  email: EmailContent,
  _accountId: string,
  logger?: Logger
): ParsedTransaction | null {
  logger?.debug?.(`Parsing email: ${email.subject}`);

  // TODO: Implement actual parsing
  // This would include:
  // 1. Amount extraction with regex
  // 2. Date extraction with date parsing
  // 3. Merchant name extraction
  // 4. Category classification
  // 5. Bill type detection

  return null;
}

/**
 * Parse multiple emails into transactions
 */
export function parseEmails(
  emails: EmailContent[],
  accountId: string,
  logger?: Logger
): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];

  for (const email of emails) {
    const parsed = parseEmailBill(email, accountId, logger);
    if (parsed) {
      transactions.push(parsed);
    }
  }

  return transactions;
}

/**
 * Convert parsed transaction to storage transaction
 */
export function toStorageTransaction(
  parsed: ParsedTransaction
): Transaction {
  return {
    transactionId: parsed.transactionId,
    plaidTransactionId: parsed.transactionId,
    accountId: parsed.accountId,
    date: parsed.date,
    amount: parsed.amount,
    currency: parsed.currency,
    category: parsed.category,
    merchantName: parsed.merchantName,
    paymentChannel: parsed.paymentChannel,
    pending: parsed.pending,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Recognize whether an email is a bill
 *
 * This is a stub implementation. The full implementation would:
 * - Check sender against whitelist
 * - Check for bill-related keywords
 * - Use ML model for confidence scoring
 */
export function recognizeBill(_email: EmailContent): BillRecognition {
  // TODO: Implement actual recognition
  return {
    isBill: false,
    confidence: 0,
  };
}

/**
 * Recognize bills from multiple emails
 */
export function recognizeBills(
  emails: EmailContent[]
): Array<{ email: EmailContent; recognition: BillRecognition }> {
  return emails.map((email) => ({
    email,
    recognition: recognizeBill(email),
  }));
}

/**
 * Filter emails to only those recognized as bills
 */
export function filterBills(
  emails: Array<{ email: EmailContent; recognition: BillRecognition }>
): Array<{ email: EmailContent; recognition: BillRecognition }> {
  return emails.filter(({ recognition }) => recognition.isBill);
}
