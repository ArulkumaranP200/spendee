/**
 * System Lock Screen - Biometric + PIN Authentication
 */

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useLockSettings } from '@/lib/finance-context';
import { cn } from '@/lib/utils';

type LockMode = 'biometric' | 'pin' | 'setup';

export default function LockScreen() {
  const router = useRouter();
  const { lockSettings, updateLockSettings } = useLockSettings();
  const [mode, setMode] = useState<LockMode>('biometric');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Check biometric availability on mount
  useEffect(() => {
    const checkBiometric = async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        if (compatible) {
          const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
          setBiometricAvailable(true);
          if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            setBiometricType('Face ID');
          } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            setBiometricType('Fingerprint');
          }
        }
      } catch (error) {
        console.error('Error checking biometric:', error);
      }
    };

    checkBiometric();
  }, []);

  // Auto-attempt biometric if enabled and available
  useEffect(() => {
    if (lockSettings.enabled && lockSettings.biometricEnabled && biometricAvailable) {
      attemptBiometric();
    }
  }, [biometricAvailable, lockSettings.enabled, lockSettings.biometricEnabled]);

  const attemptBiometric = async () => {
    if (!biometricAvailable) return;

    setIsLoading(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: false,
      });

      if (result.success) {
        updateLockSettings({
          lastUnlocked: new Date().toISOString(),
        });
        router.replace('/(tabs)');
      } else if (!result.success) {
        // User cancelled or failed - show PIN fallback
        if (lockSettings.method === 'both' || lockSettings.method === 'pin') {
          setMode('pin');
        }
      }
    } catch (error) {
      console.error('Biometric error:', error);
      if (lockSettings.method === 'both' || lockSettings.method === 'pin') {
        setMode('pin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePINSubmit = async () => {
    if (pin.length < 4) {
      Alert.alert('Invalid PIN', 'PIN must be at least 4 digits');
      return;
    }

    setIsLoading(true);
    try {
      // Simple PIN verification (in production, use secure hashing)
      if (pin === lockSettings.pin) {
        updateLockSettings({
          lastUnlocked: new Date().toISOString(),
        });
        router.replace('/(tabs)');
      } else {
        Alert.alert('Incorrect PIN', 'Please try again');
        setPin('');
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      Alert.alert('Error', 'Failed to verify PIN');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow skip if lock is not mandatory (for setup flow)
    if (!lockSettings.enabled) {
      router.replace('/(tabs)');
    }
  };

  // If lock is disabled, skip to main app
  if (!lockSettings.enabled) {
    useEffect(() => {
      router.replace('/(tabs)');
    }, []);
    return null;
  }

  return (
    <ScreenContainer className="bg-gradient-to-b from-primary/10 to-background">
      <View className="flex-1 justify-center items-center px-6">
        {/* Header */}
        <View className="mb-12 items-center">
          <Text className="text-4xl font-bold text-foreground mb-2">Spendee</Text>
          <Text className="text-base text-muted">Secure Access</Text>
        </View>

        {/* Biometric Mode */}
        {mode === 'biometric' && biometricAvailable && (
          <View className="w-full gap-6">
            <View className="items-center gap-4">
              <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center">
                <Text className="text-5xl">🔒</Text>
              </View>
              <Text className="text-lg font-semibold text-foreground text-center">
                Use {biometricType} to Unlock
              </Text>
            </View>

            <Pressable
              onPress={attemptBiometric}
              disabled={isLoading}
              style={({ pressed }) => [
                {
                  backgroundColor: pressed ? '#0a6a8a' : '#0a7ea4',
                  opacity: isLoading ? 0.6 : 1,
                },
              ]}
              className="py-4 px-6 rounded-full items-center"
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-lg">Unlock</Text>
              )}
            </Pressable>

            {lockSettings.method === 'both' && (
              <Pressable
                onPress={() => setMode('pin')}
                className="py-3 px-6 rounded-full items-center border border-border"
              >
                <Text className="text-foreground font-semibold">Use PIN Instead</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* PIN Mode */}
        {mode === 'pin' && (
          <View className="w-full gap-6">
            <View className="items-center gap-4">
              <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center">
                <Text className="text-5xl">🔐</Text>
              </View>
              <Text className="text-lg font-semibold text-foreground text-center">
                Enter Your PIN
              </Text>
            </View>

            <TextInput
              value={pin}
              onChangeText={setPin}
              placeholder="Enter 4-digit PIN"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              editable={!isLoading}
              className={cn(
                'w-full px-4 py-4 rounded-lg border-2 text-center text-2xl font-bold',
                'bg-surface text-foreground border-border',
                'focus:border-primary'
              )}
            />

            <Pressable
              onPress={handlePINSubmit}
              disabled={isLoading || pin.length < 4}
              style={({ pressed }) => [
                {
                  backgroundColor:
                    pin.length < 4 ? '#ccc' : pressed ? '#0a6a8a' : '#0a7ea4',
                  opacity: isLoading ? 0.6 : 1,
                },
              ]}
              className="py-4 px-6 rounded-full items-center"
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-lg">Unlock</Text>
              )}
            </Pressable>

            {biometricAvailable && lockSettings.method === 'both' && (
              <Pressable
                onPress={() => setMode('biometric')}
                className="py-3 px-6 rounded-full items-center border border-border"
              >
                <Text className="text-foreground font-semibold">Use {biometricType}</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Setup Mode (if lock not yet configured) */}
        {mode === 'setup' && (
          <View className="w-full gap-6">
            <Text className="text-lg font-semibold text-foreground text-center">
              Set Up Security
            </Text>
            <Pressable
              onPress={handleSkip}
              className="py-3 px-6 rounded-full items-center border border-border"
            >
              <Text className="text-foreground font-semibold">Skip for Now</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
