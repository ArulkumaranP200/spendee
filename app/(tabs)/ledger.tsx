import React, { useState, useMemo } from 'react';
import { ScrollView, View, Text, FlatList, Pressable } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useLedger } from '@/lib/finance-context';
import { useSettings } from '@/lib/finance-context';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDate, calculateNetLedgerPosition } from '@/lib/finance-utils';
import { useColors } from '@/hooks/use-colors';

type LedgerFilter = 'credit' | 'debit' | 'all';

export default function LedgerScreen() {
  const { ledgerEntries, deleteLedgerEntry } = useLedger();
  const { settings } = useSettings();
  const colors = useColors();
  const [filter, setFilter] = useState<LedgerFilter>('all');

  const filteredEntries = useMemo(() => {
    let filtered = ledgerEntries;

    if (filter === 'credit') {
      filtered = filtered.filter((e) => e.direction === 'credit');
    } else if (filter === 'debit') {
      filtered = filtered.filter((e) => e.direction === 'debit');
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [ledgerEntries, filter]);

  const netPosition = calculateNetLedgerPosition(ledgerEntries);
  const totalCredit = ledgerEntries
    .filter((e) => e.direction === 'credit')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalDebit = ledgerEntries
    .filter((e) => e.direction === 'debit')
    .reduce((sum, e) => sum + e.amount, 0);

  const renderEntry = ({ item }: { item: any }) => {
    const outstanding = item.amount - item.settledAmount;

    return (
      <Pressable
        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        onLongPress={() => deleteLedgerEntry(item.id)}
        className="bg-surface rounded-lg p-4 mb-3 border border-border"
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="font-semibold text-foreground">{item.personName}</Text>
              <StatusBadge status={item.status} size="sm" />
            </View>
            <Text className="text-sm text-muted">{item.description}</Text>
          </View>
          <Text
            className={`text-lg font-bold ${
              item.direction === 'credit' ? 'text-success' : 'text-error'
            }`}
          >
            {item.direction === 'credit' ? '+' : '-'}
            {formatCurrency(item.amount, settings.currency)}
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="bg-background rounded-full h-2 mb-2 overflow-hidden">
          <View
            style={{
              width: `${(item.settledAmount / item.amount) * 100}%`,
              backgroundColor: colors.success,
              height: '100%',
            }}
          />
        </View>

        {/* Settlement Info */}
        <View className="flex-row justify-between text-xs text-muted">
          <Text>
            Settled: {formatCurrency(item.settledAmount, settings.currency)}
          </Text>
          <Text>
            Outstanding: {formatCurrency(outstanding, settings.currency)}
          </Text>
        </View>

        {item.dueDate && (
          <Text className="text-xs text-muted mt-1">
            Due: {formatDate(item.dueDate)}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <ScreenContainer className="bg-background">
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 py-4 gap-4">
          <Text className="text-2xl font-bold text-foreground">Credit & Debit</Text>

          {/* Summary Cards */}
          <View className="gap-2">
            <View className="flex-row gap-2">
              <View className="flex-1 bg-success/10 rounded-lg p-3 border border-success">
                <Text className="text-xs text-muted mb-1">Total Credit</Text>
                <Text className="text-lg font-bold text-success">
                  {formatCurrency(totalCredit, settings.currency)}
                </Text>
              </View>
              <View className="flex-1 bg-error/10 rounded-lg p-3 border border-error">
                <Text className="text-xs text-muted mb-1">Total Debit</Text>
                <Text className="text-lg font-bold text-error">
                  {formatCurrency(totalDebit, settings.currency)}
                </Text>
              </View>
            </View>

            {/* Net Position */}
            <View
              className={`rounded-lg p-3 border ${
                netPosition >= 0
                  ? 'bg-success/10 border-success'
                  : 'bg-error/10 border-error'
              }`}
            >
              <Text className="text-xs text-muted mb-1">Net Position</Text>
              <Text
                className={`text-lg font-bold ${
                  netPosition >= 0 ? 'text-success' : 'text-error'
                }`}
              >
                {netPosition >= 0 ? '+' : ''}
                {formatCurrency(netPosition, settings.currency)}
              </Text>
              <Text className="text-xs text-muted mt-1">
                {netPosition >= 0
                  ? 'You are owed money'
                  : 'You owe money'}
              </Text>
            </View>
          </View>

          {/* Filter Chips */}
          <View className="flex-row gap-2">
            {(['credit', 'debit', 'all'] as LedgerFilter[]).map((f) => (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={({ pressed }) => [
                  {
                    backgroundColor: filter === f ? colors.primary : colors.surface,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                className="px-4 py-2 rounded-full border border-border"
              >
                <Text
                  className={`font-semibold capitalize ${
                    filter === f ? 'text-white' : 'text-foreground'
                  }`}
                >
                  {f}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Entries List */}
        {filteredEntries.length > 0 ? (
          <FlatList
            data={filteredEntries}
            renderItem={renderEntry}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
            scrollEnabled={false}
          />
        ) : (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="text-lg text-muted font-semibold mb-2">No entries</Text>
            <Text className="text-sm text-muted text-center">
              Add credit and debit entries to track money lent and borrowed
            </Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
