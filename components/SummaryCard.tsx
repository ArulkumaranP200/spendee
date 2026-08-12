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
    default: 'bg-primary/5',
    success: 'bg-success/10',
    error: 'bg-error/10',
    warning: 'bg-warning/10',
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
        'rounded-2xl px-4 py-5 items-center shadow-sm',
        variantStyles[variant],
        className
      )}
    >
      <Text className="text-xs text-muted font-semibold tracking-wide uppercase mb-1">
        {title}
      </Text>
      <Text className={cn('text-2xl font-bold', valueColorStyles[variant])}>
        {value}
      </Text>
      {subtitle && <Text className="text-xs text-muted mt-1">{subtitle}</Text>}
    </View>
  );
}
