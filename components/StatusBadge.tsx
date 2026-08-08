import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'paid' | 'unpaid' | 'settled' | 'partial' | 'outstanding' | 'excluded';
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({ status, size = 'sm', className }: StatusBadgeProps) {
  const styles = {
    paid: { bg: 'bg-success/10', text: 'text-success', label: 'Paid' },
    unpaid: { bg: 'bg-warning/10', text: 'text-warning', label: 'Unpaid' },
    settled: { bg: 'bg-success/10', text: 'text-success', label: 'Settled' },
    partial: { bg: 'bg-warning/10', text: 'text-warning', label: 'Partial' },
    outstanding: { bg: 'bg-error/10', text: 'text-error', label: 'Outstanding' },
    excluded: { bg: 'bg-accent/10', text: 'text-accent', label: 'Excluded' },
  };

  const style = styles[status];
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm';

  return (
    <View className={cn('rounded-full', style.bg, sizeClasses, className)}>
      <Text className={cn('font-semibold', style.text)}>{style.label}</Text>
    </View>
  );
}
