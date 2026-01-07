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

  if (items.length === 0) {return null;}

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
    pending: { icon: 'fa-circle-notch fa-spin', label: kind === 'upload' ? 'Enviando' : 'Processando', color: 'text-blue-500', bg: 'bg-white/95' },
    success: { icon: 'fa-check-circle', label: kind === 'upload' ? 'Enviado' : 'Concluído', color: 'text-emerald-500', bg: 'bg-white/95' },
    error: { icon: 'fa-exclamation-triangle', label: 'Falhou', color: 'text-red-600', bg: 'bg-red-50/95' },
    info: { icon: 'fa-info-circle', label: 'Info', color: 'text-zinc-600', bg: 'bg-white/95' }
  }[status];

  return (
    <div className={`w-full pointer-events-auto animate-fadeInUp shadow-2xl rounded-2xl border border-zinc-200/50 backdrop-blur-md overflow-hidden transition-all duration-300 ${config.bg}`}>
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div className={`mt-1 shrink-0 ${config.color}`}><i className={`fas ${config.icon} text-lg`}></i></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 truncate">
                {config.label} • {userName}
              </span>
              <button onClick={onClose} className="text-zinc-300 hover:text-red-500 transition-colors"><i className="fas fa-times text-xs"></i></button>
            </div>
            <p className="text-[11px] font-bold text-zinc-800 leading-tight truncate mt-0.5">{action} {detail && <span className="text-zinc-400 italic font-medium ml-1">({detail})</span>}</p>
            {kind === 'upload' && status === 'pending' && typeof progress === 'number' && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between items-center text-[9px] font-black text-zinc-500 uppercase">
                  <span>{Math.round(progress)}% Concluído</span>
                  {elapsedMs && <span>Tempo: {formatElapsed(elapsedMs)}</span>}
                </div>
                <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={`h-1 w-full opacity-30 ${config.color.replace('text-', 'bg-')}`}></div>
    </div>
  );
};

export default ActivityToastHost;