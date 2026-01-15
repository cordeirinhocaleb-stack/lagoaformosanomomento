
import React from 'react';
import { createPortal } from 'react-dom';
import { GalleryItem } from '../../../types';

interface GalleryLightboxProps {
    isOpen: boolean;
    items: GalleryItem[];
    index: number;
    onClose: () => void;
    onNext: (e?: React.MouseEvent) => void;
    onPrev: (e?: React.MouseEvent) => void;
}

const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
    isOpen,
    items,
    index,
    onClose,
    onNext,
    onPrev
}) => {
    if (!isOpen || items.length === 0) return null;

    const currentItem = items[index];

    return createPortal(
        <div
            className="fixed inset-0 z-[10000] bg-zinc-950 flex items-center justify-center animate-fadeIn select-none p-0 m-0 overflow-hidden"
            onClick={onClose}
        >
            {/* Ambient Cinema Glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <img
                    src={currentItem.url}
                    className="w-full h-full object-cover opacity-30 blur-[120px] scale-150 transition-all duration-1000"
                    alt=""
                />
                <div className="absolute inset-0 bg-zinc-950/60"></div>
            </div>

            {/* Controles Navegação */}
            {items.length > 1 && (
                <>
                    <div className="fixed inset-y-0 left-0 w-32 md:w-64 flex items-center justify-center group/nav" onClick={onPrev}>
                        <button className="w-16 h-40 rounded-full bg-white/5 border border-white/5 backdrop-blur-md flex items-center justify-center text-white/20 group-hover/nav:text-white group-hover/nav:bg-red-600/20 group-hover/nav:border-red-600/40 transition-all duration-500 opacity-0 group-hover/nav:opacity-100 -translate-x-10 group-hover/nav:translate-x-0 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent opacity-0 group-hover/nav:opacity-100"></div>
                            <i className="fas fa-chevron-left text-4xl relative z-10"></i>
                        </button>
                    </div>
                    <div className="fixed inset-y-0 right-0 w-32 md:w-64 flex items-center justify-center group/nav" onClick={onNext}>
                        <button className="w-16 h-40 rounded-full bg-white/5 border border-white/5 backdrop-blur-md flex items-center justify-center text-white/20 group-hover/nav:text-white group-hover/nav:bg-red-600/20 group-hover/nav:border-red-600/40 transition-all duration-500 opacity-0 group-hover/nav:opacity-100 translate-x-10 group-hover/nav:translate-x-0 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-l from-red-600/20 to-transparent opacity-0 group-hover/nav:opacity-100"></div>
                            <i className="fas fa-chevron-right text-4xl relative z-10"></i>
                        </button>
                    </div>
                </>
            )}

            {/* Conteúdo Principal */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-0" onClick={e => e.stopPropagation()}>
                <div className="relative w-full h-full flex items-center justify-center py-12 px-8">
                    <div className="relative inline-block">
                        <img
                            src={currentItem.url}
                            className="max-w-[85vw] max-h-[70vh] w-auto h-auto object-contain shadow-[0_40px_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-700"
                            alt=""
                        />
                        <button
                            onClick={(e) => { e.stopPropagation(); onClose(); }}
                            className="absolute text-white hover:text-white transition-all w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-2xl z-50 group border-2 border-white"
                            style={{ top: '0.5rem', right: '0.5rem' }}
                        >
                            <i className="fas fa-times text-base group-hover:rotate-90 transition-transform duration-300"></i>
                        </button>
                    </div>
                    <div className="absolute -bottom-20 w-[80%] h-32 bg-red-600/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                </div>

                {/* HUD Jornalístico */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4">
                    <div className="bg-zinc-950/98 backdrop-blur-xl rounded-2xl border border-zinc-800/50 shadow-2xl overflow-hidden">
                        <div className="px-6 py-3 flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                {currentItem.caption ? (
                                    <p className="text-white font-semibold text-sm truncate">{currentItem.caption}</p>
                                ) : (
                                    <p className="text-zinc-600 text-xs font-medium uppercase tracking-wide">Imagem {index + 1}</p>
                                )}
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                                <div className="flex items-center gap-2">
                                    {items.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1 rounded-full transition-all duration-500 ${i === index ? 'w-8 bg-red-600 shadow-[0_0_8px_#dc2626]' : 'w-1.5 bg-zinc-700/50'}`}
                                        ></div>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <i className="fas fa-images text-[10px] text-red-600"></i>
                                    <span className="text-[10px] font-black italic text-zinc-500 uppercase">{index + 1}/{items.length}</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-px bg-gradient-to-r from-transparent via-red-600/40 to-transparent"></div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default GalleryLightbox;
