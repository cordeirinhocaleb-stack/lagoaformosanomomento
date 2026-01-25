import React from 'react';

interface PopupCloseButtonProps {
    onClose?: () => void;
    closeButtonStyle?: 'default' | 'square' | 'circle';
    buttonBg?: string;
    buttonText?: string;
}

const PopupCloseButton: React.FC<PopupCloseButtonProps> = ({
    onClose,
    closeButtonStyle = 'default',
    buttonBg,
    buttonText
}) => {
    const getButtonClasses = () => {
        if (closeButtonStyle === 'square') {
            return 'top-0 right-0 w-12 h-12 rounded-none';
        }
        if (closeButtonStyle === 'circle') {
            return '-top-4 -right-4 w-10 h-10 rounded-full';
        }
        return 'top-4 right-4 w-8 h-8 rounded-lg';
    };

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClose && onClose();
            }}
            className={`absolute z-[100] transition-all flex items-center justify-center group active:scale-90 shadow-xl ${getButtonClasses()}`}
            title="Fechar"
            style={{
                backgroundColor: buttonBg,
                color: buttonText
            }}
        >
            <i className="fas fa-times text-lg group-hover:rotate-90 transition-transform duration-300"></i>
        </button>
    );
};

export default PopupCloseButton;
