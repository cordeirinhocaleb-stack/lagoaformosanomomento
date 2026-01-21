import React from 'react';

/**
 * Renderiza divisores decorativos com suporte a ícones, gradientes e textos.
 */
export const renderAdvancedDivider = (config: any, blockBg: string = 'transparent') => {
    if (!config || !config.enabled) {return null;}
    const colors: Record<string, string> = { themeDefault: '#0f172a', muted: '#cbd5e1', accent: '#dc2626' };
    const color = colors[config.color] || colors.themeDefault;
    const thickness = config.thickness || 1;
    const opacity = config.opacity ?? 1;
    const width = config.width === 'content' ? '66%' : config.width === 'short' ? '33%' : '100%';
    const alignMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' };
    
    return (
        <div className="advanced-divider-container flex items-center py-6" style={{ justifyContent: alignMap[config.align], opacity }}>
            <div className="relative flex items-center justify-center" style={{ 
                width, 
                height: config.kind === 'double' ? thickness * 3 : thickness,
                borderTop: ['solid', 'dashed', 'dotted', 'double'].includes(config.kind) ? `${thickness}px ${config.kind} ${color}` : 'none',
                background: config.kind === 'gradient' ? `linear-gradient(to right, transparent, ${color}, transparent)` : (config.kind === 'fade' ? `linear-gradient(to right, transparent, ${color} 20%, ${color} 80%, transparent)` : 'transparent')
            }}>
                {(config.icon?.enabled || config.labelText) && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-white px-3 flex items-center gap-2 pointer-events-auto" style={{ backgroundColor: blockBg }}>
                            {config.icon?.enabled && <i className={`fas fa-${config.icon.name} text-xs`} style={{ color }}></i>}
                            {config.labelText && <span className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>{config.labelText}</span>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
