import React, { useMemo } from 'react';
import { ScrollView, View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/screen-container';
import { SummaryCard } from '@/components/SummaryCard';
import { CategoryBreakdownCard } from '@/components/CategoryBreakdownCard';
import { useFinance } from '@/lib/finance-context';
import { computeSummary, formatCurrency, getCurrentMonthYear, getTransactionsForMonth, calculateNetLedgerPosition } from '@/lib/finance-utils';
import { useSettings } from '@/lib/finance-context';

export default function DashboardScreen() {
  const { state } = useFinance();
  const { settings } = useSettings();
  const { year, month } = getCurrentMonthYear();

  // Get transactions for current month
  const monthTransactions = useMemo(
    () => getTransactionsForMonth(state.transactions, year, month),
    [state.transactions, year, month]
  );

  const summary = useMemo(() => computeSummary(monthTransactions), [monthTransactions]);

  // All-time totals, independent of the current month
  const allTimeSummary = useMemo(() => computeSummary(state.transactions), [state.transactions]);

  // Calculate net ledger position
  const netLedgerPosition = useMemo(
    () => calculateNetLedgerPosition(state.ledgerEntries),
    [state.ledgerEntries]
  );

  const currency = settings.currency;

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-4 py-6">
        <Animated.View entering={FadeIn.duration(300)} className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Dashboard</Text>
            <Text className="text-sm text-muted">
              {new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
          </View>

          {/* Summary Cards Grid */}
          <View className="gap-3">
            {/* Balance Card */}
            <SummaryCard
              title="Total Balance"
              value={formatCurrency(summary.balance, currency)}
              variant={summary.balance >= 0 ? 'success' : 'error'}
            />

            {/* Income & Expenses Row */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <SummaryCard
                  title="Income"
                  value={formatCurrency(summary.totalIncome, currency)}
                  variant="success"
                />
              </View>
              <View className="flex-1">
                <SummaryCard
                  title="Expenses"
                  value={formatCurrency(summary.totalExpenses, currency)}
                  variant="error"
                />
              </View>
            </View>

            {/* Unpaid & Ledger Row */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <SummaryCard
                  title="Unpaid"
                  value={formatCurrency(summary.unpaidExpenses, currency)}
                  variant="warning"
                />
              </View>
              <View className="flex-1">
                <SummaryCard
                  title="Net Ledger"
                  value={formatCurrency(netLedgerPosition, currency)}
                  variant={netLedgerPosition >= 0 ? 'success' : 'error'}
                />
              </View>
            </View>
          </View>

          {/* All-Time Overview */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">All-Time Overview</Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <SummaryCard
                  title="Total Saved"
                  value={formatCurrency(allTimeSummary.balance, currency)}
                  subtitle="Income minus expenses"
                  variant={allTimeSummary.balance >= 0 ? 'success' : 'error'}
                />
              </View>
              <View className="flex-1">
                <SummaryCard
                  title="Total Spent"
                  value={formatCurrency(allTimeSummary.totalExpenses, currency)}
                  subtitle="All-time expenses"
                  variant="error"
                />
              </View>
            </View>
          </View>

          {/* Breakdown Charts */}
          <View className="gap-3">
            <CategoryBreakdownCard
              title="Expenses by Category"
              breakdown={summary.categoryBreakdown}
              currency={currency}
              emptyMessage="No expenses recorded this month"
              accentVariant="error"
            />
            <CategoryBreakdownCard
              title="Income by Category"
              breakdown={summary.incomeCategoryBreakdown}
              currency={currency}
              emptyMessage="No income recorded this month"
              accentVariant="success"
            />
          </View>

          {/* Quick Stats */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Quick Stats</Text>
            <View className="bg-surface rounded-lg p-4 gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Total Transactions</Text>
                <Text className="text-sm font-semibold text-foreground">{monthTransactions.length}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Categories Used</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {Object.keys(summary.categoryBreakdown).length}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Avg. Transaction</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {monthTransactions.length > 0
                    ? formatCurrency(
                        (summary.totalExpenses + summary.totalIncome) / monthTransactions.length,
                        currency
                      )
                    : formatCurrency(0, currency)}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}
