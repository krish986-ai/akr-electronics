import React from 'react';
import { cn } from '@/lib/utils/cn';
import { inputVariants, focusRing } from '@/lib/design/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: keyof typeof inputVariants;
  icon?: React.ReactNode;
  error?: string;
  label?: string;
  helpText?: string;
}

export function Input({
  variant = 'default',
  icon,
  error,
  label,
  helpText,
  className,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-900 mb-1">
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">{icon}</div>}
        <input
          className={cn(
            'w-full px-4 py-2 text-base rounded-md transition-colors',
            inputVariants[variant],
            focusRing,
            icon && 'pl-10',
            error && 'border-error bg-red-50',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-error mt-1">{error}</p>}
      {helpText && !error && <p className="text-sm text-neutral-500 mt-1">{helpText}</p>}
    </div>
  );
}

export function TextArea({
  variant = 'default',
  error,
  label,
  helpText,
  className,
  ...props
}: Omit<InputProps, 'type'> & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-900 mb-1">
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <textarea
        className={cn(
          'w-full px-4 py-2 text-base rounded-md transition-colors resize-none',
          inputVariants[variant],
          focusRing,
          error && 'border-error bg-red-50',
          className
        )}
        {...(props as any)}
      />
      {error && <p className="text-sm text-error mt-1">{error}</p>}
      {helpText && !error && <p className="text-sm text-neutral-500 mt-1">{helpText}</p>}
    </div>
  );
}

export function SearchInput(props: Omit<InputProps, 'type'>) {
  return (
    <Input
      type="search"
      placeholder="Search..."
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      {...props}
    />
  );
}
