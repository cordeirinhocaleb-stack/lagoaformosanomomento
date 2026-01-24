'use client';

import React from 'react';

export type ContractSection = 'basic' | 'showcase' | 'banner' | 'popup';

interface ContractSectionSelectorProps {
    activeSection: ContractSection;
    onChange: (section: ContractSection) => void;
    darkMode?: boolean;
}

const SECTIONS = [
    {
        id: 'basic' as ContractSection,
        label: 'Informações Básicas',
        icon: 'fa-info-circle',
        color: 'blue',
        description: 'Nome, categoria, plano e datas'
    },
    {
        id: 'showcase' as ContractSection,
        label: 'Vitrine/Página',
        icon: 'fa-store',
        color: 'purple',
        description: 'Página interna do anunciante'
    },
    {
        id: 'banner' as ContractSection,
        label: 'Banner Home',
        icon: 'fa-panorama',
        color: 'orange',
        description: 'Banners no topo do site'
    },
    {
        id: 'popup' as ContractSection,
        label: 'Popup Promo',
        icon: 'fa-bullhorn',
        color: 'red',
        description: 'Popups promocionais'
    }
];

const ContractSectionSelector: React.FC<ContractSectionSelectorProps> = ({
    activeSection,
    onChange,
    darkMode = false
}) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {SECTIONS.map((section) => {
                const isActive = activeSection === section.id;
                const colorClasses = {
                    blue: isActive
                        ? 'bg-blue-600 text-white border-blue-700'
                        : darkMode
                            ? 'bg-blue-900/20 text-blue-400 border-blue-900/30 hover:bg-blue-900/30'
                            : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100',
                    purple: isActive
                        ? 'bg-purple-600 text-white border-purple-700'
                        : darkMode
                            ? 'bg-purple-900/20 text-purple-400 border-purple-900/30 hover:bg-purple-900/30'
                            : 'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100',
                    orange: isActive
                        ? 'bg-orange-600 text-white border-orange-700'
                        : darkMode
                            ? 'bg-orange-900/20 text-orange-400 border-orange-900/30 hover:bg-orange-900/30'
                            : 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100',
                    red: isActive
                        ? 'bg-red-600 text-white border-red-700'
                        : darkMode
                            ? 'bg-red-900/20 text-red-400 border-red-900/30 hover:bg-red-900/30'
                            : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                };

                return (
                    <button
                        key={section.id}
                        onClick={() => onChange(section.id)}
                        className={`p-4 rounded-2xl border-2 transition-all text-left ${colorClasses[section.color as keyof typeof colorClasses]
                            } ${isActive ? 'shadow-lg scale-105' : 'shadow-sm'}`}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <i className={`fas ${section.icon} text-xl`}></i>
                            <h3 className="text-sm font-black uppercase tracking-tight">
                                {section.label}
                            </h3>
                        </div>
                        <p className={`text-[10px] font-medium ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                            {section.description}
                        </p>
                    </button>
                );
            })}
        </div>
    );
};

export default ContractSectionSelector;
