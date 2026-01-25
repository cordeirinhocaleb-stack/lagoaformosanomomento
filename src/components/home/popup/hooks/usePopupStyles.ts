import { useMemo } from 'react';
import { PopupSize } from '../../../../types';

interface UsePopupStylesProps {
    mode: 'live' | 'preview';
    position: string;
    overlay: string;
    animation: string;
    shape: string;
    size: PopupSize;
    isSplit: boolean;
}

export const usePopupStyles = ({
    mode,
    position,
    overlay,
    animation,
    shape,
    size,
    isSplit
}: UsePopupStylesProps) => {
    // Classes de Posicionamento
    const { wrapperClasses, positionClasses } = useMemo(() => {
        let wrapper = '';
        let pos = '';

        if (mode === 'live') {
            wrapper = 'fixed inset-0 z-[9999]';
            if (position === 'center') pos = 'items-center justify-center';
            else if (position === 'top-center') pos = 'items-start justify-center pt-20';
            else if (position === 'bottom-center') pos = 'items-end justify-center pb-8';
            else if (position === 'bottom-right') pos = 'items-end justify-end pb-8 pr-4 md:pr-8';
            else if (position === 'bottom-left') pos = 'items-end justify-start pb-8 pl-4 md:pl-8';
            else if (position === 'top-left') pos = 'items-start justify-start pt-20 pl-4 md:pl-8';
            else if (position === 'top-right') pos = 'items-start justify-end pt-20 pr-4 md:pr-8';
            else if (position === 'center-left') pos = 'items-center justify-start pl-4 md:pl-8';
            else if (position === 'center-right') pos = 'items-center justify-end pr-4 md:pr-8';
        } else {
            wrapper = 'absolute inset-0 z-10';
            pos = 'items-center justify-center';
            if (position.includes('top')) pos = 'items-start justify-center pt-4';
            if (position.includes('bottom')) pos = 'items-end justify-center pb-4';
        }

        return { wrapperClasses: wrapper, positionClasses: pos };
    }, [mode, position]);

    // Classes de Overlay
    const overlayClasses = useMemo(() => {
        if (overlay === 'transparent') return 'bg-transparent pointer-events-none';
        if (overlay === 'blur') return 'bg-white/30 backdrop-blur-xl';
        return 'bg-black/80 backdrop-blur-sm';
    }, [overlay]);

    // Classes de Animação
    const animationClass = useMemo(() => {
        if (mode !== 'live') return '';
        if (animation === 'fade') return 'animate-fadeIn';
        if (animation === 'slide-up') return 'animate-slideUp';
        if (animation === 'slide-in-right') return 'animate-slideInRight';
        if (animation === 'slide-in-left') return 'animate-slideInLeft';
        return 'animate-zoomIn';
    }, [mode, animation]);

    // Classes de Shape
    const { containerShapeClasses, mediaShapeClasses } = useMemo(() => {
        if (size === 'fullscreen') return { containerShapeClasses: '', mediaShapeClasses: '' };

        let container = '';
        let media = '';

        if (shape === 'square') {
            container = 'rounded-none';
            media = 'rounded-none';
        } else if (shape === 'rounded') {
            container = 'rounded-3xl';
            media = 'rounded-t-3xl';
        } else if (shape === 'circle' && !isSplit) {
            container = 'rounded-full aspect-square flex flex-col items-center justify-center p-12 text-center';
            media = 'rounded-full w-40 h-40 mx-auto mb-6 overflow-hidden';
        } else if (shape === 'leaf') {
            container = 'rounded-tr-[4rem] rounded-bl-[4rem]';
            media = 'rounded-tr-[3.5rem]';
        } else if (shape === 'heart') {
            container = 'rounded-[3rem] rounded-bl-none rounded-tr-none';
        } else if (shape === 'hexagon') {
            container = 'rounded-xl';
        }

        return { containerShapeClasses: container, mediaShapeClasses: media };
    }, [shape, size, isSplit]);

    const wrapperPointerEvents = overlay === 'transparent' ? 'pointer-events-none' : 'pointer-events-auto';

    return {
        wrapperClasses,
        positionClasses,
        overlayClasses,
        animationClass,
        containerShapeClasses,
        mediaShapeClasses,
        wrapperPointerEvents
    };
};
