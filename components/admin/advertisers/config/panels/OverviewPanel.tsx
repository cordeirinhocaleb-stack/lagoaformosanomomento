
import React from 'react';
import { AdPricingConfig } from '../../../../../types';

interface OverviewPanelProps {
  config: AdPricingConfig;
  onChange: (newConfig: AdPricingConfig) => void;
}

const OverviewPanel: React.FC<OverviewPanelProps> = ({ config, onChange }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn">
        
        {/* Status Geral */}
        <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
                <h3 className="text-lg font-black uppercase text-gray-900 tracking-tight mb-2">Status do Módulo Comercial</h3>
                <p className="text-xs text-gray-500 max-w-md leading-relaxed">
                    Quando desativado, a área de anunciantes e banners fica oculta para o público, mas o painel administrativo continua acessível.
                </p>
            </div>
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <span className={`text-[10px] font-black uppercase tracking-widest ${config.active ? 'text-green-600' : 'text-gray-400'}`}>
                    {config.active ? 'Sistema Ativo' : 'Sistema Pausado'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={config.active}
                        onChange={(e) => onChange({ ...config, active: e.target.checked })}
                    />
                    <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                </label>
            </div>
        </div>

        {/* Texto Promocional */}
        <div>
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
                <i className="fas fa-bullhorn"></i> Texto Promocional (Modal de Vendas)
            </h3>
            <div className="relative group">
                <textarea 
                    value={config.promoText}
                    onChange={(e) => onChange({ ...config, promoText: e.target.value })}
                    rows={4}
                    className="w-full bg-yellow-50 border-2 border-yellow-100 rounded-2xl p-6 text-sm font-bold text-yellow-900 placeholder-yellow-300 outline-none focus:border-yellow-400 focus:shadow-lg transition-all resize-none"
                    placeholder="Ex: Assine agora e impulsione seu negócio!"
                />
                <div className="absolute bottom-4 right-4 text-[9px] font-black uppercase text-yellow-600/50">
                    Exibido no topo do modal de planos
                </div>
            </div>
        </div>

        {/* Estatísticas Rápidas (Estático para Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                <p className="text-[9px] font-black uppercase text-gray-400 mb-2">Total Planos</p>
                <p className="text-3xl font-black text-gray-900">{config.plans.length}</p>
            </div>
            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                <p className="text-[9px] font-black uppercase text-gray-400 mb-2">Planos Master</p>
                <p className="text-3xl font-black text-red-600">
                    {config.plans.filter(p => p.features.placements.includes('master_carousel')).length}
                </p>
            </div>
            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                <p className="text-[9px] font-black uppercase text-gray-400 mb-2">Moeda Base</p>
                <p className="text-3xl font-black text-gray-900">BRL (R$)</p>
            </div>
        </div>

    </div>
  );
};

export default OverviewPanel;
