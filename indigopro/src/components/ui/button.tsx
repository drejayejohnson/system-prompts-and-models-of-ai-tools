'use client';

import * as React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm': variant === 'primary',
            'bg-slate-100 text-slate-700 hover:bg-slate-200': variant === 'secondary',
            'hover:bg-slate-100 text-slate-700': variant === 'ghost',
            'bg-red-500 text-white hover:bg-red-600': variant === 'danger',
            'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50': variant === 'outline',
            'px-2.5 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
            'p-2 w-9 h-9': size === 'icon',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
