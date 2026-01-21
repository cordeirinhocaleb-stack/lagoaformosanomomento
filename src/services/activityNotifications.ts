
/**
 * ESTÁGIO 1 — BUS GLOBAL DE ATIVIDADE
 * Sistema de mensageria interno para rastreamento de operações assíncronas.
 */

// Fix: Import types from global types file
import { ActivityKind, ActivityStatus } from '../types';

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  status: ActivityStatus;
  userName?: string;
  action: string;
  detail?: string;
  timestamp: number;
  progress?: number; // 0-100
  elapsedMs?: number;
}

type ActivityListener = (event: ActivityEvent) => void;

const listeners: Set<ActivityListener> = new Set();

/**
 * Registra um novo interessado nos eventos de atividade.
 */
export const subscribeActivity = (listener: ActivityListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/**
 * Emite um evento para todos os componentes inscritos.
 */
export const emitActivity = (event: ActivityEvent) => {
  try {
    listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (innerError) {
        console.error('[ActivityBus] Error in specific listener:', innerError);
      }
    });
  } catch (error) {
    console.error('[ActivityBus] Critical error emitting activity:', error);
  }
};

/**
 * Recupera o nome do usuário logado de forma segura.
 */
export const getCurrentUserNameSafe = (): string => {
  if (typeof window === 'undefined') {return 'Sistema';}
  try {
    const rawUser = localStorage.getItem('lfnm_user') || sessionStorage.getItem('lfnm_user');
    if (rawUser) {
      const user = JSON.parse(rawUser);
      return user.name || user.email || 'Sistema';
    }
  } catch (e) {
    console.warn('[ActivityBus] Failed to parse current user from storage');
  }
  return 'Sistema';
};

/**
 * Formata milissegundos para leitura humana.
 */
export const formatElapsed = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {return `${seconds}s`;}
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

/**
 * Gera um ID único para rastreio.
 */
export const makeId = (prefix: string): string => {
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${prefix}_${Date.now()}_${randomSuffix}`;
};
