
import React, { useState, useEffect } from 'react';
import { User, AdPricingConfig } from '@/types';
import { adminPurchaseForUser, getSupabase } from '@/services/supabaseService';
import { mapDbToUser, updateCommercialData, getCommercialData } from '@/services/users/userService';
import { CashbackInfoModal } from './CashbackInfoModal';
import { MarketItem } from './pos/types';

import lfnmCoin from '@/assets/lfnm_coin.png';

interface UserPOSPanelProps {
    user: User;
    adConfig?: AdPricingConfig;
    onUpdateUser: (updates: Partial<User>) => void;
    darkMode?: boolean;
    onOpenPix?: () => void;
}



const UserPOSPanel: React.FC<UserPOSPanelProps> = ({ user, adConfig, onUpdateUser, darkMode = false, onOpenPix }) => {
    const [cartItems, setCartItems] = useState<MarketItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    // New state for commercial data modal
    const [showCashbackModal, setShowCashbackModal] = useState(false);
    const [commercialInfo, setCommercialInfo] = useState<any>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [purchasedItems, setPurchasedItems] = useState<MarketItem[]>([]);

    // Load existing commercial data when component mounts / user changes
    useEffect(() => {
        const fetch = async () => {
            const data = await getCommercialData(user.id);
            setCommercialInfo(data);
        };
        fetch();
    }, [user.id]);

    // Define Commercial Benefits per Plan ID (Hardcoded logic to enrich simple config)
    const PLAN_COMMERCIAL_BENEFITS: Record<string, any> = {
        'master': {
            socialPublications: { instagram: 5, facebook: 5, youtube: 1, tiktok: 3, whatsapp: 5 }, // Alta frequência
            contract: { hasContract: true, contractUrl: '', notes: 'Plano Master - Cobertura Total' },
            renewalInfo: { autoRenew: true, cycle: 'monthly', nextRenewal: '' },
            displayLocations: { homeBar: true, sidebar: true, footer: true, homeBanner: true, popup: true }
        },
        'mensal': {
            socialPublications: { instagram: 3, facebook: 3, youtube: 0, tiktok: 1, whatsapp: 3 }, // Média frequência
            contract: { hasContract: false, contractUrl: '', notes: 'Plano Mensal - Destaque Padrão' },
            renewalInfo: { autoRenew: true, cycle: 'monthly', nextRenewal: '' },
            displayLocations: { homeBar: false, sidebar: true, footer: true, homeBanner: false, popup: true }
        },
        'semanal': {
            socialPublications: { instagram: 1, facebook: 1, youtube: 0, tiktok: 0, whatsapp: 1 },
            contract: { hasContract: false, contractUrl: '', notes: 'Plano Semanal - Impulso Rápido' },
            renewalInfo: { autoRenew: false, cycle: 'weekly', nextRenewal: '' },
            displayLocations: { homeBar: false, sidebar: true, footer: false, homeBanner: false, popup: false }
        },
        'diario': {
            socialPublications: { instagram: 0, facebook: 0, youtube: 0, tiktok: 0, whatsapp: 0 },
            contract: { hasContract: false, contractUrl: '', notes: 'Diária Avulsa - Visibilidade Relâmpago' },
            renewalInfo: { autoRenew: false, cycle: 'daily', nextRenewal: '' },
            displayLocations: { homeBar: false, sidebar: false, footer: false, homeBanner: false, popup: false }
        }
    };

    // Construct Market Items
    const marketItems: MarketItem[] = [];

    // Add Plans
    adConfig?.plans.forEach(p => {
        // Enriched features
        const commercialBenefits = PLAN_COMMERCIAL_BENEFITS[p.id.toLowerCase()] || PLAN_COMMERCIAL_BENEFITS['mensal']; // Default fallback

        marketItems.push({
            id: p.id,
            type: 'plan',
            name: p.name.toLowerCase().includes('plano') ? p.name : `Plano ${p.name}`,
            cost: p.prices.monthly || 0,
            icon: 'fas fa-certificate',
            color: 'text-purple-600 bg-purple-50 border-purple-200 hover:border-purple-400', // Consistent with boosts
            details: {
                planName: p.name,
                features: p.features,
                commercialDataUpdates: commercialBenefits // Inject benefits for backend processing
            }
        });
    });

    // Add Boosts (Itens Avulsos)
    const BOOSTS = [
        // BOOSTS AVANÇADOS (específicos do admin)
        // 1. Produção de Vídeo
        {
            id: 'boost_video_30s',
            name: 'Vídeo Propaganda (30s)',
            cost: adConfig?.boostsValues?.['boost_video_30s'] ?? 200,
            icon: 'fas fa-clapperboard',
            color: 'text-pink-600 bg-pink-50 border-pink-200 hover:border-pink-400',
            applyEffect: (u: User) => {
                const current = u.commercialData?.videoLimit || 0;
                return { commercialData: { ...u.commercialData, videoLimit: current + 1 } };
            }
        },
        // 2-4. Social Videos (6 Dias) -> Adiciona Quotas
        {
            id: 'boost_facebook_6d',
            name: '1 Vídeo Facebook (6 dias)',
            cost: adConfig?.boostsValues?.['boost_facebook_6d'] ?? 120,
            icon: 'fab fa-facebook-f',
            color: 'text-blue-600 bg-blue-50 border-blue-200 hover:border-blue-400',
            applyEffect: (u: User) => {
                const current = u.commercialData?.socialPublications?.facebook || 0;
                const existingSocial = u.commercialData?.socialPublications || {};
                return {
                    commercialData: {
                        ...u.commercialData,
                        socialPublications: {
                            ...existingSocial,
                            facebook: current + 1
                        }
                    }
                };
            }
        },
        {
            id: 'boost_instagram_6d',
            name: '1 Vídeo Instagram (6 dias)',
            cost: adConfig?.boostsValues?.['boost_instagram_6d'] ?? 120,
            icon: 'fab fa-instagram',
            color: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200 hover:border-fuchsia-400',
            applyEffect: (u: User) => {
                const current = u.commercialData?.socialPublications?.instagram || 0;
                const existingSocial = u.commercialData?.socialPublications || {};
                return {
                    commercialData: {
                        ...u.commercialData,
                        socialPublications: {
                            ...existingSocial,
                            instagram: current + 1
                        }
                    }
                };
            }
        },
        {
            id: 'boost_youtube_6d',
            name: '1 Vídeo Youtube (6 dias)',
            cost: adConfig?.boostsValues?.['boost_youtube_6d'] ?? 120,
            icon: 'fab fa-youtube',
            color: 'text-red-600 bg-red-50 border-red-200 hover:border-red-400',
            applyEffect: (u: User) => {
                const current = u.commercialData?.socialPublications?.youtube || 0;
                const existingSocial = u.commercialData?.socialPublications || {};
                return {
                    commercialData: {
                        ...u.commercialData,
                        socialPublications: {
                            ...existingSocial,
                            youtube: current + 1
                        }
                    }
                };
            }
        },
        // 5-8. Destaques (7 dias) -> Ativa Locations
        {
            id: 'boost_home_banner_7d',
            name: 'Banner Home (7d)',
            cost: adConfig?.boostsValues?.['boost_home_banner_7d'] ?? 150,
            icon: 'fas fa-window-maximize',
            color: 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:border-indigo-400',
            applyEffect: (u: User) => {
                const existingLocations = u.commercialData?.displayLocations || {};
                return {
                    commercialData: {
                        ...u.commercialData,
                        displayLocations: {
                            ...existingLocations,
                            homeBanner: true
                        }
                    }
                };
            }
        },
        {
            id: 'boost_article_footer_7d',
            name: 'Rodapé Artigo (7d)',
            cost: adConfig?.boostsValues?.['boost_article_footer_7d'] ?? 100,
            icon: 'fas fa-chart-simple',
            color: 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:border-emerald-400',
            applyEffect: (u: User) => {
                const existingLocations = u.commercialData?.displayLocations || {};
                return {
                    commercialData: {
                        ...u.commercialData,
                        displayLocations: {
                            ...existingLocations,
                            footer: true
                        }
                    }
                };
            }
        },
        {
            id: 'boost_article_sidebar_7d',
            name: 'Sidebar Esq (7d)',
            cost: adConfig?.boostsValues?.['boost_article_sidebar_7d'] ?? 100,
            icon: 'fas fa-table-columns',
            color: 'text-violet-600 bg-violet-50 border-violet-200 hover:border-violet-400',
            applyEffect: (u: User) => {
                const existingLocations = u.commercialData?.displayLocations || {};
                return {
                    commercialData: {
                        ...u.commercialData,
                        displayLocations: {
                            ...existingLocations,
                            sidebar: true
                        }
                    }
                };
            }
        },
        {
            id: 'boost_home_scroll_7d',
            name: 'Scroll Topo (7d)',
            cost: adConfig?.boostsValues?.['boost_home_scroll_7d'] ?? 150,
            icon: 'fas fa-up-long',
            color: 'text-amber-600 bg-amber-50 border-amber-200 hover:border-amber-400',
            applyEffect: (u: User) => {
                const existingLocations = u.commercialData?.displayLocations || {};
                return {
                    commercialData: {
                        ...u.commercialData,
                        displayLocations: {
                            ...existingLocations,
                            homeBar: true
                        }
                    }
                };
            }
        }
    ];

    BOOSTS.forEach(b => {
        marketItems.push({
            id: b.id,
            type: 'boost',
            name: b.name,
            cost: b.cost,
            icon: b.icon,
            color: b.color,
            details: {},
            applyEffect: b.applyEffect
        });
    });

    const handleDragStart = (e: React.DragEvent, item: MarketItem) => {
        setIsDragOver(false);
        e.dataTransfer.setData('text/plain', JSON.stringify(item));
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        // Only trigger leave if we're actually leaving the container, not entering a child
        // Simple check: clientX/Y outside rect?
        if (e.currentTarget.contains(e.relatedTarget as Node)) {
            return;
        }
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const data = e.dataTransfer.getData('text/plain');
        if (data) {
            try {
                const parsedItem = JSON.parse(data);
                // Re-hydrate item from marketItems to restore functions (applyEffect) lost in JSON
                const fullItem = marketItems.find(i => i.id === parsedItem.id);
                if (fullItem) {
                    setCartItems(prev => [...prev, fullItem]);
                } else {
                    console.warn("Dropped item not found in market registry:", parsedItem.id);
                }
            } catch (err) {
                console.error("Drop error", err);
            }
        }
    };

    const handleRemoveItem = (index: number) => {
        setCartItems(prev => prev.filter((_, i) => i !== index));
    };

    const calculateTotal = () => cartItems.reduce((acc, item) => acc + item.cost, 0);

    const handlePurchaseClick = () => {
        if (cartItems.length === 0) return;
        const totalCost = calculateTotal();
        const currentBalance = user.siteCredits || 0;

        if (currentBalance < totalCost) {
            if (onOpenPix) {
                if (confirm(`Saldo insuficiente (C$ ${currentBalance.toFixed(2)}). Deseja recarregar via PIX agora?`)) {
                    onOpenPix();
                }
            } else {
                alert(`Saldo insuficiente. Necessário: C$ ${totalCost.toFixed(2)}. Atual: C$ ${currentBalance.toFixed(2)}.`);
            }
            return;
        }

        setShowConfirmModal(true);
    };

    const executePurchase = async () => {
        setShowConfirmModal(false);
        setIsLoading(true);

        try {
            const currentAdmin = await getSupabase()?.auth.getUser();
            const adminId = currentAdmin?.data.user?.id || 'admin';

            let lastUpdatedUser = user;
            let successCount = 0;
            // Process items sequentially to ensure consistency
            for (const item of cartItems) {
                // CRITICAL: Ensure commercialData is initialized before applyEffect
                if (!lastUpdatedUser.commercialData) {
                    lastUpdatedUser = { ...lastUpdatedUser, commercialData: {} };
                }

                let purchasePayload: any;
                if (item.type === 'boost' && item.applyEffect) {
                    const effectResult = item.applyEffect(lastUpdatedUser);
                    console.log("POS DEBUG: applyEffect result for", item.name, ":", effectResult);
                    purchasePayload = { commercialDataUpdates: effectResult.commercialData };
                    console.log("POS DEBUG: commercialDataUpdates payload:", purchasePayload);
                } else {
                    purchasePayload = item.details;
                }
                console.log("POS DEBUG: Processing item", item.name, "with final payload", purchasePayload);

                const res = await adminPurchaseForUser(
                    adminId,
                    lastUpdatedUser.id,
                    item.type,
                    item.id,
                    item.cost,
                    item.name,
                    purchasePayload
                );

                if (res.success && res.updatedUser) {
                    lastUpdatedUser = res.updatedUser;
                    successCount++;
                } else {
                    console.error(`Falha ao comprar ${item.name}: ${res.message}`);
                    alert(`Erro ao comprar item ${item.name}: ${res.message}`);
                    break;
                }
            }

            if (successCount > 0) {
                // Fetch fresh data from DB to ensure UI is perfectly synced
                try {
                    const supabase = getSupabase();
                    if (!supabase) throw new Error("Supabase internal client missing");

                    const { data: freshUser } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (freshUser) {
                        const mappedFreshUser = mapDbToUser(freshUser);
                        if (mappedFreshUser) {
                            onUpdateUser(mappedFreshUser);
                            lastUpdatedUser = mappedFreshUser;
                        }
                    }
                } catch (fetchErr) {
                    console.error("Error fetching fresh user data:", fetchErr);
                    // Fallback to the accumulated lastUpdatedUser
                    onUpdateUser(lastUpdatedUser);
                }

                setCartItems([]); // Clear cart

                setPurchasedItems([...cartItems]);
                setShowSuccessModal(true);
            }

        } catch (e: unknown) {
            console.error("UserPOSPanel: CRITICAL ERROR in executePurchase:", e);
            const message = e instanceof Error ? e.message : "Erro desconhecido";
            alert("Erro crítico na venda: " + message);
        } finally {
            setIsLoading(false);
        }
    };

    const currentBalance = user.siteCredits || 0;
    const cartTotal = calculateTotal();
    const finalBalance = currentBalance - cartTotal;

    return (
        <div className={`rounded-xl p-6 mt-6 md:col-span-3 pb-24 md:pb-6 ${darkMode ? 'bg-black/40' : 'bg-gray-50'}`}>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={() => setShowSuccessModal(false)}></div>
                    <div className={`relative w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-scaleIn border ${darkMode ? 'bg-zinc-900 border-white/10' : 'bg-white border-gray-100'}`}>
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4 border-2 border-green-500/20 shadow-lg shadow-green-500/10">
                                <i className="fas fa-check text-4xl text-green-500"></i>
                            </div>
                            <h3 className={`text-xl font-black uppercase mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Compra Realizada!</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase mb-6">
                                Os seguintes itens foram adicionados aos <br /> <strong className="text-green-500">Créditos Disponíveis</strong>:
                            </p>

                            <div className={`rounded-xl p-4 mb-6 max-h-40 overflow-y-auto ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                                {purchasedItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 mb-2 last:mb-0">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${item.color}`}>
                                            <i className={item.icon}></i>
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{item.name}</span>
                                    </div>
                                ))}
                            </div>

                            <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 bg-green-600 text-white font-black uppercase rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all">
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={() => setShowConfirmModal(false)}></div>
                    <div className={`relative w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-scaleIn border ${darkMode ? 'bg-zinc-900 border-white/10' : 'bg-white border-gray-100'}`}>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6 overflow-hidden border-2 border-green-500/20 shadow-lg shadow-green-500/10">
                                <i className="fas fa-shopping-cart text-3xl text-green-500"></i>
                            </div>
                            <h3 className={`text-xl font-black uppercase italic mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Confirmar Compra</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-6">
                                Você está prestes a debitar <span className="text-red-500 font-black">C$ {cartTotal.toFixed(2)}</span> da conta de <br />
                                <span className={darkMode ? 'text-white' : 'text-gray-900'}>{user.name}</span>
                            </p>

                            <div className="w-full bg-gray-50/50 dark:bg-black/20 rounded-xl p-4 mb-6 border border-gray-100 dark:border-white/5">
                                <div className="flex justify-between items-center mb-2 text-[10px] uppercase font-bold text-gray-400">
                                    <span>Saldo Atual</span>
                                    <span>{currentBalance.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2 text-[10px] uppercase font-bold text-red-500">
                                    <span>Total Itens ({cartItems.length})</span>
                                    <span>- {cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-dashed border-gray-200 dark:border-white/10 my-2"></div>
                                <div className={`flex justify-between items-center text-xs uppercase font-black ${finalBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    <span>Saldo Final</span>
                                    <span>C$ {finalBalance.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className={`py-3 rounded-xl font-black uppercase text-[10px] tracking-widest border transition-all ${darkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={executePurchase}
                                    className="py-3 rounded-xl font-black uppercase text-[10px] tracking-widest bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>} Confirmar
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                <style>{`
                    @keyframes coin-flip {
                        0% { transform: rotateY(0deg); }
                        100% { transform: rotateY(360deg); }
                    }
                    .animate-coin {
                        animation: coin-flip 3s linear infinite;
                    }
                    .animate-coin-sm {
                        animation: coin-flip 3s linear infinite;
                    }
                `}</style>
                <i className="fas fa-store text-green-600"></i> Mercado de Serviços (PDV)
            </h3>

            <div className="flex flex-col md:flex-row gap-6">

                {/* 1. Shelves (Draggable Items) */}
                <div className="flex-1">


                    <div className={`p-4 rounded-xl shadow-sm border h-full ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100'}`}>
                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-3 text-center md:text-left">Arraste itens para o carrinho</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {marketItems.map(item => (
                                <div
                                    key={item.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, item)}
                                    // Make click work as "Add to Cart" for mobile/accessibility
                                    onClick={() => setCartItems(prev => [...prev, item])}
                                    className={`
                                        cursor-grab active:cursor-grabbing rounded-xl border overflow-hidden
                                        hover:shadow-md transition-all flex flex-row items-center p-3 gap-3
                                        group relative h-24 w-full text-left
                                        ${darkMode ? 'bg-zinc-900 border-white/5 hover:bg-zinc-800' : 'bg-white border-gray-100 hover:border-gray-300'}
                                    `}
                                >
                                    {/* Color Indicator Bar (Left) */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.color.includes('bg-') ? item.color.split(' ').find(c => c.startsWith('bg-'))?.replace('bg-', 'bg-') : 'bg-gray-200'}`}></div>

                                    {/* Icon Container */}
                                    <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-xl shadow-sm ${item.color || 'bg-gray-100 text-gray-500'}`}>
                                        <i className={item.icon.includes(' ') ? item.icon : `fas ${item.icon}`}></i>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <span className={`block text-[10px] font-black uppercase leading-tight mb-1 truncate ${darkMode ? 'text-gray-100' : 'text-gray-800'}`} title={item.name}>
                                            {item.name}
                                        </span>

                                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black w-fit ${darkMode ? 'bg-white/5 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                                            <img src={typeof lfnmCoin === 'object' ? lfnmCoin.src : lfnmCoin} alt="$" className="w-3.5 h-3.5 object-contain animate-coin-sm" />
                                            {item.cost}
                                        </div>
                                    </div>

                                    {/* Decorative Background Icon (Subtle) */}
                                    <i className={`${item.icon.includes(' ') ? item.icon : `fas ${item.icon}`} absolute -bottom-3 -right-3 text-5xl opacity-[0.03] rotate-[-15deg] pointer-events-none ${darkMode ? 'text-white' : 'text-gray-900'}`}></i>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. Multi-Item Cart (Drop Zone) */}
                <div className="w-full md:w-1/3 flex flex-col">
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
                            flex-1 min-h-[300px] border-2 border-dashed rounded-xl flex flex-col p-4 transition-all relative overflow-hidden shadow-sm
                            ${isDragOver ? 'border-green-500 bg-green-50 scale-[1.02]' : (darkMode ? 'border-white/10 bg-white/5' : 'border-gray-300 bg-white')}
                        `}
                    >
                        {/* Cart Header */}
                        <div className={`flex items-center justify-between mb-4 border-b pb-2 pointer-events-none ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
                            <h3 className={`text-sm font-black uppercase flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                                <i className="fas fa-shopping-cart text-gray-400"></i> Carrinho
                            </h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${darkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                {cartItems.length} Itens
                            </span>
                        </div>

                        {/* Cart Items List */}
                        <div className={`flex-1 overflow-y-auto space-y-2 mb-4 pr-1 max-h-[200px] ${isDragOver ? 'pointer-events-none opacity-50' : ''}`}>
                            {cartItems.length > 0 ? (
                                cartItems.map((item, index) => (
                                    <div key={`${item.id}-${index}`} className={`flex items-center justify-between p-2 rounded-lg border animate-fadeIn ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.color} text-[10px]`}>
                                                <i className={item.icon.includes(' ') ? item.icon : `fas ${item.icon}`}></i>
                                            </div>
                                            <div>
                                                <span className={`block text-[10px] font-bold uppercase leading-none ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>{item.name}</span>
                                                <span className="text-[9px] text-gray-400 font-bold flex items-center gap-1"><img src={typeof lfnmCoin === 'object' ? lfnmCoin.src : lfnmCoin} alt="$" className="w-3.5 h-3.5 object-contain animate-coin-sm" /> {item.cost}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveItem(index)}
                                            className="text-gray-300 hover:text-red-500 transition-colors px-2"
                                        >
                                            <i className="fas fa-times text-xs"></i>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-50">
                                    <i className="fas fa-box-open text-3xl mb-2"></i>
                                    <p className="text-[10px] font-bold uppercase text-center">Carrinho Vazio</p>
                                </div>
                            )}
                        </div>

                        {/* Totals & Checkout */}
                        <div className={`mt-auto pt-4 border-t ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <span className={`text-[10px] font-black uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Total a Debitar</span>
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-inner ${darkMode ? 'bg-black/40 border-yellow-500/20 text-yellow-500' : 'bg-yellow-50 border-yellow-100 text-yellow-700'}`}>
                                    <img src={typeof lfnmCoin === 'object' ? lfnmCoin.src : lfnmCoin} alt="$" className="w-4 h-4 object-contain animate-coin" />
                                    <span className="text-sm font-black tracking-tighter">{cartTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowConfirmModal(true)}
                                disabled={cartItems.length === 0 || isLoading}
                                className={`
                                    w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg transition-all flex items-center justify-center gap-2
                                    ${cartItems.length > 0
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : (darkMode ? 'bg-white/5 text-gray-600' : 'bg-gray-100 text-gray-400')}
                                    ${(cartItems.length === 0 || isLoading) ? 'cursor-not-allowed' : 'hover:shadow-green-600/20 hover:scale-[1.02]'}
                                `}
                            >
                                {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-circle"></i>}
                                {finalBalance < 0 ? 'Saldo Insuficiente' : 'Finalizar Compra'}
                            </button>

                            {finalBalance < 0 && onOpenPix && (
                                <button
                                    onClick={onOpenPix}
                                    className="w-full mt-2 py-2 rounded-xl text-[9px] font-black uppercase text-red-600 border border-red-100 hover:bg-red-50 transition-all animate-pulse"
                                >
                                    <i className="fab fa-pix mr-2"></i>
                                    Recarregar via PIX
                                </button>
                            )}
                        </div>

                        {isDragOver && (
                            <div className="absolute inset-0 bg-green-50/90 flex items-center justify-center z-10 border-2 border-green-500 rounded-xl">
                                <p className="text-green-600 font-black uppercase tracking-widest animate-pulse">Solte para Adicionar</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Cashback Info Modal */}
            <CashbackInfoModal
                isOpen={showCashbackModal}
                onClose={() => setShowCashbackModal(false)}
                onSave={async (info) => {
                    await updateCommercialData(user.id, info);
                    setCommercialInfo(info);
                }}
                initialData={commercialInfo}
            />
        </div>
    );
};

export default UserPOSPanel;

