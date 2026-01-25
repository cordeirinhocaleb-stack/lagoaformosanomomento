import React from 'react';
import { Advertiser } from '../../../../types';

interface AdvertiserCardProps {
    ad: Advertiser;
}

const AdvertiserCard: React.FC<AdvertiserCardProps> = ({ ad }) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100">
                    {ad.logoUrl ? (
                        <img src={ad.logoUrl} className="w-full h-full object-cover" alt={ad.name} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <i className="fas fa-image"></i>
                        </div>
                    )}
                </div>
                <div>
                    <h5 className="text-[11px] font-black uppercase text-gray-900 leading-tight">{ad.name}</h5>
                    <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-[8px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">
                            {ad.category}
                        </span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest ${ad.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {ad.isActive ? 'No Ar' : 'Pausado'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-grow max-w-2xl">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Início</span>
                    <span className="text-[10px] font-bold text-gray-800">
                        {ad.startDate ? new Date(ad.startDate).toLocaleDateString('pt-BR') : 'Não definido'}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Término</span>
                    <span className="text-[10px] font-bold text-gray-800">
                        {ad.endDate ? new Date(ad.endDate).toLocaleDateString('pt-BR') : 'Não definido'}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Visualizações</span>
                    <span className="text-[10px] font-black text-blue-600 flex items-center gap-1">
                        <i className="fas fa-eye text-[8px]"></i> {ad.views.toLocaleString()}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Cliques</span>
                    <span className="text-[10px] font-black text-red-600 flex items-center gap-1">
                        <i className="fas fa-mouse-pointer text-[8px]"></i> {ad.clicks.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    </div>
);

export default AdvertiserCard;
