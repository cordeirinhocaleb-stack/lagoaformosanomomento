import React from 'react';
import { PromoPopupConfig, PopupSize } from '../../../../types';
import { PopupSpecialEffects } from '../PopupSpecialEffects';

interface CoverLayoutProps {
    config: PromoPopupConfig;
    theme: any;
    size: PopupSize;
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

const CoverLayout: React.FC<CoverLayoutProps> = ({
    config,
    theme,
    size,
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
        <div className={`${wrapperClasses} flex items-center justify-center ${overlayClasses} ${wrapperPointerEvents}`}>
            {overlay !== 'transparent' && onClose && <div className="absolute inset-0" onClick={onClose}></div>}

            <div
                className={`relative w-full text-white shadow-2xl overflow-hidden pointer-events-auto group ${animationClass}`}
                style={{
                    maxWidth: size === 'fullscreen' ? '100%' : '550px',
                    height: size === 'fullscreen' ? '100%' : '750px',
                    maxHeight: '90vh',
                    borderRadius: theme.styles?.container?.includes('rounded') ? '24px' : '0px'
                }}
            >
                {/* 1. Full Background Media */}
                <div className="absolute inset-0 z-0 select-none">{renderMedia()}</div>

                {/* 2. Gradient Overlay for readability */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                {/* 3. Content - Bottom Aligned */}
                <div className="absolute bottom-0 left-0 w-full z-20 p-8 md:p-12 flex flex-col items-start">
                    {/* Optional Badge */}
                    <div className="mb-4 px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                        Destaque
                    </div>

                    <h2
                        className="text-4xl md:text-6xl font-black leading-[0.9] mb-4 tracking-tight drop-shadow-xl"
                        style={{ color: theme.colors?.title, ...fontStyle }}
                    >
                        {config.title}
                    </h2>

                    <p
                        className="text-lg md:text-xl font-medium opacity-90 mb-8 max-w-sm drop-shadow-md leading-relaxed"
                        style={{ color: theme.colors?.body, ...fontStyle }}
                    >
                        {config.description}
                    </p>

                    <button
                        onClick={onAction}
                        className="w-full md:w-auto px-8 py-4 bg-white text-black text-sm font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-300"
                        style={{
                            backgroundColor: theme.colors?.buttonBg,
                            color: theme.colors?.buttonText
                        }}
                    >
                        {config.buttonText}
                    </button>
                </div>

                {/* 4. Close Button - Floating Top Right */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-colors"
                >
                    <i className="fas fa-times"></i>
                </button>

                <PopupSpecialEffects effect={theme.specialEffect} />
            </div>
        </div>
    );
};

export default CoverLayout;
