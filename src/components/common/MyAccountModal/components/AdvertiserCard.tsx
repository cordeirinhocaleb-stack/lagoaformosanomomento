import React from 'react';
import { Advertiser } from '../../../../types';

interface AdvertiserCardProps {
    ad: Advertiser;
}

const AdvertiserCard: React.FC<AdvertiserCardProps> = ({ ad }) => (
    <div className="bg-white group hover:bg-gray-50 border border-gray-200 hover:border-red-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden">

        {/* Decorative Status Line */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${ad.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pl-2">

            {/* Logo & Info */}
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex-shrink-0 overflow-hidden border-2 border-white shadow-md relative">
                    {ad.logoUrl ? (
                        <img src={ad.logoUrl} className="w-full h-full object-cover" alt={ad.name} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                            <i className="fas fa-image text-xl"></i>
                        </div>
                    )}
                    {/* Status Dot on Logo */}
                    <div className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white ${ad.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                </div>

                <div>
                    <h5 className="text-sm font-black uppercase text-gray-900 leading-tight tracking-tight mb-1">{ad.name}</h5>
                    <div className="flex flex-wrap gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-gray-100 text-gray-500 border border-gray-200">
                            {ad.category}
                        </span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${ad.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {ad.isActive ? 'No Ar' : 'Pausado'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-grow max-w-2xl bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Início</span>
                    <span className="text-xs font-bold text-gray-800 font-mono">
                        {ad.startDate ? new Date(ad.startDate).toLocaleDateString('pt-BR') : '--/--'}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Fim</span>
                    <span className="text-xs font-bold text-gray-800 font-mono">
                        {ad.endDate ? new Date(ad.endDate).toLocaleDateString('pt-BR') : '--/--'}
                    </span>
                </div>
                <div className="flex flex-col pl-4 border-l border-gray-200">
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Views</span>
                    <span className="text-sm font-black text-blue-600 flex items-center gap-1.5 leading-none">
                        <i className="fas fa-eye text-[10px] opacity-70"></i> {ad.views.toLocaleString()}
                    </span>
                </div>
                <div className="flex flex-col pl-4 border-l border-gray-200">
                    <span className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Cliques</span>
                    <span className="text-sm font-black text-red-600 flex items-center gap-1.5 leading-none">
                        <i className="fas fa-mouse-pointer text-[10px] opacity-70"></i> {ad.clicks.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    </div>
);

export default AdvertiserCard;
