import { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from './icon-symbol';
import { SmoothPressable } from './smooth-pressable';

interface DateInputProps {
  /** ISO date string, e.g. "2026-08-11" */
  value: string;
  onChange: (value: string) => void;
}

export function DateInput({ value, onChange }: DateInputProps) {
  const colors = useColors();
  const [show, setShow] = useState(false);
  const dateObj = value ? new Date(value) : new Date();

  return (
    <View>
      <SmoothPressable
        onPress={() => setShow(true)}
        dynamicStyle={({ hovered }) => [
          {
            justifyContent: 'space-between',
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 12,
            borderWidth: 1,
            backgroundColor: colors.surface,
            borderColor: hovered ? colors.primary : colors.border,
          },
        ]}
      >
        <Text className="text-foreground text-base">{value || 'Select date'}</Text>
        <IconSymbol name="calendar" size={18} color={colors.muted} />
      </SmoothPressable>
      {show && (
        <DateTimePicker
          value={dateObj}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(event, selectedDate) => {
            setShow(Platform.OS === 'ios' && event.type !== 'dismissed');
            if (event.type !== 'dismissed' && selectedDate) {
              onChange(selectedDate.toISOString().split('T')[0]);
            }
          }}
        />
      )}
    </View>
  );
}
