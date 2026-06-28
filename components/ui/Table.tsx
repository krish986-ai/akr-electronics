import React from 'react';
import { cn } from '@/lib/utils/cn';

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full text-sm', className)} {...props} />
    </div>
  );
}

export function TableHead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn('bg-neutral-50 border-b border-neutral-200', className)} {...props} />
  );
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('[&_tr:last-child]:border-b-0', className)} {...props} />;
}

export function TableRow({ className, ...props }: React.TableHTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b border-neutral-200 hover:bg-neutral-50 transition-colors', className)} {...props} />;
}

export function TableHeader({ className, ...props }: React.TableHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn('text-left px-4 py-3 font-semibold text-neutral-900', className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.TableHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3 text-neutral-700', className)} {...props} />;
}
