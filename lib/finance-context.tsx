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
} from './types';
import * as storage from './storage';
import { generateUUID, getTodayISO } from './finance-utils';

export interface FinanceState {
  transactions: Transaction[];
  ledgerEntries: CreditDebitEntry[];
  budgets: Budget[];
  settings: Settings;
  lockSettings: LockSettings;
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
  excludedIds: [],
  isLoading: true,
};

function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };

    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] };

    case 'UPDATE_TRANSACTION': {
      const { id, updates } = action.payload;
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      };
    }

    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
        // Also remove from exclusion sets if present
        settings: {
          ...state.settings,
          savedExclusionSets: state.settings.savedExclusionSets.map((set) => ({
            ...set,
            excludedIds: set.excludedIds.filter((id) => id !== action.payload),
          })),
        },
      };

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
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(financeReducer, initialState);

  // Load data from storage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [transactions, ledgerEntries, budgets, settings, lockSettings] = await Promise.all([
          storage.getTransactions(),
          storage.getLedgerEntries(),
          storage.getBudgets(),
          storage.getSettings(),
          storage.getLockSettings(),
        ]);

        dispatch({
          type: 'INITIALIZE',
          payload: {
            transactions,
            ledgerEntries,
            budgets,
            settings,
            lockSettings,
          },
        });
      } catch (error) {
        console.error('Error loading data:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadData();
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

  return (
    <FinanceContext.Provider value={{ state, dispatch }}>
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
