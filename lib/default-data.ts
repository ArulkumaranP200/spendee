/**
 * Default categories and payment methods seeded on first launch.
 * IDs are fixed (not generated) so "isDefault" items stay identifiable
 * across reinstalls and can't be accidentally duplicated by re-seeding.
 */

import { Category, PaymentMethod } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Food & Dining', icon: '🍔', type: 'expense', isDefault: true },
  { id: 'cat-transport', name: 'Transport', icon: '🚗', type: 'expense', isDefault: true },
  { id: 'cat-shopping', name: 'Shopping', icon: '🛍️', type: 'expense', isDefault: true },
  { id: 'cat-bills', name: 'Bills & Utilities', icon: '📄', type: 'expense', isDefault: true },
  { id: 'cat-health', name: 'Health', icon: '💊', type: 'expense', isDefault: true },
  { id: 'cat-entertainment', name: 'Entertainment', icon: '🎬', type: 'expense', isDefault: true },
  { id: 'cat-education', name: 'Education', icon: '📚', type: 'expense', isDefault: true },
  { id: 'cat-travel', name: 'Travel', icon: '✈️', type: 'expense', isDefault: true },
  { id: 'cat-personal-care', name: 'Personal Care', icon: '💇', type: 'expense', isDefault: true },
  { id: 'cat-expense-other', name: 'Other', icon: '📦', type: 'expense', isDefault: true },
  { id: 'cat-salary', name: 'Salary', icon: '💰', type: 'income', isDefault: true },
  { id: 'cat-freelance', name: 'Freelance', icon: '💼', type: 'income', isDefault: true },
  { id: 'cat-investment', name: 'Investment', icon: '📈', type: 'income', isDefault: true },
  { id: 'cat-gift', name: 'Gift', icon: '🎁', type: 'income', isDefault: true },
  { id: 'cat-refund', name: 'Refund', icon: '💵', type: 'income', isDefault: true },
  { id: 'cat-income-other', name: 'Other', icon: '📦', type: 'income', isDefault: true },
];

export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm-cash',
    name: 'Cash',
    icon: '💵',
    balance: 0,
    isDefault: true,
    createdAt: new Date(0).toISOString(),
  },
];
