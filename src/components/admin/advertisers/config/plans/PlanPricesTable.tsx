
import React from 'react';
import { AdPlanConfig, BillingCycle } from '../../../../../types';

interface PlanPricesTableProps {
    prices: AdPlanConfig['prices'];
    onChange: (newPrices: AdPlanConfig['prices']) => void;
    readOnly: boolean;
    darkMode?: boolean;
}

const CYCLES: { key: BillingCycle; label: string }[] = [
    { key: 'daily', label: 'Diário' },
    { key: 'weekly', label: 'Semanal' },
    { key: 'fortnightly', label: 'Quinzenal' },
    { key: 'monthly', label: 'Mensal' },
    { key: 'quarterly', label: 'Trimestral' },
    { key: 'semiannual', label: 'Semestral' },
    { key: 'yearly', label: 'Anual' }
];

const PlanPricesTable: React.FC<PlanPricesTableProps> = ({ prices, onChange, readOnly, darkMode = false }) => {
    const handleChange = (cycle: BillingCycle, val: string) => {
        const num = parseFloat(val);
        onChange({ ...prices, [cycle]: isNaN(num) ? 0 : num });
    };

    return (
        <div>
            <label className={`text-[9px] font-black uppercase mb-3 block tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Tabela de Preços (R$)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {CYCLES.map(c => (
                    <div key={c.key} className={`p-3 rounded-xl border ${readOnly
                        ? (darkMode ? 'bg-white/5 border-white/5 opacity-50' : 'border-gray-100 bg-gray-50')
                        : (darkMode ? 'bg-black/20 border-white/10' : 'bg-white border-gray-200')
                        }`}>
                        <span className={`text-[8px] font-bold uppercase block mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{c.label}</span>
                        <input
                            type="number"
                            value={prices[c.key]}
                            onChange={e => handleChange(c.key, e.target.value)}
                            disabled={readOnly}
                            step="0.01"
                            className={`w-full font-black text-sm outline-none bg-transparent ${readOnly
                                ? (darkMode ? 'text-gray-600' : 'text-gray-500 cursor-not-allowed')
                                : (darkMode ? 'text-white' : 'text-gray-900')
                                }`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlanPricesTable;
