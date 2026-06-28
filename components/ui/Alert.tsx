import React from 'react';
import { cn } from '@/lib/utils/cn';

type AlertVariant = 'success' | 'warning' | 'error' | 'info';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  icon?: React.ReactNode;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  children: React.ReactNode;
}

const variantClasses: Record<AlertVariant, string> = {
  success: 'bg-green-50 border border-green-200 text-green-900',
  warning: 'bg-yellow-50 border border-yellow-200 text-yellow-900',
  error: 'bg-red-50 border border-red-200 text-red-900',
  info: 'bg-blue-50 border border-blue-200 text-blue-900',
};

export function Alert({
  variant = 'info',
  icon,
  title,
  dismissible = false,
  onDismiss,
  children,
  className,
}: AlertProps) {
  const [isDismissed, setIsDismissed] = React.useState(false);

  if (isDismissed) return null;

  return (
    <div className={cn('rounded-lg p-4', variantClasses[variant], className)}>
      <div className="flex gap-3">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <div className="flex-1">
          {title && <h3 className="font-semibold mb-1">{title}</h3>}
          <div className="text-sm">{children}</div>
        </div>
        {dismissible && (
          <button
            onClick={() => {
              setIsDismissed(true);
              onDismiss?.();
            }}
            className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export function Banner({ variant = 'info', children, className }: Omit<AlertProps, 'onDismiss' | 'dismissible' | 'title'>) {
  return (
    <div className={cn('w-full px-4 py-3 text-center text-sm font-medium', variantClasses[variant], className)}>
      {children}
    </div>
  );
}
