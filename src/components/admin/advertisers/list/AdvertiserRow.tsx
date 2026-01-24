
import React, { useState, useEffect } from 'react';
import { Advertiser } from '../../../../types';
import { getLocalFile } from '../../../../services/storage/localStorageService';
import { useAppControllerContext } from '../../../../providers/AppControllerProvider';

interface AdvertiserRowProps {
    advertiser: Advertiser;
    onEdit: (advertiser: Advertiser) => void;
    onDelete?: (id: string) => void;
    darkMode?: boolean;
}

const AdvertiserRow: React.FC<AdvertiserRowProps> = ({ advertiser, onEdit, onDelete, darkMode = false }) => {
    const ctrl = useAppControllerContext();
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    // Carregar preview do logo se for um ID local
    useEffect(() => {
        const loadLogoPreview = async () => {
            if (advertiser.logoUrl?.startsWith('local_')) {
                try {
                    const blob = await getLocalFile(advertiser.logoUrl);
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        setLogoPreview(url);
                        return () => URL.revokeObjectURL(url);
                    }
                } catch (error) {
                    console.error('Erro ao carregar preview do logo:', error);
                }
            } else {
                setLogoPreview(null);
            }
        };
        loadLogoPreview();
    }, [advertiser.logoUrl]);

    const startDate = new Date(advertiser.startDate);
    const endDate = new Date(advertiser.endDate);
    const now = new Date();

    const totalDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.max(0, (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));

    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isExpired = daysLeft < 0;
    const isExpiringSoon = daysLeft > 0 && daysLeft <= 7;

    let statusColor = 'bg-gray-100 text-gray-400';
    let statusText = 'Inativo';

    if (advertiser.isActive) {
        if (isExpired) {
            statusColor = 'bg-red-100 text-red-600 border-red-200';
            statusText = 'Vencido';
        } else if (isExpiringSoon) {
            statusColor = 'bg-amber-100 text-amber-600 border-amber-200';
            statusText = 'Vence em breve';
        } else {
            statusColor = 'bg-green-100 text-green-600 border-green-200';
            statusText = 'Ativo';
        }
    }

    const ctr = advertiser.views > 0 ? ((advertiser.clicks / advertiser.views) * 100).toFixed(1) : '0';

    // Resolver URL do logo (local preview ou URL normal)
    const resolvedLogoUrl = logoPreview || advertiser.logoUrl;

    return (
        <div
            onClick={() => onEdit(advertiser)}
            className={`group p-4 md:p-8 rounded-3xl md:rounded-[2.5rem] border shadow-sm hover:shadow-xl hover:border-red-100 transition-all cursor-pointer relative overflow-hidden flex flex-col lg:flex-row items-center gap-6 ${darkMode ? 'bg-[#151515] border-white/5' : 'bg-white border-gray-100'}`}
        >
            <div className={`absolute left-0 top-0 bottom-0 w-2 ${advertiser.isActive && !isExpired ? 'bg-green-500 shadow-[2px_0_10px_rgba(34,197,94,0.3)]' : (darkMode ? 'bg-white/10' : 'bg-gray-200')} group-hover:bg-red-600 transition-colors`}></div>

            <div className={`w-20 h-20 rounded-3xl border flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform shadow-inner ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                {resolvedLogoUrl ? (
                    <img src={resolvedLogoUrl} alt={advertiser.name} className="w-full h-full object-cover" />
                ) : (
                    <i className={`fas ${advertiser.logoIcon || 'fa-store'} text-3xl transition-colors ${darkMode ? 'text-gray-600 group-hover:text-red-500' : 'text-gray-300 group-hover:text-red-500'}`}></i>
                )}
            </div>

            <div className="flex-1 text-center lg:text-left min-w-0 w-full">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-2">
                    <h3 className={`text-xl font-black uppercase truncate tracking-tight group-hover:text-red-600 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {advertiser.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border w-fit mx-auto lg:mx-0 ${statusColor}`}>
                        {statusText}
                    </span>
                </div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex flex-col lg:flex-row gap-2 lg:gap-6 items-center lg:items-start">
                    <span className="flex items-center gap-1.5"><i className={`fas fa-tag ${darkMode ? 'text-gray-500' : 'text-gray-300'}`}></i> {advertiser.category}</span>
                    <span className="hidden lg:inline opacity-20">•</span>
                    <span className="flex items-center gap-1.5"><i className="fas fa-crown text-yellow-500"></i> Plano {advertiser.plan.toUpperCase()}</span>
                </p>
            </div>

            <div className={`flex flex-col gap-5 w-full lg:w-72 border-t lg:border-t-0 lg:border-l pt-5 lg:pt-0 lg:pl-6 ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
                <div>
                    <div className="flex justify-between text-[9px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                        <span>Contrato</span>
                        <span className={daysLeft <= 7 ? 'text-red-600 animate-pulse font-extrabold' : ''}>
                            {daysLeft > 0 ? (
                                <>
                                    {daysLeft <= 7 && <i className="fas fa-exclamation-triangle mr-1"></i>}
                                    {daysLeft} dias restantes
                                </>
                            ) : 'Finalizado'}
                        </span>
                    </div>
                    <div className={`w-full h-2.5 rounded-full overflow-hidden shadow-inner ${darkMode ? 'bg-black/40' : 'bg-gray-100'}`}>
                        <div
                            className={`h-full rounded-full ${isExpired ? 'bg-red-500' : (daysLeft <= 7 ? 'bg-amber-500' : 'bg-green-500')} transition-all duration-1000 ease-out`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-[8px] font-bold uppercase text-gray-400 mt-2">
                        <span className={`px-2 py-0.5 rounded border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'}`}>{startDate.toLocaleDateString()}</span>
                        <span className={`px-2 py-0.5 rounded border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'}`}>{endDate.toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div className={`rounded-xl p-3 text-center border shadow-sm ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                        <span className="block text-[9px] font-black uppercase text-gray-400 mb-0.5 tracking-tighter">Views</span>
                        <span className={`block text-sm font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{advertiser.views}</span>
                    </div>
                    <div className={`rounded-xl p-3 text-center border shadow-sm ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                        <span className="block text-[9px] font-black uppercase text-gray-400 mb-0.5 tracking-tighter">Clicks</span>
                        <span className={`block text-sm font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{advertiser.clicks}</span>
                    </div>
                    <div className="bg-blue-500/10 rounded-xl p-3 text-center border border-blue-500/20 shadow-sm">
                        <span className="block text-[9px] font-black uppercase text-blue-400 mb-0.5 tracking-tighter">CTR</span>
                        <span className="block text-sm font-black text-blue-500">{ctr}%</span>
                    </div>
                </div>
            </div>

            <div className={`flex lg:flex pl-4 lg:border-l w-full lg:w-auto gap-3 ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
                <button
                    className={`w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-lg active:scale-95 group/del`}
                    onClick={(e) => {
                        e.stopPropagation();
                        ctrl.modals.showConfirm(
                            'Excluir Parceiro',
                            `Tem certeza que deseja excluir o parceiro ${advertiser.name}?`,
                            () => onDelete && onDelete(advertiser.id),
                            'danger',
                            'Excluir'
                        );
                    }}
                    title="Excluir Parceiro"
                >
                    <i className="fas fa-trash-alt text-lg"></i>
                </button>

                <button
                    className={`flex-1 lg:w-14 h-14 rounded-2xl hover:bg-red-600 transition-all flex items-center justify-center shadow-xl active:scale-95 group/btn ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}
                    onClick={(e) => { e.stopPropagation(); onEdit(advertiser); }}
                >
                    <i className="fas fa-arrow-right md:text-lg group-hover/btn:translate-x-1 transition-transform"></i>
                </button>
            </div>
        </div>
    );
};

export default AdvertiserRow;
