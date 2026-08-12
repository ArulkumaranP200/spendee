import { useState } from 'react';
import { View } from 'react-native';
import { useColors } from '@/hooks/use-colors';

interface DateInputProps {
  /** ISO date string, e.g. "2026-08-11" */
  value: string;
  onChange: (value: string) => void;
}

export function DateInput({ value, onChange }: DateInputProps) {
  const colors = useColors();
  const [hovered, setHovered] = useState(false);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: hovered ? colors.primary : colors.border,
        borderWidth: 1,
        borderRadius: 12,
      }}
      // @ts-expect-error -- web-only DOM hover events, valid on react-native-web's View
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '12px',
          fontSize: 16,
          fontFamily: 'inherit',
          color: colors.foreground,
          backgroundColor: 'transparent',
          border: 'none',
          outline: 'none',
        }}
      />
    </View>
  );
}
