import React from 'react';

interface LinkedAdsSectionProps {
    userAds: any[];
    isLoadingAds: boolean;
    darkMode: boolean;
}

export const LinkedAdsSection: React.FC<LinkedAdsSectionProps> = ({ userAds, isLoadingAds, darkMode }) => {
    return (
        <div className={`rounded-xl p-6 ${darkMode ? 'bg-black/40' : 'bg-gray-50'}`}>
            <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                <i className="fas fa-file-contract text-red-500"></i> Anúncios Vinculados
            </h3>

            {isLoadingAds ? (
                <div className="flex justify-center p-4"><i className="fas fa-circle-notch fa-spin text-gray-400"></i></div>
            ) : userAds.length === 0 ? (
                <p className="text-xs text-gray-400 font-bold uppercase">Nenhum anúncio vinculado.</p>
            ) : (
                <div className="space-y-3">
                    {userAds.map((ad) => (
                        <div key={ad.id} className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
                                        {ad.logoUrl ? <img src={ad.logoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><i className="fas fa-image text-xs"></i></div>}
                                    </div>
                                    <div>
                                        <span className={`block text-[10px] font-black uppercase ${darkMode ? 'text-white' : 'text-gray-900'}`}>{ad.name}</span>
                                        <span className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase">{ad.category}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[8px] px-2 py-1 rounded-full font-black uppercase ${ad.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {ad.isActive ? 'No Ar' : 'Pausado'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-3 mt-3">
                                <div className="space-y-2">
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-black text-gray-400 uppercase">Período</span>
                                        <span className={`text-[9px] font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {ad.startDate ? new Date(ad.startDate).toLocaleDateString('pt-BR') : '?'} - {ad.endDate ? new Date(ad.endDate).toLocaleDateString('pt-BR') : '?'}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-black text-gray-400 uppercase">Visulizações</span>
                                        <span className="text-[10px] font-black text-blue-500 flex items-center gap-1">
                                            <i className="fas fa-eye text-[7px]"></i> {ad.views.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-black text-gray-400 uppercase">Cliques</span>
                                        <span className="text-[10px] font-black text-red-500 flex items-center gap-1">
                                            <i className="fas fa-mouse-pointer text-[7px]"></i> {ad.clicks.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
