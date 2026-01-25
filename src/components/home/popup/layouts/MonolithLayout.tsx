import React from 'react';
import { PromoPopupConfig } from '../../../../types';
import { PopupSpecialEffects } from '../PopupSpecialEffects';

interface MonolithLayoutProps {
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

const MonolithLayout: React.FC<MonolithLayoutProps> = ({
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
        <div className={`${wrapperClasses} flex p-4 items-center justify-center ${overlayClasses} ${wrapperPointerEvents}`}>
            {overlay !== 'transparent' && onClose && <div className="absolute inset-0" onClick={onClose}></div>}

            <div
                className={`relative w-full max-w-2xl aspect-[4/5] md:aspect-square overflow-hidden bg-black text-white shadow-2xl ${animationClass}`}
                style={{
                    backgroundColor: theme.colors?.background,
                    borderColor: theme.colors?.border
                }}
            >
                {/* Media as Texture Background */}
                <div className="absolute inset-0 z-0 opacity-60 mix-blend-multiply">
                    {renderMedia()}
                </div>

                {/* Content Layer */}
                <div className="relative z-10 w-full h-full flex flex-col justify-between p-8 md:p-12">
                    <div>
                        <h2
                            className="text-6xl md:text-8xl font-black leading-[0.85] tracking-tighter mix-blend-difference"
                            style={{ color: theme.colors?.title, ...fontStyle }}
                        >
                            {config.title.toUpperCase()}
                        </h2>
                        {config.subtitle && (
                            <h3
                                className="text-xl md:text-2xl font-bold mt-2 opacity-80 mix-blend-difference"
                                style={{ color: theme.colors?.title, ...fontStyle }}
                            >
                                {config.subtitle}
                            </h3>
                        )}
                    </div>

                    <div className="space-y-6">
                        {config.logoUrl && (
                            <img
                                src={config.logoUrl}
                                alt="Logo"
                                className="h-12 w-auto mb-4 object-contain mix-blend-difference"
                            />
                        )}
                        <p
                            className="text-lg md:text-xl font-medium max-w-md mix-blend-difference"
                            style={{ color: theme.colors?.body, ...fontStyle }}
                        >
                            {config.description}
                        </p>
                        {config.smallNote && (
                            <p
                                className="text-[10px] uppercase tracking-widest opacity-50 mix-blend-difference"
                                style={{ color: theme.colors?.body }}
                            >
                                {config.smallNote}
                            </p>
                        )}
                        <button
                            onClick={onAction}
                            className="w-full py-6 text-xl font-bold border-t-2 border-white/20 hover:bg-white hover:text-black transition-colors uppercase tracking-widest flex justify-between items-center group"
                            style={{
                                borderColor: theme.colors?.border,
                                color: theme.colors?.buttonText,
                                backgroundColor: theme.colors?.buttonBg
                            }}
                        >
                            <span>{config.buttonText}</span>
                            <i className="fas fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-0 right-0 p-6 mix-blend-difference text-white hover:rotate-90 transition-transform"
                    >
                        <i className="fas fa-times text-4xl"></i>
                    </button>
                </div>

                <PopupSpecialEffects effect={theme.specialEffect} />
            </div>
        </div>
    );
};

export default MonolithLayout;
