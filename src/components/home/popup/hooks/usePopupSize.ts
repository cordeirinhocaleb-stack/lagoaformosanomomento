import { PopupSize } from '../../../../types';

export const usePopupSize = (size: PopupSize, mode: 'live' | 'preview', isSplit: boolean) => {
    const getSizeClass = (s: PopupSize): string => {
        switch (s) {
            case 'xs': return 'max-w-xs';
            case 'sm': return 'max-w-sm';
            case 'md': return 'max-w-md';
            case 'lg': return 'max-w-lg';
            case 'xl': return 'max-w-xl';
            case '2xl': return 'max-w-2xl';
            case 'fullscreen': return 'w-full h-full rounded-none max-w-none';
            case 'banner_top': return 'w-full max-w-4xl fixed top-0 left-1/2 -translate-x-1/2 mt-4';
            case 'banner_bottom': return 'w-full max-w-4xl fixed bottom-0 left-1/2 -translate-x-1/2 mb-4';
            case 'sidebar_left': return 'w-80 h-auto fixed left-4 top-1/2 -translate-y-1/2';
            case 'sidebar_right': return 'w-80 h-auto fixed right-4 top-1/2 -translate-y-1/2';
            default: return 'max-w-md';
        }
    };

    let containerSizeClasses = getSizeClass(size);

    if (isSplit && !containerSizeClasses.includes('max-w') && size !== 'fullscreen') {
        containerSizeClasses += ' max-w-4xl grid md:grid-cols-2';
    }

    if (mode === 'preview') {
        if (size === 'banner_top' || size === 'banner_bottom') {
            containerSizeClasses = 'w-full max-w-sm';
        }
        if (size === 'sidebar_left' || size === 'sidebar_right') {
            containerSizeClasses = 'w-64';
        }
        if (size === 'fullscreen') {
            containerSizeClasses = 'w-full h-full';
        }
    }

    return { containerSizeClasses, getSizeClass };
};
