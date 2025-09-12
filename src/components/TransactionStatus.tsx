'use client';

import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface TransactionStatusProps {
  status: 'pending' | 'success' | 'error';
  size?: 'sm' | 'md';
  showText?: boolean;
}

export default function TransactionStatus({
  status,
  size = 'sm',
  showText = false
}: TransactionStatusProps) {
  const config = {
    pending: {
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      text: 'Pending',
    },
    success: {
      icon: CheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
      text: 'Berhasil',
    },
    error: {
      icon: AlertCircle,
      color: 'text-danger-600',
      bgColor: 'bg-danger-100',
      text: 'Gagal',
    },
  };

  const { icon: Icon, color, bgColor, text } = config[status];
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  if (showText) {
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${color}`}>
        <Icon className={`${iconSize} mr-1`} />
        {text}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center justify-center p-1 rounded-full ${bgColor}`}>
      <Icon className={`${iconSize} ${color}`} />
    </div>
  );
}