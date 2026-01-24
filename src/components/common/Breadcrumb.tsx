'use client';

import React from 'react';

interface BreadcrumbItem {
    label: string;
    onClick?: () => void;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    darkMode?: boolean;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, darkMode = false }) => {
    return (
        <nav className="flex items-center gap-2 mb-6 animate-fadeIn">
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && (
                        <i className={`fas fa-chevron-right text-[8px] ${darkMode ? 'text-white/20' : 'text-gray-300'}`}></i>
                    )}
                    {item.onClick ? (
                        <button
                            onClick={item.onClick}
                            className={`text-xs font-bold uppercase tracking-widest transition-colors ${darkMode
                                    ? 'text-white/40 hover:text-white'
                                    : 'text-gray-400 hover:text-gray-900'
                                }`}
                        >
                            {item.label}
                        </button>
                    ) : (
                        <span
                            className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-gray-900'
                                }`}
                        >
                            {item.label}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumb;
