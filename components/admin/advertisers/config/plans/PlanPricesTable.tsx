
import React from 'react';
import { AdPlanConfig, BillingCycle } from '../../../../../types';

interface PlanPricesTableProps {
  prices: AdPlanConfig['prices'];
  onChange: (newPrices: AdPlanConfig['prices']) => void;
  readOnly: boolean;
}

const CYCLES: { key: BillingCycle; label: string }[] = [
    { key: 'daily', label: 'Diário' },
    { key: 'weekly', label: 'Semanal' },
    { key: 'monthly', label: 'Mensal' },
    { key: 'quarterly', label: 'Trimestral' },
    { key: 'semiannual', label: 'Semestral' },
    { key: 'yearly', label: 'Anual' }
];

const PlanPricesTable: React.FC<PlanPricesTableProps> = ({ prices, onChange, readOnly }) => {
  const handleChange = (cycle: BillingCycle, val: string) => {
      const num = parseFloat(val);
      onChange({ ...prices, [cycle]: isNaN(num) ? 0 : num });
  };

  return (
    <div>
        <label className="text-[9px] font-black uppercase text-gray-400 mb-3 block tracking-widest">Tabela de Preços (R$)</label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {CYCLES.map(c => (
                <div key={c.key} className={`bg-white p-3 rounded-xl border ${readOnly ? 'border-gray-100 bg-gray-50' : 'border-gray-200'}`}>
                    <span className="text-[8px] font-bold text-gray-400 uppercase block mb-1">{c.label}</span>
                    <input 
                        type="number" 
                        value={prices[c.key]}
                        onChange={e => handleChange(c.key, e.target.value)}
                        disabled={readOnly}
                        step="0.01"
                        className={`w-full font-black text-sm outline-none bg-transparent ${readOnly ? 'text-gray-500 cursor-not-allowed' : 'text-gray-900'}`}
                    />
                </div>
            ))}
        </div>
    </div>
  );
};

export default PlanPricesTable;
