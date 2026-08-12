import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { BarChart } from '@/components/ui/bar-chart';
import { formatCurrency } from '@/lib/finance-utils';
import { useColors } from '@/hooks/use-colors';

interface ExpenseTrendCardProps {
  data: { label: string; value: number }[];
  currency: string;
}

/**
 * Weekly spending bar chart for the current month. The outer Animated.View
 * carries no className of its own — nativewind silently drops className on
 * a standalone (non-list) Animated.View, so all visual styling lives on the
 * plain inner View instead (see the same fix applied across app/*.tsx).
 */
export function ExpenseTrendCard({ data, currency }: ExpenseTrendCardProps) {
  const colors = useColors();
  const hasData = data.some((d) => d.value > 0);

  return (
    <Animated.View entering={FadeIn.duration(350)}>
      <View className="bg-surface rounded-2xl p-4 shadow-sm gap-4">
        <Text className="text-sm font-semibold text-foreground">Spending Trend</Text>
        {hasData ? (
          <BarChart
            data={data}
            color={colors.error}
            trackColor={colors.border}
            valueFormatter={(v) => formatCurrency(v, currency)}
          />
        ) : (
          <Text className="text-sm text-muted">No expenses recorded this month</Text>
        )}
      </View>
    </Animated.View>
  );
}
