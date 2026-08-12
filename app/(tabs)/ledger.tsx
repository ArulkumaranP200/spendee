import React, { useState, useMemo } from 'react';
import { ScrollView, View, Text, TextInput, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/screen-container';
import { useLedger } from '@/lib/finance-context';
import { useSettings } from '@/lib/finance-context';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDate, calculateNetLedgerPosition, isValidAmount } from '@/lib/finance-utils';
import { useColors } from '@/hooks/use-colors';
import { withAlpha } from '@/lib/color-utils';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SmoothPressable } from '@/components/ui/smooth-pressable';
import type { CreditDebitEntry, LedgerDirection } from '@/lib/types';

type LedgerFilter = 'credit' | 'debit' | 'all';

export default function LedgerScreen() {
  const { ledgerEntries, addLedgerEntry, deleteLedgerEntry } = useLedger();
  const { settings } = useSettings();
  const colors = useColors();
  const [filter, setFilter] = useState<LedgerFilter>('all');

  const [modalDirection, setModalDirection] = useState<LedgerDirection | null>(null);
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

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

  const closeModal = () => {
    setModalDirection(null);
    setPersonName('');
    setAmount('');
    setDescription('');
    setDueDate('');
  };

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);

    if (!personName.trim()) {
      Alert.alert('Missing Name', 'Please enter a person name');
      return;
    }

    if (!isValidAmount(numAmount)) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0');
      return;
    }

    addLedgerEntry({
      direction: modalDirection as LedgerDirection,
      personName: personName.trim(),
      amount: numAmount,
      description: description.trim(),
      date: new Date().toISOString(),
      dueDate: dueDate.trim() ? new Date(dueDate.trim()).toISOString() : null,
      status: 'outstanding',
      settledAmount: 0,
    });

    closeModal();
  };

  const handleDelete = (entry: CreditDebitEntry) => {
    Alert.alert(
      'Delete Entry',
      `Delete "${entry.personName}" entry for ${formatCurrency(entry.amount, settings.currency)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteLedgerEntry(entry.id) },
      ]
    );
  };

  return (
    <ScreenContainer className="bg-background">
      <View className="flex-1">
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(300)}
          style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, gap: 16 }}
        >
          <Text className="text-2xl font-bold text-foreground">Credit & Debit</Text>

          {/* Summary Cards */}
          <View className="gap-2">
            <View className="flex-row gap-2">
              <View className="flex-1 bg-success/10 rounded-2xl p-3 shadow-sm">
                <Text className="text-xs text-muted mb-1">Total Credit</Text>
                <Text className="text-lg font-bold text-success">
                  {formatCurrency(totalCredit, settings.currency)}
                </Text>
              </View>
              <View className="flex-1 bg-error/10 rounded-2xl p-3 shadow-sm">
                <Text className="text-xs text-muted mb-1">Total Debit</Text>
                <Text className="text-lg font-bold text-error">
                  {formatCurrency(totalDebit, settings.currency)}
                </Text>
              </View>
            </View>

            {/* Net Position */}
            <View
              className={`rounded-2xl p-3 shadow-sm ${
                netPosition >= 0 ? 'bg-success/10' : 'bg-error/10'
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

          {/* New Credit / New Debit */}
          <View className="flex-row gap-2">
            <SmoothPressable
              onPress={() => setModalDirection('credit')}
              className="flex-1"
              dynamicStyle={({ pressed, hovered }) => [
                {
                  paddingVertical: 12,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: withAlpha(colors.primary, 0.3),
                  backgroundColor: hovered ? withAlpha(colors.primary, 0.4) : withAlpha(colors.primary, 0.3),
                  alignItems: 'center',
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <IconSymbol size={18} name="arrow.up.right" color={colors.primary} />
              <Text className="font-semibold" style={{ color: colors.foreground }}>New Credit</Text>
            </SmoothPressable>
            <SmoothPressable
              onPress={() => setModalDirection('debit')}
              className="flex-1"
              dynamicStyle={({ pressed, hovered }) => [
                {
                  paddingVertical: 12,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: withAlpha(colors.primary, 0.3),
                  backgroundColor: hovered ? withAlpha(colors.primary, 0.4) : withAlpha(colors.primary, 0.3),
                  alignItems: 'center',
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <IconSymbol size={18} name="arrow.down.left" color={colors.primary} />
              <Text className="font-semibold" style={{ color: colors.foreground }}>New Debit</Text>
            </SmoothPressable>
          </View>

          {/* Filter Chips */}
          <View className="flex-row gap-2">
            {(['credit', 'debit', 'all'] as LedgerFilter[]).map((f) => {
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
        </Animated.View>

        {/* Entries List */}
        {filteredEntries.length > 0 ? (
          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}>
            {filteredEntries.map((item) => {
              const outstanding = item.amount - item.settledAmount;

              return (
                <Animated.View
                  key={item.id}
                  entering={FadeIn.duration(250)}
                  exiting={FadeOut.duration(200)}
                  layout={LinearTransition.duration(250)}
                  className="bg-surface rounded-2xl p-4 mb-3 shadow-sm"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text className="font-semibold text-foreground">{item.personName}</Text>
                        <StatusBadge status={item.status} size="sm" />
                      </View>
                      <Text className="text-sm text-muted">{item.description}</Text>
                    </View>
                    <View className="items-end gap-2">
                      <Text
                        className={`text-lg font-bold ${
                          item.direction === 'credit' ? 'text-success' : 'text-error'
                        }`}
                      >
                        {item.direction === 'credit' ? '+' : '-'}
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
                </Animated.View>
              );
            })}
          </ScrollView>
        ) : (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="text-lg text-muted font-semibold mb-2">No entries</Text>
            <Text className="text-sm text-muted text-center">
              Add credit and debit entries to track money lent and borrowed
            </Text>
          </View>
        )}
      </View>

      {/* New Credit / New Debit Modal */}
      {modalDirection !== null && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[StyleSheet.absoluteFillObject, { zIndex: 50 }]}
          className="justify-end bg-black/40"
        >
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
          <View className="bg-background rounded-t-2xl p-4 gap-4 border-t border-border">
            <Text className="text-lg font-bold text-foreground">
              New {modalDirection === 'credit' ? 'Credit' : 'Debit'} Entry
            </Text>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Person</Text>
              <TextInput
                value={personName}
                onChangeText={setPersonName}
                placeholder="Person name"
                placeholderTextColor={colors.muted}
                className="bg-surface rounded-lg px-3 py-3 border border-border text-foreground"
              />
            </View>

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

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Optional description"
                placeholderTextColor={colors.muted}
                className="bg-surface rounded-lg px-3 py-3 border border-border text-foreground"
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Due Date (optional)</Text>
              <TextInput
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.muted}
                className="bg-surface rounded-lg px-3 py-3 border border-border text-foreground"
              />
            </View>

            <View className="flex-row gap-2 pt-2">
              <SmoothPressable
                onPress={closeModal}
                dynamicStyle={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className="flex-1 py-3 rounded-full items-center border border-border"
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </SmoothPressable>
              <SmoothPressable
                onPress={handleSubmit}
                className="flex-1"
                dynamicStyle={({ pressed, hovered }) => [
                  {
                    paddingVertical: 12,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: withAlpha(colors.primary, 0.3),
                    backgroundColor: withAlpha(colors.primary, hovered ? 0.4 : 0.3),
                    alignItems: 'center',
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text className="font-bold" style={{ color: colors.foreground }}>
                  Add {modalDirection === 'credit' ? 'Credit' : 'Debit'}
                </Text>
              </SmoothPressable>
            </View>
          </View>
          </Animated.View>
        </KeyboardAvoidingView>
      )}
    </ScreenContainer>
  );
}
