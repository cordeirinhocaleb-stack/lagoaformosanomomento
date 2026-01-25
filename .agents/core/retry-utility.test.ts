/**
 * Testes para RetryUtility
 */

import { RetryUtility } from './retry-utility';

describe('RetryUtility', () => {
    // Aumentar timeout para testes assíncronos
    jest.setTimeout(10000);

    afterEach(() => {
        // Limpar todos os timers após cada teste
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    describe('executeWithRetry', () => {
        test('deve executar função com sucesso na primeira tentativa', async () => {
            const mockFn = jest.fn().mockResolvedValue('success');

            const result = await RetryUtility.executeWithRetry(mockFn, { maxRetries: 3 });

            expect(result).toBe('success');
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        test('deve fazer retry em caso de falha', async () => {
            const mockFn = jest.fn()
                .mockRejectedValueOnce(new Error('Falha 1'))
                .mockRejectedValueOnce(new Error('Falha 2'))
                .mockResolvedValue('success');

            const result = await RetryUtility.executeWithRetry(mockFn, {
                maxRetries: 3,
                initialDelay: 50,
                backoffMultiplier: 1 // Sem backoff para teste rápido
            });

            expect(result).toBe('success');
            expect(mockFn).toHaveBeenCalledTimes(3);
        });

        test('deve lançar erro após esgotar retries', async () => {
            const mockFn = jest.fn().mockRejectedValue(new Error('Sempre falha'));

            await expect(
                RetryUtility.executeWithRetry(mockFn, {
                    maxRetries: 2,
                    initialDelay: 50,
                    backoffMultiplier: 1
                })
            ).rejects.toThrow('Falha após 2 tentativas');

            expect(mockFn).toHaveBeenCalledTimes(2);
        });

        test('deve respeitar delays entre retries', async () => {
            const startTime = Date.now();
            const mockFn = jest.fn()
                .mockRejectedValueOnce(new Error('Falha 1'))
                .mockResolvedValue('success');

            await RetryUtility.executeWithRetry(mockFn, {
                maxRetries: 2,
                initialDelay: 100,
                backoffMultiplier: 1
            });

            const totalTime = Date.now() - startTime;
            // Deve ter esperado pelo menos 100ms
            expect(totalTime).toBeGreaterThanOrEqual(90); // Margem de erro
            expect(mockFn).toHaveBeenCalledTimes(2);
        });

        test('deve incluir contexto na mensagem de erro', async () => {
            const mockFn = jest.fn().mockRejectedValue(new Error('Erro'));

            await expect(
                RetryUtility.executeWithRetry(
                    mockFn,
                    { maxRetries: 1, initialDelay: 10 },
                    'test-context'
                )
            ).rejects.toThrow('test-context');
        });
    });

    describe('executeWithTimeout', () => {
        test('deve executar função dentro do timeout', async () => {
            const mockFn = jest.fn().mockResolvedValue('success');

            const result = await RetryUtility.executeWithTimeout(mockFn, 1000);

            expect(result).toBe('success');
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        test('deve lançar erro de timeout se exceder tempo', async () => {
            const mockFn = jest.fn().mockImplementation(
                () => new Promise(resolve => setTimeout(() => resolve('success'), 500))
            );

            await expect(
                RetryUtility.executeWithTimeout(mockFn, 100)
            ).rejects.toThrow('Timeout após 100ms');
        });

        test('deve incluir contexto na mensagem de timeout', async () => {
            const mockFn = jest.fn().mockImplementation(
                () => new Promise(resolve => setTimeout(() => resolve('success'), 500))
            );

            await expect(
                RetryUtility.executeWithTimeout(mockFn, 100, 'test-operation')
            ).rejects.toThrow('test-operation');
        });
    });

    describe('executeWithTimeoutAndRetry', () => {
        test('deve combinar timeout e retry', async () => {
            const mockFn = jest.fn()
                .mockRejectedValueOnce(new Error('Falha'))
                .mockResolvedValue('success');

            const result = await RetryUtility.executeWithTimeoutAndRetry(
                mockFn,
                1000,
                { maxRetries: 2, initialDelay: 50, backoffMultiplier: 1 }
            );

            expect(result).toBe('success');
            expect(mockFn).toHaveBeenCalledTimes(2);
        });

        test('deve falhar se timeout ocorrer', async () => {
            const mockFn = jest.fn().mockImplementation(
                () => new Promise(resolve => setTimeout(() => resolve('success'), 500))
            );

            await expect(
                RetryUtility.executeWithTimeoutAndRetry(
                    mockFn,
                    100,
                    { maxRetries: 1, initialDelay: 10 }
                )
            ).rejects.toThrow('Timeout');
        });

        test('deve incluir nome do agente no contexto', async () => {
            const mockFn = jest.fn().mockImplementation(
                () => new Promise(resolve => setTimeout(() => resolve('success'), 500))
            );

            await expect(
                RetryUtility.executeWithTimeoutAndRetry(
                    mockFn,
                    100,
                    { maxRetries: 1, initialDelay: 10 },
                    'my-agent'
                )
            ).rejects.toThrow('my-agent');
        });
    });
});

