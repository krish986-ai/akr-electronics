import React from 'react';
import { useForm, SubmitHandler, FieldValues, UseFormProps as RHFProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

interface FormProps<T extends FieldValues> extends Omit<RHFProps<T>, 'resolver'> {
  schema: ZodSchema;
  onSubmit: SubmitHandler<T>;
  children: React.ReactNode;
  submitLabel?: string;
  isLoading?: boolean;
  className?: string;
}

export function Form<T extends FieldValues>({
  schema,
  onSubmit,
  children,
  submitLabel = 'Submit',
  isLoading = false,
  className,
  ...props
}: FormProps<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(schema),
    ...props,
  });

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)} className={cn('space-y-4', className)}>
      <FormProvider {...methods}>
        {children}
      </FormProvider>
      <Button type="submit" fullWidth isLoading={isLoading}>
        {submitLabel}
      </Button>
    </form>
  );
}

export function FormProvider({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}

interface FormFieldProps {
  name: string;
  label?: string;
  children: (props: any) => React.ReactNode;
}

export function FormField({ name, label, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      {children({ name })}
    </div>
  );
}
