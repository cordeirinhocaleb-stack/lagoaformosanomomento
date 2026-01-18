import React from 'react';

interface AlertBlockProps {
    type?: 'amber' | 'red';
    title: string;
    description: string;
    icon?: string;
}

const AlertBlock: React.FC<AlertBlockProps> = ({ type = 'amber', title, description, icon = 'fa-exclamation-triangle' }) => {
    return (
        <div className={`flex items-center gap-4 p-4 rounded-3xl bg-${type}-500/10 border border-${type}-500/20 animate-fade-in`}>
            <div className={`w-12 h-12 rounded-2xl bg-${type}-500 flex items-center justify-center text-black shrink-0 shadow-lg`}>
                <i className={`fas ${icon} text-xl`}></i>
            </div>
            <div className="flex flex-col">
                <span className={`text-[8px] md:text-[9px] font-black uppercase text-${type}-500 tracking-widest`}>Alerta de Sistema</span>
                <h4 className="text-white text-xs md:text-sm font-bold uppercase tracking-tight">{title}</h4>
                <p className="text-white/60 text-[10px] md:text-[11px] font-medium leading-tight">{description}</p>
            </div>
        </div>
    );
};

export default AlertBlock;
