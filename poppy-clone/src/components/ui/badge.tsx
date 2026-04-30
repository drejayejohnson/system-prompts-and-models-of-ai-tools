import * as React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'pink' | 'blue' | 'green' | 'yellow' | 'slate';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-slate-100 text-slate-700': variant === 'default' || variant === 'slate',
          'bg-pink-100 text-pink-700': variant === 'pink',
          'bg-blue-100 text-blue-700': variant === 'blue',
          'bg-green-100 text-green-700': variant === 'green',
          'bg-yellow-100 text-yellow-700': variant === 'yellow',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
