'use client';

import React, { useEffect, useState } from 'react';
import { User } from '@/types';

interface WelcomeToastProps {
    user: User;
    onClose: () => void;
}

export const WelcomeToast: React.FC<WelcomeToastProps> = ({ user, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        const autoHide = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 500);
        }, 8000);

        return () => {
            clearTimeout(timer);
            clearTimeout(autoHide);
        };
    }, [onClose]);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(onClose, 500);
    };

    return (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[10050] transition-all duration-700 ease-out transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95'}`}>
            <div className="bg-black/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-2 pr-6 shadow-2xl flex items-center gap-4 group">
                <div className="relative">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-red-600 shadow-lg shadow-red-600/20">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-white">
                                <i className="fas fa-user"></i>
                            </div>
                        )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-black rounded-full animate-pulse"></div>
                </div>

                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Acesso Autorizado</span>
                    <h3 className="text-sm font-bold text-white">
                        Olá, <span className="font-black italic uppercase">{user.name.split(' ')[0]}!</span>
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Bom ver você no Lagoa Formosa No Momento</p>
                </div>

                <button
                    onClick={handleDismiss}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-all ml-4"
                >
                    <i className="fas fa-times text-xs"></i>
                </button>

                {/* Glow Effect */}
                <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent"></div>
            </div>
        </div>
    );
};
