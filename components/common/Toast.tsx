
import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-green-600 border-green-400 text-white',
    error: 'bg-red-600 border-red-400 text-white',
    warning: 'bg-amber-500 border-amber-300 text-white',
    info: 'bg-blue-600 border-blue-400 text-white',
  };

  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border-2 animate-slideInRight max-w-sm ${styles[type]}`}>
      <i className={`fas ${icons[type]} text-xl`}></i>
      <p className="text-xs font-black uppercase tracking-widest leading-tight flex-1">{message}</p>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity">
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default Toast;
