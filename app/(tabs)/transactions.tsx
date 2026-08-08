import React, { useState, useMemo } from 'react';
import { ScrollView, View, Text, FlatList, TextInput, Pressable } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useFinance } from '@/lib/finance-context';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/finance-utils';
import { useSettings } from '@/lib/finance-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';

type FilterType = 'all' | 'paid' | 'unpaid';

export default function TransactionsScreen() {
  const { state, dispatch } = useFinance();
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

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  };

  const renderTransaction = ({ item }: { item: any }) => (
    <Pressable
      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
      onLongPress={() => handleDelete(item.id)}
      className="bg-surface rounded-lg p-4 mb-3 border border-border flex-row justify-between items-center"
    >
      <View className="flex-1">
        <View className="flex-row items-center gap-2 mb-1">
          <Text className="font-semibold text-foreground">{item.category}</Text>
          <StatusBadge status={item.paymentStatus} size="sm" />
        </View>
        <Text className="text-sm text-muted">{item.note}</Text>
        <Text className="text-xs text-muted mt-1">{formatDate(item.date)}</Text>
      </View>
      <View className="items-end">
        <Text
          className={`text-lg font-bold ${
            item.type === 'income' ? 'text-success' : 'text-error'
          }`}
        >
          {item.type === 'income' ? '+' : '-'}
          {formatCurrency(item.amount, settings.currency)}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer className="bg-background">
      <View className="flex-1">
        {/* Header */}
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
            {(['all', 'paid', 'unpaid'] as FilterType[]).map((f) => (
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

        {/* Transactions List */}
        {filteredTransactions.length > 0 ? (
          <FlatList
            data={filteredTransactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
            scrollEnabled={false}
          />
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
