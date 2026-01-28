import React, { useState, useEffect } from 'react';
import { AdPricingConfig, AdPlan, User } from '@/types';
import { userPurchaseItem } from '@/services/supabaseService';
import lfnmCoin from '@/assets/lfnm_coin.png';
import PixRechargeModal from './MyAccountModal/components/PixRechargeModal';

interface PricingModalProps {
    config: AdPricingConfig;
    user?: User | null;
    onClose: () => void;
    onSelectPlan: (planId: string) => void;
    onUpdateUser?: (user: User) => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ config, onClose, onSelectPlan, user, onUpdateUser }) => {
    const [activeCycle, setActiveCycle] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
    const [isProcessing, setIsProcessing] = useState(false);
    const [hiddenPlans, setHiddenPlans] = useState<Set<string>>(new Set());
    const [showPixModal, setShowPixModal] = useState(false);

    const isAdmin = user && ['Admin', 'Administrador', 'Desenvolvedor'].includes(user.role);

    const togglePlanVisibility = (planId: string) => {
        setHiddenPlans(prev => {
            const newSet = new Set(prev);
            if (newSet.has(planId)) {
                newSet.delete(planId);
            } else {
                newSet.add(planId);
            }
            return newSet;
        });
    };

    const handleCommercialContact = () => {
        const number = ("(34) 999123-4567").replace(/\D/g, ''); // Placeholder: should come from settings if possible
        const message = "Olá! Tenho dúvidas sobre os planos de anúncio e gostaria de falar com um consultor.";
        window.open(`https://wa.me/55${number}?text=${encodeURIComponent(message)}`, '_blank');
    };

    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    const getPlacementLabel = (placement: string) => {
        switch (placement) {
            case 'master_carousel': return 'Banner Rotativo (Topo)';
            case 'live_tab': return 'Aba Ao Vivo';
            case 'sidebar': return 'Barra Lateral';
            case 'standard_list': return 'Lista de Parceiros';
            default: return 'Geral';
        }
    };

    const getFrequencyLabel = (freq?: string) => {
        switch (freq) {
            case 'daily': return 'Diária';
            case 'weekly': return 'Semanal';
            case 'biweekly': return 'Quinzenal';
            case 'monthly': return 'Mensal';
            default: return '';
        }
    };

    return (
        <div className="fixed inset-0 z-[7000] bg-[#050505]/95 backdrop-blur-2xl flex items-center justify-center p-0 md:p-4 animate-fadeIn">
            <style>{`
                @keyframes spin-3d {
                    0% { transform: rotateY(0deg); }
                    100% { transform: rotateY(360deg); }
                }
                .animate-coin {
                    animation: spin-3d 3s linear infinite;
                    transform-style: preserve-3d;
                }
            `}</style>

            <div className="absolute inset-0 cursor-pointer" onClick={onClose}></div>

            <button
                onClick={onClose}
                className="fixed top-4 right-4 md:top-10 md:right-10 z-[7100] w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-red-600 text-white rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl border border-white/20 group backdrop-blur-md active:scale-95"
            >
                <i className="fas fa-times text-xl group-hover:rotate-90 transition-transform duration-300"></i>
                <span className="text-[6px] font-black uppercase tracking-[0.2em] mt-1 hidden md:block">Fechar</span>
            </button>

            <div className="w-full max-w-7xl h-full max-h-screen md:max-h-[94vh] overflow-y-auto custom-scrollbar relative z-10 pointer-events-none bg-transparent">
                <div className="text-center mb-10 pt-16 md:pt-14 pointer-events-auto px-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-600/10 border border-red-500/20 rounded-full mb-4 animate-bounce">
                        <i className="fas fa-star text-red-500 text-[10px]"></i>
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Mídia Kit 2026</span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-[1000] uppercase italic tracking-tighter text-white mb-4 leading-none select-none">
                        Destaque sua <span className="text-red-600">Marca</span>
                    </h2>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs max-w-2xl mx-auto leading-relaxed">
                        Escolha o plano ideal para o seu negócio e apareça no maior portal de notícias do <span className="text-white">Alto Paranaíba</span>.
                    </p>

                    <div className="mt-8 flex justify-center sticky top-0 z-50">
                        <div className="bg-zinc-900/80 p-1.5 rounded-[2rem] flex items-center flex-wrap justify-center gap-1 border border-white/10 backdrop-blur-xl shadow-2xl">
                            {[
                                { id: 'daily', label: 'Diário' },
                                { id: 'weekly', label: 'Semanal' },
                                { id: 'monthly', label: 'Mensal' },
                                { id: 'yearly', label: 'Anual' }
                            ].map(cycle => (
                                <button
                                    key={cycle.id}
                                    onClick={() => setActiveCycle(cycle.id as any)}
                                    className={`px-6 py-3 rounded-full text-[10px] font-[1000] uppercase tracking-widest transition-all ${activeCycle === cycle.id
                                        ? 'bg-red-600 text-white shadow-[0_8px_20px_rgba(220,38,38,0.4)] scale-105'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {cycle.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-6 md:px-10 pb-12 justify-center pointer-events-auto">

                    {config.plans.map((plan) => {
                        const isHidden = hiddenPlans.has(plan.id);
                        if (isHidden && !isAdmin) return null;

                        const isMaster = plan.id.toLowerCase().includes('master') || plan.features.placements.includes('master_carousel');
                        const isPopular = plan.isPopular || isMaster;

                        let currentPrice = 0;
                        let periodLabel = '';
                        let dailyEquivalent = 0;
                        let discountPercent = 0;

                        if (activeCycle === 'daily') {
                            currentPrice = plan.prices.daily;
                            periodLabel = '/dia';
                            dailyEquivalent = plan.prices.daily;
                        } else if (activeCycle === 'weekly') {
                            currentPrice = plan.prices.weekly;
                            periodLabel = '/sem';
                            dailyEquivalent = currentPrice / 7;
                        } else if (activeCycle === 'monthly') {
                            currentPrice = plan.prices.monthly;
                            periodLabel = '/mês';
                            dailyEquivalent = currentPrice / 30;
                        } else {
                            currentPrice = plan.prices.yearly;
                            periodLabel = '/ano';
                            dailyEquivalent = currentPrice / 365;
                        }

                        if (activeCycle !== 'daily' && plan.prices.daily > 0) {
                            const baseDailyCost = plan.prices.daily;
                            if (dailyEquivalent < baseDailyCost) {
                                discountPercent = Math.round(((baseDailyCost - dailyEquivalent) / baseDailyCost) * 100);
                            }
                        }

                        return (
                            <div
                                key={plan.id}
                                className={`relative rounded-[3rem] p-10 flex flex-col transition-all duration-500 hover:scale-[1.03] group border ${isHidden ? 'opacity-50' : ''} ${isMaster
                                    ? 'bg-zinc-950 text-white border-zinc-800 shadow-[0_0_60px_rgba(220,38,38,0.1)]'
                                    : 'bg-white text-zinc-900 border-gray-100 shadow-2xl'
                                    }`}
                            >
                                {/* Master Skew Highlight */}
                                {isMaster && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem]"></div>
                                )}

                                {isAdmin && (
                                    <button
                                        onClick={() => togglePlanVisibility(plan.id)}
                                        className="absolute top-6 left-6 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-red-600 border border-white/20 flex items-center justify-center transition-all"
                                    >
                                        <i className={`fas ${isHidden ? 'fa-eye-slash' : 'fa-eye'} text-[10px]`}></i>
                                    </button>
                                )}

                                {isPopular && (
                                    <div className="absolute top-0 right-10 bg-red-600 text-white text-[9px] font-black uppercase px-5 py-2.5 rounded-b-2xl shadow-xl z-10 animate-pulse">
                                        {isMaster ? 'Top Tier' : 'Popular'}
                                    </div>
                                )}

                                <div className="mb-8 mt-4">
                                    <h3 className="text-2xl font-[1000] uppercase italic tracking-tighter flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isMaster ? 'bg-red-600' : 'bg-zinc-100'}`}>
                                            {isMaster ? <i className="fas fa-crown text-white text-sm"></i> : <i className="fas fa-bolt text-red-600 text-sm"></i>}
                                        </div>
                                        {plan.name}
                                    </h3>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-3 leading-relaxed opacity-60`}>
                                        {plan.description || 'Impulsione sua presença agora'}
                                    </p>
                                </div>

                                <div className="mb-10 pb-10 border-b border-dashed border-zinc-200/20">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm font-black opacity-50">LFNM</span>
                                        <span className="text-5xl font-[1000] tracking-tighter italic">{currentPrice}</span>
                                        <span className={`font-black text-xs uppercase opacity-40`}>{periodLabel}</span>
                                    </div>

                                    {discountPercent > 0 && (
                                        <div className="mt-4 flex items-center gap-2">
                                            <div className="bg-green-500/10 text-green-500 text-[9px] font-black uppercase px-3 py-1 rounded-full border border-green-500/20">
                                                Economia de {discountPercent}%
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <ul className="space-y-5 mb-10 flex-1">
                                    {plan.features.placements.map(p => (
                                        <li key={p} className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isMaster ? 'bg-red-500/20 text-red-500' : 'bg-green-100 text-green-600'}`}>
                                                <i className="fas fa-check text-[10px]"></i>
                                            </div>
                                            <span className={`text-[11px] font-black uppercase tracking-tight ${isMaster ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                                {getPlacementLabel(p)}
                                            </span>
                                        </li>
                                    ))}

                                    {plan.features.videoLimit && plan.features.videoLimit > 0 ? (
                                        <li className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                                <i className="fas fa-video text-[10px]"></i>
                                            </div>
                                            <span className={`text-[11px] font-black uppercase tracking-tight ${isMaster ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                                {plan.features.videoLimit} Vídeos Mensais
                                            </span>
                                        </li>
                                    ) : null}

                                    {plan.features.canCreateJobs && (
                                        <li className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                                <i className="fas fa-user-plus text-[10px]"></i>
                                            </div>
                                            <span className={`text-[11px] font-black uppercase tracking-tight ${isMaster ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                                Oferta de Vagas
                                            </span>
                                        </li>
                                    )}
                                </ul>

                                <button
                                    disabled={isProcessing}
                                    onClick={async () => {
                                        if (!user) { onSelectPlan(plan.id); return; }
                                        if ((user.siteCredits || 0) < currentPrice) {
                                            if (confirm(`Saldo insuficiente! Deseja carregar via PIX?`)) { setShowPixModal(true); }
                                            return;
                                        }
                                        if (!confirm(`Confirmar assinatura: ${plan.name}?`)) { return; }
                                        setIsProcessing(true);
                                        try {
                                            const cashbackValue = (plan.cashbackPercent && plan.cashbackPercent > 0) ? (currentPrice * (plan.cashbackPercent / 100)) : 0;
                                            const res = await userPurchaseItem(user.id, 'plan', plan.id, currentPrice, plan.name, { maxProducts: plan.features.maxProducts, videoLimit: plan.features.videoLimit }, cashbackValue);
                                            if (res.success && res.updatedUser) {
                                                if (onUpdateUser && user) { onUpdateUser({ ...user, ...res.updatedUser } as User); }
                                                onClose();
                                            }
                                        } finally { setIsProcessing(false); }
                                    }}
                                    className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all transform active:scale-95 shadow-xl ${isMaster
                                        ? 'bg-red-600 text-white hover:bg-white hover:text-red-600 shadow-red-600/30'
                                        : 'bg-black text-white hover:bg-red-600 shadow-black/20'
                                        }`}
                                >
                                    {isProcessing ? 'Processando...' : (user ? 'Assinar Agora' : 'Selecionar ' + plan.name)}
                                </button>
                            </div>
                        );
                    })}

                </div>

                <div className="mt-8 mb-20 px-6 max-w-2xl mx-auto pointer-events-auto">
                    <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 text-center flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center shadow-2xl shadow-red-600/40 -rotate-6">
                            <i className="fas fa-headset text-2xl text-white"></i>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Ainda tem dúvidas?</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Nossa equipe comercial está pronta para te ajudar a escolher a melhor estratégia.</p>
                        </div>
                        <button
                            onClick={handleCommercialContact}
                            className="mt-2 px-10 py-4 bg-white text-black hover:bg-green-500 hover:text-white rounded-full font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-3 group"
                        >
                            <i className="fab fa-whatsapp text-lg"></i>
                            Falar com um Consultor
                            <i className="fas fa-arrow-right text-[10px] translate-x-0 group-hover:translate-x-2 transition-transform"></i>
                        </button>
                    </div>

                    <div className="mt-12 text-center opacity-30">
                        <button onClick={onClose} className="text-white text-[9px] font-black uppercase tracking-[0.4em] hover:opacity-100 transition-opacity">
                            Fechar Mídia Kit
                        </button>
                    </div>
                </div>
            </div>

            <PixRechargeModal
                isOpen={showPixModal}
                onClose={() => setShowPixModal(false)}
            />
        </div>
    );
};

export default PricingModal;