import React from 'react';

interface TabButtonProps {
    id: 'profile' | 'professional' | 'security' | 'billing' | 'support';
    label: string;
    icon: string;
    activeTab: 'profile' | 'professional' | 'security' | 'billing' | 'support';
    onClick: (id: 'profile' | 'professional' | 'security' | 'billing' | 'support') => void;
}

const TabButton: React.FC<TabButtonProps> = ({ id, label, icon, activeTab, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`
      flex-shrink-0 md:w-full text-left px-4 md:px-6 py-4 md:py-6 flex items-center gap-2 md:gap-4 transition-all border-b-2 md:border-b-0 md:border-l-8
      ${activeTab === id
                ? 'bg-black text-white md:bg-gray-50 md:text-black border-red-600 font-bold'
                : 'text-gray-500 hover:bg-gray-50 hover:text-black border-transparent font-medium'}
    `}
    >
        <i className={`fas ${icon} w-6 text-xl md:text-2xl text-center ${activeTab === id ? 'text-red-500' : ''}`}></i>
        <span className="text-[10px] md:text-sm uppercase tracking-widest whitespace-nowrap">{label}</span>
    </button>
);

export default TabButton;
