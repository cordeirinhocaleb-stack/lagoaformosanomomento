import React, { useState } from 'react';
import { User } from '@/types';
import { updateUser } from '@/services/users/userService';
import { useAppController } from '@/hooks/useAppController';

interface CreditItemControlProps {
    label: string;
    icon: string;
    field: string;
    currentValue: number;
    canEdit: boolean;
    onUpdateUser: (updates: Record<string, unknown>) => void;
    currentUsage: unknown;
    user: User;
    darkMode: boolean;
}

export const CreditItemControl: React.FC<CreditItemControlProps> = ({
    label,
    icon,
    field,
    currentValue,
    canEdit,
    onUpdateUser,
    currentUsage,
    user,
    darkMode
}) => {
    const [amount, setAmount] = useState(0);
    const [mode, setMode] = useState<'dar' | 'retirar'>('dar');
    const [isSaving, setIsSaving] = useState(false);
    const { } = useAppController();

    const handleApply = async () => {
        if (amount > 0 && canEdit) {
            setIsSaving(true);
            try {
                const current = currentUsage?.[field] || 0;
                const finalValue = mode === 'dar' ? current + amount : Math.max(0, current - amount);

                const updatedUsage = {
                    ...(currentUsage || {}),
                    [field]: finalValue
                };

                // Persistir no Banco de Dados IMEDIATAMENTE
                await updateUser({
                    ...user,
                    usageCredits: updatedUsage
                });

                // Sincronizar UI local
                onUpdateUser({
                    usageCredits: updatedUsage
                });

                setAmount(0);
                alert(`${amount} item(s) ${mode === 'dar' ? 'adicionados' : 'removidos'} de "${label}". Salvo no banco.`);
            } catch (err: unknown) {
                console.error("Erro ao salvar item:", err);
                alert("Erro ao salvar no banco: " + (err.message || "Tente novamente"));
            } finally {
                setIsSaving(false);
            }
        }
    };

    return (
        <div className={`border rounded-xl p-2 shadow-sm flex flex-col items-center hover: shadow-md transition-shadow ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100'} `}>
            <div className="flex items-center justify-between w-full mb-2 px-1">
                <div className="flex items-center gap-1.5" title={label}>
                    <i className={`${icon} text-lg text-yellow-600`}></i>
                    <span className="text-[10px] font-black text-gray-400">{currentValue}</span>
                </div>
                <div className="flex bg-gray-200/50 dark:bg-white/5 rounded-lg p-0.5">
                    <button
                        onClick={() => setMode('dar')}
                        className={`px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase transition-all ${mode === 'dar' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-400 opacity-60'} `}
                    >+</button>
                    <button
                        onClick={() => setMode('retirar')}
                        className={`px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase transition-all ${mode === 'retirar' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-400 opacity-60'} `}
                    >-</button>
                </div>
            </div>

            <div className={`flex items-center border rounded-lg overflow-hidden w-full mb-2 ${darkMode ? 'bg-black/40 border-yellow-500/20' : 'bg-gray-50 border-yellow-200'} `}>
                <button
                    type="button"
                    onClick={() => setAmount(Math.max(0, amount - 1))}
                    disabled={!canEdit}
                    className={`px-2 py-1 transition-colors font-bold ${darkMode ? 'bg-yellow-900/20 hover:bg-yellow-900/40 text-yellow-500' : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700'} `}
                >-</button>
                <div className={`flex-1 text-center text-xs font-bold py-1 ${darkMode ? 'text-gray-300' : 'text-gray-800'} `}>{amount}</div>
                <button
                    type="button"
                    onClick={() => setAmount(amount + 1)}
                    disabled={!canEdit}
                    className={`px-2 py-1 transition-colors font-bold ${darkMode ? 'bg-yellow-900/20 hover:bg-yellow-900/40 text-yellow-500' : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700'} `}
                >+</button>
            </div>

            <button
                type="button"
                onClick={handleApply}
                disabled={!canEdit || amount === 0 || isSaving}
                className={`
w-full py-2 text-[8px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-1
                    ${amount > 0
                        ? (mode === 'dar' ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' : 'bg-red-600 hover:bg-red-700 text-white shadow-lg')
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                    ${isSaving ? 'opacity-50' : ''}
`}
            >
                {isSaving ? (
                    <i className="fas fa-spinner fa-spin"></i>
                ) : (
                    <i className={mode === 'dar' ? "fas fa-plus-circle" : "fas fa-minus-circle"}></i>
                )}
                {isSaving ? 'Salvando...' : (mode === 'dar' ? 'Dar Item' : 'Retirar Item')}
            </button>
        </div>
    );
};
