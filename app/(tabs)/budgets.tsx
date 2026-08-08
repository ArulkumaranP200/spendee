import React, { useState, useMemo } from 'react';
import { ScrollView, View, Text, FlatList, TextInput, Pressable, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useBudgets } from '@/lib/finance-context';
import { useFinance } from '@/lib/finance-context';
import { useSettings } from '@/lib/finance-context';
import { formatCurrency, calculateBudgetProgress, getBudgetStatusColor, getTransactionsForMonth, getCurrentMonthYear } from '@/lib/finance-utils';
import { useColors } from '@/hooks/use-colors';

export default function BudgetsScreen() {
  const { budgets, addBudget, deleteBudget } = useBudgets();
  const { state } = useFinance();
  const { settings } = useSettings();
  const colors = useColors();
  const { year, month } = getCurrentMonthYear();

  const [showForm, setShowForm] = useState(false);
  const [newBudgetCategory, setNewBudgetCategory] = useState('');
  const [newBudgetLimit, setNewBudgetLimit] = useState('');

  const monthTransactions = useMemo(
    () => getTransactionsForMonth(state.transactions, year, month),
    [state.transactions, year, month]
  );

  const budgetsWithSpending = useMemo(() => {
    return budgets.map((budget) => {
      const spent = monthTransactions
        .filter((t) => t.category === budget.category && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const progress = calculateBudgetProgress(spent, budget.limit);
      const status = getBudgetStatusColor(progress);

      return { ...budget, spent, progress, status };
    });
  }, [budgets, monthTransactions]);

  const handleAddBudget = () => {
    const limit = parseFloat(newBudgetLimit);

    if (!newBudgetCategory.trim()) {
      Alert.alert('Missing Category', 'Please enter a category name');
      return;
    }

    if (isNaN(limit) || limit <= 0) {
      Alert.alert('Invalid Limit', 'Please enter a valid budget limit');
      return;
    }

    if (budgets.some((b) => b.category === newBudgetCategory)) {
      Alert.alert('Duplicate', 'Budget for this category already exists');
      return;
    }

    addBudget({
      category: newBudgetCategory,
      limit,
      period: 'monthly',
    });

    setNewBudgetCategory('');
    setNewBudgetLimit('');
    setShowForm(false);
  };

  const renderBudget = ({ item }: { item: any }) => (
    <Pressable
      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
      onLongPress={() => deleteBudget(item.id)}
      className="bg-surface rounded-lg p-4 mb-3 border border-border"
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="font-semibold text-foreground mb-1">{item.category}</Text>
          <Text className="text-sm text-muted">
            {formatCurrency(item.spent, settings.currency)} of{' '}
            {formatCurrency(item.limit, settings.currency)}
          </Text>
        </View>
        <View
          className={`px-3 py-1 rounded-full ${
            item.status === 'green'
              ? 'bg-success/10'
              : item.status === 'yellow'
                ? 'bg-warning/10'
                : 'bg-error/10'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              item.status === 'green'
                ? 'text-success'
                : item.status === 'yellow'
                  ? 'text-warning'
                  : 'text-error'
            }`}
          >
            {item.progress.toFixed(0)}%
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="bg-background rounded-full h-2 overflow-hidden">
        <View
          style={{
            width: `${Math.min(item.progress, 100)}%`,
            backgroundColor:
              item.status === 'green'
                ? colors.success
                : item.status === 'yellow'
                  ? colors.warning
                  : colors.error,
            height: '100%',
          }}
        />
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer className="bg-background">
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 py-4 gap-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-bold text-foreground">Budgets</Text>
            <Pressable
              onPress={() => setShowForm(!showForm)}
              style={({ pressed }) => [
                {
                  backgroundColor: pressed ? '#1a3a7a' : '#1e40af',
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              className="px-4 py-2 rounded-full"
            >
              <Text className="text-white font-semibold">+ Add</Text>
            </Pressable>
          </View>

          {/* Add Budget Form */}
          {showForm && (
            <View className="bg-surface rounded-lg p-4 border border-border gap-3">
              <TextInput
                value={newBudgetCategory}
                onChangeText={setNewBudgetCategory}
                placeholder="Category name"
                placeholderTextColor={colors.muted}
                className="bg-background rounded px-3 py-2 border border-border text-foreground"
              />
              <View className="flex-row items-center bg-background rounded px-3 py-2 border border-border">
                <Text className="text-foreground font-semibold">{settings.currency}</Text>
                <TextInput
                  value={newBudgetLimit}
                  onChangeText={setNewBudgetLimit}
                  placeholder="Budget limit"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  className="flex-1 ml-2 text-foreground"
                />
              </View>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={handleAddBudget}
                  style={({ pressed }) => [
                    {
                      backgroundColor: pressed ? '#1a3a7a' : '#1e40af',
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  className="flex-1 py-2 rounded items-center"
                >
                  <Text className="text-white font-semibold">Save</Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowForm(false)}
                  className="flex-1 py-2 rounded items-center border border-border"
                >
                  <Text className="text-foreground font-semibold">Cancel</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Budgets List */}
        {budgetsWithSpending.length > 0 ? (
          <FlatList
            data={budgetsWithSpending}
            renderItem={renderBudget}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
            scrollEnabled={false}
          />
        ) : (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="text-lg text-muted font-semibold mb-2">No budgets</Text>
            <Text className="text-sm text-muted text-center">
              Create budgets to track spending by category
            </Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
