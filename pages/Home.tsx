
import React, { useState, useMemo } from 'react';
import { NewsItem, Advertiser, User, AdPricingConfig } from '../types';
import CategoryMenu from '../components/layout/CategoryMenu';
import AdBanner from '../components/ads/AdBanner';
import FullWidthPromo from '../components/ads/FullWidthPromo';
import DailyBread from '../components/news/DailyBread';
import NewsCard from '../components/news/NewsCard';

interface HomeProps {
  news: NewsItem[];
  advertisers: Advertiser[];
  user: User | null;
  onNewsClick: (item: NewsItem) => void;
  onAdvertiserClick: (ad: Advertiser) => void;
  onAdminClick: () => void;
  onPricingClick: () => void;
  onJobsClick: () => void;
  brazilNews?: any[]; 
  worldNews?: any[];
  externalCategories?: Record<string, any[]>;
}

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

    const TRANSPARENT_PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

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
                              src={item.imageUrl} 
                              alt={item.title} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              onError={(e) => {
                                  e.currentTarget.onerror = null; 
                                  e.currentTarget.src = CATEGORY_FALLBACKS[title] || TRANSPARENT_PIXEL;
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
                  [1,2].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse"></div>)
              )}
          </div>
      </div>
    );
};

const Home: React.FC<HomeProps & { adConfig?: AdPricingConfig }> = ({ 
  news, advertisers, user, onNewsClick, onAdvertiserClick, onAdminClick, onPricingClick, onJobsClick, adConfig, externalCategories = {} 
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredNews = useMemo(() => {
    let list = news.filter(n => n.status === 'published' && n.source === 'site');
    if (selectedCategory !== 'all') list = list.filter(n => n.category === selectedCategory);
    return [...list].sort((a, b) => (b.featuredPriority || 0) - (a.featuredPriority || 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [news, selectedCategory]);

  const breakingNewsItem = useMemo(() => news.find(n => n.isBreaking && n.status === 'published'), [news]);

  const verticalHighlights = useMemo(() => {
      const cats = ['Polícia', 'Agro', 'Política', 'Esporte'];
      return cats.map(cat => news.find(n => n.category === cat && n.status === 'published' && n.source === 'site')).filter(Boolean) as NewsItem[];
  }, [news]);

  const displayOrder = ['Política', 'Agronegócio', 'Tecnologia', 'Economia', 'Mundo'];

  return (
    <div className="w-full">
      <CategoryMenu selectedCategory={selectedCategory} onSelectCategory={id => id === 'jobs_view_trigger' ? onJobsClick() : setSelectedCategory(id)} onAdminClick={onAdminClick} user={user} />
      
      {breakingNewsItem && (
          <div onClick={() => onNewsClick(breakingNewsItem)} className="bg-red-600 text-white cursor-pointer overflow-hidden relative z-50">
              <div className="max-w-[1500px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest italic">Plantão</span>
                  </div>
                  <p className="flex-1 text-xs md:text-sm font-black uppercase italic tracking-tight truncate">{breakingNewsItem.title}</p>
                  <i className="fas fa-arrow-right text-xs"></i>
              </div>
          </div>
      )}

      <AdBanner advertisers={advertisers} adConfig={adConfig} onAdvertiserClick={onAdvertiserClick} onPlanRequest={onPricingClick} />
      <FullWidthPromo />
      
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 md:mb-16 mt-8 md:mt-24">
          <h2 className="text-4xl md:text-6xl lg:text-8xl font-[1000] uppercase tracking-tighter text-black leading-none">NOTÍCIAS</h2>
          <div className="bg-red-600 px-6 py-2 md:py-4 skew-x-[-15deg] shadow-xl w-fit">
            <span className="text-white font-black text-2xl md:text-4xl lg:text-6xl italic skew-x-[15deg] block leading-none">DO MOMENTO</span>
          </div>
        </div>
        
        {/* GRID PRINCIPAL RESPONSIVA */}
        <section className="mb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Coluna de Notícias: 1 no mobile, 2 no tablet (md), 2 no desktop (lg col-span-8) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
             {filteredNews.length > 0 ? (
                filteredNews.slice(0, 6).map((item) => (
                    <NewsCard key={item.id} news={item} featured onClick={onNewsClick} />
                ))
             ) : (
                <div className="col-span-full py-24 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Aguardando publicações...</p>
                </div>
             )}
          </div>

          {/* Lateral de Destaques: Ocupa largura total no mobile/tablet, lateral no desktop */}
          <div className="lg:col-span-4 flex flex-col gap-6">
             <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Editorias <span className="text-red-600">LFNM</span></h3>
                <i className="fas fa-layer-group text-gray-300"></i>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                {verticalHighlights.map((item) => (
                   <div key={item.id} onClick={() => onNewsClick(item)} className="group bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer flex gap-4 items-center h-28">
                      <div className="w-24 h-full flex-shrink-0 rounded-xl overflow-hidden relative">
                         <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                         {item.mediaType === 'video' && <div className="absolute inset-0 flex items-center justify-center bg-black/20"><i className="fas fa-play text-white text-[10px]"></i></div>}
                      </div>
                      <div className="flex-1 flex flex-col justify-center h-full">
                         <span className="text-[9px] font-black uppercase text-red-600 tracking-widest mb-1">{item.category}</span>
                         <h4 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-red-600">{item.title}</h4>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </section>

        {/* GIRO BRASIL & MUNDO: Layout Grid Progressivo */}
        <section className="w-full mb-24 bg-gray-50 rounded-[3rem] p-6 md:p-10 lg:p-16 border border-gray-100">
            <div className="flex items-center gap-4 mb-12">
                <div className="w-2 h-12 bg-black rounded-full"></div>
                <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">Giro <span className="text-red-600">Brasil & Mundo</span></h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                {displayOrder.map(cat => (
                    <VerticalNewsColumn key={cat} title={cat} items={(externalCategories[cat] || []).slice(0, 3)} theme={['Política', 'Agronegócio'].includes(cat) ? 'green' : 'blue'} />
                ))}
            </div>
        </section>
      </div>
      <DailyBread />
    </div>
  );
};

export default Home;
