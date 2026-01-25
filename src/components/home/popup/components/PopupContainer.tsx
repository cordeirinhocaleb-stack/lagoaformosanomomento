import React from 'react';

interface PopupContainerProps {
    mode: 'live' | 'preview';
    wrapperClasses: string;
    positionClasses: string;
    overlayClasses: string;
    wrapperPointerEvents: string;
    overlay: string;
    onClose?: () => void;
    children: React.ReactNode;
}

const PopupContainer: React.FC<PopupContainerProps> = ({
    mode,
    wrapperClasses,
    positionClasses,
    overlayClasses,
    wrapperPointerEvents,
    overlay,
    onClose,
    children
}) => {
    return (
        <div className={`${wrapperClasses} flex p-4 ${positionClasses} ${overlayClasses} ${wrapperPointerEvents} transition-all duration-500`}>
            {overlay !== 'transparent' && onClose && (
                <div className="absolute inset-0" onClick={onClose}></div>
            )}
            {children}
        </div>
    );
};

export default PopupContainer;
