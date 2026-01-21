
import React from 'react';

export type ModuleStatus = 'planned' | 'development' | 'beta' | 'soon';

interface UpcomingModuleCardProps {
  title: string;
  description: string;
  icon: string;
  status: ModuleStatus;
  eta?: string;
}

const STATUS_CONFIG: Record<ModuleStatus, { label: string; color: string; bg: string }> = {
    planned: { label: 'Planejado', color: 'text-gray-500', bg: 'bg-gray-100' },
    development: { label: 'Em Desenvolvimento', color: 'text-blue-600', bg: 'bg-blue-50' },
    beta: { label: 'Beta Fechado', color: 'text-purple-600', bg: 'bg-purple-50' },
    soon: { label: 'Em Breve', color: 'text-amber-600', bg: 'bg-amber-50' }
};

const UpcomingModuleCard: React.FC<UpcomingModuleCardProps> = ({ title, description, icon, status, eta }) => {
  const statusInfo = STATUS_CONFIG[status];

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1 h-full flex flex-col">
        <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[9px] font-black uppercase tracking-widest ${statusInfo.bg} ${statusInfo.color}`}>
            {statusInfo.label}
        </div>
        
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 transition-transform group-hover:scale-110 shrink-0 ${status === 'development' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400'}`}>
            <i className={`fas ${icon}`}></i>
        </div>

        <h4 className="text-lg font-black uppercase text-gray-900 mb-2 tracking-tight">{title}</h4>
        <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6 flex-grow">
            {description}
        </p>

        {eta && (
            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-50 pt-4 mt-auto">
                <i className="fas fa-calendar-alt"></i> Previsão: {eta}
            </div>
        )}
        
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-gray-100 rounded-3xl pointer-events-none transition-colors"></div>
    </div>
  );
};

export default UpcomingModuleCard;
