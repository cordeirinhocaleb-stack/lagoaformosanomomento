
import React from 'react';
import { NewsItem } from '../../types';
import Logo from '../common/Logo';

interface NewsCardProps {
  news: NewsItem;
  featured?: boolean;
  onClick?: (news: NewsItem) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, featured, onClick }) => {
  const handleClick = () => {
    if (onClick) onClick(news);
  };

  if (featured) {
    return (
      <div 
        onClick={handleClick}
        className="relative overflow-hidden rounded-[2.5rem] md:rounded-[3rem] shadow-2xl group cursor-pointer bg-black h-[280px] md:h-[400px] lg:h-[480px] xl:h-[550px] border-b-[10px] border-red-600 transition-all duration-500 hover:scale-[1.01]"
      >
        <img 
          src={news.imageUrl} 
          alt={news.title}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-60 group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        
        <div className="absolute bottom-0 p-6 md:p-8 lg:p-10 w-full">
          <div className="flex items-center gap-3 mb-3 md:mb-4">
            <span className="bg-red-600 text-white text-[8px] md:text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest animate-pulse">
              {news.isBreaking ? 'PLANTÃO' : 'NO MOMENTO'}
            </span>
            <span className="text-white/80 text-[10px] uppercase font-black tracking-[0.2em]">{news.category}</span>
          </div>
          <h2 className="text-xl md:text-3xl lg:text-5xl font-black text-white leading-[0.9] serif mb-4 group-hover:text-red-500 transition-colors line-clamp-3">
            {news.title}
          </h2>
          <p className="hidden lg:block text-gray-200 line-clamp-2 text-lg mb-6 font-medium opacity-90">
            {news.lead}
          </p>
          <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center overflow-hidden"><Logo /></div>
              <div>
                <p className="font-black text-white tracking-tighter text-sm md:text-lg uppercase italic leading-none">Por {news.author}</p>
                <p className="text-red-600 font-black uppercase text-[8px] tracking-widest mt-1">{new Date(news.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden active:bg-gray-50 transition-all flex flex-col h-full hover:shadow-2xl hover:border-red-200 group cursor-pointer"
    >
      <div className="w-full h-48 md:h-64 lg:h-72 overflow-hidden relative">
        <img 
          src={news.imageUrl} 
          alt={news.title}
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4">
          <div className="bg-black/90 backdrop-blur-md px-3 py-1 rounded text-[9px] font-black text-red-500 uppercase tracking-widest border border-red-600/30">
            {news.category}
          </div>
        </div>
      </div>
      <div className="p-6 lg:p-10 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-gray-900 leading-tight serif mb-4 line-clamp-2 group-hover:text-red-600">
            {news.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-3 mb-6 leading-relaxed font-medium">
            {news.lead}
          </p>
        </div>
        <div className="flex justify-between items-center border-t border-gray-50 pt-6 mt-auto">
          <span className="text-[10px] font-black text-gray-800 uppercase italic tracking-tighter">
            {news.author}
          </span>
          <span className="text-[9px] font-black text-gray-300 uppercase">{new Date(news.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
