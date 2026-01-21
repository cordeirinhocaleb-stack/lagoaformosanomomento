import { NewsItem } from '../types';

/**
 * Serviço para gerenciar rascunhos offline
 * Versão: 1.102 (Web Only)
 * Última Atualização: 10/01/2026
 * Changelog: Removido suporte ao Capacitor, agora usa exclusivamente localStorage
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
 * Adaptador de armazenamento Web
 * Usa localStorage
 */
class StorageAdapter {
    /**
     * Armazena um valor
     */
    static async set(key: string, value: string): Promise<void> {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.error(`[StorageAdapter] Erro ao salvar ${key}:`, error);
            throw new Error('Não foi possível salvar os dados');
        }
    }

    /**
     * Recupera um valor
     */
    static async get(key: string): Promise<string | null> {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error(`[StorageAdapter] Erro ao ler ${key}:`, error);
            return null;
        }
    }

    /**
     * Remove um valor
     */
    static async remove(key: string): Promise<void> {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`[StorageAdapter] Erro ao remover ${key}:`, error);
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
        return false;
    }

    /**
     * Retorna informações sobre a plataforma atual
     */
    static getPlatformInfo(): { platform: string; isNative: boolean } {
        return {
            platform: 'web',
            isNative: false
        };
    }
}
