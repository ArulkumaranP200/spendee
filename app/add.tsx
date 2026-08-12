import React, { useState, useMemo } from 'react';
import { ScrollView, View, Text, TextInput, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useTransactions, useCategories, usePaymentMethods } from '@/lib/finance-context';
import { useSettings } from '@/lib/finance-context';
import { validateSplitSum, isValidAmount } from '@/lib/finance-utils';
import { generateUUID } from '@/lib/finance-utils';
import { useColors } from '@/hooks/use-colors';
import { withAlpha } from '@/lib/color-utils';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SmoothPressable } from '@/components/ui/smooth-pressable';
import { DateInput } from '@/components/ui/date-input';
import { SplitItem } from '@/lib/types';

export default function AddTransactionScreen() {
  const router = useRouter();
  const { addTransaction } = useTransactions();
  const { settings } = useSettings();
  const { categories } = useCategories();
  const { paymentMethods } = usePaymentMethods();
  const colors = useColors();

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('paid');
  const [isSplit, setIsSplit] = useState(false);
  const [splits, setSplits] = useState<SplitItem[]>([]);
  const defaultPaymentMethodId = paymentMethods.find((pm) => pm.isDefault)?.id ?? paymentMethods[0]?.id ?? null;
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(defaultPaymentMethodId);

  const availableCategories = useMemo(
    () => categories.filter((c) => c.type === type || c.type === 'both'),
    [categories, type]
  );

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

    addTransaction({
      type,
      amount: numAmount,
      category,
      note,
      date: new Date(date).toISOString(),
      paymentStatus,
      isSplit,
      splits,
      paymentMethodId,
    });

    // Navigate back immediately rather than waiting on the alert's OK
    // button — Alert.alert doesn't render on web, which would otherwise
    // strand the user on this modal with no way to dismiss it.
    router.back();
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-4 py-6">
        <View className="gap-6">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-foreground">Add Transaction</Text>
            <SmoothPressable onPress={() => router.back()} hitSlop={8} className="p-1">
              <IconSymbol size={26} name="xmark.circle.fill" color={colors.muted} />
            </SmoothPressable>
          </View>

          {/* Type Toggle */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Type</Text>
            <View className="flex-row gap-2">
              {(['income', 'expense'] as const).map((t) => {
                const selected = type === t;
                return (
                  <SmoothPressable
                    key={t}
                    onPress={() => {
                      setType(t);
                      setCategory('');
                    }}
                    className="flex-1"
                    dynamicStyle={({ pressed, hovered }) => [
                      {
                        paddingVertical: 12,
                        borderRadius: 12,
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
                      {t}
                    </Text>
                  </SmoothPressable>
                );
              })}
            </View>
          </View>

          {/* Amount */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Amount</Text>
            <View className="flex-row items-center bg-surface rounded-xl px-3 py-3 border border-border">
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
              {availableCategories.map((cat) => {
                const selected = category === cat.name;
                return (
                  <SmoothPressable
                    key={cat.id}
                    onPress={() => setCategory(cat.name)}
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
                    <Text className="text-sm">{cat.icon}</Text>
                    <Text className="font-semibold text-sm" style={{ color: colors.foreground }}>
                      {cat.name}
                    </Text>
                  </SmoothPressable>
                );
              })}
            </View>
          </View>

          {/* Payment Method */}
          {paymentMethods.length > 0 && (
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Payment Method</Text>
              <View className="flex-row flex-wrap gap-2">
                {paymentMethods.map((pm) => {
                  const selected = paymentMethodId === pm.id;
                  return (
                    <SmoothPressable
                      key={pm.id}
                      onPress={() => setPaymentMethodId(pm.id)}
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
                      <Text className="text-sm">{pm.icon}</Text>
                      <Text className="font-semibold text-sm" style={{ color: colors.foreground }}>
                        {pm.name}
                      </Text>
                    </SmoothPressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Date */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Date</Text>
            <DateInput value={date} onChange={setDate} />
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
              className="bg-surface rounded-xl px-3 py-3 border border-border text-foreground"
            />
          </View>

          {/* Payment Status */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Payment Status</Text>
            <View className="flex-row gap-2">
              {(['paid', 'unpaid'] as const).map((status) => {
                const selected = paymentStatus === status;
                return (
                  <SmoothPressable
                    key={status}
                    onPress={() => setPaymentStatus(status)}
                    className="flex-1"
                    dynamicStyle={({ pressed, hovered }) => [
                      {
                        paddingVertical: 12,
                        borderRadius: 12,
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
                      {status}
                    </Text>
                  </SmoothPressable>
                );
              })}
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
            dynamicStyle={({ pressed, hovered }) => [
              {
                paddingVertical: 16,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: withAlpha(colors.primary, 0.3),
                backgroundColor: hovered ? withAlpha(colors.primary, 0.4) : withAlpha(colors.primary, 0.3),
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text className="font-bold text-lg" style={{ color: colors.foreground }}>
              Add Transaction
            </Text>
          </SmoothPressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
