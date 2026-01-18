
import React, { useState, useEffect } from 'react';
import { Advertiser } from '../../types';

interface MediaBoxProps {
    ad: Advertiser;
    className?: string;
}

export const MediaBox: React.FC<MediaBoxProps> = ({ ad, className }) => {
    const urls = ad.logoUrls?.filter(u => !!u) || [];
    const mainImg = ad.logoUrl;
    const finalUrls = urls.length > 0 ? urls : (mainImg ? [mainImg] : []);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Efeito para alternar imagens se houver mais de uma
    useEffect(() => {
        if (ad.mediaType === 'video' || finalUrls.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % finalUrls.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [finalUrls.length, ad.mediaType]);

    if (ad.mediaType === 'video' && ad.videoUrl) {
        return (
            <div className={className}>
                <video
                    src={ad.videoUrl}
                    className="w-full h-full object-cover"
                    autoPlay muted loop playsInline
                />
            </div>
        );
    }

    if (finalUrls.length === 0) {
        return (
            <div className={className}>
                <i className="fas fa-store text-zinc-300 text-xl lg:text-2xl"></i>
            </div>
        );
    }

    return (
        <div className={`${className} relative overflow-hidden`}>
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest z-10 border border-white/10 shadow-sm">
                {ad.category}
            </div>
            {finalUrls.map((url, idx) => {
                const isActive = currentIndex === idx;

                // Mapeamento de classes de animação baseado no transitionType
                let activeClasses = "opacity-100 scale-100 translate-x-0";
                let inactiveClasses = "opacity-0";

                if (ad.transitionType === 'slide') {
                    inactiveClasses = "opacity-0 translate-x-full";
                } else if (ad.transitionType === 'zoom') {
                    inactiveClasses = "opacity-0 scale-125";
                } else { // fade (default)
                    inactiveClasses = "opacity-0";
                }

                return (
                    <img
                        key={url + idx}
                        src={url}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${isActive ? activeClasses : inactiveClasses
                            }`}
                        alt={`${ad.name} - Imagem ${idx + 1}`}
                    />
                );
            })}
        </div>
    );
};

interface AdvertiserCardProps {
    ad: Advertiser;
    onClick: (ad: Advertiser) => void;
    className?: string;
    innerClassName?: string;
}

export const AdvertiserCard: React.FC<AdvertiserCardProps> = ({ ad, onClick, className, innerClassName }) => {
    return (
        <div
            onClick={() => onClick(ad)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(ad); } }}
            className={`cursor-pointer group w-full bg-gray-50 dark:bg-zinc-800/50 rounded-[1.5rem] lg:rounded-[2.2rem] hover:bg-white dark:hover:bg-zinc-800 border-2 border-transparent hover:border-red-600 transition-all duration-300 active:scale-[0.98] overflow-hidden shadow-sm hover:shadow-2xl flex flex-col min-h-[130px] lg:min-h-[190px] ${className || ''}`}
        >
            <MediaBox
                ad={ad}
                className="w-full h-20 lg:h-auto lg:aspect-[16/10] shrink-0 bg-white dark:bg-zinc-900"
            />

            <div className={`flex flex-col items-center p-1.5 lg:p-3 gap-0.5 w-full flex-grow justify-center ${innerClassName || ''}`}>
                <div className="flex items-center justify-center gap-1.5 w-full">
                    <h4 className="text-[9px] lg:text-[11px] font-[1000] text-gray-900 dark:text-white uppercase tracking-tight leading-tight truncate max-w-[65%]">{ad.name}</h4>

                    {/* Mini Ícones Sociais - Ao lado do título */}
                    <div className="flex items-center justify-center gap-0.5 lg:gap-1 shrink-0">
                        {ad.internalPage?.whatsapp && (
                            <button
                                onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/55${ad.internalPage!.whatsapp.replace(/\D/g, '')}`, '_blank'); }}
                                className="w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center rounded-full bg-green-100 hover:bg-green-500 text-green-600 hover:text-white transition-all duration-300 hover:scale-125 hover:shadow-md active:scale-90 shadow-sm"
                                title="WhatsApp"
                            >
                                <i className="fab fa-whatsapp text-[9px] lg:text-xs"></i>
                            </button>
                        )}
                        {ad.internalPage?.instagram && (
                            <button
                                onClick={(e) => { e.stopPropagation(); window.open(`https://instagram.com/${ad.internalPage!.instagram.replace('@', '').trim()}`, '_blank'); }}
                                className="w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center rounded-full bg-pink-100 hover:bg-pink-500 text-pink-600 hover:text-white transition-all duration-300 hover:scale-125 hover:shadow-md active:scale-90 shadow-sm"
                                title="Instagram"
                            >
                                <i className="fab fa-instagram text-[9px] lg:text-xs"></i>
                            </button>
                        )}
                        {ad.internalPage?.tiktok && (
                            <button
                                onClick={(e) => { e.stopPropagation(); window.open(`https://tiktok.com/@${ad.internalPage!.tiktok?.replace('@', '').trim()}`, '_blank'); }}
                                className="w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-700 hover:bg-black text-black dark:text-white hover:text-white transition-all duration-300 hover:scale-125 hover:shadow-md active:scale-90 shadow-sm"
                                title="TikTok"
                            >
                                <i className="fab fa-tiktok text-[9px] lg:text-xs"></i>
                            </button>
                        )}
                        {ad.internalPage?.kwai && (
                            <button
                                onClick={(e) => { e.stopPropagation(); window.open(`https://kwai.com/@${ad.internalPage!.kwai?.replace('@', '').trim()}`, '_blank'); }}
                                className="w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center rounded-full bg-orange-100 hover:bg-orange-500 text-orange-600 hover:text-white transition-all duration-300 hover:scale-125 hover:shadow-md active:scale-90 shadow-sm"
                                title="Kwai"
                            >
                                <i className="fas fa-video text-[8px] lg:text-[10px]"></i>
                            </button>
                        )}
                        {ad.internalPage?.telegram && (
                            <button
                                onClick={(e) => { e.stopPropagation(); window.open(`https://t.me/${ad.internalPage!.telegram?.replace('@', '').trim()}`, '_blank'); }}
                                className="w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-500 text-blue-500 hover:text-white transition-all duration-300 hover:scale-125 hover:shadow-md active:scale-90 shadow-sm"
                                title="Telegram"
                            >
                                <i className="fab fa-telegram text-[9px] lg:text-xs"></i>
                            </button>
                        )}
                        {ad.externalUrl && (
                            <button
                                onClick={(e) => { e.stopPropagation(); window.open(ad.externalUrl, '_blank'); }}
                                className="w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-600 text-blue-400 hover:text-white transition-all duration-300 hover:scale-125 hover:shadow-md active:scale-90 shadow-sm"
                                title="Visitar Site"
                            >
                                <i className="fas fa-globe text-[9px] lg:text-xs"></i>
                            </button>
                        )}
                    </div>
                </div>

                {ad.internalPage?.description && (
                    <div className="mt-1 pt-1 border-t border-gray-200/50 dark:border-white/5 w-full">
                        <p className="text-[7px] lg:text-[9px] font-bold text-gray-400 dark:text-zinc-500 italic line-clamp-2 leading-tight text-center">
                            "{ad.internalPage.description}"
                        </p>
                    </div>
                )}

                {/* Botão de Chamada para Ação (Contextual) */}
                <div className="mt-1 w-full group/btn">
                    {ad.redirectType === 'whatsapp' ? (
                        <div className="w-full py-1 lg:py-2 bg-green-500 text-white rounded-xl lg:rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 group-hover/btn:scale-105 group-active/btn:scale-95 transition-all duration-300 hover:shadow-xl">
                            <i className="fab fa-whatsapp text-[10px] lg:text-[12px]"></i>
                            <span className="text-[7px] lg:text-[9px] font-[1000] uppercase tracking-wider">WhatsApp</span>
                        </div>
                    ) : ad.redirectType === 'instagram' ? (
                        <div className="w-full py-1 lg:py-2 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white rounded-xl lg:rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 group-hover/btn:scale-105 group-active/btn:scale-95 transition-all duration-300 hover:shadow-xl">
                            <i className="fab fa-instagram text-[10px] lg:text-[12px]"></i>
                            <span className="text-[7px] lg:text-[9px] font-[1000] uppercase tracking-wider">Instagram</span>
                        </div>
                    ) : ad.redirectType === 'tiktok' ? (
                        <div className="w-full py-1 lg:py-2 bg-black text-white rounded-xl lg:rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-black/20 group-hover/btn:scale-105 group-active/btn:scale-95 transition-all duration-300 hover:shadow-xl border border-zinc-800">
                            <i className="fab fa-tiktok text-[10px] lg:text-[12px]"></i>
                            <span className="text-[7px] lg:text-[9px] font-[1000] uppercase tracking-wider">TikTok</span>
                        </div>
                    ) : ad.redirectType === 'kwai' ? (
                        <div className="w-full py-1 lg:py-2 bg-orange-500 text-white rounded-xl lg:rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 group-hover/btn:scale-105 group-active/btn:scale-95 transition-all duration-300 hover:shadow-xl">
                            <i className="fas fa-video text-[10px] lg:text-[12px]"></i>
                            <span className="text-[7px] lg:text-[9px] font-[1000] uppercase tracking-wider">Kwai</span>
                        </div>
                    ) : ad.redirectType === 'telegram' ? (
                        <div className="w-full py-1 lg:py-2 bg-blue-500 text-white rounded-xl lg:rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 group-hover/btn:scale-105 group-active/btn:scale-95 transition-all duration-300 hover:shadow-xl">
                            <i className="fab fa-telegram text-[10px] lg:text-[12px]"></i>
                            <span className="text-[7px] lg:text-[9px] font-[1000] uppercase tracking-wider">Telegram</span>
                        </div>
                    ) : (
                        <div className="w-full py-1 lg:py-2 bg-red-600 text-white rounded-xl lg:rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 group-hover/btn:scale-105 group-active/btn:scale-95 transition-all duration-300 hover:shadow-xl">
                            <i className="fas fa-external-link-alt text-[9px] lg:text-[11px]"></i>
                            <span className="text-[7px] lg:text-[9px] font-[1000] uppercase tracking-wider">Ver Site</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-red-600 h-1 w-full mt-auto opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
    );
};
