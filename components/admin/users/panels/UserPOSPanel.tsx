
import React, { useState } from 'react';
import { User, AdPricingConfig } from '../../../../types';
import { adminPurchaseForUser } from '../../../../services/supabaseService';
import { getSupabase } from '../../../../services/supabaseService';
import lfnmCoin from '../../../../src/assets/lfnm_coin.png';

interface UserPOSPanelProps {
    user: User;
    adConfig?: AdPricingConfig;
    onUpdateUser: (updates: Partial<User>) => void;
}

interface MarketItem {
    id: string;
    type: 'plan' | 'boost';
    name: string;
    cost: number;
    icon: string;
    color: string;
    details?: any; // For boosts
}

const UserPOSPanel: React.FC<UserPOSPanelProps> = ({ user, adConfig, onUpdateUser }) => {
    const [cartItems, setCartItems] = useState<MarketItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    // Construct Market Items
    const marketItems: MarketItem[] = [];

    // Add Plans
    adConfig?.plans.forEach(p => {
        marketItems.push({
            id: p.id,
            type: 'plan',
            name: p.name,
            cost: p.prices.monthly || 0,
            icon: 'fa-certificate',
            color: 'text-purple-600 bg-purple-100',
            details: { planName: p.name }
        });
    });

    // Add Boosts
    // Add Boosts - REMOVED as per request to show only database items
    // marketItems.push(
    //     { id: 'boost_posts_10', type: 'boost', name: '10 Posts', cost: 50, icon: 'fa-bullhorn', color: 'text-blue-600 bg-blue-100', details: { posts: 10 } },
    //     { id: 'boost_posts_50', type: 'boost', name: '50 Posts', cost: 200, icon: 'fa-bullhorn', color: 'text-blue-600 bg-blue-100', details: { posts: 50 } },
    //     { id: 'boost_videos_5', type: 'boost', name: '5 Vídeos', cost: 100, icon: 'fa-video', color: 'text-red-600 bg-red-100', details: { videos: 5 } },
    //     { id: 'boost_featured_7', type: 'boost', name: 'Destaque 7d', cost: 70, icon: 'fa-star', color: 'text-yellow-600 bg-yellow-100', details: { featuredDays: 7 } }
    // );

    const handleDragStart = (e: React.DragEvent, item: MarketItem) => {
        e.dataTransfer.setData('application/json', JSON.stringify(item));
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const data = e.dataTransfer.getData('application/json');
        if (data) {
            try {
                const item = JSON.parse(data);
                setCartItems(prev => [...prev, item]); // Append to cart
            } catch (err) {
                console.error("Drop error", err);
            }
        }
    };

    const handleRemoveItem = (index: number) => {
        setCartItems(prev => prev.filter((_, i) => i !== index));
    };

    const calculateTotal = () => cartItems.reduce((acc, item) => acc + item.cost, 0);

    const handlePurchase = async () => {
        if (cartItems.length === 0) return;

        const totalCost = calculateTotal();
        const currentBalance = user.siteCredits || 0;

        if (currentBalance < totalCost) {
            alert(`Saldo insuficiente. Necessário: C$ ${totalCost}. Atual: C$ ${currentBalance}.`);
            return;
        }

        if (!confirm(`Confirmar venda de ${cartItems.length} itens?\nTotal: C$ ${totalCost}\nSaldo Final: C$ ${currentBalance - totalCost}`)) return;

        setIsLoading(true);
        try {
            const currentAdmin = await getSupabase()?.auth.getUser();
            const adminId = currentAdmin?.data.user?.id || 'admin';

            let lastUpdatedUser = user;
            let successCount = 0;

            // Process items sequentially to ensure consistency
            for (const item of cartItems) {
                const res = await adminPurchaseForUser(
                    adminId,
                    lastUpdatedUser.id, // Use updated ID if needed, but usually ID is static
                    item.type,
                    item.id,
                    item.cost,
                    item.name,
                    item.details
                );

                if (res.success && res.updatedUser) {
                    lastUpdatedUser = res.updatedUser;
                    successCount++;
                } else {
                    console.error(`Falha ao comprar ${item.name}: ${res.message}`);
                    // Break or continue? Usually break to avoid inconsistent state with funds?
                    // For now, let's assume if one fails we stop.
                    alert(`Erro ao processar ${item.name}: ${res.message}`);
                    break;
                }
            }

            if (successCount > 0) {
                onUpdateUser(lastUpdatedUser);
                setCartItems([]); // Clear cart
                alert(`${successCount} itens comprados com sucesso!`);
            }

        } catch (e: any) {
            alert("Erro na venda em lote: " + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const currentBalance = user.siteCredits || 0;
    const cartTotal = calculateTotal();
    const finalBalance = currentBalance - cartTotal;

    return (
        <div className="bg-gray-50 rounded-xl p-6 mt-6 md:col-span-3">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
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
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-full">
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
                                        cursor-grab active:cursor-grabbing p-3 rounded-lg border border-gray-100 
                                        hover:shadow-md hover:border-gray-300 transition-all flex flex-col items-center gap-2
                                        group bg-gray-50 hover:bg-white relative
                                    `}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                                        <i className={`fas ${item.icon}`}></i>
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-[10px] font-bold uppercase text-gray-700 leading-tight">{item.name}</span>
                                        <span className="block text-[9px] font-black text-gray-400 mt-1 flex items-center justify-center gap-1">
                                            <img src={lfnmCoin} alt="$" className="w-4 h-4 object-contain inline-block mr-0.5 animate-coin-sm" /> {item.cost}
                                        </span>
                                    </div>
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
                            flex-1 min-h-[300px] border-2 border-dashed rounded-xl flex flex-col p-4 transition-all relative overflow-hidden bg-white shadow-sm
                            ${isDragOver ? 'border-green-500 bg-green-50 scale-[1.02]' : 'border-gray-300'}
                        `}
                    >
                        {/* Cart Header */}
                        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2 pointer-events-none">
                            <h3 className="text-sm font-black uppercase text-gray-800 flex items-center gap-2">
                                <i className="fas fa-shopping-cart text-gray-400"></i> Carrinho
                            </h3>
                            <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {cartItems.length} Itens
                            </span>
                        </div>

                        {/* Cart Items List */}
                        <div className={`flex-1 overflow-y-auto space-y-2 mb-4 pr-1 max-h-[200px] ${isDragOver ? 'pointer-events-none opacity-50' : ''}`}>
                            {cartItems.length > 0 ? (
                                cartItems.map((item, index) => (
                                    <div key={`${item.id}-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100 animate-fadeIn">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.color} text-[10px]`}>
                                                <i className={`fas ${item.icon}`}></i>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] font-bold text-gray-800 uppercase leading-none">{item.name}</span>
                                                <span className="text-[9px] text-gray-400 font-bold flex items-center gap-1"><img src={lfnmCoin} alt="$" className="w-3.5 h-3.5 object-contain animate-coin-sm" /> {item.cost}</span>
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
                        <div className={`border-t border-gray-100 pt-3 mt-auto ${isDragOver ? 'opacity-50 pointer-events-none' : ''}`}>
                            {/* Saldo Inicial */}
                            <div className="flex justify-between items-center mb-1 opacity-60 text-[9px] font-bold uppercase text-gray-500">
                                <span>Saldo Atual</span>
                                <span className="text-gray-700 flex items-center gap-1"><img src={lfnmCoin} alt="$" className="w-3.5 h-3.5 object-contain animate-coin-sm" /> {currentBalance.toFixed(2)}</span>
                            </div>

                            {/* Total Carrinho */}
                            <div className="flex justify-between items-center mb-1 text-[10px] font-bold uppercase text-gray-800">
                                <span>Total Carrinho</span>
                                <span className="text-purple-600 flex items-center gap-1">- <img src={lfnmCoin} alt="$" className="w-3.5 h-3.5 object-contain animate-coin-sm" /> {cartTotal.toFixed(2)}</span>
                            </div>

                            {/* Saldo Final */}
                            <div className="flex justify-between items-center mb-3 bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                                <span className="text-[10px] font-black uppercase text-yellow-800">Saldo Final</span>
                                <span className={`text-[12px] font-black flex items-center gap-1 ${finalBalance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                    <img src={lfnmCoin} alt="$" className="w-5 h-5 object-contain animate-coin-sm" /> {finalBalance.toFixed(2)}
                                </span>
                            </div>

                            <button
                                onClick={handlePurchase}
                                disabled={isLoading || cartItems.length === 0 || finalBalance < 0}
                                className={`
                                    w-full py-3 rounded-xl text-xs font-black uppercase text-white shadow-lg flex items-center justify-center gap-2 transition-all
                                    ${isLoading || cartItems.length === 0 || finalBalance < 0
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 hover:shadow-xl hover:scale-[1.02]'}
                                `}
                            >
                                {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-circle"></i>}
                                {finalBalance < 0 ? 'Saldo Insuficiente' : 'Finalizar Compra'}
                            </button>
                        </div>

                        {isDragOver && (
                            <div className="absolute inset-0 bg-green-50/90 flex items-center justify-center z-10 border-2 border-green-500 rounded-xl">
                                <p className="text-green-600 font-black uppercase tracking-widest animate-pulse">Solte para Adicionar</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserPOSPanel;
