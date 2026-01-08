import React, { useState, useEffect, useCallback } from 'react';
import {
  subscribeActivity,
  ActivityEvent,
  formatElapsed
} from '../../services/activityNotifications';

/**
 * ESTÁGIO 2 — UI DO POP-UP INFERIOR (HOST GLOBAL)
 */
const ActivityToastHost: React.FC = () => {
  const [items, setItems] = useState<ActivityEvent[]>([]);
  const MAX_TOASTS = 4;

  const removeToast = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeActivity((event) => {
      setItems(prev => {
        const index = prev.findIndex(item => item.id === event.id);
        let nextItems = [...prev];
        if (index > -1) {
          nextItems[index] = event;
        } else {
          nextItems = [event, ...nextItems];
        }
        return nextItems.slice(0, MAX_TOASTS);
      });

      if (event.status !== 'pending') {
        setTimeout(() => removeToast(event.id), 6500);
      }
    });
    return () => unsubscribe();
  }, [removeToast]);

  if (items.length === 0) { return null; }

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-[400px] px-4 pointer-events-none space-y-2 flex flex-col items-center">
      {items.map((item) => (
        <ToastItem key={item.id} item={item} onClose={() => removeToast(item.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ item: ActivityEvent; onClose: () => void }> = ({ item, onClose }) => {
  const { status, kind, userName, action, detail, progress, elapsedMs } = item;

  const config = {
    pending: { icon: 'fa-circle-notch fa-spin', label: kind === 'upload' ? 'ENVIANDO MÍDIA' : 'PROCESSANDO', color: 'text-blue-600', bg: 'bg-white border-blue-100' },
    success: { icon: 'fa-check-circle', label: kind === 'upload' ? 'UPLOAD CONCLUÍDO' : 'SUCESSO', color: 'text-green-600', bg: 'bg-white border-green-100' },
    error: { icon: 'fa-times-circle', label: 'FALHA NO PROCESSO', color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
    info: { icon: 'fa-info-circle', label: 'INFORMAÇÃO', color: 'text-zinc-600', bg: 'bg-white border-zinc-100' }
  }[status];

  return (
    <div className={`w-full pointer-events-auto animate-slideUp shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-3xl border overflow-hidden transition-all duration-500 hover:scale-[1.02] ${config.bg}`}>
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-4">
          <div className={`mt-1 shrink-0 ${config.color} text-2xl drop-shadow-sm`}><i className={`fas ${config.icon}`}></i></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] truncate ${config.color} opacity-80`}>
                {config.label}
              </span>
              <button onClick={onClose} className="text-zinc-300 hover:text-zinc-500 transition-colors bg-zinc-50 hover:bg-zinc-100 w-6 h-6 rounded-full flex items-center justify-center"><i className="fas fa-times text-[10px]"></i></button>
            </div>

            <p className="text-sm font-bold text-zinc-900 leading-snug truncate mb-3">
              {action}
              {detail && <span className="text-zinc-500 font-medium text-xs ml-1.5 border-l border-zinc-200 pl-1.5">{detail}</span>}
            </p>

            {kind === 'upload' && status === 'pending' && typeof progress === 'number' && (
              <div className="space-y-2 relative">
                <div className="flex justify-between items-end text-[9px] font-black text-zinc-400 uppercase tracking-wider">
                  <span>{Math.round(progress)}%</span>
                  {elapsedMs && <span>{formatElapsed(elapsedMs)}</span>}
                </div>
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700 ease-out relative" style={{ width: `${progress}%` }}>
                    <div className="absolute inset-0 bg-white/30 animate-pulse w-full"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {(status === 'success' || status === 'error') && (
        <div className={`h-1 w-full ${status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
      )}
    </div>
  );
};

export default ActivityToastHost;