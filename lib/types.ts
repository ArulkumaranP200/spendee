/**
 * Shared TypeScript types for SpendWise app
 */

export type PaymentStatus = 'paid' | 'unpaid';
export type TransactionType = 'income' | 'expense';
export type LedgerDirection = 'credit' | 'debit';
export type LedgerStatus = 'outstanding' | 'settled' | 'partial';
export type BudgetPeriod = 'monthly' | 'weekly';

export interface SplitItem {
  id: string;
  label: string; // person name or line-item description
  amount: number;
  paymentStatus: PaymentStatus;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  date: string; // ISO 8601
  createdAt: string;
  paymentStatus: PaymentStatus;
  isSplit: boolean;
  splits: SplitItem[];
  paymentMethodId: string | null;
}

export type CategoryType = 'income' | 'expense' | 'both';

export interface Category {
  id: string;
  name: string;
  icon: string; // emoji
  type: CategoryType;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string; // emoji
  balance: number;
  isDefault: boolean;
  createdAt: string;
}

export interface CreditDebitEntry {
  id: string;
  direction: LedgerDirection;
  personName: string;
  amount: number;
  description: string;
  date: string; // ISO 8601
  dueDate: string | null;
  status: LedgerStatus;
  settledAmount: number;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  period: BudgetPeriod;
}

export interface ExclusionSet {
  id: string;
  name: string;
  excludedIds: string[];
  createdAt: string;
}

export interface Settings {
  currency: string; // e.g. '$', '€', '₹'
  theme: 'light' | 'dark' | 'system';
  savedExclusionSets: ExclusionSet[];
}

export interface LockSettings {
  enabled: boolean;
  method: 'biometric' | 'pin' | 'both'; // biometric, PIN, or both
  pin: string | null; // hashed PIN
  biometricEnabled: boolean;
  lastUnlocked: string | null; // ISO 8601
}

export interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  unpaidExpenses: number;
  categoryBreakdown: Record<string, number>;
  incomeCategoryBreakdown: Record<string, number>;
  netLedgerPosition: number;
}
