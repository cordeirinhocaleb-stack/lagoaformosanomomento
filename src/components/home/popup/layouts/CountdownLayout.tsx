import React from 'react';
import { PromoPopupConfig } from '../../../../types';
import { PopupSpecialEffects } from '../PopupSpecialEffects';

interface CountdownLayoutProps {
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

const CountdownLayout: React.FC<CountdownLayoutProps> = ({
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
    return (
        <div className={`${wrapperClasses} flex items-center justify-center ${overlayClasses} ${wrapperPointerEvents}`}>
            {overlay !== 'transparent' && onClose && <div className="absolute inset-0" onClick={onClose}></div>}

            <div
                className={`relative w-full max-w-sm p-8 text-center shadow-2xl pointer-events-auto ${animationClass}`}
                style={{
                    backgroundColor: theme.colors?.background,
                    borderRadius: '32px'
                }}
            >
                <div className="mb-6 flex justify-center">
                    <div className="w-16 h-1 bg-white/20 rounded-full"></div>
                </div>

                <h2
                    className="text-2xl font-black uppercase tracking-wider mb-2"
                    style={{ color: theme.colors?.title, ...fontStyle }}
                >
                    {config.title}
                </h2>

                <p
                    className="text-sm font-bold opacity-80 mb-8"
                    style={{ color: theme.colors?.body, ...fontStyle }}
                >
                    {config.description}
                </p>

                {/* DUMMY COUNTDOWN BOXES */}
                <div className="flex justify-center gap-4 mb-10">
                    {['23', '59', '42'].map((unit, i) => (
                        <div key={i} className="flex flex-col gap-1 items-center">
                            <div
                                className="w-14 h-16 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl font-black border border-white/10"
                                style={{ color: theme.colors?.title }}
                            >
                                {unit}
                            </div>
                            <span
                                className="text-[8px] font-bold uppercase opacity-50"
                                style={{ color: theme.colors?.body }}
                            >
                                {i === 0 ? 'Horas' : i === 1 ? 'Minutos' : 'Segundos'}
                            </span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onAction}
                    className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                    style={{
                        backgroundColor: theme.colors?.buttonBg,
                        color: theme.colors?.buttonText,
                        borderRadius: 'full'
                    }}
                >
                    {config.buttonText}
                </button>

                <button
                    onClick={onClose}
                    className="mt-6 text-xs font-black uppercase opacity-40 hover:opacity-100 transition-opacity"
                    style={{ color: theme.colors?.body }}
                >
                    Não, obrigado
                </button>

                <PopupSpecialEffects effect={theme.specialEffect} />
            </div>
        </div>
    );
};

export default CountdownLayout;
