
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface SuccessModalProps {
    visible: boolean;
    title?: string;
    message: string;
    onClose: () => void;
    autoClose?: boolean;
    duration?: number;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
    visible,
    title = "Sucesso!",
    message,
    onClose,
    autoClose = false,
    duration = 5000
}) => {
    const [show, setShow] = useState(visible);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        if (visible) {
            setShow(true);
            setAnimating(true); // Start enter animation

            if (autoClose) {
                const timer = setTimeout(() => {
                    handleClose();
                }, duration);
                return () => clearTimeout(timer);
            }
        } else {
            setAnimating(false); // Start exit animation
            setTimeout(() => setShow(false), 300); // Remove from DOM after animation
        }
    }, [visible, autoClose, duration]);

    const handleClose = () => {
        setAnimating(false);
        setTimeout(() => {
            setShow(false);
            onClose();
        }, 300);
    };

    if (!show) {return null;}

    return createPortal(
        <div className={`fixed inset-0 z-[10040] flex items-center justify-center p-4 transition-all duration-300 ${animating ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
                onClick={handleClose}
            ></div>

            {/* Modal Card */}
            <div className={`
                relative bg-[#0F0F0F] border border-green-500/20 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(34,197,94,0.1)]
                transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
                flex flex-col items-center text-center
                ${animating ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}
            `}>

                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6 group">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-transform duration-500 group-hover:scale-110">
                        <i className="fas fa-check text-black text-xl"></i>
                    </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">
                    {title}
                </h3>

                <p className="text-gray-400 mb-8 leading-relaxed text-sm">
                    {message}
                </p>

                {/* Button */}
                <button
                    onClick={handleClose}
                    className="w-full py-4 rounded-xl bg-green-600 text-black font-black uppercase tracking-widest text-xs hover:bg-white hover:text-green-700 transition-all shadow-lg hover:shadow-green-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                    <span>Continuar</span>
                    <i className="fas fa-arrow-right"></i>
                </button>

            </div>
        </div>,
        document.body
    );
};

export default SuccessModal;
