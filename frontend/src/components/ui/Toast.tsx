import React from 'react';
import { useToastStore, ToastItem } from '../../store/toastStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

interface ToastCardProps {
  toast: ToastItem;
  onClose: () => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onClose }) => {
  const getColors = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200';
      case 'error':
        return 'bg-rose-950/80 border-rose-500/30 text-rose-200';
      case 'info':
      default:
        return 'bg-slate-900/80 border-blue-500/30 text-blue-200';
    }
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex items-center justify-between p-4 rounded-lg border backdrop-blur-md shadow-xl transition-all duration-300 transform translate-y-0 scale-100 ${getColors()}`}
    >
      <div className="flex items-center gap-3">
        {toast.type === 'success' && (
          <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {toast.type === 'error' && (
          <svg className="w-5 h-5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
        {toast.type === 'info' && (
          <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        aria-label="Close notification"
        className="ml-4 text-slate-400 hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
