import React from 'react';
import { MarketItem } from '@/components/admin/users/panels/pos/types';
import lfnmCoin from '@/assets/lfnm_coin.png';

interface POSCartProps {
    cartItems: MarketItem[];
    setCartItems: React.Dispatch<React.SetStateAction<MarketItem[]>>;
    isDragOver: boolean;
    handleDragOver: (e: React.DragEvent) => void;
    handleDragLeave: (e: React.DragEvent) => void;
    handleDrop: (e: React.DragEvent) => void;
    handlePurchaseClick: () => void;
    isLoading: boolean;
    currentBalance: number;
    cartTotal: number;
    finalBalance: number;
    darkMode: boolean;
}

export const POSCart: React.FC<POSCartProps> = ({
    cartItems,
    setCartItems,
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handlePurchaseClick,
    isLoading,
    currentBalance,
    cartTotal,
    finalBalance,
    darkMode
}) => {
    const handleRemoveItem = (index: number) => {
        setCartItems(prev => prev.filter((_, i) => i !== index));
    };

    return (
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
                <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
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
            <div className={`border-t pt-3 mt-auto ${isDragOver ? 'opacity-50 pointer-events-none' : ''} ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
                {/* Saldo Inicial */}
                <div className="flex justify-between items-center mb-1 opacity-60 text-[9px] font-bold uppercase text-gray-500">
                    <span>Saldo Atual</span>
                    <span className="text-gray-700 flex items-center gap-1"><img src={typeof lfnmCoin === 'object' ? lfnmCoin.src : lfnmCoin} alt="$" className="w-3.5 h-3.5 object-contain animate-coin-sm" /> {currentBalance.toFixed(2)}</span>
                </div>

                {/* Total Carrinho */}
                <div className={`flex justify-between items-center mb-1 text-[10px] font-bold uppercase ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                    <span>Total Carrinho</span>
                    <span className="text-purple-600 flex items-center gap-1">- <img src={typeof lfnmCoin === 'object' ? lfnmCoin.src : lfnmCoin} alt="$" className="w-3.5 h-3.5 object-contain animate-coin-sm" /> {cartTotal.toFixed(2)}</span>
                </div>

                {/* Saldo Final */}
                <div className={`flex justify-between items-center mb-3 p-2 rounded-lg border ${darkMode ? 'bg-yellow-900/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-100'}`}>
                    <span className="text-[10px] font-black uppercase text-yellow-800">Saldo Final</span>
                    <span className={`text-[12px] font-black flex items-center gap-1 ${finalBalance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                        <img src={typeof lfnmCoin === 'object' ? lfnmCoin.src : lfnmCoin} alt="$" className="w-5 h-5 object-contain animate-coin-sm" /> {finalBalance.toFixed(2)}
                    </span>
                </div>

                <button
                    onClick={handlePurchaseClick}
                    disabled={isLoading || cartItems.length === 0}
                    className={`
                        w-full py-3 rounded-xl text-xs font-black uppercase text-white shadow-lg flex items-center justify-center gap-2 transition-all
                        ${isLoading || cartItems.length === 0
                            ? 'bg-gray-300 cursor-not-allowed'
                            : finalBalance < 0
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                                : 'bg-green-600 hover:bg-green-700 hover:shadow-xl hover:scale-[1.02]'}
                    `}
                >
                    {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-circle"></i>}
                    {finalBalance < 0 ? 'Finalizar (Override)' : 'Finalizar Compra'}
                </button>
            </div>

            {isDragOver && (
                <div className="absolute inset-0 bg-green-50/90 flex items-center justify-center z-10 border-2 border-green-500 rounded-xl">
                    <p className="text-green-600 font-black uppercase tracking-widest animate-pulse">Solte para Adicionar</p>
                </div>
            )}
        </div>
    );
};
