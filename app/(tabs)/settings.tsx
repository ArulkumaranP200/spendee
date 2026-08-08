import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Switch, Alert, TextInput } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useSettings } from '@/lib/finance-context';
import { useLockSettings } from '@/lib/finance-context';
import { useFinance } from '@/lib/finance-context';
import { exportAllData, clearAllData } from '@/lib/storage';
import { useColors } from '@/hooks/use-colors';
import * as Clipboard from 'expo-clipboard';

const CURRENCY_OPTIONS = ['$', '€', '₹', '£', '¥', '₽'];

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();
  const { lockSettings, updateLockSettings } = useLockSettings();
  const { dispatch } = useFinance();
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

  const handleExportData = async () => {
    try {
      const data = await exportAllData();
      await Clipboard.setStringAsync(data);
      Alert.alert('Success', 'Data copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
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
                    dispatch({ type: 'SET_TRANSACTIONS', payload: [] });
                    dispatch({ type: 'SET_LEDGER_ENTRIES', payload: [] });
                    dispatch({ type: 'SET_BUDGETS', payload: [] });
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
              {CURRENCY_OPTIONS.map((curr) => (
                <Pressable
                  key={curr}
                  onPress={() => updateSettings({ currency: curr })}
                  style={({ pressed }) => [
                    {
                      backgroundColor: settings.currency === curr ? colors.primary : colors.surface,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  className="px-4 py-2 rounded-full border border-border"
                >
                  <Text
                    className={`font-semibold ${
                      settings.currency === curr ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {curr}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Theme Section */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Theme</Text>
            <View className="flex-row gap-2">
              {(['light', 'dark', 'system'] as const).map((theme) => (
                <Pressable
                  key={theme}
                  onPress={() => updateSettings({ theme })}
                  style={({ pressed }) => [
                    {
                      backgroundColor: settings.theme === theme ? colors.primary : colors.surface,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  className="flex-1 py-2 rounded-lg border border-border items-center"
                >
                  <Text
                    className={`font-semibold capitalize ${
                      settings.theme === theme ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {theme}
                  </Text>
                </Pressable>
              ))}
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
                  <Pressable
                    onPress={handleSetupLock}
                    style={({ pressed }) => [
                      {
                        backgroundColor: pressed ? '#1a3a7a' : '#1e40af',
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                    className="flex-1 py-2 rounded items-center"
                  >
                    <Text className="text-white font-semibold">Enable</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setShowLockSetup(false)}
                    className="flex-1 py-2 rounded items-center border border-border"
                  >
                    <Text className="text-foreground font-semibold">Cancel</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          {/* Data Section */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Data</Text>

            <Pressable
              onPress={handleExportData}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              className="bg-surface rounded-lg p-4 border border-border flex-row justify-between items-center"
            >
              <View>
                <Text className="font-semibold text-foreground">Export Data</Text>
                <Text className="text-xs text-muted mt-1">Copy all data to clipboard</Text>
              </View>
              <Text className="text-lg">→</Text>
            </Pressable>

            <Pressable
              onPress={handleClearData}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              className="bg-error/10 rounded-lg p-4 border border-error flex-row justify-between items-center"
            >
              <View>
                <Text className="font-semibold text-error">Clear All Data</Text>
                <Text className="text-xs text-error/70 mt-1">Permanently delete everything</Text>
              </View>
              <Text className="text-lg text-error">→</Text>
            </Pressable>
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
