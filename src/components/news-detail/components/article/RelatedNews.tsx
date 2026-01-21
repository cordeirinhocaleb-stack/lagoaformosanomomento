import React from 'react';
import { NewsItem } from '@/types';

interface RelatedNewsProps {
    currentNews: NewsItem;
    recommendedNews: NewsItem[];
    onNewsClick?: (news: NewsItem) => void;
}

const RelatedNews: React.FC<RelatedNewsProps> = ({ currentNews, recommendedNews, onNewsClick }) => {
    if (recommendedNews.length === 0) return null;

    return (
        <section className="pt-16 border-t-2 border-gray-100 dark:border-zinc-800">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                <div>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-900 dark:text-zinc-100 mb-2 flex items-center gap-3">
                        <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span> Continue por dentro
                    </h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        As principais notícias de Lagoa Formosa e região para você
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {recommendedNews.map(rn => (
                    <div key={rn.id} onClick={() => onNewsClick?.(rn)} className="group cursor-pointer space-y-4">
                        <div className="aspect-[16/10] rounded-[2rem] overflow-hidden bg-gray-100 shadow-md relative">
                            <div className="absolute top-4 left-4 z-10">
                                <span className="bg-black/60 backdrop-blur-md text-white text-[7px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">
                                    {rn.region === currentNews.region ? 'Na sua região' : rn.category}
                                </span>
                            </div>
                            <img src={rn.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                        </div>
                        <h5 className="text-[13px] font-black leading-tight group-hover:text-red-600 dark:text-zinc-200 transition-colors line-clamp-3 uppercase italic tracking-tighter">{rn.title}</h5>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default RelatedNews;
