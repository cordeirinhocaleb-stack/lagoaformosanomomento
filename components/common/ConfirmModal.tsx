import React from 'react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
    type = 'warning'
}) => {
    if (!isOpen) return null;

    const typeColors = {
        danger: {
            icon: 'fa-trash-alt',
            iconBg: 'bg-red-500',
            confirmBtn: 'bg-red-600 hover:bg-red-700 border-red-700'
        },
        warning: {
            icon: 'fa-exclamation-triangle',
            iconBg: 'bg-yellow-500',
            confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 border-yellow-700'
        },
        info: {
            icon: 'fa-info-circle',
            iconBg: 'bg-blue-500',
            confirmBtn: 'bg-blue-600 hover:bg-blue-700 border-blue-700'
        }
    };

    const colors = typeColors[type];

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center animate-fadeIn"
            onClick={onCancel}
        >
            {/* Backdrop com blur */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

            {/* Modal */}
            <div
                className="relative bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-slideInRight"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Gradient Top Border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500" />

                {/* Content */}
                <div className="p-8">
                    {/* Icon */}
                    <div className={`w-16 h-16 ${colors.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl`}>
                        <i className={`fas ${colors.icon} text-3xl text-white`}></i>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white text-center mb-3">
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="text-sm text-zinc-400 text-center leading-relaxed mb-8">
                        {message}
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-bold uppercase text-xs tracking-widest transition-all border border-zinc-700 shadow-lg"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 px-6 py-3 ${colors.confirmBtn} text-white rounded-full font-bold uppercase text-xs tracking-widest transition-all border shadow-lg`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>

                {/* Police Flash Effect on Hover */}
                <div className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br from-red-500/20 via-transparent to-blue-500/20" />
            </div>
        </div>,
        document.body
    );
};

export default ConfirmModal;
