/**
 * Testes para CacheManager
 */

import { CacheManager } from './cache-manager';

describe('CacheManager', () => {
    let cache: CacheManager;

    beforeEach(() => {
        cache = new CacheManager(1000, 100); // 1s TTL, max 100 entries
    });

    afterEach(() => {
        cache.clear();
    });

    describe('get and set', () => {
        test('deve armazenar e recuperar valores', () => {
            cache.set('key1', 'value1');
            const result = cache.get<string>('key1');

            expect(result).toBe('value1');
        });

        test('deve retornar null para chave inexistente', () => {
            const result = cache.get('nonexistent');

            expect(result).toBeNull();
        });

        test('deve expirar entradas após TTL', async () => {
            cache.set('key1', 'value1', 100); // 100ms TTL

            expect(cache.get('key1')).toBe('value1');

            await new Promise(resolve => setTimeout(resolve, 150));

            expect(cache.get('key1')).toBeNull();
        });

        test('deve usar TTL customizado', async () => {
            cache.set('key1', 'value1', 200); // 200ms TTL

            await new Promise(resolve => setTimeout(resolve, 150));
            expect(cache.get('key1')).toBe('value1'); // Ainda válido

            await new Promise(resolve => setTimeout(resolve, 100));
            expect(cache.get('key1')).toBeNull(); // Expirou
        });
    });

    describe('statistics', () => {
        test('deve rastrear hits e misses', () => {
            cache.set('key1', 'value1');

            cache.get('key1'); // hit
            cache.get('key2'); // miss
            cache.get('key1'); // hit

            const stats = cache.getStats();

            expect(stats.hits).toBe(2);
            expect(stats.misses).toBe(1);
            expect(stats.hitRate).toBeCloseTo(66.67, 1);
        });

        test('deve resetar estatísticas', () => {
            cache.set('key1', 'value1');
            cache.get('key1');
            cache.get('key2');

            cache.resetStats();
            const stats = cache.getStats();

            expect(stats.hits).toBe(0);
            expect(stats.misses).toBe(0);
        });
    });

    describe('cleanup', () => {
        test('deve remover entradas expiradas', async () => {
            cache.set('key1', 'value1', 100);
            cache.set('key2', 'value2', 1000);

            await new Promise(resolve => setTimeout(resolve, 150));

            const removed = cache.cleanup();

            expect(removed).toBe(1);
            expect(cache.size()).toBe(1);
            expect(cache.get('key2')).toBe('value2');
        });
    });

    describe('LRU eviction', () => {
        test('deve remover entrada menos usada quando atingir limite', () => {
            const smallCache = new CacheManager(1000, 3);

            smallCache.set('key1', 'value1');
            smallCache.set('key2', 'value2');
            smallCache.set('key3', 'value3');

            // Acessar key1 e key2 para aumentar hits
            smallCache.get('key1');
            smallCache.get('key2');

            // Adicionar key4 deve remover key3 (menos usada)
            smallCache.set('key4', 'value4');

            expect(smallCache.has('key3')).toBe(false);
            expect(smallCache.has('key1')).toBe(true);
            expect(smallCache.size()).toBe(3);
        });
    });

    describe('has', () => {
        test('deve verificar existência de chave', () => {
            cache.set('key1', 'value1');

            expect(cache.has('key1')).toBe(true);
            expect(cache.has('key2')).toBe(false);
        });

        test('deve retornar false para chave expirada', async () => {
            cache.set('key1', 'value1', 100);

            expect(cache.has('key1')).toBe(true);

            await new Promise(resolve => setTimeout(resolve, 150));

            expect(cache.has('key1')).toBe(false);
        });
    });

    describe('clear', () => {
        test('deve limpar todo o cache', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');

            cache.clear();

            expect(cache.size()).toBe(0);
            expect(cache.get('key1')).toBeNull();
        });
    });
});
