
import React from 'react';
import { Advertiser, Coupon } from '../../../../../types';

interface CouponsSectionProps {
  data: Advertiser;
  onChange: (data: Advertiser) => void;
}

const CouponsSection: React.FC<CouponsSectionProps> = ({ data, onChange }) => {
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

  const handleUpdateCoupon = (id: string, field: keyof Coupon, value: any) => {
      const updated = coupons.map(c => c.id === id ? { ...c, [field]: value } : c);
      onChange({ ...data, coupons: updated });
  };

  const handleRemoveCoupon = (id: string) => {
      if(!confirm("Remover este cupom?")) return;
      onChange({ ...data, coupons: coupons.filter(c => c.id !== id) });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">
                Cupons Ativos
            </h3>
            <button 
                onClick={handleAddCoupon}
                className="bg-dashed border-2 border-gray-300 text-gray-500 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:border-black hover:text-black transition-colors flex items-center gap-2"
            >
                <i className="fas fa-ticket"></i> Criar Cupom
            </button>
        </div>

        {coupons.length === 0 ? (
            <div className="text-center py-12 bg-yellow-50 rounded-2xl border border-yellow-100">
                <i className="fas fa-ticket-alt text-3xl text-yellow-300 mb-2"></i>
                <p className="text-xs font-bold text-yellow-600 uppercase">Nenhum cupom ativo</p>
                <p className="text-[9px] text-yellow-500 mt-1">Crie promoções exclusivas para atrair clientes</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coupons.map(coupon => (
                    <div key={coupon.id} className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-4 relative group hover:border-yellow-400 transition-colors">
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border-r border-gray-200"></div>
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border-l border-gray-200"></div>
                        
                        <div className="space-y-3 pl-4 pr-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-[8px] font-black uppercase text-gray-400 block mb-1">Código</label>
                                    <input 
                                        type="text" 
                                        value={coupon.code}
                                        onChange={e => handleUpdateCoupon(coupon.id, 'code', e.target.value.toUpperCase())}
                                        className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm font-black uppercase tracking-wider text-center"
                                        placeholder="PROMO10"
                                    />
                                </div>
                                <div className="w-24">
                                    <label className="text-[8px] font-black uppercase text-gray-400 block mb-1">Desconto</label>
                                    <input 
                                        type="text" 
                                        value={coupon.discount}
                                        onChange={e => handleUpdateCoupon(coupon.id, 'discount', e.target.value)}
                                        className="w-full bg-green-50 border border-green-200 text-green-700 rounded px-2 py-1 text-sm font-bold text-center"
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
                                    className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs"
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
