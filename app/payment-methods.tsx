import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/screen-container';
import { usePaymentMethods, useSettings } from '@/lib/finance-context';
import { formatCurrency } from '@/lib/finance-utils';
import { useColors } from '@/hooks/use-colors';
import { withAlpha } from '@/lib/color-utils';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SmoothPressable } from '@/components/ui/smooth-pressable';

const EMOJI_OPTIONS = ['💵', '💳', '📱', '🏦', '🪙', '💰', '👛', '🧾'];

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { paymentMethods, addPaymentMethod, deletePaymentMethod, updatePaymentMethodBalance } =
    usePaymentMethods();
  const { settings } = useSettings();
  const colors = useColors();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(EMOJI_OPTIONS[0]);
  const [initialBalance, setInitialBalance] = useState('');

  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustValue, setAdjustValue] = useState('');

  const closeForm = () => {
    setShowForm(false);
    setName('');
    setIcon(EMOJI_OPTIONS[0]);
    setInitialBalance('');
  };

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a payment method name');
      return;
    }
    const balance = parseFloat(initialBalance) || 0;
    addPaymentMethod({ name: name.trim(), icon, balance });
    closeForm();
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Payment Method', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const ok = deletePaymentMethod(id);
          if (!ok) {
            Alert.alert('Cannot Delete', 'The default payment method cannot be deleted.');
          }
        },
      },
    ]);
  };

  const openAdjust = (id: string, currentBalance: number) => {
    setAdjustingId(id);
    setAdjustValue(currentBalance.toString());
  };

  const handleSaveAdjust = () => {
    if (!adjustingId) return;
    const value = parseFloat(adjustValue);
    if (isNaN(value)) {
      Alert.alert('Invalid Amount', 'Please enter a valid balance');
      return;
    }
    updatePaymentMethodBalance(adjustingId, value);
    setAdjustingId(null);
    setAdjustValue('');
  };

  return (
    <ScreenContainer className="bg-background">
      <View className="flex-1">
        <Animated.View entering={FadeIn.duration(250)}>
        <View className="px-4 py-4 flex-row items-center gap-3">
          <SmoothPressable onPress={() => router.back()} hitSlop={8} className="p-1">
            <IconSymbol size={24} name="chevron.left" color={colors.foreground} />
          </SmoothPressable>
          <Text className="text-2xl font-bold text-foreground">Payment Methods</Text>
        </View>
        </Animated.View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}>
          {paymentMethods.map((method) => (
            <Animated.View
              key={method.id}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
              layout={LinearTransition.duration(200)}
              className="bg-surface rounded-2xl p-4 mb-3 shadow-sm"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-3 flex-1">
                  <Text className="text-2xl">{method.icon}</Text>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="font-semibold text-foreground">{method.name}</Text>
                      {method.isDefault && (
                        <View className="px-2 py-0.5 rounded-full bg-primary/10">
                          <Text className="text-xs font-semibold text-primary">DEFAULT</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <View className="flex-row items-center gap-3">
                  <SmoothPressable
                    onPress={() => openAdjust(method.id, method.balance)}
                    hitSlop={8}
                    dynamicStyle={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                    className="p-1"
                  >
                    <Text className="text-lg">💰</Text>
                  </SmoothPressable>
                  {!method.isDefault && (
                    <SmoothPressable
                      onPress={() => handleDelete(method.id, method.name)}
                      hitSlop={8}
                      dynamicStyle={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                      className="p-1"
                    >
                      <IconSymbol size={18} name="trash" color={colors.error} />
                    </SmoothPressable>
                  )}
                </View>
              </View>
              <Text className="text-xs text-muted mb-1">Current Balance</Text>
              <Text
                className={`text-xl font-bold ${method.balance >= 0 ? 'text-success' : 'text-error'}`}
              >
                {method.balance < 0 ? '-' : ''}
                {formatCurrency(method.balance, settings.currency)}
              </Text>
            </Animated.View>
          ))}

          <SmoothPressable
            onPress={() => setShowForm(true)}
            className="mt-2"
            dynamicStyle={({ pressed, hovered }) => [
              {
                paddingVertical: 16,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: withAlpha(colors.primary, 0.3),
                backgroundColor: withAlpha(colors.primary, hovered ? 0.4 : 0.3),
                alignItems: 'center',
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text className="font-bold" style={{ color: colors.foreground }}>+ Add Payment Method</Text>
          </SmoothPressable>
        </ScrollView>
      </View>

      {(showForm || adjustingId) && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[StyleSheet.absoluteFillObject, { zIndex: 50 }]}
          className="justify-end bg-black/40"
        >
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
          <View className="bg-background rounded-t-2xl p-4 gap-4 border-t border-border">
            {showForm ? (
              <>
                <Text className="text-lg font-bold text-foreground">New Payment Method</Text>

                <View className="gap-2">
                  <Text className="text-sm font-semibold text-foreground">Name</Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. GPay, Bank Account"
                    placeholderTextColor={colors.muted}
                    className="bg-surface rounded-lg px-3 py-3 border border-border text-foreground"
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-sm font-semibold text-foreground">Icon</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {EMOJI_OPTIONS.map((emoji) => {
                      const selected = icon === emoji;
                      return (
                        <SmoothPressable
                          key={emoji}
                          onPress={() => setIcon(emoji)}
                          dynamicStyle={({ pressed, hovered }) => [
                            {
                              width: 44,
                              height: 44,
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
                          <Text className="text-xl">{emoji}</Text>
                        </SmoothPressable>
                      );
                    })}
                  </View>
                </View>

                <View className="gap-2">
                  <Text className="text-sm font-semibold text-foreground">Initial Balance</Text>
                  <View className="flex-row items-center bg-surface rounded-lg px-3 py-3 border border-border">
                    <Text className="text-lg font-semibold text-foreground">{settings.currency}</Text>
                    <TextInput
                      value={initialBalance}
                      onChangeText={setInitialBalance}
                      placeholder="0.00"
                      placeholderTextColor={colors.muted}
                      keyboardType="decimal-pad"
                      className="flex-1 ml-2 text-foreground text-lg"
                    />
                  </View>
                </View>

                <View className="flex-row gap-2 pt-2">
                  <SmoothPressable
                    onPress={closeForm}
                    dynamicStyle={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                    className="flex-1 py-3 rounded-full items-center border border-border"
                  >
                    <Text className="text-foreground font-semibold">Cancel</Text>
                  </SmoothPressable>
                  <SmoothPressable
                    onPress={handleAdd}
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
                    <Text className="font-bold" style={{ color: colors.foreground }}>Add</Text>
                  </SmoothPressable>
                </View>
              </>
            ) : (
              <>
                <Text className="text-lg font-bold text-foreground">Adjust Balance</Text>
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-foreground">New Balance</Text>
                  <View className="flex-row items-center bg-surface rounded-lg px-3 py-3 border border-border">
                    <Text className="text-lg font-semibold text-foreground">{settings.currency}</Text>
                    <TextInput
                      value={adjustValue}
                      onChangeText={setAdjustValue}
                      placeholder="0.00"
                      placeholderTextColor={colors.muted}
                      keyboardType="numbers-and-punctuation"
                      className="flex-1 ml-2 text-foreground text-lg"
                    />
                  </View>
                </View>
                <View className="flex-row gap-2 pt-2">
                  <SmoothPressable
                    onPress={() => setAdjustingId(null)}
                    dynamicStyle={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                    className="flex-1 py-3 rounded-full items-center border border-border"
                  >
                    <Text className="text-foreground font-semibold">Cancel</Text>
                  </SmoothPressable>
                  <SmoothPressable
                    onPress={handleSaveAdjust}
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
                    <Text className="font-bold" style={{ color: colors.foreground }}>Save</Text>
                  </SmoothPressable>
                </View>
              </>
            )}
          </View>
          </Animated.View>
        </KeyboardAvoidingView>
      )}
    </ScreenContainer>
  );
}
