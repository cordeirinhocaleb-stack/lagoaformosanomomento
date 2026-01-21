import React from 'react';

interface MobileToolBtnProps {
    icon: string;
    label: string;
    action: string;
    val?: string;
    activeColor?: string;
    tooltip?: string;
    onAction: (action: string, val?: string) => void;
    onLink: () => void;
}

export const MobileToolBtn: React.FC<MobileToolBtnProps> = ({ icon, label, action, val, activeColor, tooltip, onAction, onLink }) => (
    <button
        onClick={(e) => { e.stopPropagation(); action === 'link' ? onLink() : onAction(action, val); }}
        className={`flex-shrink-0 flex flex-col items-center justify-center w-12 h-11 rounded-xl transition-all border border-zinc-800 hover:border-zinc-600 active:scale-95 group relative ${activeColor ? activeColor : 'bg-zinc-800 text-white'}`}
        title={tooltip || label}
    >
        <i className={`fas ${icon} text-sm mb-0.5`}></i>
        <span className="text-[6px] font-black uppercase tracking-wider opacity-60">{label}</span>
    </button>
);
