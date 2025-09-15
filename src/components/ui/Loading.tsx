import React from 'react';
import { cn } from '@/utils/helpers';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  className,
  text = 'Loading...'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-4 border-text-200 border-t-primary-500 backdrop-blur-md shadow-glass',
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="text-sm text-text-600 bg-white/70 px-3 py-1 rounded-full backdrop-blur-md shadow-glass">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loading;