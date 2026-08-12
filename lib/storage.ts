/**
 * AsyncStorage CRUD helpers for SpendWise
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Transaction,
  CreditDebitEntry,
  Budget,
  Settings,
  ExclusionSet,
  LockSettings,
  Category,
  PaymentMethod,
} from './types';
import { DEFAULT_CATEGORIES, DEFAULT_PAYMENT_METHODS } from './default-data';

const STORAGE_KEYS = {
  TRANSACTIONS: 'ft_transactions',
  LEDGER_ENTRIES: 'ft_ledger_entries',
  BUDGETS: 'ft_budgets',
  SETTINGS: 'ft_settings',
  LOCK_SETTINGS: 'ft_lock_settings',
  CATEGORIES: 'ft_categories',
  PAYMENT_METHODS: 'ft_payment_methods',
};

// ============================================================================
// Transactions
// ============================================================================

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading transactions:', error);
    return [];
  }
}

export async function saveTransactions(transactions: Transaction[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions:', error);
  }
}

export async function addTransaction(transaction: Transaction): Promise<void> {
  const transactions = await getTransactions();
  transactions.push(transaction);
  await saveTransactions(transactions);
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
  const transactions = await getTransactions();
  const index = transactions.findIndex((t) => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updates };
    await saveTransactions(transactions);
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  const transactions = await getTransactions();
  const filtered = transactions.filter((t) => t.id !== id);
  await saveTransactions(filtered);
}

// ============================================================================
// Credit & Debit Ledger
// ============================================================================

export async function getLedgerEntries(): Promise<CreditDebitEntry[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LEDGER_ENTRIES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading ledger entries:', error);
    return [];
  }
}

export async function saveLedgerEntries(entries: CreditDebitEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LEDGER_ENTRIES, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving ledger entries:', error);
  }
}

export async function addLedgerEntry(entry: CreditDebitEntry): Promise<void> {
  const entries = await getLedgerEntries();
  entries.push(entry);
  await saveLedgerEntries(entries);
}

export async function updateLedgerEntry(id: string, updates: Partial<CreditDebitEntry>): Promise<void> {
  const entries = await getLedgerEntries();
  const index = entries.findIndex((e) => e.id === id);
  if (index !== -1) {
    entries[index] = { ...entries[index], ...updates };
    await saveLedgerEntries(entries);
  }
}

export async function deleteLedgerEntry(id: string): Promise<void> {
  const entries = await getLedgerEntries();
  const filtered = entries.filter((e) => e.id !== id);
  await saveLedgerEntries(filtered);
}

// ============================================================================
// Budgets
// ============================================================================

export async function getBudgets(): Promise<Budget[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BUDGETS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading budgets:', error);
    return [];
  }
}

export async function saveBudgets(budgets: Budget[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  } catch (error) {
    console.error('Error saving budgets:', error);
  }
}

export async function addBudget(budget: Budget): Promise<void> {
  const budgets = await getBudgets();
  budgets.push(budget);
  await saveBudgets(budgets);
}

export async function updateBudget(id: string, updates: Partial<Budget>): Promise<void> {
  const budgets = await getBudgets();
  const index = budgets.findIndex((b) => b.id === id);
  if (index !== -1) {
    budgets[index] = { ...budgets[index], ...updates };
    await saveBudgets(budgets);
  }
}

export async function deleteBudget(id: string): Promise<void> {
  const budgets = await getBudgets();
  const filtered = budgets.filter((b) => b.id !== id);
  await saveBudgets(filtered);
}

// ============================================================================
// Categories
// ============================================================================

export async function getCategories(): Promise<Category[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
  } catch (error) {
    console.error('Error reading categories:', error);
    return DEFAULT_CATEGORIES;
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving categories:', error);
  }
}

// ============================================================================
// Payment Methods
// ============================================================================

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
    return data ? JSON.parse(data) : DEFAULT_PAYMENT_METHODS;
  } catch (error) {
    console.error('Error reading payment methods:', error);
    return DEFAULT_PAYMENT_METHODS;
  }
}

export async function savePaymentMethods(paymentMethods: PaymentMethod[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(paymentMethods));
  } catch (error) {
    console.error('Error saving payment methods:', error);
  }
}

// ============================================================================
// Settings
// ============================================================================

export async function getSettings(): Promise<Settings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data
      ? JSON.parse(data)
      : {
          currency: '$',
          theme: 'system',
          savedExclusionSets: [],
        };
  } catch (error) {
    console.error('Error reading settings:', error);
    return {
      currency: '$',
      theme: 'system',
      savedExclusionSets: [],
    };
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

export async function addExclusionSet(set: ExclusionSet): Promise<void> {
  const settings = await getSettings();
  settings.savedExclusionSets.push(set);
  await saveSettings(settings);
}

export async function updateExclusionSet(id: string, updates: Partial<ExclusionSet>): Promise<void> {
  const settings = await getSettings();
  const index = settings.savedExclusionSets.findIndex((s) => s.id === id);
  if (index !== -1) {
    settings.savedExclusionSets[index] = { ...settings.savedExclusionSets[index], ...updates };
    await saveSettings(settings);
  }
}

export async function deleteExclusionSet(id: string): Promise<void> {
  const settings = await getSettings();
  settings.savedExclusionSets = settings.savedExclusionSets.filter((s) => s.id !== id);
  await saveSettings(settings);
}

// ============================================================================
// Lock Settings
// ============================================================================

export async function getLockSettings(): Promise<LockSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LOCK_SETTINGS);
    return data
      ? JSON.parse(data)
      : {
          enabled: false,
          method: 'biometric',
          pin: null,
          biometricEnabled: false,
          lastUnlocked: null,
        };
  } catch (error) {
    console.error('Error reading lock settings:', error);
    return {
      enabled: false,
      method: 'biometric',
      pin: null,
      biometricEnabled: false,
      lastUnlocked: null,
    };
  }
}

export async function saveLockSettings(lockSettings: LockSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LOCK_SETTINGS, JSON.stringify(lockSettings));
  } catch (error) {
    console.error('Error saving lock settings:', error);
  }
}

// ============================================================================
// Bulk Operations
// ============================================================================

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TRANSACTIONS,
      STORAGE_KEYS.LEDGER_ENTRIES,
      STORAGE_KEYS.BUDGETS,
      STORAGE_KEYS.SETTINGS,
      STORAGE_KEYS.LOCK_SETTINGS,
      STORAGE_KEYS.CATEGORIES,
      STORAGE_KEYS.PAYMENT_METHODS,
    ]);
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
}

/** Resets every payment method's balance to 0 without touching transactions or the method list itself. */
export async function resetAllBalances(): Promise<PaymentMethod[]> {
  const paymentMethods = await getPaymentMethods();
  const reset = paymentMethods.map((pm) => ({ ...pm, balance: 0 }));
  await savePaymentMethods(reset);
  return reset;
}

