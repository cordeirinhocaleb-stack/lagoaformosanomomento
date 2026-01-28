import React from 'react';
import { AdvertiserInfoSummary } from '../../../../types';

interface AdvertiserInfoModalProps {
    info: AdvertiserInfoSummary;
    onClose: () => void;
}

const AdvertiserInfoModal: React.FC<AdvertiserInfoModalProps> = ({ info, onClose }) => {
    const isSiteContact = info.id === 'site_contact_ads';

    // Format Phone
    const formatPhone = (phone?: string) => {
        if (!phone) return null;
        return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    };

    // Open WhatsApp
    const handleWhatsApp = () => {
        if (!info.whatsapp && !info.phone) return;
        const number = (info.whatsapp || info.phone || '').replace(/\D/g, '');
        const message = info.whatsappMessage || "Oi eu vim pelo portal Lagoa Formosa No Momento, gostaria de saber mais sobre anúncios.";
        window.open(`https://wa.me/55${number}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-xl transition-all duration-500"
                onClick={onClose}
            ></div>

            {/* Modal Card */}
            <div className={`relative bg-white dark:bg-zinc-900 w-full ${isSiteContact ? 'max-w-lg' : 'max-w-md'} rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden animate-slideUp border border-white/10`}>

                {/* Header Section */}
                <div className={`h-36 relative overflow-hidden ${isSiteContact ? 'bg-zinc-950' : 'bg-gray-100 dark:bg-zinc-800'}`}>
                    {info.logoUrl ? (
                        <>
                            <div className="absolute inset-0 bg-black/40 z-10" />
                            <img
                                src={info.logoUrl}
                                className="w-full h-full object-cover blur-2xl scale-150 opacity-50 transform translate-y-8"
                                alt=""
                            />
                        </>
                    ) : (
                        <div className={`w-full h-full ${isSiteContact ? 'bg-gradient-to-br from-red-600 via-red-800 to-zinc-950' : 'bg-gradient-to-br from-blue-600 to-purple-700'}`}>
                            {isSiteContact && (
                                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center bg-black/30 text-white rounded-full hover:bg-red-600 transition-all backdrop-blur-md border border-white/10"
                    >
                        <i className="fas fa-times"></i>
                    </button>

                    {isSiteContact && (
                        <div className="absolute inset-0 flex items-center justify-center z-15">
                            <span className="text-white/10 font-black text-6xl tracking-[0.2em] uppercase italic select-none">MÍDIA</span>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="px-6 sm:px-10 pb-10 -mt-16 relative flex flex-col items-center text-center">

                    {/* Brand Identity / Logo */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative w-32 h-32 rounded-[2rem] bg-white dark:bg-zinc-900 shadow-2xl p-2 mb-6 flex items-center justify-center overflow-hidden border-4 border-white dark:border-zinc-900 animate-float">
                            {info.logoUrl ? (
                                <img src={info.logoUrl} alt={info.name} className="w-full h-full object-contain" />
                            ) : (
                                <div className={`w-full h-full rounded-2xl flex items-center justify-center ${isSiteContact ? 'bg-red-50 dark:bg-red-500/10 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <i className={`fas ${isSiteContact ? 'fa-rocket' : 'fa-store'} text-4xl`}></i>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Information */}
                    <h2 className={`text-2xl sm:text-3xl font-black ${isSiteContact ? 'text-zinc-900 dark:text-white' : 'text-zinc-900 dark:text-white'} mb-2 tracking-tighter uppercase italic`}>
                        {typeof info.name === 'string' ? info.name : ''}
                    </h2>

                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        <span className="px-4 py-1 bg-red-600 text-white text-[10px] uppercase font-black tracking-widest rounded-full shadow-lg shadow-red-500/20">
                            {info.category || 'Parceiro'}
                        </span>
                        {isSiteContact && (
                            <span className="px-4 py-1 bg-zinc-900 text-zinc-100 text-[10px] uppercase font-black tracking-widest rounded-full">
                                Premium
                            </span>
                        )}
                    </div>

                    {/* Specialized Benefits for Advertisers */}
                    {isSiteContact && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-8">
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-white/5 flex flex-col items-center">
                                <i className="fas fa-eye text-red-500 mb-2"></i>
                                <span className="text-[9px] font-black uppercase text-gray-400 dark:text-zinc-500">Visibilidade</span>
                                <span className="text-xs font-bold dark:text-white">+100k views/mês</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-white/5 flex flex-col items-center">
                                <i className="fas fa-bullseye text-blue-500 mb-2"></i>
                                <span className="text-[9px] font-black uppercase text-gray-400 dark:text-zinc-500">Público</span>
                                <span className="text-xs font-bold dark:text-white">Segmentado</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-white/5 flex flex-col items-center">
                                <i className="fas fa-certificate text-orange-500 mb-2"></i>
                                <span className="text-[9px] font-black uppercase text-gray-400 dark:text-zinc-500">Marca</span>
                                <span className="text-xs font-bold dark:text-white">Credibilidade</span>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="w-full space-y-4">
                        <button
                            onClick={handleWhatsApp}
                            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl ${isSiteContact
                                ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-red-600 hover:text-white'
                                : 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20'
                                }`}
                        >
                            <i className={`fab fa-whatsapp ${isSiteContact ? 'text-lg' : 'text-xl'}`}></i>
                            <span>{isSiteContact ? 'Falar com Consultor Comercial' : 'Conversar no WhatsApp'}</span>
                        </button>

                        {/* Additional Info Box */}
                        <div className="w-full py-4 px-6 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl text-left border border-gray-100 dark:border-zinc-800 transition-colors group">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center shrink-0 shadow-sm">
                                    <i className={`fas ${isSiteContact ? 'fa-info-circle text-blue-500' : 'fa-map-marker-alt text-red-500'}`}></i>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                        {isSiteContact ? 'Sobre a Publicidade' : 'Localização'}
                                    </h3>
                                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                        {isSiteContact
                                            ? "Anuncie de forma profissional com banners, popups e reportagens exclusivas para sua marca."
                                            : (typeof (info.location || info.address) === 'string' ? (info.location || info.address) : 'Endereço não informado')
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Close Button */}
                    <button
                        onClick={onClose}
                        className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-red-500 transition-colors"
                    >
                        Talvez mais tarde
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdvertiserInfoModal;
