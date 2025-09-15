'use client';

import { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    children,
    className = '',
    disabled,
    ...props
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-500 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md shadow-glass hover:shadow-glass-lg';

    const variantClasses = {
      primary: 'bg-primary-500/90 text-white hover:bg-primary-600 focus:ring-primary-500',
      secondary: 'bg-secondary-500/90 text-white hover:bg-secondary-600 focus:ring-secondary-500',
      accent: 'bg-accent-500/90 text-white hover:bg-accent-600 focus:ring-accent-500',
      danger: 'bg-danger-600/90 text-white hover:bg-danger-700 focus:ring-danger-500',
      outline: 'border border-text-300 bg-white/80 text-text-700 hover:bg-white/90 focus:ring-primary-500',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3.5 text-base',
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="mr-2 animate-spin">●</span>
        )}
        {LeftIcon && !loading && <LeftIcon className="h-4 w-4 mr-2" />}
        {children}
        {RightIcon && <RightIcon className="h-4 w-4 ml-2" />}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;