export async function exportAllData(): Promise<string> {
  try {
    const transactions = await getTransactions();
    const ledgerEntries = await getLedgerEntries();
    const budgets = await getBudgets();
    const settings = await getSettings();
    const categories = await getCategories();
    const paymentMethods = await getPaymentMethods();

    const exportData = {
      transactions,
      ledgerEntries,
      budgets,
      settings,
      categories,
      paymentMethods,
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    return '';
  }
}

export interface ImportedData {
  transactions?: Transaction[];
  ledgerEntries?: CreditDebitEntry[];
  budgets?: Budget[];
  settings?: Settings;
  categories?: Category[];
  paymentMethods?: PaymentMethod[];
}

/**
 * Parses and applies a previously exported backup. Throws on invalid JSON
 * or a payload that doesn't look like a SpendWise export, so callers can
 * show the error to the user before anything is overwritten.
 */
export async function importAllData(json: string): Promise<ImportedData> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('That doesn\'t look like valid backup data (invalid JSON).');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('That doesn\'t look like valid backup data.');
  }

  const data = parsed as ImportedData;
  const hasRecognizedField =
    Array.isArray(data.transactions) ||
    Array.isArray(data.ledgerEntries) ||
    Array.isArray(data.budgets) ||
    Array.isArray(data.categories) ||
    Array.isArray(data.paymentMethods) ||
    (typeof data.settings === 'object' && data.settings !== null);

  if (!hasRecognizedField) {
    throw new Error('That doesn\'t look like a SpendWise backup.');
  }

  if (Array.isArray(data.transactions)) await saveTransactions(data.transactions);
  if (Array.isArray(data.ledgerEntries)) await saveLedgerEntries(data.ledgerEntries);
  if (Array.isArray(data.budgets)) await saveBudgets(data.budgets);
  if (data.settings) await saveSettings(data.settings);
  if (Array.isArray(data.categories)) await saveCategories(data.categories);
  if (Array.isArray(data.paymentMethods)) await savePaymentMethods(data.paymentMethods);

  return data;
}
