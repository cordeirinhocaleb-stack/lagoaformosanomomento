
import React from 'react';
import { Advertiser, Coupon } from '../../../../../types';

interface CouponsSectionProps {
    data: Advertiser;
    onChange: (data: Advertiser) => void;
    darkMode?: boolean;
}

const CouponsSection: React.FC<CouponsSectionProps> = ({ data, onChange, darkMode = false }) => {
    const coupons = data.coupons || [];

    const handleAddCoupon = () => {
        const newCoupon: Coupon = {
            id: Math.random().toString(36).substr(2, 9),
            code: '',
            discount: '',
            description: '',
            active: true
        };
        onChange({ ...data, coupons: [newCoupon, ...coupons] });
    };

    const handleUpdateCoupon = (id: string, field: keyof Coupon, value: unknown) => {
        const newCoupons = (data.coupons || []).map(c => c.id === id ? { ...c, [field]: value } : c);
        onChange({ ...data, coupons: newCoupons });
    };

    const handleRemoveCoupon = (id: string) => {
        if (!confirm("Remover este cupom?")) { return; }
        onChange({ ...data, coupons: coupons.filter(c => c.id !== id) });
    };

    const emptyStateClass = `text-center py-12 rounded-2xl border ${darkMode ? 'bg-yellow-900/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-100'}`;
    const cardClass = `border-2 border-dashed rounded-xl p-4 relative group transition-colors ${darkMode ? 'bg-white/5 border-white/10 hover:border-yellow-500/50' : 'bg-white border-gray-200 hover:border-yellow-400'}`;
    const dotClass = `absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full ${darkMode ? 'bg-[#0F0F0F] border-gray-700' : 'bg-gray-50 border-gray-200'}`;
    const inputClass = `w-full rounded px-2 py-1 text-sm font-black uppercase tracking-wider text-center outline-none border transition-colors ${darkMode ? 'bg-black/20 border-white/5 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`;
    const addBtnClass = `bg-dashed border-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${darkMode ? 'border-white/20 text-gray-400 hover:border-white hover:text-white' : 'border-gray-300 text-gray-500 hover:border-black hover:text-black'}`;

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">
                    Cupons Ativos
                </h3>
                <button
                    onClick={handleAddCoupon}
                    className={addBtnClass}
                >
                    <i className="fas fa-ticket"></i> Criar Cupom
                </button>
            </div>

            {coupons.length === 0 ? (
                <div className={emptyStateClass}>
                    <i className="fas fa-ticket-alt text-3xl text-yellow-300 mb-2"></i>
                    <p className="text-xs font-bold text-yellow-600 uppercase">Nenhum cupom ativo</p>
                    <p className="text-[9px] text-yellow-500 mt-1">Crie promoções exclusivas para atrair clientes</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coupons.map(coupon => (
                        <div key={coupon.id} className={cardClass}>
                            <div className={`${dotClass} -left-3 border-r`}></div>
                            <div className={`${dotClass} -right-3 border-l`}></div>

                            <div className="space-y-3 pl-4 pr-4">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-[8px] font-black uppercase text-gray-400 block mb-1">Código</label>
                                        <input
                                            type="text"
                                            value={coupon.code}
                                            onChange={e => handleUpdateCoupon(coupon.id, 'code', e.target.value.toUpperCase())}
                                            className={inputClass}
                                            placeholder="PROMO10"
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className="text-[8px] font-black uppercase text-gray-400 block mb-1">Desconto</label>
                                        <input
                                            type="text"
                                            value={coupon.discount}
                                            onChange={e => handleUpdateCoupon(coupon.id, 'discount', e.target.value)}
                                            className={`w-full rounded px-2 py-1 text-sm font-bold text-center border outline-none ${darkMode ? 'bg-green-900/20 border-green-500/20 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}
                                            placeholder="10%"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[8px] font-black uppercase text-gray-400 block mb-1">Descrição da Regra</label>
                                    <input
                                        type="text"
                                        value={coupon.description}
                                        onChange={e => handleUpdateCoupon(coupon.id, 'description', e.target.value)}
                                        className={`w-full rounded px-2 py-1 text-xs outline-none border transition-colors ${darkMode ? 'bg-black/20 border-white/5 text-gray-300' : 'bg-gray-50 border-gray-200'}`}
                                        placeholder="Válido para compras acima de R$ 50"
                                    />
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={coupon.active}
                                            onChange={e => handleUpdateCoupon(coupon.id, 'active', e.target.checked)}
                                            className="rounded text-green-600 focus:ring-green-500"
                                        />
                                        <span className={`text-[9px] font-bold uppercase ${coupon.active ? 'text-green-600' : 'text-gray-400'}`}>
                                            {coupon.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </label>

                                    <button
                                        onClick={() => handleRemoveCoupon(coupon.id)}
                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        <i className="fas fa-trash text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CouponsSection;
