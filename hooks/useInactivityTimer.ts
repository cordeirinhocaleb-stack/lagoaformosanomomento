import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook para detectar inatividade do usuário
 * @param timeoutMs Tempo em milissegundos para considerar inativo (padrão: 30 minutos)
 * @param onIdle Callback a ser executado quando o tempo expirar
 */
export const useInactivityTimer = (timeoutMs: number = 30 * 60 * 1000, onIdle: () => void) => {
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const callbackRef = useRef(onIdle);

    // Mantém referência atualizada do callback para evitar re-attach dos listeners
    useEffect(() => {
        callbackRef.current = onIdle;
    }, [onIdle]);

    const resetTimer = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            if (callbackRef.current) {
                console.log(`⏱️ Inatividade detectada (${timeoutMs}ms). Executando logout...`);
                callbackRef.current();
            }
        }, timeoutMs);
    }, [timeoutMs]);

    useEffect(() => {
        // Eventos para monitorar
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

        // Listener otimizado (throttled seria ideal, mas reset simples funciona para MVP)
        const handleActivity = () => resetTimer();

        // Attach listeners
        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        // Inicia timer
        resetTimer();

        // Cleanup
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [resetTimer]);

    return { resetTimer };
};
