import React from 'react';
import { GlobalTextSettings } from '../types';

export const SIZE_MAP: Record<string, string> = {
    xs: '12px', sm: '14px', md: '18px', lg: '24px', xl: '32px', '2xl': '48px', '3xl': '64px'
};

/**
 * Converte as configurações globais do editor em estilos CSS e classes.
 */
export const applyGlobalStyles = (settings: GlobalTextSettings) => {
    // Fix: Added React import to provide access to React.CSSProperties
    const style: React.CSSProperties = {
        textAlign: settings.alignment,
        fontSize: SIZE_MAP[settings.fontSize] || SIZE_MAP.md,
        marginTop: settings.marginTop,
        marginBottom: settings.marginBottom,
    };

    return {
        className: "", // Reservado para classes globais futuras
        style
    };
};