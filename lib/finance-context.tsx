/**
 * Finance Context + Reducer for global state management
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
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
import * as storage from './storage';
import { generateUUID, getTodayISO } from './finance-utils';

export interface FinanceState {
  transactions: Transaction[];
  ledgerEntries: CreditDebitEntry[];
  budgets: Budget[];
  settings: Settings;
  lockSettings: LockSettings;
  categories: Category[];
  paymentMethods: PaymentMethod[];
  excludedIds: string[]; // Session-only exclusions
  isLoading: boolean;
}

export type FinanceAction =
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; updates: Partial<Transaction> } }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_LEDGER_ENTRIES'; payload: CreditDebitEntry[] }
  | { type: 'ADD_LEDGER_ENTRY'; payload: CreditDebitEntry }
  | { type: 'UPDATE_LEDGER_ENTRY'; payload: { id: string; updates: Partial<CreditDebitEntry> } }
  | { type: 'DELETE_LEDGER_ENTRY'; payload: string }
  | { type: 'SET_BUDGETS'; payload: Budget[] }
  | { type: 'ADD_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET'; payload: { id: string; updates: Partial<Budget> } }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'SET_SETTINGS'; payload: Settings }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'ADD_EXCLUSION_SET'; payload: ExclusionSet }
  | { type: 'DELETE_EXCLUSION_SET'; payload: string }
  | { type: 'SET_EXCLUDED_IDS'; payload: string[] }
  | { type: 'TOGGLE_EXCLUDED_ID'; payload: string }
  | { type: 'CLEAR_EXCLUDED_IDS' }
  | { type: 'SET_LOCK_SETTINGS'; payload: LockSettings }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_PAYMENT_METHODS'; payload: PaymentMethod[] }
  | { type: 'ADD_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'UPDATE_PAYMENT_METHOD'; payload: { id: string; updates: Partial<PaymentMethod> } }
  | { type: 'DELETE_PAYMENT_METHOD'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INITIALIZE'; payload: Partial<FinanceState> };

const initialState: FinanceState = {
  transactions: [],
  ledgerEntries: [],
  budgets: [],
  settings: { currency: '$', theme: 'system', savedExclusionSets: [] },
  lockSettings: {
    enabled: false,
    method: 'biometric',
    pin: null,
    biometricEnabled: false,
    lastUnlocked: null,
  },
  categories: [],
  paymentMethods: [],
  excludedIds: [],
  isLoading: true,
};

/** balance delta a transaction applies to its payment method: income adds, expense subtracts */
function transactionBalanceDelta(transaction: Transaction): number {
  return transaction.type === 'income' ? transaction.amount : -transaction.amount;
}

function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };

    case 'ADD_TRANSACTION': {
      const transaction = action.payload;
      let paymentMethods = state.paymentMethods;
      if (transaction.paymentMethodId) {
        const delta = transactionBalanceDelta(transaction);
        paymentMethods = paymentMethods.map((pm) =>
          pm.id === transaction.paymentMethodId ? { ...pm, balance: pm.balance + delta } : pm
        );
      }
      return { ...state, transactions: [...state.transactions, transaction], paymentMethods };
    }

    case 'UPDATE_TRANSACTION': {
      const { id, updates } = action.payload;
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      };
    }

    case 'DELETE_TRANSACTION': {
      const removed = state.transactions.find((t) => t.id === action.payload);
      let paymentMethods = state.paymentMethods;
      if (removed?.paymentMethodId) {
        const delta = -transactionBalanceDelta(removed);
        paymentMethods = paymentMethods.map((pm) =>
          pm.id === removed.paymentMethodId ? { ...pm, balance: pm.balance + delta } : pm
        );
      }
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
        paymentMethods,
        // Also remove from exclusion sets if present
        settings: {
          ...state.settings,
          savedExclusionSets: state.settings.savedExclusionSets.map((set) => ({
            ...set,
            excludedIds: set.excludedIds.filter((id) => id !== action.payload),
          })),
        },
      };
    }

    case 'SET_LEDGER_ENTRIES':
      return { ...state, ledgerEntries: action.payload };

    case 'ADD_LEDGER_ENTRY':
      return { ...state, ledgerEntries: [...state.ledgerEntries, action.payload] };

    case 'UPDATE_LEDGER_ENTRY': {
      const { id, updates } = action.payload;
      return {
        ...state,
        ledgerEntries: state.ledgerEntries.map((e) =>
          e.id === id ? { ...e, ...updates } : e
        ),
      };
    }

    case 'DELETE_LEDGER_ENTRY':
      return {
        ...state,
        ledgerEntries: state.ledgerEntries.filter((e) => e.id !== action.payload),
      };

    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload };

    case 'ADD_BUDGET':
      return { ...state, budgets: [...state.budgets, action.payload] };

    case 'UPDATE_BUDGET': {
      const { id, updates } = action.payload;
      return {
        ...state,
        budgets: state.budgets.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      };
    }

    case 'DELETE_BUDGET':
      return { ...state, budgets: state.budgets.filter((b) => b.id !== action.payload) };

    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'ADD_EXCLUSION_SET':
      return {
        ...state,
        settings: {
          ...state.settings,
          savedExclusionSets: [...state.settings.savedExclusionSets, action.payload],
        },
      };

    case 'DELETE_EXCLUSION_SET':
      return {
        ...state,
        settings: {
          ...state.settings,
          savedExclusionSets: state.settings.savedExclusionSets.filter(
            (s) => s.id !== action.payload
          ),
        },
      };

    case 'SET_EXCLUDED_IDS':
      return { ...state, excludedIds: action.payload };

    case 'TOGGLE_EXCLUDED_ID': {
      const id = action.payload;
      const isExcluded = state.excludedIds.includes(id);
      return {
        ...state,
        excludedIds: isExcluded
          ? state.excludedIds.filter((eid) => eid !== id)
          : [...state.excludedIds, id],
      };
    }

    case 'CLEAR_EXCLUDED_IDS':
      return { ...state, excludedIds: [] };

    case 'SET_LOCK_SETTINGS':
      return { ...state, lockSettings: action.payload };

    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };

    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };

    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter((c) => c.id !== action.payload) };

    case 'SET_PAYMENT_METHODS':
      return { ...state, paymentMethods: action.payload };

    case 'ADD_PAYMENT_METHOD':
      return { ...state, paymentMethods: [...state.paymentMethods, action.payload] };

    case 'UPDATE_PAYMENT_METHOD': {
      const { id, updates } = action.payload;
      return {
        ...state,
        paymentMethods: state.paymentMethods.map((pm) =>
          pm.id === id ? { ...pm, ...updates } : pm
        ),
      };
    }

    case 'DELETE_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethods: state.paymentMethods.filter((pm) => pm.id !== action.payload),
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'INITIALIZE':
      return { ...state, ...action.payload, isLoading: false };

    default:
      return state;
  }
}

