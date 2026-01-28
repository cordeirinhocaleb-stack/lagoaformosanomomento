import React, { useState } from 'react';
import { User, AdPricingConfig } from '../../../../types';
import UserStorePOS from '../UserStorePOS';
import PixRechargeModal from '../components/PixRechargeModal';
import lfnmCoin from '@/assets/lfnm_coin.png';

interface BillingSectionProps {
    user: User;
    adConfig?: AdPricingConfig;
    onUpdateUser: (user: User) => void;
    userAds: any[];
    isLoadingAds: boolean;
    AdvertiserCard: React.FC<any>;
}


const BillingSection: React.FC<BillingSectionProps> = ({ user, adConfig, onUpdateUser, userAds, isLoadingAds, AdvertiserCard }) => {
    const [showPixModal, setShowPixModal] = useState(false);

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-fadeIn">

            {/* --- SEÇÃO DE SALDO E RECARGA --- */}
            <div className="bg-zinc-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-[60px]"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center relative group">
                            <style>{`
                                @keyframes coin-rotate {
                                    0% { transform: rotateY(0deg); }
                                    100% { transform: rotateY(360deg); }
                                }
                                .animate-coin-slow {
                                    animation: coin-rotate 4s linear infinite;
                                }
                            `}</style>
                            <img
                                src={typeof lfnmCoin === 'object' ? lfnmCoin.src : lfnmCoin}
                                alt="$"
                                className="w-14 h-14 object-contain animate-coin-slow"
                            />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-1 block">Saldo em Carteira</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl md:text-5xl font-[1000] tracking-tighter italic">
                                    C$ {user.siteCredits?.toFixed(2) || '0.00'}
                                </span>
                                <span className="text-red-500 font-black text-xs uppercase italic">LFNM</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowPixModal(true)}
                        className="group flex items-center gap-4 bg-white text-black px-8 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl hover:shadow-red-600/20 active:scale-95"
                    >
                        <i className="fab fa-pix text-xl group-hover:scale-125 transition-transform"></i>
                        Recarregar via PIX
                    </button>
                </div>
            </div>

            {/* --- SEÇÃO 1: DASHBOARD DE ANÚNCIOS --- */}
            <section>
                <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-2">
                    <h3 className="text-xl font-black uppercase text-gray-900 tracking-tighter flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                            <i className="fas fa-bullhorn text-lg"></i>
                        </div>
                        Meus Anúncios
                    </h3>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">
                        {userAds ? userAds.length : 0} Ativos
                    </span>
                </div>

                {isLoadingAds ? (
                    <div className="flex justify-center py-12">
                        <div className="flex flex-col items-center gap-3 text-gray-300 animate-pulse">
                            <i className="fas fa-circle-notch fa-spin text-3xl"></i>
                            <span className="text-xs font-black uppercase tracking-widest">Carregando ativos...</span>
                        </div>
                    </div>
                ) : userAds && userAds.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {userAds.map((ad: any) => (
                            <AdvertiserCard key={ad.id} ad={ad} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-3xl p-8 border-2 border-dashed border-gray-200 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-300 shadow-sm mb-4">
                            <i className="fas fa-ad text-2xl"></i>
                        </div>
                        <h4 className="text-sm font-black uppercase text-gray-400 tracking-widest mb-1">Nenhum anúncio ativo</h4>
                        <p className="text-xs text-gray-400 max-w-xs mb-6">Você ainda não tem campanhas rodando. Use a loja abaixo para impulsionar seu alcance!</p>
                    </div>
                )}
            </section>

            {/* --- SEÇÃO 2: POS / LOJA --- */}
            <section>
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-2">
                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white shadow-lg">
                        <i className="fas fa-shopping-cart text-sm"></i>
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase text-gray-900 tracking-tighter leading-none">Loja de Recursos</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Adquira boosts e planos</p>
                    </div>
                </div>

                <UserStorePOS user={user} adConfig={adConfig} onUpdateUser={onUpdateUser} onOpenPix={() => setShowPixModal(true)} />
            </section>

            {/* Modal de Recarga Pix */}
            <PixRechargeModal
                isOpen={showPixModal}
                onClose={() => setShowPixModal(false)}
                user={user}
            />
        </div>
    );
};

export default BillingSection;

