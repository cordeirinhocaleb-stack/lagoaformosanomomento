
import React from 'react';
import { AdPlanConfig } from '../../../../../types';

interface PlanFeaturesFormProps {
    features: AdPlanConfig['features'];
    onChange: (newFeatures: AdPlanConfig['features']) => void;
    readOnly: boolean;
    darkMode?: boolean;
}

const PlanFeaturesForm: React.FC<PlanFeaturesFormProps> = ({ features, onChange, readOnly, darkMode = false }) => {

    const update = (key: keyof AdPlanConfig['features'], value: unknown) => {
        onChange({ ...features, [key]: value });
    };

    const toggleSocial = (network: string) => {
        const current = features.allowedSocialNetworks || [];
        const updated = current.includes(network)
            ? current.filter(n => n !== network)
            : [...current, network];
        update('allowedSocialNetworks', updated);
    };

    return (
        <div className={`space-y-6 ${readOnly ? 'opacity-70 pointer-events-none' : ''}`}>

            {/* Toggles Principais */}
            <div>
                <label className={`text-[9px] font-black uppercase mb-3 block tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Recursos Principais</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer hover:border-gray-300 ${darkMode ? 'bg-black/20 border-white/10 hover:border-white/20' : 'bg-white border-gray-200'}`}>
                        <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-700'}`}>Página Interna</span>
                        <input type="checkbox" checked={features.hasInternalPage} onChange={e => update('hasInternalPage', e.target.checked)} className={`rounded focus:ring-0 ${darkMode ? 'bg-white/10 border-white/20 text-white' : 'text-black'}`} />
                    </label>
                    <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer hover:border-gray-300 ${darkMode ? 'bg-black/20 border-white/10 hover:border-white/20' : 'bg-white border-gray-200'}`}>
                        <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-700'}`}>Vagas de Emprego</span>
                        <input type="checkbox" checked={features.canCreateJobs} onChange={e => update('canCreateJobs', e.target.checked)} className={`rounded focus:ring-0 ${darkMode ? 'bg-white/10 border-white/20 text-white' : 'text-black'}`} />
                    </label>
                    <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer hover:border-gray-300 ${darkMode ? 'bg-black/20 border-white/10 hover:border-white/20' : 'bg-white border-gray-200'}`}>
                        <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-700'}`}>Vídeo Social</span>
                        <input type="checkbox" checked={features.socialVideoAd} onChange={e => update('socialVideoAd', e.target.checked)} className={`rounded focus:ring-0 ${darkMode ? 'bg-white/10 border-white/20 text-white' : 'text-black'}`} />
                    </label>
                </div>
            </div>

            {/* Limites */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className={`text-[8px] font-bold uppercase mb-1 block ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Produção de Vídeo (Qtd Mensal)</label>
                    <input
                        type="number"
                        value={features.videoLimit || 0}
                        onChange={e => update('videoLimit', parseInt(e.target.value))}
                        className={`w-full border rounded-lg p-2 text-sm font-bold outline-none ${darkMode ? 'bg-black/20 border-white/10 text-white focus:border-white/30' : 'bg-white border-gray-200 focus:border-black'}`}
                    />
                </div>
                <div>
                    <label className={`text-[8px] font-bold uppercase mb-1 block ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Divulgação (Frequência Base)</label>
                    <select
                        value={features.socialFrequency}
                        onChange={e => update('socialFrequency', e.target.value)}
                        className={`w-full border rounded-lg p-2 text-sm font-bold outline-none ${darkMode ? 'bg-black/20 border-white/10 text-white focus:border-white/30' : 'bg-white border-gray-200 focus:border-black'}`}
                    >
                        <option value="daily" className="text-black">Diária</option>
                        <option value="weekly" className="text-black">Semanal</option>
                        <option value="biweekly" className="text-black">Quinzenal</option>
                        <option value="monthly" className="text-black">Mensal</option>
                    </select>
                </div>
            </div>

            {/* Redes Sociais */}
            <div>
                <label className={`text-[9px] font-black uppercase mb-2 block tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Redes Permitidas</label>
                <div className="flex gap-2 flex-wrap">
                    {['instagram', 'facebook', 'whatsapp', 'tiktok', 'youtube'].map(net => {
                        const active = features.allowedSocialNetworks.includes(net);
                        return (
                            <button
                                key={net}
                                onClick={() => toggleSocial(net)}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all ${active
                                    ? (darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                                    : (darkMode ? 'bg-black/20 text-gray-500 border-white/10 hover:border-white/20' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300')
                                    }`}
                            >
                                {net}
                            </button>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};

export default PlanFeaturesForm;
