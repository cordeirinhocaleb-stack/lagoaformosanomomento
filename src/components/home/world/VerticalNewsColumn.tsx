
import React from 'react';

interface VerticalNewsColumnProps {
    title: string;
    items: any[];
    theme: 'green' | 'blue' | 'orange' | 'purple';
}

const CATEGORY_FALLBACKS: Record<string, string> = {
    'Política': 'https://placehold.co/600x400/1a1a1a/FFF?text=Politica',
    'Agronegócio': 'https://placehold.co/600x400/166534/FFF?text=Agro',
    'Tecnologia': 'https://placehold.co/600x400/2563eb/FFF?text=Tech',
    'Economia': 'https://placehold.co/600x400/0f172a/FFF?text=Economia',
    'Mundo': 'https://placehold.co/600x400/475569/FFF?text=Mundo'
};

const THEME_CONFIG = {
    green: { accent: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', mainBorder: 'border-green-600', hover: 'group-hover:border-green-300', badgeBg: 'bg-green-100', badgeText: 'text-green-800' },
    blue: { accent: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', mainBorder: 'border-blue-600', hover: 'group-hover:border-blue-300', badgeBg: 'bg-blue-100', badgeText: 'text-blue-800' },
    orange: { accent: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', mainBorder: 'border-orange-600', hover: 'group-hover:border-orange-300', badgeBg: 'bg-orange-100', badgeText: 'text-orange-800' },
    purple: { accent: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', mainBorder: 'border-purple-600', hover: 'group-hover:border-purple-300', badgeBg: 'bg-purple-100', badgeText: 'text-purple-800' }
};

const VerticalNewsColumn: React.FC<VerticalNewsColumnProps> = ({ title, items, theme }) => {
    const styles = THEME_CONFIG[theme] || THEME_CONFIG['blue'];

    const iconMap: Record<string, string> = {
        'Política': 'fa-building-columns',
        'Agronegócio': 'fa-tractor',
        'Tecnologia': 'fa-microchip',
        'Economia': 'fa-chart-line',
        'Mundo': 'fa-globe'
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className={`flex items-center gap-3 border-b-4 ${styles.mainBorder} pb-3`}>
                <div className={`w-10 h-10 rounded-xl ${styles.bg} flex items-center justify-center ${styles.accent} shadow-sm border ${styles.border}`}>
                    <i className={`fas ${iconMap[title] || 'fa-newspaper'} text-lg`}></i>
                </div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">
                    {title}
                </h3>
            </div>

            <div className="flex flex-col gap-4">
                {items && items.length > 0 ? items.map((item, idx) => (
                    <a
                        key={idx}
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group bg-white rounded-2xl p-3 border ${styles.border} shadow-sm hover:shadow-lg ${styles.hover} transition-all flex flex-col gap-3 h-auto relative overflow-hidden`}
                    >
                        <div className="w-full h-32 rounded-xl overflow-hidden relative bg-gray-100">
                            <img
                                src={item.imageUrl || item.image_url}
                                alt={item.title}
                                loading="lazy"
                                width="600"
                                height="400"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = CATEGORY_FALLBACKS[title] || "https://placehold.co/600x400?text=News";
                                }}
                            />
                            <span className={`absolute top-2 left-2 ${styles.badgeBg} ${styles.badgeText} text-[8px] font-black uppercase px-2 py-1 rounded-md tracking-widest z-10 shadow-sm`}>
                                {item.sourceName}
                            </span>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-900 leading-tight line-clamp-3 group-hover:text-red-600 transition-colors">
                                {item.title}
                            </h4>
                        </div>
                    </a>
                )) : (
                    [1, 2].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse"></div>)
                )}
            </div>
        </div>
    );
};

export default VerticalNewsColumn;
