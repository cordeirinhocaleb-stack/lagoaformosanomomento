
import React from 'react';

interface VerticalNewsColumnProps {
    title: string;
    items: any[];
    theme: 'green' | 'blue';
}

const CATEGORY_FALLBACKS: Record<string, string> = {
    'Política': 'https://placehold.co/600x400/1a1a1a/FFF?text=Politica',
    'Agronegócio': 'https://placehold.co/600x400/166534/FFF?text=Agro',
    'Tecnologia': 'https://placehold.co/600x400/2563eb/FFF?text=Tech',
    'Economia': 'https://placehold.co/600x400/0f172a/FFF?text=Economia',
    'Mundo': 'https://placehold.co/600x400/475569/FFF?text=Mundo'
};

const VerticalNewsColumn: React.FC<VerticalNewsColumnProps> = ({ title, items, theme }) => {
    const isGreen = theme === 'green';
    const accentColor = isGreen ? 'text-green-600' : 'text-blue-600';
    const bgColor = isGreen ? 'bg-green-50' : 'bg-blue-50';
    const borderColor = isGreen ? 'border-green-100' : 'border-blue-100';
    const hoverBorderColor = isGreen ? 'group-hover:border-green-300' : 'group-hover:border-blue-300';
    const badgeBg = isGreen ? 'bg-green-100' : 'bg-blue-100';
    const badgeText = isGreen ? 'text-green-800' : 'text-blue-800';

    const iconMap: Record<string, string> = {
        'Política': 'fa-building-columns',
        'Agronegócio': 'fa-tractor',
        'Tecnologia': 'fa-microchip',
        'Economia': 'fa-chart-line',
        'Mundo': 'fa-globe'
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className={`flex items-center gap-3 border-b-4 ${isGreen ? 'border-green-600' : 'border-blue-600'} pb-3`}>
                <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center ${accentColor} shadow-sm border ${borderColor}`}>
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
                        className={`group bg-white rounded-2xl p-3 border ${borderColor} shadow-sm hover:shadow-lg ${hoverBorderColor} transition-all flex flex-col gap-3 h-auto relative overflow-hidden`}
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
                            <span className={`absolute top-2 left-2 ${badgeBg} ${badgeText} text-[8px] font-black uppercase px-2 py-1 rounded-md tracking-widest z-10 shadow-sm`}>
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
