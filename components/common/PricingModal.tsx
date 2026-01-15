import React, { useState, useEffect } from 'react';
import { AdPricingConfig, AdPlan, User } from '../../types';
import { userPurchaseItem } from '../../services/supabaseService';

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
        <div className="fixed inset-0 z-[7000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
            {/* Área de clique externa para fechar */}
            <div className="absolute inset-0 cursor-pointer" onClick={onClose}></div>

            {/* BOTÃO FECHAR FIXO SUPERIOR */}
            <button
                onClick={onClose}
                className="fixed top-6 right-6 md:top-10 md:right-10 z-[7100] w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-red-600 text-white rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl border border-white/20 group backdrop-blur-md active:scale-95"
            >
                <i className="fas fa-times text-xl md:text-2xl group-hover:rotate-90 transition-transform duration-300"></i>
                <span className="text-[7px] font-black uppercase tracking-widest mt-1 hidden md:block">Fechar</span>
            </button>

            <div className="w-full max-w-7xl h-full max-h-[92vh] overflow-y-auto custom-scrollbar relative z-10 pointer-events-none">
                <div className="text-center mb-8 pt-12 md:pt-20 pointer-events-auto">
                    <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-4">
                        Destaque sua <span className="text-red-600">Marca</span>
                    </h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs md:text-sm max-w-2xl mx-auto px-4">
                        Escolha o plano ideal para o seu negócio e apareça para milhares de leitores no maior portal da região.
                    </p>

                    {user && (
                        <div className="mt-4 bg-zinc-800/80 inline-flex items-center gap-3 px-6 py-2 rounded-full border border-zinc-700 backdrop-blur-md">
                            <i className="fas fa-wallet text-green-500"></i>
                            <div className="text-left">
                                <p className="text-[8px] font-black uppercase text-zinc-400">Seu Saldo</p>
                                <p className="text-sm font-black text-white">C$ {(user.siteCredits || 0).toFixed(2)}</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex justify-center px-4">
                        <div className="bg-zinc-900/50 p-1.5 rounded-2xl flex items-center flex-wrap justify-center gap-1 border border-white/5 backdrop-blur-md">
                            <button
                                onClick={() => setActiveCycle('daily')}
                                className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeCycle === 'daily' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                Diário
                            </button>
                            <button
                                onClick={() => setActiveCycle('weekly')}
                                className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeCycle === 'weekly' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                Semanal
                            </button>
                            <button
                                onClick={() => setActiveCycle('monthly')}
                                className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeCycle === 'monthly' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                Mensal
                            </button>
                            <button
                                onClick={() => setActiveCycle('yearly')}
                                className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeCycle === 'yearly' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                Anual
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 pb-12 justify-center pointer-events-auto">

                    {config.plans.map((plan) => {
                        const isMaster = plan.features.placements.includes('master_carousel');
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
                                className={`relative rounded-[2.5rem] p-8 flex flex-col transition-transform duration-500 hover:scale-[1.02] border ${isMaster
                                    ? 'bg-black text-white border-zinc-800 shadow-[0_0_40px_rgba(220,38,38,0.2)]'
                                    : 'bg-white text-zinc-900 border-gray-100 shadow-xl'
                                    }`}
                            >
                                {isPopular && (
                                    <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black uppercase px-4 py-2 rounded-bl-2xl shadow-lg z-10">
                                        {isMaster ? 'Mais Vendido' : 'Popular'}
                                    </div>
                                )}

                                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${isMaster ? 'from-red-600 to-red-800' : 'from-gray-200 to-gray-400'}`}></div>

                                <div className="mb-6 mt-2">
                                    <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                        {isMaster ? <i className="fas fa-crown text-yellow-400 text-lg"></i> : <i className="fas fa-star text-blue-500 text-lg"></i>}
                                        {plan.name}
                                    </h3>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${isMaster ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                        {plan.description || 'Plano de visibilidade'}
                                    </p>
                                </div>

                                <div className="mb-8 pb-8 border-b border-dashed border-zinc-200/20">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black">R$ {currentPrice}</span>
                                        <span className={`font-bold text-xs ${isMaster ? 'text-zinc-500' : 'text-zinc-400'}`}>{periodLabel}</span>
                                    </div>

                                    {activeCycle !== 'daily' && (
                                        <div className={`text-[10px] font-bold uppercase mt-1 ${isMaster ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                            Equivale a R$ {dailyEquivalent.toFixed(2)}/dia
                                        </div>
                                    )}

                                    {discountPercent > 0 && (
                                        <div className="mt-3 text-[10px] font-bold uppercase text-green-500 bg-green-500/10 inline-block px-2 py-1 rounded">
                                            {discountPercent}% OFF vs Diário
                                        </div>
                                    )}

                                    {plan.cashbackPercent && plan.cashbackPercent > 0 ? (
                                        <div className={`mt-3 flex items-center gap-2 px-3 py-1 rounded-lg w-fit ${isMaster ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'}`}>
                                            <i className="fas fa-wallet text-xs"></i>
                                            <span className="text-[10px] font-black uppercase">Cashback {plan.cashbackPercent}%</span>
                                        </div>
                                    ) : null}
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    <li className="flex items-start gap-3 text-xs font-bold">
                                        <i className={`fas fa-check mt-0.5 ${isMaster ? 'text-red-500' : 'text-green-500'}`}></i>
                                        <div className={isMaster ? 'text-zinc-300' : 'text-zinc-600'}>
                                            Exibição em:
                                            <ul className="mt-1 space-y-1">
                                                {plan.features.placements.map(p => (
                                                    <li key={p} className={`text-[10px] uppercase px-2 py-0.5 rounded w-fit ${isMaster ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-black'}`}>
                                                        {getPlacementLabel(p)}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </li>

                                    {plan.features.videoLimit && plan.features.videoLimit > 0 ? (
                                        <li className="flex items-start gap-3 text-xs font-bold">
                                            <i className="fas fa-video mt-0.5 text-blue-500"></i>
                                            <span className={isMaster ? 'text-zinc-300' : 'text-zinc-600'}>
                                                {plan.features.videoLimit} Vídeos Comerciais / Mês
                                            </span>
                                        </li>
                                    ) : null}

                                    {plan.features.socialFrequency && (
                                        <li className="flex items-start gap-3 text-xs font-bold">
                                            <i className="fas fa-bullhorn mt-0.5 text-pink-500"></i>
                                            <span className={isMaster ? 'text-zinc-300' : 'text-zinc-600'}>
                                                Divulgação nas Redes: <span className="uppercase">{getFrequencyLabel(plan.features.socialFrequency)}</span>
                                            </span>
                                        </li>
                                    )}

                                    <li className="flex items-start gap-3 text-xs font-bold">
                                        <i className={`fas ${plan.features.maxProducts === 0 || plan.features.maxProducts > 0 ? 'fa-check' : 'fa-times'} mt-0.5 ${isMaster ? 'text-red-500' : 'text-green-500'}`}></i>
                                        <span className={isMaster ? 'text-zinc-300' : 'text-zinc-600'}>
                                            {plan.features.maxProducts === 0
                                                ? 'Produtos Ilimitados na Vitrine'
                                                : plan.features.maxProducts > 0
                                                    ? `Até ${plan.features.maxProducts} Produtos na Vitrine`
                                                    : 'Sem Vitrine de Produtos'}
                                        </span>
                                    </li>

                                    <li className={`flex items-start gap-3 text-xs font-bold ${!plan.features.canCreateJobs ? 'opacity-50' : ''}`}>
                                        <i className={`fas ${plan.features.canCreateJobs ? 'fa-check' : 'fa-times'} mt-0.5 ${plan.features.canCreateJobs ? (isMaster ? 'text-red-500' : 'text-green-500') : 'text-zinc-400'}`}></i>
                                        <span className={isMaster ? 'text-zinc-300' : 'text-zinc-600'}>Publicação de Vagas</span>
                                    </li>

                                    <li className="flex items-start gap-3 text-xs font-bold">
                                        <i className={`fas fa-share-alt mt-0.5 ${isMaster ? 'text-red-500' : 'text-green-500'}`}></i>
                                        <span className={isMaster ? 'text-zinc-300' : 'text-zinc-600'}>
                                            {plan.features.allowedSocialNetworks.length > 0
                                                ? `Redes: ${plan.features.allowedSocialNetworks.join(', ').replace('instagram', 'Insta').replace('facebook', 'Face')}`
                                                : 'Sem divulgação social'}
                                        </span>
                                    </li>
                                </ul>

                                <button
                                    disabled={isProcessing}
                                    onClick={async () => {
                                        if (!user) {
                                            onSelectPlan(plan.id);
                                            return;
                                        }

                                        if ((user.siteCredits || 0) < currentPrice) {
                                            alert(`Saldo insuficiente! Você tem C$ ${(user.siteCredits || 0).toFixed(2)} mas este plano custa C$ ${currentPrice.toFixed(2)}.`);
                                            return;
                                        }

                                        if (!confirm(`Confirmar assinatura do plano ${plan.name} por C$ ${currentPrice.toFixed(2)}? \nIsso descontará do seu saldo na carteira virtual.`)) { return; }

                                        setIsProcessing(true);
                                        try {
                                            const res = await userPurchaseItem(
                                                user.id,
                                                'plan',
                                                plan.id,
                                                currentPrice,
                                                plan.name,
                                                { maxProducts: plan.features.maxProducts, videoLimit: plan.features.videoLimit }
                                            );

                                            if (res.success && res.updatedUser) {
                                                alert(res.message);
                                                if (onUpdateUser && user) {
                                                    onUpdateUser({ ...user, ...res.updatedUser } as User);
                                                }
                                                onClose();
                                            } else {
                                                alert(res.message);
                                            }
                                        } catch (error) {
                                            alert("Erro ao processar.");
                                        } finally {
                                            setIsProcessing(false);
                                        }
                                    }}
                                    className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${user && (user.siteCredits || 0) >= currentPrice
                                        ? 'bg-green-600 text-white hover:bg-white hover:text-green-600'
                                        : 'bg-red-600 text-white hover:bg-white hover:text-red-600'
                                        }`}
                                >
                                    {isProcessing ? 'Processando...' : (
                                        user
                                            ? ((user.siteCredits || 0) >= currentPrice ? `Comprar com Créditos` : `Saldo Insuficiente`)
                                            : `Selecionar ${plan.name}`
                                    )}
                                </button>
                            </div>
                        );
                    })}

                </div>

                <div className="mt-8 text-center pb-20 pointer-events-auto">
                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-6">
                        Pagamento via PIX ou Cartão de Crédito. Cancelamento a qualquer momento.
                    </p>
                    <button
                        onClick={onClose}
                        className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] underline underline-offset-8 transition-colors"
                    >
                        Não tenho interesse agora
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PricingModal;