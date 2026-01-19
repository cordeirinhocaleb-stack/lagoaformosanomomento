import React from 'react';
import { Advertiser } from '@/types';

interface DisplayLocationsConfigProps {
    data: Advertiser;
    onChange: (data: Advertiser) => void;
    darkMode?: boolean;
}

export const DisplayLocationsConfig: React.FC<DisplayLocationsConfigProps> = ({ data, onChange, darkMode }) => {
    return (
        <div className={`pt-6 mt-6 border-t ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Locais de Exibição</label>
            <div className="space-y-3">
                {[
                    { id: 'home_top', label: 'Topo da Home (Carrossel Parceiros)', icon: 'fa-home' },
                    { id: 'article_sidebar', label: 'Barra Lateral dos Artigos', icon: 'fa-columns' },
                    { id: 'article_footer', label: 'Rodapé dos Artigos', icon: 'fa-shoe-prints' }
                ].map(loc => {
                    const isChecked = (data.displayLocations || ['home_top', 'article_sidebar', 'article_footer']).includes(loc.id);
                    return (
                        <label key={loc.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isChecked
                            ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30'
                            : darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}>
                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${isChecked
                                ? 'bg-red-600 border-red-600 text-white'
                                : 'border-gray-300 dark:border-zinc-600'
                                }`}>
                                {isChecked && <i className="fas fa-check text-[10px]"></i>}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={isChecked}
                                onChange={() => {
                                    const current = data.displayLocations || ['home_top', 'article_sidebar', 'article_footer'];
                                    const newLocs = isChecked
                                        ? current.filter(l => l !== loc.id)
                                        : [...current, loc.id];
                                    onChange({ ...data, displayLocations: newLocs });
                                }}
                            />
                            <i className={`fas ${loc.icon} ${isChecked ? 'text-red-600' : 'text-gray-400'} text-xs w-4 text-center`}></i>
                            <span className={`text-[10px] font-bold uppercase tracking-wide ${isChecked ? 'text-red-600 dark:text-red-400' : 'text-gray-500'}`}>
                                {loc.label}
                            </span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};
