import React from 'react';
import { PromoPopupConfig } from '../../../../types';
import { PopupSpecialEffects } from '../PopupSpecialEffects';

interface AsymmetricLayoutProps {
    config: PromoPopupConfig;
    theme: any;
    animationClass: string;
    fontStyle: any;
    wrapperClasses: string;
    overlayClasses: string;
    wrapperPointerEvents: string;
    overlay: string;
    renderMedia: () => React.ReactNode;
    onAction?: () => void;
    onClose?: () => void;
}

const AsymmetricLayout: React.FC<AsymmetricLayoutProps> = ({
    config,
    theme,
    animationClass,
    fontStyle,
    wrapperClasses,
    overlayClasses,
    wrapperPointerEvents,
    overlay,
    renderMedia,
    onAction,
    onClose
}) => {
    return (
        <div className={`${wrapperClasses} flex ${overlayClasses} ${wrapperPointerEvents}`}>
            {overlay !== 'transparent' && onClose && <div className="absolute inset-0" onClick={onClose}></div>}

            <div className="relative w-full h-full p-4 md:p-8 flex items-end justify-start pointer-events-none">
                {/* Content Box (10% area) */}
                <div
                    className={`relative z-50 pointer-events-auto bg-black text-white p-6 md:p-8 max-w-md w-full shadow-2xl ${animationClass}`}
                    style={{
                        backgroundColor: theme.colors?.background,
                        borderTop: `4px solid ${theme.colors?.border}`
                    }}
                >
                    <h2
                        className="text-4xl md:text-5xl font-bold mb-1 leading-none tracking-tight"
                        style={{ color: theme.colors?.title, ...fontStyle }}
                    >
                        {config.title}
                    </h2>
                    {config.subtitle && (
                        <h3
                            className="text-sm font-bold opacity-70 mb-4"
                            style={{ color: theme.colors?.title, ...fontStyle }}
                        >
                            {config.subtitle}
                        </h3>
                    )}
                    <p
                        className="text-sm opacity-80 mb-6 leading-relaxed"
                        style={{ color: theme.colors?.body, ...fontStyle }}
                    >
                        {config.description}
                    </p>
                    {config.smallNote && (
                        <p
                            className="text-[9px] uppercase tracking-widest opacity-40 mb-4"
                            style={{ color: theme.colors?.body }}
                        >
                            {config.smallNote}
                        </p>
                    )}
                    <div className="flex gap-4">
                        <button
                            onClick={onAction}
                            className="flex-1 py-3 px-6 bg-yellow-400 text-black font-bold uppercase text-sm tracking-wider hover:bg-white transition-colors"
                            style={{
                                backgroundColor: theme.colors?.buttonBg,
                                color: theme.colors?.buttonText
                            }}
                        >
                            {config.buttonText}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-12 h-12 flex items-center justify-center border border-white/20 hover:bg-white/10 transition-colors"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                {/* Massive Background Media (90% area) */}
                <div className="absolute inset-0 z-0 pointer-events-auto">
                    <div className="w-full h-full opacity-80">{renderMedia()}</div>
                    <div className="absolute bottom-[20%] left-0 w-full overflow-hidden opacity-20 pointer-events-none">
                        <div
                            className="whitespace-nowrap animate-marquee text-[10rem] font-black uppercase text-transparent stroke-white"
                            style={{ WebkitTextStroke: '2px white' }}
                        >
                            {config.title} {config.title} {config.title}
                        </div>
                    </div>
                    <PopupSpecialEffects effect={theme.specialEffect} />
                </div>
            </div>
        </div>
    );
};

export default AsymmetricLayout;
