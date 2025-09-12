'use client';

import { HTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';

interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ className, size = 'md', ...props }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-b-2 border-primary-600',
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Loading({ text = 'Memuat...', size = 'md', className, ...props }: LoadingProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center space-y-2', className)}
      {...props}
    >
      <LoadingSpinner size={size} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
}