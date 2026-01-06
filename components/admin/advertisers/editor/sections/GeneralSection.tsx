
import React from 'react';
import { Advertiser } from '../../../../../types';

interface GeneralSectionProps {
  data: Advertiser;
  onChange: (data: Advertiser) => void;
}

const GeneralSection: React.FC<GeneralSectionProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof Advertiser, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Identificação */}
        <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4 border-b border-gray-100 pb-2">Identificação</h3>
            
            <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Nome Fantasia</label>
                <input 
                    type="text" 
                    value={data.name} 
                    onChange={e => handleChange('name', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:border-red-500 outline-none"
                    placeholder="Ex: Supermercado Central"
                />
            </div>

            {/* Vínculo de Conta (Multi-páginas) */}
            <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">
                    ID do Responsável (User ID)
                    <span className="ml-2 text-[8px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-bold">MULTI-CONTAS</span>
                </label>
                <input 
                    type="text" 
                    value={data.ownerId || ''} 
                    onChange={e => handleChange('ownerId', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-mono text-blue-600 focus:border-blue-500 outline-none"
                    placeholder="Cole o ID do usuário dono aqui..."
                />
                <p className="text-[8px] text-gray-400 mt-1">
                    Isso permite que este usuário gerencie esta página, mesmo tendo outras.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Categoria</label>
                    <select 
                        value={data.category} 
                        onChange={e => handleChange('category', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-3 text-xs font-bold uppercase text-gray-700 focus:border-red-500 outline-none"
                    >
                        {['Comércio', 'Serviços', 'Saúde', 'Alimentação', 'Imóveis', 'Veículos', 'Agro', 'Outros'].map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Plano</label>
                    <select 
                        value={data.plan} 
                        onChange={e => handleChange('plan', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-3 text-xs font-bold uppercase text-gray-700 focus:border-red-500 outline-none"
                    >
                        <option value="master">Master</option>
                        <option value="premium">Premium</option>
                        <option value="basic">Básico</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Vigência e Status */}
        <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4 border-b border-gray-100 pb-2">Contrato & Vigência</h3>
            
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase text-gray-600">Status do Contrato</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={data.isActive}
                            onChange={e => handleChange('isActive', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        <span className="ml-2 text-[9px] font-bold uppercase text-gray-400">{data.isActive ? 'Ativo' : 'Pausado'}</span>
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Início</label>
                        <input 
                            type="date" 
                            value={data.startDate.split('T')[0]}
                            onChange={e => handleChange('startDate', new Date(e.target.value).toISOString())}
                            className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs font-bold outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Fim</label>
                        <input 
                            type="date" 
                            value={data.endDate.split('T')[0]}
                            onChange={e => handleChange('endDate', new Date(e.target.value).toISOString())}
                            className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs font-bold outline-none"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Ciclo de Faturamento</label>
                <div className="flex bg-gray-50 p-1 rounded-xl">
                    {['daily', 'weekly', 'monthly'].map(cycle => (
                        <button
                            key={cycle}
                            onClick={() => handleChange('billingCycle', cycle)}
                            className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${data.billingCycle === cycle ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {cycle === 'daily' ? 'Diário' : cycle === 'weekly' ? 'Semanal' : 'Mensal'}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSection;
