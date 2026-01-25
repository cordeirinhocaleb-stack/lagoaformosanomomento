import React from 'react';
import { PromoPopupConfig } from '../../../../types';
import { PopupSpecialEffects } from '../PopupSpecialEffects';

interface FeatureListLayoutProps {
    config: PromoPopupConfig;
    theme: any;
    animationClass: string;
    fontStyle: any;
    wrapperClasses: string;
    overlayClasses: string;
    wrapperPointerEvents: string;
    overlay: string;
    onAction?: () => void;
    onClose?: () => void;
}

const FeatureListLayout: React.FC<FeatureListLayoutProps> = ({
    config,
    theme,
    animationClass,
    fontStyle,
    wrapperClasses,
    overlayClasses,
    wrapperPointerEvents,
    overlay,
    onAction,
    onClose
}) => {
    const features = config.description.split('|').map(f => f.trim());

    return (
        <div className={`${wrapperClasses} flex items-center justify-center ${overlayClasses} ${wrapperPointerEvents}`}>
            {overlay !== 'transparent' && onClose && <div className="absolute inset-0" onClick={onClose}></div>}

            <div
                className={`relative w-full max-w-md p-8 shadow-2xl overflow-hidden pointer-events-auto ${animationClass}`}
                style={{
                    backgroundColor: theme.colors?.background,
                    borderRadius: '24px',
                    border: theme.colors.border ? `1px solid ${theme.colors.border}` : 'none'
                }}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                >
                    <i className="fas fa-times text-xl"></i>
                </button>

                <h2
                    className="text-3xl font-black uppercase tracking-tighter mb-8"
                    style={{ color: theme.colors?.title, ...fontStyle }}
                >
                    {config.title}
                </h2>

                <div className="space-y-4 mb-10">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 animate-slideUp"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center bg-white/10"
                                style={{ backgroundColor: `${theme.colors?.buttonBg}20` }}
                            >
                                <i
                                    className="fas fa-check text-[10px]"
                                    style={{ color: theme.colors?.buttonBg }}
                                ></i>
                            </div>
                            <span
                                className="text-sm font-bold opacity-90"
                                style={{ color: theme.colors?.body, ...fontStyle }}
                            >
                                {feature}
                            </span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onAction}
                    className="w-full py-4 text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl"
                    style={{
                        backgroundColor: theme.colors?.buttonBg,
                        color: theme.colors?.buttonText,
                        borderRadius: '12px'
                    }}
                >
                    {config.buttonText}
                </button>

                <PopupSpecialEffects effect={theme.specialEffect} />
            </div>
        </div>
    );
};

export default FeatureListLayout;
