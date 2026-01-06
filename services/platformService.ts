import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';

/**
 * Serviço para detectar plataforma e status de rede
 * Versão: 1.100
 */

export class PlatformService {
    /**
     * Verifica se está rodando como app nativo
     */
    static isNativeApp(): boolean {
        return Capacitor.isNativePlatform();
    }

    /**
     * Verifica se está rodando no Android
     */
    static isAndroid(): boolean {
        return Capacitor.getPlatform() === 'android';
    }

    /**
     * Verifica se está rodando no iOS
     */
    static isIOS(): boolean {
        return Capacitor.getPlatform() === 'ios';
    }

    /**
     * Verifica se está rodando na web
     */
    static isWeb(): boolean {
        return Capacitor.getPlatform() === 'web';
    }

    /**
     * Retorna a plataforma atual
     */
    static getPlatform(): string {
        return Capacitor.getPlatform();
    }
}

export class NetworkService {
    private static listeners: Array<(status: boolean) => void> = [];

    /**
     * Verifica se está online
     */
    static async isOnline(): Promise<boolean> {
        const status = await Network.getStatus();
        return status.connected;
    }

    /**
     * Adiciona listener para mudanças de conectividade
     */
    static addNetworkListener(callback: (isOnline: boolean) => void): void {
        this.listeners.push(callback);

        Network.addListener('networkStatusChange', (status) => {
            callback(status.connected);
        });
    }

    /**
     * Remove todos os listeners
     */
    static removeAllListeners(): void {
        Network.removeAllListeners();
        this.listeners = [];
    }
}
