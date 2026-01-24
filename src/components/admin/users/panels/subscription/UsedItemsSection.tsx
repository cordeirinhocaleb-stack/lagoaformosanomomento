import React from 'react';

interface UsedItemsSectionProps {
    userAds: any[];
    darkMode: boolean;
}

export const UsedItemsSection: React.FC<UsedItemsSectionProps> = ({ userAds, darkMode }) => {
    return (
        <div className={`rounded-xl p-6 ${darkMode ? 'bg-black/40' : 'bg-gray-50'}`}>
            <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                <i className="fas fa-box-open text-orange-500"></i> Itens Utilizados
            </h3>

            {userAds.length === 0 ? (
                <div className={`p-4 rounded-xl text-center border border-dashed ${darkMode ? 'border-white/10' : 'border-gray-300'}`}>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Nenhum item utilizado ainda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {userAds.map((ad: any, idx) => {
                        let icon = 'fas fa-ad';
                        let label = 'Anúncio';
                        let color = 'text-gray-500';

                        if (ad.category === 'video' || ad.type === 'video') {
                            icon = 'fas fa-clapperboard';
                            label = 'Vídeo';
                            color = 'text-pink-500';
                        } else if (ad.category?.includes('banner') || ad.name?.toLowerCase().includes('banner')) {
                            icon = 'fas fa-window-maximize';
                            label = 'Banner';
                            color = 'text-indigo-500';
                        } else {
                            const n = ad.name?.toLowerCase() || '';
                            if (n.includes('insta')) { icon = 'fab fa-instagram'; label = 'Instagram'; color = 'text-fuchsia-500'; }
                            else if (n.includes('face')) { icon = 'fab fa-facebook-f'; label = 'Facebook'; color = 'text-blue-500'; }
                        }

                        return (
                            <div key={idx} className={`relative aspect-square rounded-xl flex flex-col items-center justify-center gap-2 border border-dashed ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-300 bg-gray-50'}`} title={`Utilizado em: ${ad.name}`}>
                                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500/50"></div>
                                <i className={`${icon} ${color} text-xl opacity-80`}></i>
                                <span className={`text-[8px] font-bold uppercase text-center leading-tight px-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
