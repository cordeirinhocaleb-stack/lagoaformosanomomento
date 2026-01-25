import React from 'react';

interface PopupMediaWrapperProps {
    styles: any;
    isSplit: boolean;
    mediaShapeClasses: string;
    size: string;
    themeId: string;
    children: React.ReactNode;
}

const PopupMediaWrapper: React.FC<PopupMediaWrapperProps> = ({
    styles,
    isSplit,
    mediaShapeClasses,
    size,
    themeId,
    children
}) => {
    return (
        <div
            className={`${styles.mediaContainer} ${isSplit ? 'h-64 md:h-full' : ''} relative ${mediaShapeClasses} ${size === 'fullscreen' ? 'h-1/2' : ''} p-2 bg-transparent border-0`}
        >
            {children}
        </div>
    );
};

export default PopupMediaWrapper;
