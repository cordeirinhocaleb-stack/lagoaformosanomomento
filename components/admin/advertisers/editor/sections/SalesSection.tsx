
import React, { useState } from 'react';
import { Advertiser } from '../../../../../types';
import ProductsSection from './ProductsSection';
import CouponsSection from './CouponsSection';
import AdvertiserPopupSection from './AdvertiserPopupSection';

interface SalesSectionProps {
    data: Advertiser;
    onChange: (data: Advertiser) => void;
    darkMode?: boolean;
}

type SubTab = 'products' | 'coupons' | 'popup';

const SalesSection: React.FC<SalesSectionProps> = ({ data, onChange, darkMode = false }) => {
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('products');

    const subTabs: { id: SubTab, label: string, icon: string }[] = [
        { id: 'products', label: 'Produtos', icon: 'fa-tags' },
        { id: 'coupons', label: 'Cupons', icon: 'fa-ticket' },
        { id: 'popup', label: 'Popup', icon: 'fa-bullhorn' },
    ];

    return (
        <div className="space-y-6">
            {/* Sub-navegação interna - Estilo Pílula */}
            <div className="flex justify-center">
                <div className={`inline-flex p-1 rounded-xl ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-gray-100 border border-gray-200'}`}>
                    {subTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeSubTab === tab.id
                                    ? (darkMode ? 'bg-zinc-800 text-white shadow-md' : 'bg-white text-black shadow-md')
                                    : (darkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-gray-400 hover:text-gray-600')
                                }`}
                        >
                            <i className={`fas ${tab.icon}`}></i>
                            <span className="hidden md:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Conteúdo Dinâmico */}
            <div className="animate-fadeIn">
                {activeSubTab === 'products' && (
                    <div className="max-w-4xl mx-auto">
                        <ProductsSection data={data} onChange={onChange} darkMode={darkMode} />
                    </div>
                )}

                {activeSubTab === 'coupons' && (
                    <div className="max-w-4xl mx-auto">
                        <CouponsSection data={data} onChange={onChange} darkMode={darkMode} />
                    </div>
                )}

                {activeSubTab === 'popup' && (
                    <div className="max-w-5xl mx-auto">
                        <AdvertiserPopupSection data={data} onChange={onChange} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesSection;
