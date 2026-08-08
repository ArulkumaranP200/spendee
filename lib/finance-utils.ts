/**
 * Finance utility functions for calculations and transformations
 */

import { Transaction, SummaryData, LedgerDirection, CreditDebitEntry } from './types';

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number, currency: string = '$'): string {
  return `${currency}${Math.abs(amount).toFixed(2)}`;
}

/**
 * Parse currency string back to number
 */
export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
}

/**
 * Group transactions by category
 */
export function groupByCategory(transactions: Transaction[]): Record<string, number> {
  return transactions.reduce(
    (acc, tx) => {
      const key = tx.category || 'Other';
      acc[key] = (acc[key] || 0) + tx.amount;
      return acc;
    },
    {} as Record<string, number>
  );
}

/**
 * Compute summary data for transactions, optionally excluding specific IDs
 */
export function computeSummary(
  transactions: Transaction[],
  excludedIds: string[] = []
): SummaryData {
  const effectiveTransactions = transactions.filter((t) => !excludedIds.includes(t.id));

  const totalIncome = effectiveTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = effectiveTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const unpaidExpenses = effectiveTransactions
    .filter((t) => t.type === 'expense' && t.paymentStatus === 'unpaid')
    .reduce((sum, t) => sum + t.amount, 0);

  const categoryBreakdown = groupByCategory(
    effectiveTransactions.filter((t) => t.type === 'expense')
  );

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    unpaidExpenses,
    categoryBreakdown,
    netLedgerPosition: 0, // Will be computed separately with ledger data
  };
}

/**
 * Derive payment status for a transaction with splits
 * - 'paid' if all splits are paid
 * - 'unpaid' if all splits are unpaid
 * - 'partial' if mixed
 */
export function deriveSplitPaymentStatus(
  paymentStatus: 'paid' | 'unpaid' | 'partial'
): 'paid' | 'unpaid' {
  // For overall transaction, we return 'paid' or 'unpaid'
  // 'partial' is tracked but displayed as a badge
  return paymentStatus === 'paid' ? 'paid' : 'unpaid';
}

/**
 * Calculate net ledger position
 * Positive = net owed to you, Negative = net you owe
 */
export function calculateNetLedgerPosition(ledgerEntries: CreditDebitEntry[]): number {
  return ledgerEntries.reduce((sum, entry) => {
    const outstanding = entry.amount - entry.settledAmount;
    return entry.direction === 'credit' ? sum + outstanding : sum - outstanding;
  }, 0);
}

/**
 * Get transactions for a specific month
 */
export function getTransactionsForMonth(
  transactions: Transaction[],
  year: number,
  month: number
): Transaction[] {
  return transactions.filter((t) => {
    const date = new Date(t.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });
}

/**
 * Get current month and year
 */
export function getCurrentMonthYear(): { year: number; month: number } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
  };
}

/**
 * Format date for display (e.g., "Aug 8, 2026")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date for input (e.g., "2026-08-08")
 */
export function formatDateForInput(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse date from input format
 */
export function parseDateFromInput(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Get ISO string for today
 */
export function getTodayISO(): string {
  return new Date().toISOString();
}

/**
 * Calculate budget progress percentage
 */
export function calculateBudgetProgress(spent: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min((spent / limit) * 100, 100);
}

/**
 * Get budget status color based on progress
 * - green: < 50%
 * - yellow: 50-90%
 * - red: > 90%
 */
export function getBudgetStatusColor(progress: number): 'green' | 'yellow' | 'red' {
  if (progress < 50) return 'green';
  if (progress < 90) return 'yellow';
  return 'red';
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Validate transaction amount
 */
export function isValidAmount(amount: number): boolean {
  return !isNaN(amount) && amount > 0;
}

/**
 * Validate split items sum to total
 */
export function validateSplitSum(splits: Array<{ amount: number }>, total: number): boolean {
  const sum = splits.reduce((acc, split) => acc + split.amount, 0);
  return Math.abs(sum - total) < 0.01; // Account for floating point errors
}
