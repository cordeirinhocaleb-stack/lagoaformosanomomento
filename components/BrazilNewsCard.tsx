
import React from 'react';

interface BrazilNewsCardProps {
  news: {
    title: string;
    excerpt: string;
    sourceName: string;
    sourceUrl: string;
    category: string;
    readingTime?: string;
  };
}

const BrazilNewsCard: React.FC<BrazilNewsCardProps> = ({ news }) => {
  return (
    <a 
      href={news.sourceUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:border-green-200 transition-all flex flex-col justify-between group h-full"
    >
      <div>
        <div className="flex items-center justify-between mb-6">
          <span className="text-[10px] font-black uppercase text-green-600 tracking-widest bg-green-50 px-3 py-1 rounded-full border border-green-100">
            {news.category}
          </span>
          {news.readingTime && (
            <span className="text-[9px] font-bold text-gray-400 uppercase">
              <i className="far fa-clock mr-1"></i> {news.readingTime}
            </span>
          )}
        </div>
        <h3 className="text-xl md:text-2xl font-black text-gray-900 leading-tight mb-4 group-hover:text-green-600 transition-colors">
          {news.title}
        </h3>
        <p className="text-gray-500 text-sm md:text-base leading-relaxed line-clamp-3 mb-8">
          {news.excerpt}
        </p>
      </div>
      
      <div className="pt-6 border-t border-gray-50 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-[10px] font-black italic">
            {news.sourceName.substring(0, 1).toUpperCase()}
          </div>
          <span className="text-[10px] font-black uppercase text-gray-800 tracking-tighter">
            FONTE: <span className="text-green-600">{news.sourceName}</span>
          </span>
        </div>
        <i className="fas fa-external-link-alt text-gray-300 group-hover:text-green-600 transition-colors text-xs"></i>
      </div>
    </a>
  );
};

export default BrazilNewsCard;
