import { cn } from '@/lib/utils/cn';
import { badgeVariants } from '@/lib/design/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export function Badge({ variant = 'neutral', size = 'md', icon, className, children, ...props }: BadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium rounded',
    md: 'px-3 py-1 text-sm font-medium rounded-full',
  };

  return (
    <span className={cn(badgeVariants[variant], sizeClasses[size], 'inline-flex items-center gap-1', className)} {...props}>
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
}

export function Chip({ variant = 'neutral', icon, onRemove, children }: BadgeProps & { onRemove?: () => void }) {
  return (
    <span className={cn(badgeVariants[variant], 'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium')}>
      {icon && <span>{icon}</span>}
      {children}
      {onRemove && (
        <button onClick={onRemove} className="ml-1 hover:opacity-70 transition-opacity">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  );
}
