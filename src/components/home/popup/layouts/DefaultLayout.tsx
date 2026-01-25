import React from 'react';
import { PromoPopupConfig, PopupSize } from '../../../../types';
import PopupCloseButton from '../components/PopupCloseButton';
import PopupMediaWrapper from '../components/PopupMediaWrapper';

interface DefaultLayoutProps {
    config: PromoPopupConfig;
    theme: any;
    size: PopupSize;
    shape: string;
    animationClass: string;
    fontStyle: any;
    containerSizeClasses: string;
    containerShapeClasses: string;
    mediaShapeClasses: string;
    fontSizeClass: string;
    isSplit: boolean;
    renderMedia: () => React.ReactNode;
    onAction?: () => void;
    onClose?: () => void;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({
    config,
    theme,
    size,
    shape,
    animationClass,
    fontStyle,
    containerSizeClasses,
    containerShapeClasses,
    mediaShapeClasses,
    fontSizeClass,
    isSplit,
    renderMedia,
    onAction,
    onClose
}) => {
    const styles = theme.styles;

    return (
        <div
            className={`relative w-full ${containerSizeClasses} ${animationClass} ${styles.container} ${shape !== 'default' ? containerShapeClasses : ''} shadow-2xl pointer-events-auto`}
            style={{
                backgroundColor: theme.colors?.background,
                borderColor: theme.colors?.border
            }}
        >
            {/* Accent: Badge */}
            {theme.headerAccent === 'badge' && (
                <div
                    className="absolute top-4 left-4 z-20 bg-red-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg"
                    style={{
                        backgroundColor: theme.colors.buttonBg,
                        color: theme.colors.buttonText
                    }}
                >
                    Destaque
                </div>
            )}

            <PopupCloseButton
                onClose={onClose}
                closeButtonStyle={config.closeButtonStyle}
                buttonBg={theme.colors?.buttonBg}
                buttonText={theme.colors?.buttonText}
            />

            {(config.mediaUrl || (config.images && config.images.length > 0)) && theme.id !== 'creative_terminal' && (
                <PopupMediaWrapper
                    styles={styles}
                    isSplit={isSplit}
                    mediaShapeClasses={shape !== 'default' && !isSplit ? mediaShapeClasses : ''}
                    size={size}
                    themeId={theme.id}
                >
                    {renderMedia()}
                </PopupMediaWrapper>
            )}

            <div
                className={`relative z-10 ${styles.contentContainer} ${shape === 'circle' ? 'p-0' : ''} ${size === 'fullscreen' ? 'h-1/2 flex flex-col justify-center items-center' : ''}`}
            >
                {theme.buttonPosition === 'top' && (
                    <button
                        onClick={onAction}
                        className={`w-full py-4 mb-6 transition-all flex items-center justify-center gap-2 ${styles.button} ${size === 'fullscreen' ? 'max-w-md mx-auto text-xl py-6' : ''}`}
                        style={{
                            backgroundColor: theme.colors?.buttonBg,
                            color: theme.colors?.buttonText
                        }}
                    >
                        {config.buttonText} {theme.category !== 'Criativo' && <i className="fas fa-arrow-right"></i>}
                    </button>
                )}

                <h2
                    className={`leading-none mb-1 ${styles.title} ${size === 'fullscreen' ? 'text-5xl md:text-7xl' : ''}`}
                    style={{
                        ...fontStyle,
                        fontSize: config.fontSize ? undefined : 'inherit',
                        color: theme.colors?.title
                    }}
                >
                    {config.title}
                </h2>

                {config.subtitle && (
                    <h3
                        className={`font-bold opacity-80 mb-3 ${size === 'fullscreen' ? 'text-2xl' : 'text-sm'}`}
                        style={{ color: theme.colors?.title, ...fontStyle }}
                    >
                        {config.subtitle}
                    </h3>
                )}

                <p
                    className={`whitespace-pre-line ${styles.description} ${size === 'fullscreen' ? 'text-xl max-w-2xl mx-auto' : ''} ${fontSizeClass}`}
                    style={{
                        ...fontStyle,
                        color: theme.colors?.body
                    }}
                >
                    {config.description}
                </p>

                {config.smallNote && (
                    <p
                        className="mt-4 text-[9px] uppercase tracking-widest opacity-40"
                        style={{ color: theme.colors?.body }}
                    >
                        — {config.smallNote} —
                    </p>
                )}

                {theme.buttonPosition !== 'top' && (
                    <button
                        onClick={onAction}
                        className={`w-full py-4 transition-all flex items-center justify-center gap-2 ${styles.button} ${size === 'fullscreen' ? 'max-w-md mx-auto text-xl py-6' : ''}`}
                        style={{
                            backgroundColor: theme.colors?.buttonBg,
                            color: theme.colors?.buttonText
                        }}
                    >
                        {config.buttonText} {theme.category !== 'Criativo' && <i className="fas fa-arrow-right"></i>}
                    </button>
                )}
            </div>
        </div>
    );
};

export default DefaultLayout;
