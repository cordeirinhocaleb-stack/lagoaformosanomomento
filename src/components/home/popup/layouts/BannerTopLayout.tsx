import React from 'react';
import { PromoPopupConfig } from '../../../../types';

interface BannerTopLayoutProps {
    config: PromoPopupConfig;
    theme: any;
    animationClass: string;
    fontStyle: any;
    onAction?: () => void;
    onClose?: () => void;
}

const BannerTopLayout: React.FC<BannerTopLayoutProps> = ({
    config,
    theme,
    animationClass,
    fontStyle,
    onAction,
    onClose
}) => {
    return (
        <div className={`fixed top-0 left-0 w-full z-[9999] p-2 md:p-4 flex justify-center pointer-events-none ${animationClass}`}>
            <div
                className="flex items-center gap-4 md:gap-8 px-6 py-3 shadow-2xl pointer-events-auto max-w-5xl w-full border-t-2"
                style={{
                    backgroundColor: theme.colors?.background,
                    borderColor: theme.colors?.border,
                    ...fontStyle
                }}
            >
                <span
                    className="font-black uppercase text-[10px] md:text-sm tracking-widest whitespace-nowrap"
                    style={{ color: theme.colors?.title }}
                >
                    {config.title}
                </span>
                <span
                    className="flex-1 text-xs md:text-sm font-semibold opacity-90 line-clamp-1"
                    style={{ color: theme.colors?.body }}
                >
                    {config.description}
                </span>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onAction}
                        className="px-4 py-1.5 md:px-6 md:py-2 bg-white text-black text-[9px] md:text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
                        style={{
                            backgroundColor: theme.colors?.buttonBg,
                            color: theme.colors?.buttonText
                        }}
                    >
                        {config.buttonText}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 opacity-60 hover:opacity-100 transition-opacity"
                        style={{ color: theme.colors?.title }}
                    >
                        <i className="fas fa-times text-sm"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BannerTopLayout;
