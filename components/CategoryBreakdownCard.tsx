import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { DonutChart } from '@/components/ui/donut-chart';
import { formatCurrency } from '@/lib/finance-utils';
import { getChartCategoricalPalette } from '@/constants/chart-colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CategoryBreakdownCardProps {
  title: string;
  breakdown: Record<string, number>;
  currency: string;
  emptyMessage?: string;
  accentVariant?: 'success' | 'error';
}

const MAX_SLICES = 6;

/**
 * Donut chart + legend for a category breakdown. Folds anything past the
 * top 6 categories into "Other" so the palette never has to stretch past
 * its validated 8-slot categorical order.
 */
export function CategoryBreakdownCard({
  title,
  breakdown,
  currency,
  emptyMessage = 'No data yet',
  accentVariant = 'error',
}: CategoryBreakdownCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = getChartCategoricalPalette(scheme);

  const entries = Object.entries(breakdown)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1]);

  const top = entries.slice(0, MAX_SLICES);
  const rest = entries.slice(MAX_SLICES);
  const otherTotal = rest.reduce((sum, [, value]) => sum + value, 0);

  const slices = [
    ...top.map(([label, value], i) => ({ label, value, color: palette[i % palette.length] })),
    ...(otherTotal > 0
      ? [{ label: 'Other', value: otherTotal, color: palette[top.length % palette.length] }]
      : []),
  ];

  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const valueTextClass = accentVariant === 'success' ? 'text-success' : 'text-error';

  return (
    <Animated.View
      entering={FadeIn.duration(350)}
      className="bg-surface rounded-lg p-4 border border-border gap-4"
    >
      <Text className="text-sm font-semibold text-foreground">{title}</Text>

      {total > 0 ? (
        <View className="flex-row items-center gap-4">
          <View style={{ width: 120, height: 120, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'absolute', top: 0, left: 0 }}>
              <DonutChart data={slices} size={120} strokeWidth={18} />
            </View>
            <View className="items-center">
              <Text className="text-xs text-muted">Total</Text>
              <Text className={`text-sm font-bold ${valueTextClass}`} numberOfLines={1}>
                {formatCurrency(total, currency)}
              </Text>
            </View>
          </View>

          <View className="flex-1 gap-2">
            {slices.map((slice) => {
              const pct = total > 0 ? (slice.value / total) * 100 : 0;
              return (
                <View key={slice.label} className="flex-row items-center gap-2">
                  <View
                    style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: slice.color }}
                  />
                  <Text className="flex-1 text-xs text-foreground" numberOfLines={1}>
                    {slice.label}
                  </Text>
                  <Text className="text-xs font-semibold text-muted">{pct.toFixed(0)}%</Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <Text className="text-sm text-muted">{emptyMessage}</Text>
      )}
    </Animated.View>
  );
}
