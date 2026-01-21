
import { emitActivity, makeId, getCurrentUserNameSafe } from './activityNotifications';
import { ActivityStatus } from '../types';

/**
 * Exibe um toast de notificação usando o sistema global ActivityToastHost.
 * @param type Tipo de visualização ('success' | 'error' | 'info' | 'pending')
 * @param title Título curto da ação (ex: "Salvo")
 * @param message Mensagem detalhada
 */
export const showToast = (type: ActivityStatus, title: string, message: string) => {
    const id = makeId('toast');
    const userName = getCurrentUserNameSafe();

    emitActivity({
        id,
        kind: 'process',
        status: type,
        userName,
        action: title,
        detail: message,
        timestamp: Date.now(),
        progress: type === 'success' ? 100 : 0
    });
};
