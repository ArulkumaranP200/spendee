import React from 'react';
import { View, Text } from 'react-native';

export interface BarChartDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartDatum[];
  color: string;
  trackColor: string;
  height?: number;
  valueFormatter?: (value: number) => string;
}

/**
 * Minimal vertical bar chart built from plain Views (no SVG needed for
 * straight rectangles) — bar heights are relative to the largest value.
 */
export function BarChart({ data, color, trackColor, height = 100, valueFormatter }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 0);

  return (
    <View className="flex-row items-end gap-2">
      {data.map((d) => {
        const barHeight = max > 0 && d.value > 0 ? Math.max((d.value / max) * height, 4) : 0;
        return (
          <View key={d.label} className="flex-1 items-center gap-1">
            <Text className="text-[9px] text-muted" numberOfLines={1}>
              {d.value > 0 && valueFormatter ? valueFormatter(d.value) : ' '}
            </Text>
            <View
              className="w-full items-center justify-end"
              style={{ height, backgroundColor: trackColor, borderRadius: 6, overflow: 'hidden' }}
            >
              <View
                style={{
                  width: '100%',
                  height: barHeight,
                  backgroundColor: color,
                  borderRadius: 6,
                }}
              />
            </View>
            <Text className="text-[10px] text-muted" numberOfLines={1}>
              {d.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
