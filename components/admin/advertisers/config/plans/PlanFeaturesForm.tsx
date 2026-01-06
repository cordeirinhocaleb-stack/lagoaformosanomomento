
import React from 'react';
import { AdPlanConfig } from '../../../../../types';

interface PlanFeaturesFormProps {
  features: AdPlanConfig['features'];
  onChange: (newFeatures: AdPlanConfig['features']) => void;
  readOnly: boolean;
}

const PlanFeaturesForm: React.FC<PlanFeaturesFormProps> = ({ features, onChange, readOnly }) => {
  
  const update = (key: keyof AdPlanConfig['features'], value: any) => {
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
            <label className="text-[9px] font-black uppercase text-gray-400 mb-3 block tracking-widest">Recursos Principais</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white cursor-pointer hover:border-gray-300">
                    <span className="text-xs font-bold text-gray-700">Página Interna</span>
                    <input type="checkbox" checked={features.hasInternalPage} onChange={e => update('hasInternalPage', e.target.checked)} className="rounded text-black focus:ring-0" />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white cursor-pointer hover:border-gray-300">
                    <span className="text-xs font-bold text-gray-700">Vagas de Emprego</span>
                    <input type="checkbox" checked={features.canCreateJobs} onChange={e => update('canCreateJobs', e.target.checked)} className="rounded text-black focus:ring-0" />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white cursor-pointer hover:border-gray-300">
                    <span className="text-xs font-bold text-gray-700">Vídeo Social</span>
                    <input type="checkbox" checked={features.socialVideoAd} onChange={e => update('socialVideoAd', e.target.checked)} className="rounded text-black focus:ring-0" />
                </label>
            </div>
        </div>

        {/* Limites */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="text-[8px] font-bold text-gray-400 uppercase mb-1 block">Limite Vídeos/Mês</label>
                <input 
                    type="number" 
                    value={features.videoLimit || 0}
                    onChange={e => update('videoLimit', parseInt(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm font-bold outline-none focus:border-black"
                />
            </div>
            <div>
                <label className="text-[8px] font-bold text-gray-400 uppercase mb-1 block">Máx Produtos (0=Ilimitado)</label>
                <input 
                    type="number" 
                    value={features.maxProducts}
                    onChange={e => update('maxProducts', parseInt(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm font-bold outline-none focus:border-black"
                />
            </div>
            <div>
                <label className="text-[8px] font-bold text-gray-400 uppercase mb-1 block">Frequência Social</label>
                <select 
                    value={features.socialFrequency}
                    onChange={e => update('socialFrequency', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm font-bold outline-none focus:border-black"
                >
                    <option value="daily">Diária</option>
                    <option value="weekly">Semanal</option>
                    <option value="biweekly">Quinzenal</option>
                    <option value="monthly">Mensal</option>
                </select>
            </div>
        </div>

        {/* Redes Sociais */}
        <div>
            <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Redes Permitidas</label>
            <div className="flex gap-2 flex-wrap">
                {['instagram', 'facebook', 'whatsapp', 'linkedin', 'tiktok', 'youtube'].map(net => {
                    const active = features.allowedSocialNetworks.includes(net);
                    return (
                        <button
                            key={net}
                            onClick={() => toggleSocial(net)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all ${active ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}
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
