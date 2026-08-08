import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
  className?: string;
}

export function SummaryCard({
  title,
  value,
  subtitle,
  variant = 'default',
  className,
}: SummaryCardProps) {
  const variantStyles = {
    default: 'border-border',
    success: 'border-success bg-success/5',
    error: 'border-error bg-error/5',
    warning: 'border-warning bg-warning/5',
  };

  const valueColorStyles = {
    default: 'text-foreground',
    success: 'text-success',
    error: 'text-error',
    warning: 'text-warning',
  };

  return (
    <View
      className={cn(
        'bg-surface rounded-lg p-4 border border-border',
        variantStyles[variant],
        className
      )}
    >
      <Text className="text-sm text-muted font-medium mb-1">{title}</Text>
      <Text className={cn('text-2xl font-bold', valueColorStyles[variant])}>
        {value}
      </Text>
      {subtitle && <Text className="text-xs text-muted mt-1">{subtitle}</Text>}
    </View>
  );
}