interface FinanceContextType {
  state: FinanceState;
  dispatch: React.Dispatch<FinanceAction>;
  reloadFromStorage: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(financeReducer, initialState);

  const reloadFromStorage = async () => {
    try {
      const [transactions, ledgerEntries, budgets, settings, lockSettings, categories, paymentMethods] =
        await Promise.all([
          storage.getTransactions(),
          storage.getLedgerEntries(),
          storage.getBudgets(),
          storage.getSettings(),
          storage.getLockSettings(),
          storage.getCategories(),
          storage.getPaymentMethods(),
        ]);

      dispatch({
        type: 'INITIALIZE',
        payload: {
          transactions,
          ledgerEntries,
          budgets,
          settings,
          lockSettings,
          categories,
          paymentMethods,
        },
      });
    } catch (error) {
      console.error('Error loading data:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Load data from storage on mount
  useEffect(() => {
    reloadFromStorage();
  }, []);

  // Persist transactions when they change
  useEffect(() => {
    if (!state.isLoading) {
      storage.saveTransactions(state.transactions).catch(console.error);
    }
  }, [state.transactions, state.isLoading]);

  // Persist ledger entries when they change
  useEffect(() => {
    if (!state.isLoading) {
      storage.saveLedgerEntries(state.ledgerEntries).catch(console.error);
    }
  }, [state.ledgerEntries, state.isLoading]);

  // Persist budgets when they change
  useEffect(() => {
    if (!state.isLoading) {
      storage.saveBudgets(state.budgets).catch(console.error);
    }
  }, [state.budgets, state.isLoading]);

  // Persist settings when they change
  useEffect(() => {
    if (!state.isLoading) {
      storage.saveSettings(state.settings).catch(console.error);
    }
  }, [state.settings, state.isLoading]);

  // Persist lock settings when they change
  useEffect(() => {
    if (!state.isLoading) {
      storage.saveLockSettings(state.lockSettings).catch(console.error);
    }
  }, [state.lockSettings, state.isLoading]);

  // Persist categories when they change
  useEffect(() => {
    if (!state.isLoading) {
      storage.saveCategories(state.categories).catch(console.error);
    }
  }, [state.categories, state.isLoading]);

  // Persist payment methods when they change
  useEffect(() => {
    if (!state.isLoading) {
      storage.savePaymentMethods(state.paymentMethods).catch(console.error);
    }
  }, [state.paymentMethods, state.isLoading]);

  return (
    <FinanceContext.Provider value={{ state, dispatch, reloadFromStorage }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance(): FinanceContextType {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }
  return context;
}

// ============================================================================
// Convenience hooks for common operations
// ============================================================================

export function useTransactions() {
  const { state, dispatch } = useFinance();

  return {
    transactions: state.transactions,
    addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
      const transaction: Transaction = {
        ...tx,
        id: generateUUID(),
        createdAt: getTodayISO(),
      };
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
      return transaction;
    },
    updateTransaction: (id: string, updates: Partial<Transaction>) => {
      dispatch({ type: 'UPDATE_TRANSACTION', payload: { id, updates } });
    },
    deleteTransaction: (id: string) => {
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    },
  };
}

export function useLedger() {
  const { state, dispatch } = useFinance();

  return {
    ledgerEntries: state.ledgerEntries,
    addLedgerEntry: (entry: Omit<CreditDebitEntry, 'id' | 'createdAt'>) => {
      const newEntry: CreditDebitEntry = {
        ...entry,
        id: generateUUID(),
        createdAt: getTodayISO(),
      };
      dispatch({ type: 'ADD_LEDGER_ENTRY', payload: newEntry });
      return newEntry;
    },
    updateLedgerEntry: (id: string, updates: Partial<CreditDebitEntry>) => {
      dispatch({ type: 'UPDATE_LEDGER_ENTRY', payload: { id, updates } });
    },
    deleteLedgerEntry: (id: string) => {
      dispatch({ type: 'DELETE_LEDGER_ENTRY', payload: id });
    },
  };
}

export function useBudgets() {
  const { state, dispatch } = useFinance();

  return {
    budgets: state.budgets,
    addBudget: (budget: Omit<Budget, 'id'>) => {
      const newBudget: Budget = {
        ...budget,
        id: generateUUID(),
      };
      dispatch({ type: 'ADD_BUDGET', payload: newBudget });
      return newBudget;
    },
    updateBudget: (id: string, updates: Partial<Budget>) => {
      dispatch({ type: 'UPDATE_BUDGET', payload: { id, updates } });
    },
    deleteBudget: (id: string) => {
      dispatch({ type: 'DELETE_BUDGET', payload: id });
    },
  };
}

export function useExclusions() {
  const { state, dispatch } = useFinance();

  return {
    excludedIds: state.excludedIds,
    setExcludedIds: (ids: string[]) => {
      dispatch({ type: 'SET_EXCLUDED_IDS', payload: ids });
    },
    toggleExcludedId: (id: string) => {
      dispatch({ type: 'TOGGLE_EXCLUDED_ID', payload: id });
    },
    clearExcludedIds: () => {
      dispatch({ type: 'CLEAR_EXCLUDED_IDS' });
    },
    addExclusionSet: (set: Omit<ExclusionSet, 'id' | 'createdAt'>) => {
      const newSet: ExclusionSet = {
        ...set,
        id: generateUUID(),
        createdAt: getTodayISO(),
      };
      dispatch({ type: 'ADD_EXCLUSION_SET', payload: newSet });
      return newSet;
    },
    deleteExclusionSet: (id: string) => {
      dispatch({ type: 'DELETE_EXCLUSION_SET', payload: id });
    },
  };
}

export function useSettings() {
  const { state, dispatch } = useFinance();

  return {
    settings: state.settings,
    updateSettings: (updates: Partial<Settings>) => {
      dispatch({ type: 'UPDATE_SETTINGS', payload: updates });
    },
  };
}

export function useLockSettings() {
  const { state, dispatch } = useFinance();

  return {
    lockSettings: state.lockSettings,
    updateLockSettings: (updates: Partial<LockSettings>) => {
      dispatch({
        type: 'SET_LOCK_SETTINGS',
        payload: { ...state.lockSettings, ...updates },
      });
    },
  };
}

export function useCategories() {
  const { state, dispatch } = useFinance();

  return {
    categories: state.categories,
    addCategory: (category: Omit<Category, 'id' | 'isDefault'>) => {
      const newCategory: Category = {
        ...category,
        id: generateUUID(),
        isDefault: false,
      };
      dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
      return newCategory;
    },
    deleteCategory: (id: string) => {
      const category = state.categories.find((c) => c.id === id);
      if (category?.isDefault) return false;
      dispatch({ type: 'DELETE_CATEGORY', payload: id });
      return true;
    },
  };
}

export function usePaymentMethods() {
  const { state, dispatch } = useFinance();

  return {
    paymentMethods: state.paymentMethods,
    addPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'createdAt' | 'isDefault'>) => {
      const newMethod: PaymentMethod = {
        ...method,
        id: generateUUID(),
        createdAt: getTodayISO(),
        isDefault: false,
      };
      dispatch({ type: 'ADD_PAYMENT_METHOD', payload: newMethod });
      return newMethod;
    },
    updatePaymentMethodBalance: (id: string, balance: number) => {
      dispatch({ type: 'UPDATE_PAYMENT_METHOD', payload: { id, updates: { balance } } });
    },
    deletePaymentMethod: (id: string) => {
      const method = state.paymentMethods.find((pm) => pm.id === id);
      if (method?.isDefault) return false;
      dispatch({ type: 'DELETE_PAYMENT_METHOD', payload: id });
      return true;
    },
  };
}
