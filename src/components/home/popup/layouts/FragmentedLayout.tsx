import React from 'react';
import { PromoPopupConfig } from '../../../../types';
import { PopupSpecialEffects } from '../PopupSpecialEffects';

interface FragmentedLayoutProps {
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

const FragmentedLayout: React.FC<FragmentedLayoutProps> = ({
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
        <div className={`${wrapperClasses} flex items-center justify-center ${overlayClasses} ${wrapperPointerEvents}`}>
            {overlay !== 'transparent' && onClose && <div className="absolute inset-0" onClick={onClose}></div>}

            <div className={`relative w-full max-w-4xl h-[60vh] pointer-events-none ${animationClass}`}>
                {/* Layer 1: Media (Floating somewhere) */}
                <div className="absolute top-0 right-0 w-2/3 h-2/3 z-0 pointer-events-auto overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                    {renderMedia()}
                </div>

                {/* Layer 2: Text Block (Floating left) */}
                <div
                    className="absolute bottom-10 left-4 md:left-10 z-10 max-w-sm pointer-events-auto mix-blend-hard-light backdrop-blur-md p-8"
                    style={{ backgroundColor: `${theme.colors?.background}99` }}
                >
                    <h2
                        className="text-5xl md:text-6xl font-thin tracking-tighter mb-4"
                        style={{ color: theme.colors?.title, ...fontStyle }}
                    >
                        {config.title}
                    </h2>
                    <p
                        className="text-lg font-light mb-8 border-l-2 pl-4 border-current opacity-80"
                        style={{ color: theme.colors?.body, ...fontStyle }}
                    >
                        {config.description}
                    </p>
                    <button
                        onClick={onAction}
                        className="px-8 py-3 text-sm font-bold uppercase tracking-[0.2em] border border-current hover:bg-current hover:text-black transition-colors"
                        style={{
                            color: theme.colors?.buttonText,
                            borderColor: theme.colors?.border
                        }}
                    >
                        {config.buttonText}
                    </button>
                </div>

                {/* Layer 3: Close Button (Random spot) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 z-50 pointer-events-auto w-16 h-16 flex items-center justify-center bg-black text-white hover:bg-red-600 transition-colors"
                >
                    <i className="fas fa-times text-2xl"></i>
                </button>

                <PopupSpecialEffects effect={theme.specialEffect} />
            </div>
        </div>
    );
};

export default FragmentedLayout;
