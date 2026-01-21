
import React, { useEffect, useState } from 'react';
import { getUserPurchaseLogs } from '../../../../services/admin/auditService';

interface PurchaseHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    itemLabel: string;   // Ex: 'Instagram', 'Vídeo', 'Barra Topo'
    darkMode?: boolean;
}

export const PurchaseHistoryModal: React.FC<PurchaseHistoryModalProps> = ({ isOpen, onClose, userId, itemLabel, darkMode }) => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            setLoading(true);
            getUserPurchaseLogs(userId).then((data: any[]) => {
                // Filtrar logs que contenham o label do item (case insensitive)
                // Ex: itemLabel='Instagram' filtra logs com "Instagram" no detalhe
                const filtered = data.filter((log: any) => {
                    const details = log.changes?.details || "";
                    // Normaliza para comparação
                    return details.toLowerCase().includes(itemLabel.toLowerCase());
                });
                setLogs(filtered);
                setLoading(false);
            });
        }
    }, [isOpen, userId, itemLabel]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 relative flex flex-col max-h-[80vh] ${darkMode ? 'bg-gray-900 border border-gray-700 text-white' : 'bg-white text-gray-800'}`}>

                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <i className="fas fa-history text-blue-500"></i>
                        Histórico: {itemLabel}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <i className="fas fa-circle-notch fa-spin text-3xl text-blue-500"></i>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-10 opacity-50">
                            <i className="fas fa-ghost text-4xl mb-2 text-gray-300"></i>
                            <p className="text-sm">Nenhuma compra encontrada para este item.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {logs.map((log) => {
                                const date = new Date(log.created_at).toLocaleString('pt-BR');
                                const details = log.changes?.details || "Sem detalhes";

                                return (
                                    <div key={log.id} className={`p-3 rounded-lg border text-sm ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-mono text-[10px] opacity-70 flex items-center gap-1">
                                                <i className="far fa-clock"></i> {date}
                                            </span>
                                            <i className="fas fa-check-circle text-green-500 text-xs"></i>
                                        </div>
                                        <p className="font-medium leading-relaxed">{details}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-[10px] opacity-50 uppercase">Total de Transações: {logs.length}</p>
                </div>

            </div>
        </div>
    );
};
