import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { NewsItem } from '../types';

/**
 * Serviço para gerenciar rascunhos offline
 * Versão: 1.101
 * Última Atualização: 04/01/2026
 * Changelog: Adicionado suporte cross-platform com fallback para localStorage
 */

interface DraftPost {
    id: string;
    title: string;
    content: string;
    author: string;
    category: string;
    images?: string[];
    createdAt: string;
    status: 'draft' | 'pending_sync';
}

/**
 * Adaptador de armazenamento híbrido
 * Usa Capacitor Preferences em apps nativos e localStorage na web
 */
class StorageAdapter {
    private static isNative = Capacitor.isNativePlatform();

    /**
     * Armazena um valor
     */
    static async set(key: string, value: string): Promise<void> {
        try {
            if (this.isNative) {
                await Preferences.set({ key, value });
            } else {
                // Fallback para localStorage na web
                localStorage.setItem(key, value);
            }
        } catch (error) {
            console.error(`[StorageAdapter] Erro ao salvar ${key}:`, error);
            // Fallback de emergência para localStorage
            try {
                localStorage.setItem(key, value);
            } catch (fallbackError) {
                console.error('[StorageAdapter] Fallback também falhou:', fallbackError);
                throw new Error('Não foi possível salvar os dados');
            }
        }
    }

    /**
     * Recupera um valor
     */
    static async get(key: string): Promise<string | null> {
        try {
            if (this.isNative) {
                const { value } = await Preferences.get({ key });
                return value;
            } else {
                // Fallback para localStorage na web
                return localStorage.getItem(key);
            }
        } catch (error) {
            console.error(`[StorageAdapter] Erro ao ler ${key}:`, error);
            // Fallback de emergência para localStorage
            try {
                return localStorage.getItem(key);
            } catch (fallbackError) {
                console.error('[StorageAdapter] Fallback também falhou:', fallbackError);
                return null;
            }
        }
    }

    /**
     * Remove um valor
     */
    static async remove(key: string): Promise<void> {
        try {
            if (this.isNative) {
                await Preferences.remove({ key });
            } else {
                localStorage.removeItem(key);
            }
        } catch (error) {
            console.error(`[StorageAdapter] Erro ao remover ${key}:`, error);
            // Fallback de emergência
            try {
                localStorage.removeItem(key);
            } catch (fallbackError) {
                console.error('[StorageAdapter] Fallback também falhou:', fallbackError);
            }
        }
    }
}

export class OfflineService {
    private static DRAFTS_KEY = 'lfnm_offline_drafts';
    private static SYNC_QUEUE_KEY = 'lfnm_sync_queue';

    /**
     * Salva um rascunho offline
     */
    static async saveDraft(draft: DraftPost): Promise<void> {
        try {
            const drafts = await this.getDrafts();
            const existingIndex = drafts.findIndex(d => d.id === draft.id);

            if (existingIndex >= 0) {
                drafts[existingIndex] = draft;
            } else {
                drafts.push(draft);
            }

            await StorageAdapter.set(this.DRAFTS_KEY, JSON.stringify(drafts));
        } catch (error) {
            console.error('[OfflineService] Erro ao salvar rascunho:', error);
            throw error;
        }
    }

    /**
     * Obtém todos os rascunhos
     */
    static async getDrafts(): Promise<DraftPost[]> {
        try {
            const value = await StorageAdapter.get(this.DRAFTS_KEY);
            return value ? JSON.parse(value) : [];
        } catch (error) {
            console.error('[OfflineService] Erro ao obter rascunhos:', error);
            return [];
        }
    }

    /**
     * Remove um rascunho
     */
    static async deleteDraft(id: string): Promise<void> {
        try {
            const drafts = await this.getDrafts();
            const filtered = drafts.filter(d => d.id !== id);

            await StorageAdapter.set(this.DRAFTS_KEY, JSON.stringify(filtered));
        } catch (error) {
            console.error('[OfflineService] Erro ao deletar rascunho:', error);
            throw error;
        }
    }

    /**
     * Adiciona item à fila de sincronização
     */
    static async addToSyncQueue(item: DraftPost): Promise<void> {
        try {
            const queue = await this.getSyncQueue();
            queue.push({ ...item, status: 'pending_sync' });

            await StorageAdapter.set(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
        } catch (error) {
            console.error('[OfflineService] Erro ao adicionar à fila:', error);
            throw error;
        }
    }

    /**
     * Obtém fila de sincronização
     */
    static async getSyncQueue(): Promise<DraftPost[]> {
        try {
            const value = await StorageAdapter.get(this.SYNC_QUEUE_KEY);
            return value ? JSON.parse(value) : [];
        } catch (error) {
            console.error('[OfflineService] Erro ao obter fila:', error);
            return [];
        }
    }

    /**
     * Remove item da fila após sincronizar
     */
    static async removeFromSyncQueue(id: string): Promise<void> {
        try {
            const queue = await this.getSyncQueue();
            const filtered = queue.filter(item => item.id !== id);

            await StorageAdapter.set(this.SYNC_QUEUE_KEY, JSON.stringify(filtered));
        } catch (error) {
            console.error('[OfflineService] Erro ao remover da fila:', error);
            throw error;
        }
    }

    /**
     * Limpa toda a fila de sincronização
     */
    static async clearSyncQueue(): Promise<void> {
        try {
            await StorageAdapter.set(this.SYNC_QUEUE_KEY, JSON.stringify([]));
        } catch (error) {
            console.error('[OfflineService] Erro ao limpar fila:', error);
            throw error;
        }
    }

    /**
     * Conta quantos itens estão pendentes de sincronização
     */
    static async getPendingCount(): Promise<number> {
        try {
            const queue = await this.getSyncQueue();
            return queue.length;
        } catch (error) {
            console.error('[OfflineService] Erro ao contar pendentes:', error);
            return 0;
        }
    }

    /**
     * Verifica se está rodando em plataforma nativa
     */
    static isNativePlatform(): boolean {
        return Capacitor.isNativePlatform();
    }

    /**
     * Retorna informações sobre a plataforma atual
     */
    static getPlatformInfo(): { platform: string; isNative: boolean } {
        return {
            platform: Capacitor.getPlatform(),
            isNative: Capacitor.isNativePlatform()
        };
    }
}
