import React from 'react';
import { ContentBlock } from '@/types';

interface RenderDividerProps {
    block: ContentBlock;
}

export const RenderDivider: React.FC<RenderDividerProps> = ({ block }) => {
    const s = block.settings || {};

    // Mapping keys from DividerPanel.tsx
    const kind = s.kind || 'solid';
    const thickness = s.thickness || 1;
    const width = s.width || 'full';
    const align = s.align || 'center';
    const colorType = s.color || 'themeDefault';
    const opacity = s.opacity !== undefined ? s.opacity : 1;
    const labelText = s.labelText || '';
    const iconName = s.iconName || '';
    const iconPosition = s.iconPosition || 'none';
    const iconSize = s.iconSize || 14;

    // Resolve Color
    const getHexColor = (type: string) => {
        switch (type) {
            case 'muted': return '#71717a'; // zinc-500
            case 'accent': return '#dc2626'; // red-600 (site primary)
            case 'themeDefault':
            default: return '#e4e4e7'; // zinc-200
        }
    };
    const finalColor = getHexColor(colorType);

    // Width classes
    const widthClass = width === 'content' ? 'max-w-[66%]' : width === 'short' ? 'max-w-[33%]' : 'w-full';

    // Align classes
    const alignClass = align === 'left' ? 'mr-auto ml-0' : align === 'right' ? 'ml-auto mr-0' : 'mx-auto';

    const IconOrLabel = () => {
        if (iconPosition === 'none' && !labelText) return null;

        return (
            <div className="flex items-center justify-center shrink-0 px-4 gap-2" style={{ opacity }}>
                {iconName && (
                    <div className="flex items-center justify-center" style={{ color: finalColor, fontSize: `${iconSize}px` }}>
                        {iconName === 'site_logo' ? (
                            <img
                                src="https://lh3.googleusercontent.com/d/1u0-ygqjuvPa4STtU8gT8HFyF05luNo1P"
                                alt="Logo"
                                style={{ width: `${iconSize * 1.5}px`, height: 'auto', display: 'block' }}
                            />
                        ) : (
                            <i className={`fas ${iconName}`}></i>
                        )}
                    </div>
                )}
                {labelText && (
                    <span className="text-[10px] font-black uppercase tracking-widest italic" style={{ color: finalColor }}>
                        {labelText}
                    </span>
                )}
            </div>
        );
    };

    const Line = () => {
        if (kind === 'fade') {
            return (
                <div className="flex-1 h-[1px]" style={{
                    background: `linear-gradient(to right, transparent, ${finalColor}, transparent)`,
                    opacity
                }}></div>
            );
        }

        if (kind === 'gradient') {
            return (
                <div className="flex-1 h-[2px]" style={{
                    background: `linear-gradient(to right, ${finalColor}33, ${finalColor}, ${finalColor}33)`,
                    opacity
                }}></div>
            );
        }

        const borderStyle = kind === 'double' ? 'double' : kind === 'dashed' ? 'dashed' : kind === 'dotted' ? 'dotted' : 'solid';

        return (
            <div className="flex-1" style={{
                height: kind === 'double' ? `${thickness * 3}px` : `${thickness}px`,
                borderTop: `${thickness}px ${borderStyle} ${finalColor}`,
                opacity,
                marginTop: kind === 'double' ? '2px' : '0'
            }}></div>
        );
    };

    return (
        <div className={`my-12 py-4 flex items-center ${widthClass} ${alignClass}`}>
            {(iconPosition === 'left' || (!iconPosition && (iconName || labelText))) && <IconOrLabel />}

            {(iconPosition === 'center' || iconPosition === 'none') && <Line />}

            {(iconPosition === 'center' || (iconPosition === 'none' && (iconName || labelText))) && <IconOrLabel />}

            {(iconPosition === 'center' || iconPosition === 'none') && <Line />}

            {iconPosition === 'right' && <IconOrLabel />}

            {/* Se for apenas uma linha simples */}
            {iconPosition === 'none' && !iconName && !labelText && (
                <div className="w-full">
                    {/* Line ja renderizada acima se iconPosition for none, mas vamos garantir o layout */}
                </div>
            )}
        </div>
    );
};
