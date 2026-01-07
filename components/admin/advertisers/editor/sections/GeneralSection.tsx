
import React from 'react';
import { Advertiser } from '../../../../../types';

interface GeneralSectionProps {
    data: Advertiser;
    onChange: (data: Advertiser) => void;
    darkMode?: boolean;
}

const GeneralSection: React.FC<GeneralSectionProps> = ({ data, onChange, darkMode = false }) => {
    const handleChange = (field: keyof Advertiser, value: any) => {
        onChange({ ...data, [field]: value });
    };

    const inputClass = `w-full rounded-xl px-4 py-3 text-sm font-bold outline-none border transition-colors ${darkMode ? 'bg-white/5 border-white/10 text-white focus:border-red-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-red-500'}`;
    const selectClass = `w-full rounded-xl px-3 py-3 text-xs font-bold uppercase outline-none border transition-colors ${darkMode ? 'bg-[#0F0F0F] border-white/10 text-gray-200 focus:border-red-500' : 'bg-white border-gray-200 text-gray-700 focus:border-red-500'}`;
    const cardClass = `p-4 rounded-2xl border transition-colors ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`;
    const labelClass = `block text-[9px] font-bold uppercase mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`;

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Identificação */}
                <div className="space-y-4">
                    <h3 className={`text-xs font-black uppercase tracking-widest mb-4 border-b pb-2 ${darkMode ? 'text-gray-400 border-white/5' : 'text-gray-400 border-gray-100'}`}>Identificação</h3>

                    <div>
                        <label className={labelClass}>Nome Fantasia</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => handleChange('name', e.target.value)}
                            className={inputClass}
                            placeholder="Ex: Supermercado Central"
                        />
                    </div>

                    {/* Vínculo de Conta (Multi-páginas) */}
                    <div>
                        <label className={labelClass}>
                            ID do Responsável (User ID)
                            <span className="ml-2 text-[8px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-bold">MULTI-CONTAS</span>
                        </label>
                        <input
                            type="text"
                            value={data.ownerId || ''}
                            onChange={e => handleChange('ownerId', e.target.value)}
                            className={`w-full rounded-xl px-4 py-3 text-xs font-mono outline-none border transition-colors ${darkMode ? 'bg-white/5 border-white/10 text-blue-400 focus:border-blue-500' : 'bg-white border-gray-200 text-blue-600 focus:border-blue-500'}`}
                            placeholder="Cole o ID do usuário dono aqui..."
                        />
                        <p className="text-[8px] text-gray-400 mt-1">
                            Isso permite que este usuário gerencie esta página, mesmo tendo outras.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Categoria</label>
                            <select
                                value={data.category}
                                onChange={e => handleChange('category', e.target.value)}
                                className={selectClass}
                            >
                                {['Comércio', 'Serviços', 'Saúde', 'Alimentação', 'Imóveis', 'Veículos', 'Agro', 'Outros'].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Plano</label>
                            <select
                                value={data.plan}
                                onChange={e => handleChange('plan', e.target.value)}
                                className={selectClass}
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
                    <h3 className={`text-xs font-black uppercase tracking-widest mb-4 border-b pb-2 ${darkMode ? 'text-gray-400 border-white/5' : 'text-gray-400 border-gray-100'}`}>Contrato & Vigência</h3>

                    <div className={cardClass}>
                        <div className="flex items-center justify-between mb-4">
                            <span className={`text-[10px] font-black uppercase ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status do Contrato</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={data.isActive}
                                    onChange={e => handleChange('isActive', e.target.checked)}
                                />
                                <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>
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
                                    className={`w-full rounded-lg px-2 py-2 text-xs font-bold outline-none border ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200'}`}
                                />
                            </div>
                            <div>
                                <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Fim</label>
                                <input
                                    type="date"
                                    value={data.endDate.split('T')[0]}
                                    onChange={e => handleChange('endDate', new Date(e.target.value).toISOString())}
                                    className={`w-full rounded-lg px-2 py-2 text-xs font-bold outline-none border ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200'}`}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Ciclo de Faturamento</label>
                        <div className={`flex p-1 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                            {['daily', 'weekly', 'monthly'].map(cycle => (
                                <button
                                    key={cycle}
                                    onClick={() => handleChange('billingCycle', cycle)}
                                    className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${data.billingCycle === cycle ? (darkMode ? 'bg-white/10 shadow-sm text-white' : 'bg-white shadow-sm text-black') : 'text-gray-400 hover:text-gray-500'}`}
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
