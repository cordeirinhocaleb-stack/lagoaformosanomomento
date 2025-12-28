
import React from 'react';
import { NewsItem } from '../types';
import Logo from './Logo';

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
        /* AJUSTE MOBILE: Altura reduzida de h-[400px] para h-[280px] para ficar mais retangular e ocupar menos espaço */
        className="relative overflow-hidden rounded-[2.5rem] md:rounded-[3rem] shadow-2xl group cursor-pointer bg-black h-[280px] md:h-[550px] border-b-[12px] border-red-600 transition-all duration-500 hover:scale-[1.01]"
      >
        <img 
          src={news.imageUrl} 
          alt={news.title}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-60 group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        
        {/* AJUSTE MOBILE: Padding reduzido de p-10 para p-6 no mobile */}
        <div className="absolute bottom-0 p-6 md:p-10 w-full">
          <div className="flex items-center gap-3 mb-3 md:mb-6">
            <span className="bg-red-600 text-white text-[8px] md:text-[10px] font-black px-3 md:px-4 py-1.5 md:py-2 rounded-full uppercase tracking-widest italic shadow-xl animate-pulse">
              {news.isBreaking ? 'PLANTÃO' : 'NO MOMENTO'}
            </span>
            <span className="text-white/80 text-[10px] md:text-xs uppercase font-black tracking-[0.3em]">{news.category}</span>
          </div>
          <h2 className="text-2xl md:text-5xl lg:text-6xl font-black text-white leading-[0.9] serif mb-4 md:mb-6 group-hover:text-red-500 transition-colors drop-shadow-2xl line-clamp-3 md:line-clamp-none">
            {news.title}
          </h2>
          <p className="hidden md:block text-gray-200 line-clamp-2 text-xl mb-6 max-w-2xl font-medium leading-relaxed opacity-90">
            {news.lead}
          </p>
          <div className="flex items-center justify-between border-t border-white/10 pt-4 md:pt-6 mt-2 md:mt-6">
            <div className="flex items-center gap-3 md:gap-6">
              <div className="w-10 h-10 md:w-16 md:h-16 flex items-center justify-center overflow-hidden"><Logo /></div>
              <div>
                <p className="font-black text-white tracking-tighter text-lg md:text-2xl uppercase italic leading-none">Por {news.author}</p>
                <p className="text-red-600 font-black uppercase text-[8px] md:text-[10px] tracking-widest mt-1">Lagoa Formosa • {new Date(news.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <span className="hidden md:block text-[8px] text-white/30 font-bold uppercase tracking-widest">Créditos: {news.imageCredits}</span>
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
      <div className="w-full h-72 overflow-hidden relative">
        <img 
          src={news.imageUrl} 
          alt={news.title}
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          <div className="bg-black/90 backdrop-blur-md px-4 py-1.5 rounded-lg text-[10px] font-black text-red-500 uppercase tracking-widest border border-red-600/30 shadow-xl">
            {news.category}
          </div>
        </div>
      </div>
      <div className="p-10 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight serif mb-4 line-clamp-2 group-hover:text-red-600 transition-colors">
            {news.title}
          </h3>
          <p className="text-sm md:text-lg text-gray-600 line-clamp-3 mb-8 leading-relaxed font-medium">
            {news.lead}
          </p>
        </div>
        <div className="flex justify-between items-center border-t-2 border-gray-50 pt-6 mt-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center"><Logo /></div>
            <span className="text-sm font-black text-gray-800 uppercase italic tracking-tighter">
              {news.author}
            </span>
          </div>
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{new Date(news.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
