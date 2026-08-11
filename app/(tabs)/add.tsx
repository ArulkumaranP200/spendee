import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Switch, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useTransactions } from '@/lib/finance-context';
import { useSettings } from '@/lib/finance-context';
import { validateSplitSum, isValidAmount } from '@/lib/finance-utils';
import { generateUUID } from '@/lib/finance-utils';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SmoothPressable } from '@/components/ui/smooth-pressable';
import { SplitItem } from '@/lib/types';

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Shopping',
  'Bills & Utilities',
  'Health',
  'Entertainment',
  'Education',
  'Travel',
  'Personal Care',
  'Other',
];

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Gift',
  'Refund',
  'Other',
];

export default function AddTransactionScreen() {
  const { addTransaction } = useTransactions();
  const { settings } = useSettings();
  const colors = useColors();

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('paid');
  const [isSplit, setIsSplit] = useState(false);
  const [splits, setSplits] = useState<SplitItem[]>([]);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleAddSplit = () => {
    setSplits([
      ...splits,
      {
        id: generateUUID(),
        label: '',
        amount: 0,
        paymentStatus: 'paid',
      },
    ]);
  };

  const handleRemoveSplit = (id: string) => {
    setSplits(splits.filter((s) => s.id !== id));
  };

  const handleUpdateSplit = (id: string, updates: Partial<SplitItem>) => {
    setSplits(
      splits.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const totalSplitAmount = splits.reduce((sum, s) => sum + (s.amount || 0), 0);
  const splitAmountRemaining = (parseFloat(amount) || 0) - totalSplitAmount;

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);

    if (!isValidAmount(numAmount)) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0');
      return;
    }

    if (!category) {
      Alert.alert('Missing Category', 'Please select a category');
      return;
    }

    if (isSplit) {
      if (splits.length === 0) {
        Alert.alert('No Splits', 'Add at least one split item');
        return;
      }

      if (!validateSplitSum(splits, numAmount)) {
        Alert.alert(
          'Split Mismatch',
          `Split items must total ${settings.currency}${numAmount.toFixed(2)}`
        );
        return;
      }
    }

    const transaction = addTransaction({
      type,
      amount: numAmount,
      category,
      note,
      date: new Date(date).toISOString(),
      paymentStatus,
      isSplit,
      splits,
    });

    Alert.alert('Success', 'Transaction added', [
      {
        text: 'OK',
        onPress: () => {
          // Reset form
          setAmount('');
          setCategory('');
          setNote('');
          setDate(new Date().toISOString().split('T')[0]);
          setPaymentStatus('paid');
          setIsSplit(false);
          setSplits([]);
        },
      },
    ]);
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-4 py-6">
        <View className="gap-6">
          <Text className="text-2xl font-bold text-foreground">Add Transaction</Text>

          {/* Type Toggle */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Type</Text>
            <View className="flex-row gap-2">
              {(['income', 'expense'] as const).map((t) => (
                <SmoothPressable
                  key={t}
                  onPress={() => {
                    setType(t);
                    setCategory('');
                  }}
                  dynamicStyle={({ pressed }) => [
                    {
                      backgroundColor: type === t ? colors.primary : colors.surface,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  className="flex-1 py-3 rounded-lg items-center border border-border"
                >
                  <Text
                    className={`font-semibold capitalize ${
                      type === t ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {t}
                  </Text>
                </SmoothPressable>
              ))}
            </View>
          </View>

          {/* Amount */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Amount</Text>
            <View className="flex-row items-center bg-surface rounded-lg px-3 py-3 border border-border">
              <Text className="text-lg font-semibold text-foreground">{settings.currency}</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={colors.muted}
                keyboardType="decimal-pad"
                className="flex-1 ml-2 text-foreground text-lg"
              />
            </View>
          </View>

          {/* Category */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Category</Text>
            <View className="flex-row flex-wrap gap-2">
              {categories.map((cat) => (
                <SmoothPressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  dynamicStyle={({ pressed }) => [
                    {
                      backgroundColor: category === cat ? colors.primary : colors.surface,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  className="px-4 py-2 rounded-full border border-border"
                >
                  <Text
                    className={`font-semibold text-sm ${
                      category === cat ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {cat}
                  </Text>
                </SmoothPressable>
              ))}
            </View>
          </View>

          {/* Date */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Date</Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.muted}
              className="bg-surface rounded-lg px-3 py-3 border border-border text-foreground"
            />
          </View>

          {/* Note */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Note</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Optional note"
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              className="bg-surface rounded-lg px-3 py-3 border border-border text-foreground"
            />
          </View>

          {/* Payment Status */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Payment Status</Text>
            <View className="flex-row gap-2">
              {(['paid', 'unpaid'] as const).map((status) => (
                <SmoothPressable
                  key={status}
                  onPress={() => setPaymentStatus(status)}
                  dynamicStyle={({ pressed }) => [
                    {
                      backgroundColor: paymentStatus === status ? colors.success : colors.surface,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  className="flex-1 py-3 rounded-lg items-center border border-border"
                >
                  <Text
                    className={`font-semibold capitalize ${
                      paymentStatus === status ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {status}
                  </Text>
                </SmoothPressable>
              ))}
            </View>
          </View>

          {/* Split Toggle */}
          <View className="flex-row items-center justify-between bg-surface rounded-lg p-4 border border-border">
            <Text className="font-semibold text-foreground">Split Transaction</Text>
            <Switch
              value={isSplit}
              onValueChange={setIsSplit}
              trackColor={{ false: colors.border, true: colors.success }}
              thumbColor={colors.background}
            />
          </View>

          {/* Split Items */}
          {isSplit && (
            <View className="gap-3 bg-surface rounded-lg p-4 border border-border">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-semibold text-foreground">Split Items</Text>
                <Text className="text-xs text-muted">
                  Remaining: {settings.currency}{splitAmountRemaining.toFixed(2)}
                </Text>
              </View>

              {splits.map((split, idx) => (
                <View key={split.id} className="gap-2 pb-3 border-b border-border">
                  <TextInput
                    value={split.label}
                    onChangeText={(text) => handleUpdateSplit(split.id, { label: text })}
                    placeholder="Person/Item name"
                    placeholderTextColor={colors.muted}
                    className="bg-background rounded px-3 py-2 border border-border text-foreground"
                  />
                  <TextInput
                    value={split.amount.toString()}
                    onChangeText={(text) =>
                      handleUpdateSplit(split.id, { amount: parseFloat(text) || 0 })
                    }
                    placeholder="Amount"
                    placeholderTextColor={colors.muted}
                    keyboardType="decimal-pad"
                    className="bg-background rounded px-3 py-2 border border-border text-foreground"
                  />
                  <SmoothPressable
                    onPress={() => handleRemoveSplit(split.id)}
                    className="py-2 items-center"
                  >
                    <Text className="text-error font-semibold">Remove</Text>
                  </SmoothPressable>
                </View>
              ))}

              <SmoothPressable
                onPress={handleAddSplit}
                className="py-3 items-center border-t border-border mt-2"
              >
                <Text className="text-primary font-semibold">+ Add Split Item</Text>
              </SmoothPressable>
            </View>
          )}

          {/* Submit Button */}
          <SmoothPressable
            onPress={handleSubmit}
            dynamicStyle={({ pressed }) => [
              {
                backgroundColor: pressed ? '#1a3a7a' : '#1e40af',
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            className="py-4 rounded-lg items-center"
          >
            <Text className="text-white font-bold text-lg">Add Transaction</Text>
          </SmoothPressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
