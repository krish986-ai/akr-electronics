import React from 'react';
import { cn } from '@/lib/utils/cn';

interface PriceProps {
  amount: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  original?: number;
  highlight?: boolean;
  className?: string;
}

export function Price({
  amount,
  currency = '₹',
  size = 'md',
  original,
  highlight = false,
  className,
}: PriceProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-bold',
  };

  const discount = original ? Math.round(((original - amount) / original) * 100) : 0;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('font-semibold', sizeClasses[size], highlight && 'text-primary-600')}>
        {currency}
        {amount.toLocaleString('en-IN')}
      </span>
      {original && (
        <>
          <span className="text-sm text-neutral-500 line-through">
            {currency}
            {original.toLocaleString('en-IN')}
          </span>
          {discount > 0 && (
            <span className="text-sm font-medium text-secondary-600 bg-secondary-50 px-2 py-0.5 rounded">
              -{discount}%
            </span>
          )}
        </>
      )}
    </div>
  );
}

export function PriceRange({
  min,
  max,
  currency = '₹',
}: {
  min: number;
  max: number;
  currency?: string;
}) {
  return (
    <span className="text-neutral-600">
      {currency}
      {min.toLocaleString('en-IN')} - {currency}
      {max.toLocaleString('en-IN')}
    </span>
  );
}
