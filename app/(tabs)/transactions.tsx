import React, { useState, useMemo } from 'react';
import { ScrollView, View, Text, TextInput, Alert } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/screen-container';
import { useFinance, useCategories } from '@/lib/finance-context';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/finance-utils';
import { useSettings } from '@/lib/finance-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SmoothPressable } from '@/components/ui/smooth-pressable';
import { useColors } from '@/hooks/use-colors';
import { withAlpha } from '@/lib/color-utils';
import type { Transaction } from '@/lib/types';

type FilterType = 'all' | 'paid' | 'unpaid';

export default function TransactionsScreen() {
  const { state, dispatch } = useFinance();
  const { categories } = useCategories();
  const categoryIcon = (name: string) => categories.find((c) => c.name === name)?.icon ?? '📦';
  const { settings } = useSettings();
  const colors = useColors();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchText, setSearchText] = useState('');

  const filteredTransactions = useMemo(() => {
    let filtered = state.transactions;

    // Filter by payment status
    if (filter === 'paid') {
      filtered = filtered.filter((t) => t.paymentStatus === 'paid');
    } else if (filter === 'unpaid') {
      filtered = filtered.filter((t) => t.paymentStatus === 'unpaid');
    }

    // Filter by search text
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.note.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.transactions, filter, searchText]);

  const handleDelete = (transaction: Transaction) => {
    Alert.alert(
      'Delete Transaction',
      `Delete "${transaction.category}" for ${formatCurrency(transaction.amount, settings.currency)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch({ type: 'DELETE_TRANSACTION', payload: transaction.id }),
        },
      ]
    );
  };

  return (
    <ScreenContainer className="bg-background">
      <View className="flex-1">
        {/* Header */}
        <Animated.View entering={FadeIn.duration(300)}>
        <View className="px-4 py-4 gap-4">
          <Text className="text-2xl font-bold text-foreground">Transactions</Text>

          {/* Search Bar */}
          <View className="flex-row items-center bg-surface rounded-lg px-3 py-2 border border-border">
            <IconSymbol size={20} name="magnifyingglass" color={colors.muted} />
            <TextInput
              placeholder="Search..."
              placeholderTextColor={colors.muted}
              value={searchText}
              onChangeText={setSearchText}
              className="flex-1 ml-2 text-foreground"
            />
          </View>

          {/* Filter Chips */}
          <View className="flex-row gap-2">
            {(['all', 'paid', 'unpaid'] as FilterType[]).map((f) => {
              const selected = filter === f;
              return (
                <SmoothPressable
                  key={f}
                  onPress={() => setFilter(f)}
                  dynamicStyle={({ pressed, hovered }) => [
                    {
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 999,
                      borderWidth: 1,
                      backgroundColor: selected
                        ? withAlpha(colors.primary, 0.3)
                        : hovered
                          ? withAlpha(colors.primary, 0.12)
                          : colors.surface,
                      borderColor: selected ? withAlpha(colors.primary, 0.3) : colors.border,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Text className="font-semibold capitalize" style={{ color: colors.foreground }}>
                    {f}
                  </Text>
                </SmoothPressable>
              );
            })}
          </View>
        </View>
        </Animated.View>

        {/* Transactions List */}
        {filteredTransactions.length > 0 ? (
          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}>
            {filteredTransactions.map((item) => (
              <Animated.View
                key={item.id}
                entering={FadeIn.duration(250)}
                exiting={FadeOut.duration(200)}
                layout={LinearTransition.duration(250)}
                className="bg-surface rounded-2xl p-4 mb-3 shadow-sm flex-row justify-between items-center"
              >
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-base">{categoryIcon(item.category)}</Text>
                    <Text className="font-semibold text-foreground">{item.category}</Text>
                    <StatusBadge status={item.paymentStatus} size="sm" />
                  </View>
                  <Text className="text-sm text-muted">{item.note}</Text>
                  <Text className="text-xs text-muted mt-1">{formatDate(item.date)}</Text>
                </View>
                <View className="items-end gap-2">
                  <Text
                    className={`text-lg font-bold ${
                      item.type === 'income' ? 'text-success' : 'text-error'
                    }`}
                  >
                    {item.type === 'income' ? '+' : '-'}
                    {formatCurrency(item.amount, settings.currency)}
                  </Text>
                  <SmoothPressable
                    onPress={() => handleDelete(item)}
                    hitSlop={8}
                    dynamicStyle={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                    className="p-1"
                  >
                    <IconSymbol size={18} name="trash" color={colors.error} />
                  </SmoothPressable>
                </View>
              </Animated.View>
            ))}
          </ScrollView>
        ) : (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="text-lg text-muted font-semibold mb-2">No transactions</Text>
            <Text className="text-sm text-muted text-center">
              {searchText ? 'Try a different search' : 'Add your first transaction from the Add tab'}
            </Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
