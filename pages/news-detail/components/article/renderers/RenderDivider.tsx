import React from 'react';
import { ContentBlock } from '@/types';

interface RenderDividerProps {
    block: ContentBlock;
}

export const RenderDivider: React.FC<RenderDividerProps> = ({ block }) => {
    const sSettings = block.settings || {};
    const color = sSettings.color || '#e2e8f0'; // Default safe color
    const thickness = sSettings.thickness || 1;
    let lineStyle = sSettings.lineStyle || 'solid';
    let iconName = sSettings.iconName || 'fa-star';
    const iconPosition = sSettings.iconPosition || 'none';
    const iconSize = sSettings.iconSize || 14;
    const opacity = sSettings.opacity !== undefined ? sSettings.opacity : 1;
    const orientation = sSettings.orientation || 'horizontal';
    const height = sSettings.height || 60;
    const width = sSettings.width || 'full';
    const align = sSettings.align || 'center';

    const sVariant = block.settings?.editorialVariant || 'divider_minimal';

    // Apply Defaults based on Variant if specific settings are missing
    if (sVariant === 'divider_dots' && !block.settings?.lineStyle) lineStyle = 'dotted';
    if (sVariant === 'divider_ornamental' && !block.settings?.lineStyle) {
        lineStyle = 'double';
        if (!sSettings.iconName) iconName = 'fa-diamond';
    }

    // Width classes
    const widthClass = width === 'content' ? 'max-w-[66%]' : width === 'short' ? 'max-w-[33%]' : 'max-w-[90%]';

    // Align classes
    const alignClass = align === 'left' ? 'mr-auto ml-0' : align === 'right' ? 'ml-auto mr-0' : 'mx-auto';

    const IconComponent = () => (
        <div className="flex items-center justify-center shrink-0 transition-transform duration-700 hover:[transform:rotateY(360deg)] px-2 cursor-pointer" style={{ color: color === 'themeDefault' ? '#3f3f46' : color, fontSize: `${iconSize}px`, opacity }}>
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
    );

    if (orientation === 'vertical') {
        return (
            <div className={`py-6 flex flex-col items-center justify-center w-full`} style={{ height: `${height}px` }}>
                <div style={{
                    width: `${thickness}px`,
                    flex: 1,
                    backgroundColor: color === 'themeDefault' ? '#e4e4e7' : color,
                    opacity: opacity,
                    borderRadius: '999px'
                }}></div>

                {iconPosition !== 'none' && (
                    <div className="py-2 transform -rotate-90 md:rotate-0">
                        <IconComponent />
                    </div>
                )}

                <div style={{
                    width: `${thickness}px`,
                    flex: 1,
                    backgroundColor: color === 'themeDefault' ? '#e4e4e7' : color,
                    opacity: opacity,
                    borderRadius: '999px'
                }}></div>
            </div>
        );
    }

    const Line = () => (
        <div className="flex-1" style={{
            height: lineStyle === 'double' ? `${thickness * 3}px` : `${thickness}px`,
            borderBottom: lineStyle !== 'double' ? `${thickness}px ${lineStyle} ${color === 'themeDefault' ? '#e4e4e7' : color}` : 'none',
            borderTop: lineStyle === 'double' ? `${thickness}px double ${color === 'themeDefault' ? '#e4e4e7' : color}` : 'none',
            background: sSettings.kind === 'gradient' ? `linear-gradient(to right, transparent, ${color}, transparent)` : 'transparent',
            opacity, borderRadius: '999px'
        }}></div>
    );

    return (
        <div className={`py-8 w-full ${widthClass} ${alignClass} flex items-center justify-center`}>
            {iconPosition === 'left' && <><IconComponent /><Line /></>}
            {iconPosition === 'right' && <><Line /><IconComponent /></>}
            {iconPosition === 'center' && <><Line /><IconComponent /><Line /></>}
            {(iconPosition === 'none' || !iconPosition) && <Line />}
        </div>
    );
};
