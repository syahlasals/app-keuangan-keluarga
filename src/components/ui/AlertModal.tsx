
import React from 'react';

interface AlertModalProps {
  open: boolean;
  type: 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  onClose: () => void;
}

const typeConfig = {
  success: {
    color: 'bg-accent-100 text-accent-500',
    icon: (
      <svg className="w-14 h-14 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="10" className="text-accent-200" fill="currentColor" opacity="0.2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" className="text-accent-500" />
      </svg>
    ),
    title: 'Sukses',
  },
  warning: {
    color: 'bg-yellow-100 text-yellow-600',
    icon: (
      <svg className="w-14 h-14 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="10" className="text-yellow-200" fill="currentColor" opacity="0.2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" className="text-yellow-500" />
      </svg>
    ),
    title: 'Peringatan',
  },
  error: {
    color: 'bg-danger-100 text-danger-600',
    icon: (
      <svg className="w-14 h-14 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="10" className="text-danger-200" fill="currentColor" opacity="0.2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9l-6 6m0-6l6 6" className="text-danger-500" />
      </svg>
    ),
    title: 'Gagal',
  },
};

const AlertModal: React.FC<AlertModalProps> = ({ open, type, title, message, onClose }) => {
  if (!open) return null;
  const config = typeConfig[type];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className={`glass-card max-w-xs w-full p-7 rounded-2xl shadow-glass-lg border-0 text-center relative ${config.color} animate-fadeInUp`}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-2xl text-text-400 hover:text-text-700 focus:outline-none"
          aria-label="Tutup"
        >
          ×
        </button>
        <div className="flex flex-col items-center">
          {config.icon}
          <h3 className="font-semibold text-xl mb-1 mt-1">{title || config.title}</h3>
          <div className="text-base mb-4 text-text-700">{message}</div>
        </div>
        {/* Button Tutup dihilangkan, modal akan tertutup otomatis */}
      </div>
    </div>
  );
};

export default AlertModal;
