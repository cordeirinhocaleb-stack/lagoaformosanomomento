
import React, { useState } from 'react';
import { AdPricingConfig, PromoBanner } from '../../../../../types';
import FullWidthPromo from '../../../../ads/FullWidthPromo';
import { DEFAULT_BANNER } from '../banners/constants';
import { BannerTextTab } from '../banners/BannerTextTab';
import { BannerMediaTab } from '../banners/BannerMediaTab';
import { BannerButtonTab } from '../banners/BannerButtonTab';

interface BannersPanelProps {
    config: PromoBanner[];
    onChange: (newBanners: PromoBanner[]) => void;
    darkMode?: boolean;
}

const BannersPanel: React.FC<BannersPanelProps> = ({ config, onChange, darkMode = false }) => {
    const banners = config || [];
    const [editingId, setEditingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'media' | 'text' | 'button'>('text');

    const editingBanner = banners.find(b => b.id === editingId) || null;

    const handleAdd = () => {
        const newBanner = { ...DEFAULT_BANNER, id: Math.random().toString(36).substr(2, 9) };
        onChange([...banners, newBanner]);
        setEditingId(newBanner.id);
    };

    const handleRemove = (id: string) => {
        // Removido confirmação para fluxo mais ágil
        const updated = banners.filter(b => b.id !== id);
        onChange(updated);
        if (editingId === id) { setEditingId(null); }
    };

    const handleUpdate = (id: string, updates: Partial<PromoBanner>) => {
        const updated = banners.map(b => b.id === id ? { ...b, ...updates } : b);
        onChange(updated);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 lg:h-[900px] animate-fadeIn">

            {/* LISTA LATERAL */}
            <div className={`w-full lg:w-1/4 flex flex-col lg:border-r border-b lg:border-b-0 pb-6 lg:pb-0 mb-6 lg:mb-0 lg:pr-6 ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Banners ({banners.length})</h3>
                    <button
                        onClick={handleAdd}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-green-600 transition-colors flex items-center gap-2 ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}
                    >
                        <i className="fas fa-plus"></i> Novo
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                    {banners.map((banner) => {
                        const thumb = banner.type === 'video'
                            ? 'https://placehold.co/100x60/000000/FFFFFF?text=VIDEO'
                            : (banner.images && banner.images[0]) || banner.image;

                        return (
                            <div
                                key={banner.id}
                                onClick={() => setEditingId(banner.id)}
                                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex gap-3 items-center group ${editingId === banner.id
                                    ? (darkMode ? 'border-red-500 bg-red-900/10' : 'border-red-600 bg-red-50')
                                    : (darkMode ? 'border-white/5 bg-black/20 hover:border-white/20' : 'border-gray-100 bg-white hover:border-gray-200')
                                    }`}
                            >
                                <div className={`w-12 h-8 rounded overflow-hidden shrink-0 relative ${darkMode ? 'bg-white/5' : 'bg-gray-200'}`}>
                                    {thumb ? (
                                        <img src={thumb} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}><i className="fas fa-image"></i></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-[9px] font-black uppercase truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{banner.tag || 'Sem Tag'}</p>
                                    <div className={`flex gap-2 text-[8px] items-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {banner.type === 'video' ? <i className="fas fa-video"></i> : <i className="fas fa-images"></i>}
                                        <span className="truncate max-w-[80px]">{banner.textPositionPreset?.replace(/_/g, ' ') || 'Padrão'}</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleRemove(banner.id);
                                    }}
                                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 shadow-sm relative z-50 ${darkMode ? 'bg-white/10 text-gray-400 hover:text-red-500 hover:bg-white/20' : 'bg-white text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                                >
                                    <i className="fas fa-trash text-[10px]"></i>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* EDITOR */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pl-2 flex flex-col">
                {editingBanner ? (
                    <>
                        {/* LIVE PREVIEW SECTION */}
                        <div className="mb-6 rounded-2xl overflow-hidden shadow-xl border-4 border-gray-900 bg-black relative group shrink-0">
                            <div className="absolute top-2 left-2 z-50 bg-black/80 backdrop-blur text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest pointer-events-none border border-white/20">
                                <i className="fas fa-eye mr-2"></i> Pré-visualização Real
                            </div>
                            <FullWidthPromo
                                banners={[editingBanner]}
                                customHeight="h-[200px] md:h-[280px]"
                                forceShow={true}
                            />
                        </div>

                        <div className="space-y-6 flex-1">
                            <div className={`flex justify-between items-center pb-2 border-b ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
                                <div className={`flex p-1 rounded-lg ${darkMode ? 'bg-black/20' : 'bg-gray-100'}`}>
                                    {['text', 'media', 'button'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab as any)}
                                            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                                                ? (darkMode ? 'bg-white/10 shadow-sm text-white' : 'bg-white shadow-sm text-black')
                                                : (darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600')
                                                }`}
                                        >
                                            {tab === 'text' ? 'Texto & Layout' : tab === 'media' ? 'Mídia / Fundo' : 'Botão CTA'}
                                        </button>
                                    ))}
                                </div>
                                <label className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border ${darkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={editingBanner.active}
                                        onChange={e => handleUpdate(editingBanner.id, { active: e.target.checked })}
                                    />
                                    <div className={`w-3 h-3 rounded-full ${editingBanner.active ? 'bg-green-500' : (darkMode ? 'bg-gray-700' : 'bg-gray-300')}`}></div>
                                    <span className={`text-[9px] font-bold uppercase ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{editingBanner.active ? 'Ativo' : 'Inativo'}</span>
                                </label>
                            </div>

                            {activeTab === 'text' && (
                                <BannerTextTab banner={editingBanner} onUpdate={(u) => handleUpdate(editingBanner.id, u)} darkMode={darkMode} />
                            )}

                            {activeTab === 'media' && (
                                <BannerMediaTab banner={editingBanner} onUpdate={(u) => handleUpdate(editingBanner.id, u)} darkMode={darkMode} />
                            )}

                            {activeTab === 'button' && (
                                <BannerButtonTab banner={editingBanner} onUpdate={(u) => handleUpdate(editingBanner.id, u)} darkMode={darkMode} />
                            )}
                        </div>
                    </>
                ) : (
                    <div className={`h-full flex flex-col items-center justify-center opacity-50 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>
                        <i className="fas fa-arrow-left text-3xl mb-2"></i>
                        <p className="text-xs font-black uppercase tracking-widest">Selecione um banner para editar</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BannersPanel;
