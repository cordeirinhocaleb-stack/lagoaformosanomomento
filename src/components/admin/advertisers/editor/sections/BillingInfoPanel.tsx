import React from 'react';
import { Advertiser } from '../../../../../types';

interface BillingInfoPanelProps {
    data: Advertiser;
    onChange: (data: Advertiser) => void;
    darkMode?: boolean;
}

const BillingInfoPanel: React.FC<BillingInfoPanelProps> = ({ data, onChange, darkMode = false }) => {
    // Estilos (reutilizando do GeneralSection para consistência)
    const BASE_INPUT_CLASS = "w-full rounded-lg px-4 py-3 text-sm font-medium outline-none border transition-all duration-200 focus:ring-2 focus:ring-red-500/20";
    const LIGHT_INPUT_CLASS = "bg-white border-gray-200 text-gray-900 focus:border-red-500 placeholder-gray-400";
    const DARK_INPUT_CLASS = "bg-[#1A1A1A] border-zinc-800 text-gray-100 focus:border-red-500 placeholder-zinc-600";

    const inputClass = `${BASE_INPUT_CLASS} ${darkMode ? DARK_INPUT_CLASS : LIGHT_INPUT_CLASS}`;
    const labelClass = `block text-[10px] font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`;

    const handleChange = (field: keyof Advertiser, value: any) => {
        onChange({ ...data, [field]: value });
    };

    // Formatar moeda
    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        const numberValue = Number(rawValue) / 100;
        handleChange('billingValue', numberValue);
    };

    const formatCurrency = (value?: number) => {
        if (value === undefined || value === null) return '';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className={`mt-8 p-6 rounded-3xl border relative overflow-hidden ${darkMode ? 'bg-[#151515] border-zinc-800' : 'bg-white border-gray-200 shadow-sm'}`}>
            <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-6 pb-2 border-b flex items-center gap-2 ${darkMode ? 'text-zinc-500 border-zinc-800' : 'text-zinc-400 border-gray-100'}`}>
                <i className="fas fa-barcode"></i>
                Dados para Cobrança (Boleto Simples)
            </h3>

            {/* Layout de Boleto Simplificado */}
            <div className={`rounded-xl border border-dashed p-4 md:p-6 ${darkMode ? 'border-zinc-700 bg-zinc-900/30' : 'border-gray-300 bg-gray-50/50'}`}>

                {/* Linha Superior: Valor e Vencimento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className={labelClass}>Valor a Cobrar (R$)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
                            <input
                                type="text"
                                value={data.billingValue ? (data.billingValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''}
                                onChange={handleValueChange}
                                className={`${inputClass} pl-10 text-lg font-bold tracking-widest`}
                                placeholder="0,00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Data de Vencimento</label>
                        <input
                            type="date"
                            value={data.billingDueDate ? data.billingDueDate.split('T')[0] : ''}
                            onChange={(e) => handleChange('billingDueDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                            className={`${inputClass} font-mono`}
                        />
                    </div>
                </div>

                {/* Status e Código de Barras */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className={labelClass}>Status da Cobrança</label>
                        <select
                            value={data.billingStatus || 'pending'}
                            onChange={(e) => handleChange('billingStatus', e.target.value)}
                            className={`${inputClass} uppercase text-xs font-bold`}
                        >
                            <option value="pending">Pendente</option>
                            <option value="paid">Pago</option>
                            <option value="overdue">Vencido</option>
                            <option value="cancelled">Cancelado</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelClass}>Código de Barras (Linha Digitável)</label>
                        <input
                            type="text"
                            value={data.billingBarCode || ''}
                            onChange={(e) => handleChange('billingBarCode', e.target.value)}
                            className={`${inputClass} font-mono text-xs tracking-wider`}
                            placeholder="00000.00000 00000.00000 00000.00000 0 00000000000000"
                        />
                    </div>
                </div>

                {/* Observações */}
                <div>
                    <label className={labelClass}>Instruções / Observações</label>
                    <textarea
                        value={data.billingObs || ''}
                        onChange={(e) => handleChange('billingObs', e.target.value)}
                        className={`${inputClass} min-h-[80px] resize-none`}
                        placeholder="Ex: Referente à renovação do plano mensal..."
                    />
                </div>

            </div>

            <div className={`mt-4 flex items-center gap-2 text-[10px] ${darkMode ? 'text-zinc-600' : 'text-gray-400'}`}>
                <i className="fas fa-info-circle"></i>
                <span>Estes dados são apenas informativos para controle manual.</span>
            </div>
        </div>
    );
};

export default BillingInfoPanel;
