import React from 'react';
import { cn } from '@/lib/utils/cn';
import { focusRing } from '@/lib/design/utils';

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Radio({ label, className, ...props }: RadioProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="radio"
          className={cn(
            'w-5 h-5 rounded-full border-2 border-neutral-300 text-primary-500 transition-colors',
            'appearance-none cursor-pointer',
            'checked:border-primary-500',
            focusRing,
            className
          )}
          {...props}
        />
        <div className="absolute inset-1 rounded-full bg-primary-500 hidden checked:block" />
      </div>
      {label && (
        <label className="text-sm font-medium">
          {label}
        </label>
      )}
    </div>
  );
}

export function RadioGroup({ options, value, onChange, className, ...props }: { options: { label: string; value: string }[]; value?: string; onChange?: (value: string) => void } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-3', className)} {...props}>
      {options.map((option) => (
        <Radio
          key={option.value}
          label={option.label}
          value={option.value}
          checked={value === option.value}
          onChange={(e) => onChange?.(e.currentTarget.value)}
        />
      ))}
    </div>
  );
}
