import React from 'react';
import { cn } from '@/lib/utils/cn';
import { focusRing } from '@/lib/design/utils';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Switch({ label, className, ...props }: SwitchProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={props.checked}
        className={cn(
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors',
          'bg-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          props.checked && 'bg-primary-500',
          focusRing,
          className
        )}
        onClick={() => {
          const input = document.getElementById(props.id || '') as HTMLInputElement;
          if (input) input.click();
        }}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-white transition-transform',
            props.checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
      <input type="checkbox" {...props} className="hidden" />
      {label && <label className="text-sm font-medium">{label}</label>}
    </div>
  );
}
