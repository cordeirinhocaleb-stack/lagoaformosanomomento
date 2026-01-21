
import { useMemo } from 'react';

/**
 * Compara o estado original com o atual para determinar se houve mudanças (dirty state).
 * Utiliza JSON.stringify para comparação profunda simples.
 */
export function useDirtyState<T>(original: T, current: T): boolean {
  return useMemo(() => {
    return JSON.stringify(original) !== JSON.stringify(current);
  }, [original, current]);
}
