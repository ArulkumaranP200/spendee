import React, { useState } from 'react';
import { ScrollView, View, Text, Switch, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useSettings } from '@/lib/finance-context';
import { useLockSettings } from '@/lib/finance-context';
import { useFinance } from '@/lib/finance-context';
import { importAllData, clearAllData, resetAllBalances } from '@/lib/storage';
import { backupToFile, pickBackupFile } from '@/lib/backup';
import { useColors } from '@/hooks/use-colors';
import { withAlpha } from '@/lib/color-utils';
import { SmoothPressable } from '@/components/ui/smooth-pressable';
import { IconSymbol } from '@/components/ui/icon-symbol';

const CURRENCY_OPTIONS = ['$', '€', '₹', '£', '¥', '₽'];

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useSettings();
  const { lockSettings, updateLockSettings } = useLockSettings();
  const { dispatch, reloadFromStorage } = useFinance();
  const colors = useColors();

  const [showLockSetup, setShowLockSetup] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleSetupLock = () => {
    if (newPin.length < 4) {
      Alert.alert('Invalid PIN', 'PIN must be at least 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert('PIN Mismatch', 'PINs do not match');
      return;
    }

    updateLockSettings({
      enabled: true,
      pin: newPin,
      method: 'both',
      biometricEnabled: true,
    });

    Alert.alert('Success', 'Lock setup complete');
    setNewPin('');
    setConfirmPin('');
    setShowLockSetup(false);
  };

  const handleDisableLock = () => {
    Alert.alert(
      'Disable Lock',
      'Are you sure? Your app will be accessible without authentication.',
      [
        { text: 'Cancel' },
        {
          text: 'Disable',
          onPress: () => {
            updateLockSettings({ enabled: false });
          },
        },
      ]
    );
  };

  const handleBackupData = async () => {
    try {
      await backupToFile();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to back up data');
    }
  };

  const handleRestoreData = async () => {
    try {
      const text = await pickBackupFile();
      if (!text) return; // user cancelled the picker

      try {
        JSON.parse(text);
      } catch {
        Alert.alert('Invalid File', 'That file doesn\'t look like a valid SpendWise backup.');
        return;
      }

      Alert.alert(
        'Restore Data',
        'This will overwrite your current transactions, budgets, categories, and payment methods with the selected backup. Continue?',
        [
          { text: 'Cancel' },
          {
            text: 'Restore',
            style: 'destructive',
            onPress: async () => {
              try {
                await importAllData(text);
                await reloadFromStorage();
                Alert.alert('Success', 'Data restored from backup');
              } catch (error) {
                Alert.alert('Restore Failed', error instanceof Error ? error.message : 'Could not restore backup');
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to read backup file');
    }
  };

  const handleResetBalances = () => {
    Alert.alert(
      'Reset All Balances',
      'This sets every payment method\'s balance to 0. Transactions are not affected.',
      [
        { text: 'Cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const reset = await resetAllBalances();
            dispatch({ type: 'SET_PAYMENT_METHODS', payload: reset });
            Alert.alert('Complete', 'All balances have been reset');
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all transactions, budgets, and settings. This action cannot be undone.',
      [
        { text: 'Cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm',
              'Are you absolutely sure? Type "CLEAR" to confirm.',
              [
                { text: 'Cancel' },
                {
                  text: 'CLEAR',
                  style: 'destructive',
                  onPress: async () => {
                    await clearAllData();
                    await reloadFromStorage();
                    Alert.alert('Complete', 'All data has been cleared');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-4 py-6">
        <View className="gap-6">
          <Text className="text-2xl font-bold text-foreground">Settings</Text>

          {/* Currency Section */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Currency</Text>
            <View className="flex-row flex-wrap gap-2">
              {CURRENCY_OPTIONS.map((curr) => {
                const selected = settings.currency === curr;
                return (
                  <SmoothPressable
                    key={curr}
                    onPress={() => updateSettings({ currency: curr })}
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
                    <Text className="font-semibold" style={{ color: colors.foreground }}>
                      {curr}
                    </Text>
                  </SmoothPressable>
                );
              })}
            </View>
          </View>

          {/* Theme Section */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Theme</Text>
            <View className="flex-row gap-2">
              {(['light', 'dark', 'system'] as const).map((theme) => {
                const selected = settings.theme === theme;
                return (
                  <SmoothPressable
                    key={theme}
                    onPress={() => updateSettings({ theme })}
                    className="flex-1"
                    dynamicStyle={({ pressed, hovered }) => [
                      {
                        paddingVertical: 10,
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
                      {theme}
                    </Text>
                  </SmoothPressable>
                );
              })}
            </View>
          </View>

          {/* Security Section */}
          <View className="gap-3 bg-surface rounded-lg p-4 border border-border">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-semibold text-foreground">Security Lock</Text>
              <Switch
                value={lockSettings.enabled}
                onValueChange={(value) => {
                  if (value) {
                    setShowLockSetup(true);
                  } else {
                    handleDisableLock();
                  }
                }}
                trackColor={{ false: colors.border, true: colors.success }}
                thumbColor={colors.background}
              />
            </View>

            {lockSettings.enabled && (
              <View className="text-xs text-muted">
                <Text>
                  Method: {lockSettings.method === 'both' ? 'Biometric + PIN' : lockSettings.method}
                </Text>
              </View>
            )}

            {showLockSetup && !lockSettings.enabled && (
              <View className="gap-3 mt-3 pt-3 border-t border-border">
                <TextInput
                  value={newPin}
                  onChangeText={setNewPin}
                  placeholder="Enter 4-digit PIN"
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={6}
                  className="bg-background rounded px-3 py-2 border border-border text-foreground"
                />
                <TextInput
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  placeholder="Confirm PIN"
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={6}
                  className="bg-background rounded px-3 py-2 border border-border text-foreground"
                />
                <View className="flex-row gap-2">
                  <SmoothPressable
                    onPress={handleSetupLock}
                    className="flex-1"
                    dynamicStyle={({ pressed, hovered }) => [
                      {
                        paddingVertical: 10,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: withAlpha(colors.primary, 0.3),
                        backgroundColor: withAlpha(colors.primary, hovered ? 0.4 : 0.3),
                        alignItems: 'center',
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Text className="font-semibold" style={{ color: colors.foreground }}>Enable</Text>
                  </SmoothPressable>
                  <SmoothPressable
                    onPress={() => setShowLockSetup(false)}
                    className="flex-1 py-2.5 rounded-full items-center border border-border"
                  >
                    <Text className="text-foreground font-semibold">Cancel</Text>
                  </SmoothPressable>
                </View>
              </View>
            )}
          </View>

          {/* Manage Section */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Manage</Text>

            <SmoothPressable
              onPress={() => router.push('/categories')}
              dynamicStyle={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              className="bg-surface rounded-2xl p-4 mb-3 shadow-sm flex-row justify-between items-center"
            >
              <View className="flex-row items-center gap-2">
                <Text className="text-lg">🏷️</Text>
                <Text className="font-semibold text-foreground">Categories</Text>
              </View>
              <IconSymbol size={20} name="chevron.right" color={colors.muted} />
            </SmoothPressable>

            <SmoothPressable
              onPress={() => router.push('/payment-methods')}
              dynamicStyle={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              className="bg-surface rounded-2xl p-4 mb-3 shadow-sm flex-row justify-between items-center"
            >
              <View className="flex-row items-center gap-2">
                <Text className="text-lg">💳</Text>
                <Text className="font-semibold text-foreground">Payment Methods</Text>
              </View>
              <IconSymbol size={20} name="chevron.right" color={colors.muted} />
            </SmoothPressable>
          </View>

          {/* Backup & Restore Section */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Backup & Restore</Text>

            <SmoothPressable
              onPress={handleBackupData}
              dynamicStyle={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              className="bg-surface rounded-2xl p-4 mb-3 shadow-sm flex-row justify-between items-center"
            >
              <View>
                <Text className="font-semibold text-foreground">Backup Data</Text>
                <Text className="text-xs text-muted mt-1">Save a backup file — survives reinstalling the app</Text>
              </View>
              <Text className="text-lg">→</Text>
            </SmoothPressable>

            <SmoothPressable
              onPress={handleRestoreData}
              dynamicStyle={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              className="bg-surface rounded-2xl p-4 mb-3 shadow-sm flex-row justify-between items-center"
            >
              <View>
                <Text className="font-semibold text-foreground">Restore Data</Text>
                <Text className="text-xs text-muted mt-1">Choose a backup file to restore</Text>
              </View>
              <Text className="text-lg">→</Text>
            </SmoothPressable>
          </View>

          {/* Data Management Section */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Data Management</Text>

            <SmoothPressable
              onPress={handleResetBalances}
              dynamicStyle={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              className="bg-warning/10 rounded-2xl p-4 mb-3 shadow-sm flex-row justify-between items-center"
            >
              <View>
                <Text className="font-semibold text-warning">Reset All Balances</Text>
                <Text className="text-xs text-warning/70 mt-1">Set every payment method to 0</Text>
              </View>
              <Text className="text-lg text-warning">→</Text>
            </SmoothPressable>

            <SmoothPressable
              onPress={handleClearData}
              dynamicStyle={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              className="bg-error/10 rounded-2xl p-4 shadow-sm flex-row justify-between items-center"
            >
              <View>
                <Text className="font-semibold text-error">Clear All Data</Text>
                <Text className="text-xs text-error/70 mt-1">Permanently delete everything</Text>
              </View>
              <Text className="text-lg text-error">→</Text>
            </SmoothPressable>
          </View>

          {/* About Section */}
          <View className="gap-2 bg-surface rounded-lg p-4 border border-border">
            <Text className="text-sm font-semibold text-foreground">About</Text>
            <View className="gap-1">
              <View className="flex-row justify-between">
                <Text className="text-xs text-muted">App Version</Text>
                <Text className="text-xs text-foreground font-semibold">1.0.0</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-muted">Offline First</Text>
                <Text className="text-xs text-success font-semibold">✓ Enabled</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
