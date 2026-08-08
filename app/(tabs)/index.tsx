import React, { useMemo } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { SummaryCard } from '@/components/SummaryCard';
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

  // Compute summary with and without exclusions
  const summaryWithExclusions = useMemo(
    () => computeSummary(monthTransactions, state.excludedIds),
    [monthTransactions, state.excludedIds]
  );

  const summaryWithoutExclusions = useMemo(
    () => computeSummary(monthTransactions, []),
    [monthTransactions]
  );

  // Calculate net ledger position
  const netLedgerPosition = useMemo(
    () => calculateNetLedgerPosition(state.ledgerEntries),
    [state.ledgerEntries]
  );

  const currency = settings.currency;

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-4 py-6">
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Dashboard</Text>
            <Text className="text-sm text-muted">
              {new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
          </View>

          {/* Exclusion Info Banner */}
          {state.excludedIds.length > 0 && (
            <View className="bg-accent/10 border border-accent rounded-lg p-3">
              <Text className="text-sm text-accent font-semibold">
                {state.excludedIds.length} transaction(s) excluded from totals
              </Text>
            </View>
          )}

          {/* Summary Cards Grid */}
          <View className="gap-3">
            {/* Balance Card */}
            <SummaryCard
              title="Total Balance"
              value={formatCurrency(summaryWithExclusions.balance, currency)}
              variant={summaryWithExclusions.balance >= 0 ? 'success' : 'error'}
            />

            {/* Income & Expenses Row */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <SummaryCard
                  title="Income"
                  value={formatCurrency(summaryWithExclusions.totalIncome, currency)}
                  variant="success"
                />
              </View>
              <View className="flex-1">
                <SummaryCard
                  title="Expenses"
                  value={formatCurrency(summaryWithExclusions.totalExpenses, currency)}
                  variant="error"
                />
              </View>
            </View>

            {/* Unpaid & Ledger Row */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <SummaryCard
                  title="Unpaid"
                  value={formatCurrency(summaryWithExclusions.unpaidExpenses, currency)}
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

          {/* Exclude Payments Button */}
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? '#1a3a7a' : '#1e40af',
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            className="py-3 px-4 rounded-lg items-center flex-row justify-between"
          >
            <Text className="text-white font-semibold">
              Exclude Payments {state.excludedIds.length > 0 && `(${state.excludedIds.length})`}
            </Text>
            <Text className="text-white text-lg">→</Text>
          </Pressable>

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
                  {Object.keys(summaryWithExclusions.categoryBreakdown).length}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Avg. Transaction</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {monthTransactions.length > 0
                    ? formatCurrency(
                        (summaryWithExclusions.totalExpenses + summaryWithExclusions.totalIncome) /
                          monthTransactions.length,
                        currency
                      )
                    : formatCurrency(0, currency)}
                </Text>
              </View>
            </View>
          </View>

          {/* Comparison Note */}
          {state.excludedIds.length > 0 && (
            <View className="bg-surface rounded-lg p-3 border border-border">
              <Text className="text-xs text-muted mb-2">Without Exclusions:</Text>
              <View className="flex-row justify-between">
                <Text className="text-sm font-semibold text-foreground">
                  {formatCurrency(summaryWithoutExclusions.balance, currency)}
                </Text>
                <Text className="text-xs text-muted">
                  Difference: {formatCurrency(
                    summaryWithoutExclusions.balance - summaryWithExclusions.balance,
                    currency
                  )}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
