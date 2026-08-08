import { cn } from '@/lib/utils/cn';
import { focusRing } from '@/lib/design/utils';

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Radio({ label, className, ...props }: RadioProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input
          type="radio"
          className={cn(
            'peer w-5 h-5 rounded-full border-2 border-neutral-300 text-primary-500 transition-colors',
            'appearance-none cursor-pointer',
            focusRing,
            className
          )}
          {...props}
        />
        <div className="absolute inset-0 m-auto w-2.5 h-2.5 rounded-full bg-primary-500 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
      </div>
      {label && <span className="text-sm font-medium">{label}</span>}
    </label>
  );
}

interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: { label: string; value: string }[];
  value?: string;
  onChange?: (value: string) => void;
}

export function RadioGroup({ options, value, onChange, className, ...props }: RadioGroupProps) {
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
