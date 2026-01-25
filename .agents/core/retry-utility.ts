/**
 * Retry Utility - Implementa retry logic com backoff exponencial
 * 
 * Funcionalidades:
 * - Retry automático em caso de falha
 * - Backoff exponencial (delay aumenta a cada tentativa)
 * - Configurável por tipo de erro
 * - Logging de tentativas
 */

export interface RetryOptions {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    retryableErrors?: string[];
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableErrors: ['ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND']
};

export class RetryUtility {
    /**
     * Executa função com retry automático
     */
    static async executeWithRetry<T>(
        fn: () => Promise<T>,
        options: Partial<RetryOptions> = {},
        context?: string
    ): Promise<T> {
        const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
        let lastError: Error;

        for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error: any) {
                lastError = error;

                // Verificar se erro é retryable
                if (!this.isRetryableError(error, opts.retryableErrors)) {
                    throw error;
                }

                // Última tentativa - não fazer retry
                if (attempt === opts.maxRetries) {
                    break;
                }

                // Calcular delay com backoff exponencial
                const delay = Math.min(
                    opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
                    opts.maxDelay
                );

                console.log(
                    `⚠️  [Retry] Tentativa ${attempt}/${opts.maxRetries} falhou` +
                    (context ? ` (${context})` : '') +
                    `. Retentando em ${delay}ms...`
                );

                await this.sleep(delay);
            }
        }

        throw new Error(
            `Falha após ${opts.maxRetries} tentativas` +
            (context ? ` (${context})` : '') +
            `: ${lastError!.message}`
        );
    }

    /**
     * Verifica se erro é retryable
     */
    private static isRetryableError(error: any, retryableErrors?: string[]): boolean {
        if (!retryableErrors || retryableErrors.length === 0) {
            return true; // Retry em todos os erros se não especificado
        }

        const errorCode = error.code || error.name || '';
        const errorMessage = error.message || '';

        return retryableErrors.some(
            retryable =>
                errorCode.includes(retryable) ||
                errorMessage.includes(retryable)
        );
    }

    /**
     * Sleep helper
     */
    private static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Executa com timeout
     */
    static async executeWithTimeout<T>(
        fn: () => Promise<T>,
        timeoutMs: number,
        context?: string
    ): Promise<T> {
        return Promise.race([
            fn(),
            new Promise<T>((_, reject) =>
                setTimeout(
                    () => reject(new Error(
                        `Timeout após ${timeoutMs}ms` +
                        (context ? ` (${context})` : '')
                    )),
                    timeoutMs
                )
            )
        ]);
    }

    /**
     * Executa com timeout E retry
     */
    static async executeWithTimeoutAndRetry<T>(
        fn: () => Promise<T>,
        timeoutMs: number,
        retryOptions: Partial<RetryOptions> = {},
        context?: string
    ): Promise<T> {
        return this.executeWithRetry(
            () => this.executeWithTimeout(fn, timeoutMs, context),
            retryOptions,
            context
        );
    }
}
