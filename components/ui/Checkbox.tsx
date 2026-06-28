import React from 'react';
import { cn } from '@/lib/utils/cn';
import { focusRing } from '@/lib/design/utils';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Checkbox({ label, error, className, ...props }: CheckboxProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="checkbox"
          className={cn(
            'w-5 h-5 rounded border-2 border-neutral-300 text-primary-500 transition-colors',
            'appearance-none cursor-pointer',
            'checked:bg-primary-500 checked:border-primary-500',
            focusRing,
            error && 'border-error',
            className
          )}
          {...props}
        />
        <svg
          className="absolute inset-0 w-5 h-5 text-white pointer-events-none hidden checked:block"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      {label && (
        <label className={cn('text-sm font-medium', error && 'text-error')}>
          {label}
        </label>
      )}
    </div>
  );
}
