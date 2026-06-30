'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface RatingProps {
  value: number;
  max?: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showCount?: boolean;
  count?: number;
}

export function Rating({
  value,
  max = 5,
  onChange,
  size = 'md',
  readonly = false,
  showCount = false,
  count,
}: RatingProps) {
  const [hoverValue, setHoverValue] = React.useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const displayValue = hoverValue || value;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <button
            key={i}
            onClick={() => !readonly && onChange?.(i + 1)}
            onMouseEnter={() => !readonly && setHoverValue(i + 1)}
            onMouseLeave={() => setHoverValue(0)}
            disabled={readonly}
            className={cn('transition-colors', !readonly && 'cursor-pointer hover:scale-110')}
          >
            <svg
              className={cn(
                sizeClasses[size],
                i < displayValue ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300 fill-neutral-300'
              )}
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
      {showCount && (
        <span className="text-sm text-neutral-600">
          {value.toFixed(1)} {count && `(${count})`}
        </span>
      )}
    </div>
  );
}
