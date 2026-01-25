import React, { useState } from 'react';
import { User, AdPricingConfig } from '../../../types';
import lfnmCoin from '@/assets/lfnm_coin.png';
import { userPurchaseItem } from '../../../services/users/userService';

export interface MarketItem {
    id: string;
    type: 'plan' | 'boost';
    name: string;
    cost: number;
    icon: string;
    color: string;
    details?: any;
    cashback?: number;
}

interface UserStorePOSProps {
    user: User;
    adConfig?: AdPricingConfig;
    onUpdateUser: (u: User) => void;
}

const UserStorePOS: React.FC<UserStorePOSProps> = ({ user, adConfig, onUpdateUser }) => {
    const [cartItems, setCartItems] = useState<MarketItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [activeCategory, setActiveCategory] = useState<'plans' | 'boosts'>('plans');

    const planItems: MarketItem[] = [];

    const boostItems: MarketItem[] = [
        {
            id: 'boost_video_30s',
            type: 'boost',
            name: 'Vídeo Propaganda (30s)',
            cost: adConfig?.boostsValues?.['boost_video_30s'] ?? 200,
            icon: 'fa-clapperboard',
            color: 'text-pink-600 bg-pink-100',
            details: { videoLimit: 1 }
        },
        {
            id: 'boost_facebook_6d',
            type: 'boost',
            name: '1 Vídeo Facebook (6 dias)',
            cost: adConfig?.boostsValues?.['boost_facebook_6d'] ?? 120,
            icon: 'fa-facebook-f',
            color: 'text-blue-600 bg-blue-100',
            details: { socialFacebook: 1 }
        },
        {
            id: 'boost_instagram_6d',
            type: 'boost',
            name: '1 Vídeo Instagram (6 dias)',
            cost: adConfig?.boostsValues?.['boost_instagram_6d'] ?? 120,
            icon: 'fa-instagram',
            color: 'text-fuchsia-600 bg-fuchsia-100',
            details: { socialInstagram: 1 }
        },
        {
            id: 'boost_youtube_6d',
            type: 'boost',
            name: '1 Vídeo Youtube (6 dias)',
            cost: adConfig?.boostsValues?.['boost_youtube_6d'] ?? 120,
            icon: 'fa-youtube',
            color: 'text-red-600 bg-red-100',
            details: { socialYoutube: 1 }
        },
        {
            id: 'boost_home_banner_7d',
            type: 'boost',
            name: 'Banner Home (7d)',
            cost: adConfig?.boostsValues?.['boost_home_banner_7d'] ?? 150,
            icon: 'fa-window-maximize',
            color: 'text-indigo-600 bg-indigo-100',
            details: { homeBanner: true }
        },
        {
            id: 'boost_article_footer_7d',
            type: 'boost',
            name: 'Rodapé Artigo (7d)',
            cost: adConfig?.boostsValues?.['boost_article_footer_7d'] ?? 100,
            icon: 'fa-chart-simple',
            color: 'text-emerald-600 bg-emerald-100',
            details: { articleFooter: true }
        },
        {
            id: 'boost_article_sidebar_7d',
            type: 'boost',
            name: 'Sidebar Esq (7d)',
            cost: adConfig?.boostsValues?.['boost_article_sidebar_7d'] ?? 100,
            icon: 'fa-table-columns',
            color: 'text-violet-600 bg-violet-100',
            details: { articleSidebar: true }
        },
        {
            id: 'boost_home_scroll_7d',
            type: 'boost',
            name: 'Scroll Topo (7d)',
            cost: adConfig?.boostsValues?.['boost_home_scroll_7d'] ?? 150,
            icon: 'fa-up-long',
            color: 'text-amber-600 bg-amber-100',
            details: { homeScroll: true }
        }
    ];

    const getPlanIcon = (planId: string): string => {
        const id = planId.toLowerCase();
        if (id.includes('master')) return 'fa-crown';
        if (id.includes('mensal') || id.includes('monthly')) return 'fa-certificate';
        if (id.includes('semanal') || id.includes('weekly')) return 'fa-calendar-week';
        if (id.includes('diario') || id.includes('daily')) return 'fa-calendar-day';
        return 'fa-certificate';
    };

    const getPlanColor = (planId: string): string => {
        const id = planId.toLowerCase();
        if (id.includes('master')) return 'text-yellow-600 bg-yellow-100';
        if (id.includes('mensal') || id.includes('monthly')) return 'text-purple-600 bg-purple-100';
        if (id.includes('semanal') || id.includes('weekly')) return 'text-blue-600 bg-blue-100';
        if (id.includes('diario') || id.includes('daily')) return 'text-green-600 bg-green-100';
        return 'text-purple-600 bg-purple-100';
    };

    adConfig?.plans.forEach(p => {
        planItems.push({
            id: p.id,
            type: 'plan',
            name: p.name,
            cost: p.prices.monthly || 0,
            icon: getPlanIcon(p.id),
            color: getPlanColor(p.id),
            details: { maxProducts: p.features.maxProducts, videoLimit: p.features.videoLimit },
            cashback: (p.cashbackPercent && p.cashbackPercent > 0) ? ((p.prices.monthly || 0) * (p.cashbackPercent / 100)) : 0
        });
    });

    const marketItems = activeCategory === 'plans' ? planItems : boostItems;

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const data = e.dataTransfer.getData('application/json');
        if (data) {
            try {
                const item = JSON.parse(data);
                setCartItems(prev => [...prev, item]);
            } catch (err) { }
        }
    };

    const calculateTotal = () => cartItems.reduce((acc, item) => acc + item.cost, 0);

    const handlePurchase = async () => {
        if (cartItems.length === 0) return;
        const total = calculateTotal();
        const balance = user.siteCredits || 0;

        if (balance < total) {
            alert(`Saldo insuficiente. Recarregue sua carteira.`);
            return;
        }

        if (!confirm(`Confirmar compra de ${cartItems.length} itens?\nTotal: ${total} Moedas`)) return;

        setIsLoading(true);
        try {
            let lastUpdatedUser = user;
            let successCount = 0;

            for (const item of cartItems) {
                const res = await userPurchaseItem(
                    lastUpdatedUser.id,
                    item.type,
                    item.id,
                    item.cost,
                    item.name,
                    item.details,
                    item.cashback || 0
                );

                if (res.success && res.updatedUser) {
                    lastUpdatedUser = { ...lastUpdatedUser, ...res.updatedUser };
                    successCount++;
                } else {
                    alert(`Erro na compra de ${item.name}: ${res.message}`);
                    break;
                }
            }

            if (successCount > 0) {
                onUpdateUser(lastUpdatedUser);
                setCartItems([]);
                alert("Compra realizada com sucesso!");
            }
        } catch (e: any) {
            alert("Erro: " + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const cartTotal = calculateTotal();
    const finalBalance = (user.siteCredits || 0) - cartTotal;

    return (
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
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

            <div className="flex-1">
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setActiveCategory('plans')}
                        className={`flex-1 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === 'plans'
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                    >
                        <i className="fas fa-certificate mr-2"></i>
                        Planos
                    </button>
                    <button
                        onClick={() => setActiveCategory('boosts')}
                        className={`flex-1 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === 'boosts'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                    >
                        <i className="fas fa-rocket mr-2"></i>
                        Impulsionamentos
                    </button>
                </div>

                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">
                    {activeCategory === 'plans' ? 'Planos Disponíveis' : 'Impulsionamentos Disponíveis'}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 md:gap-3">
                    {marketItems.map(item => (
                        <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => { e.dataTransfer.setData('application/json', JSON.stringify(item)); e.dataTransfer.effectAllowed = 'copy'; }}
                            onClick={() => setCartItems(prev => [...prev, item])}
                            className="bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-300 p-3 rounded-xl flex flex-col items-center gap-2 cursor-pointer transition-all active:scale-95 group relative"
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                                <i className={`fas ${item.icon}`}></i>
                            </div>
                            <div className="text-center">
                                <span className="block text-[9px] font-bold uppercase text-gray-700">{item.name}</span>
                                <span className="block text-[10px] font-black text-gray-800 flex items-center justify-center gap-1">
                                    <img src={lfnmCoin.src} className="w-3.5 h-3.5 object-contain animate-coin-sm grayscale" alt="Coin" /> {item.cost}
                                </span>
                            </div>
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <i className="fas fa-plus-circle text-green-500"></i>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full md:w-1/3 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Seu Carrinho ({cartItems.length})</h4>
                    {cartItems.length > 0 && (
                        <button
                            onClick={() => setCartItems([])}
                            className="text-[9px] font-black uppercase text-red-500 hover:text-red-700 transition-colors"
                        >
                            <i className="fas fa-trash mr-1"></i>
                            Limpar
                        </button>
                    )}
                </div>
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    className={`flex-1 min-h-[180px] md:min-h-[250px] border-2 border-dashed rounded-2xl flex flex-col p-3 md:p-4 transition-all relative overflow-hidden bg-white ${isDragOver ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                >
                    <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1 max-h-[150px]">
                        {cartItems.length > 0 ? (
                            cartItems.map((item, index) => (
                                <div key={`${item.id}-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100 animate-fadeIn">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.color} text-[8px]`}><i className={`fas ${item.icon}`}></i></div>
                                        <div>
                                            <span className="block text-[9px] font-bold uppercase">{item.name}</span>
                                            <span className="text-[9px] font-black text-gray-400 flex items-center gap-1">
                                                <img src={lfnmCoin.src} className="w-3 h-3 object-contain animate-coin-sm grayscale" alt="Coin" /> {item.cost}
                                            </span>
                                        </div>
                                    </div>
                                    <button onClick={() => setCartItems(p => p.filter((_, i) => i !== index))} className="text-gray-300 hover:text-red-500"><i className="fas fa-times"></i></button>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-50">
                                <i className="fas fa-shopping-basket text-3xl mb-2"></i>
                                <p className="text-[9px] font-bold uppercase">Arraste ou clique para adicionar</p>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-100 pt-3">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-bold uppercase text-gray-400">Total</span>
                            <span className="text-[10px] font-black text-gray-800 flex items-center gap-1">
                                <img src={lfnmCoin.src} className="w-3.5 h-3.5 object-contain animate-coin-sm grayscale" alt="Coin" /> {cartTotal.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[9px] font-bold uppercase text-gray-400">Saldo Final</span>
                            <span className={`text-[10px] font-black flex items-center gap-1 ${finalBalance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                <img src={lfnmCoin.src} className="w-4 h-4 object-contain animate-coin-sm grayscale" alt="Coin" /> {finalBalance.toFixed(2)}
                            </span>
                        </div>
                        <button
                            onClick={handlePurchase}
                            disabled={isLoading || cartItems.length === 0 || finalBalance < 0}
                            className={`w-full py-2 rounded-lg text-[9px] font-black uppercase text-white shadow-lg transition-all ${isLoading || finalBalance < 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            {isLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Confirmar Compra'}
                        </button>
                    </div>
                    {isDragOver && <div className="absolute inset-0 bg-green-50/90 flex items-center justify-center text-green-600 font-black uppercase text-xs z-10 border-2 border-green-500 rounded-2xl">Solte Aqui</div>}
                </div>
            </div>
        </div>
    );
};

export default UserStorePOS;
