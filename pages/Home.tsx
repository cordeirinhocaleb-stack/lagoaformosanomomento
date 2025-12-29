
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
      <div className="flex flex-col gap-6 min-w-[280px]">
          <div className={`flex items-center gap-3 border-b-4 ${isGreen ? 'border-green-600' : 'border-blue-600'} pb-3`}>
              <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center ${accentColor} shadow-sm border ${borderColor}`}>
                  <i className={`fas ${iconMap[title] || 'fa-newspaper'} text-lg`}></i>
              </div>
              <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">
                      {title}
                  </h3>
              </div>
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
                                  const safeFallback = CATEGORY_FALLBACKS[title] || TRANSPARENT_PIXEL;
                                  if (e.currentTarget.src === safeFallback) {
                                      e.currentTarget.src = TRANSPARENT_PIXEL;
                                  } else {
                                      e.currentTarget.src = safeFallback;
                                  }
                              }}
                          />
                          <span className={`absolute top-2 left-2 ${badgeBg} ${badgeText} text-[8px] font-black uppercase px-2 py-1 rounded-md tracking-widest z-10`}>
                              {item.sourceName}
                          </span>
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                          <h4 className="text-sm font-bold text-gray-900 leading-snug line-clamp-3 group-hover:text-black transition-colors mb-2">
                              {item.title}
                          </h4>
                          <div className="flex items-center justify-end">
                              <i className={`fas fa-external-link-alt text-[10px] text-gray-300 group-hover:${accentColor} transition-colors`}></i>
                          </div>
                      </div>
                  </a>
              )) : (
                  [1,2,3].map(i => (
                      <div key={i} className="h-48 bg-gray-50 rounded-2xl animate-pulse"></div>
                  ))
              )}
          </div>
      </div>
    );
};

const Home: React.FC<HomeProps & { adConfig?: AdPricingConfig }> = ({ 
  news, 
  advertisers, 
  user, 
  onNewsClick, 
  onAdvertiserClick, 
  onAdminClick, 
  onPricingClick, 
  onJobsClick, 
  adConfig, 
  externalCategories = {} 
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredNews = useMemo(() => {
    let list = news.filter(n => n.status === 'published' && n.source === 'site');
    if (selectedCategory !== 'all') list = list.filter(n => n.category === selectedCategory);
    
    return [...list].sort((a, b) => {
      const pA = a.featuredPriority || 0;
      const pB = b.featuredPriority || 0;
      if (pB !== pA) return pB - pA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [news, selectedCategory]);

  const breakingNewsItem = useMemo(() => {
    return news.find(n => n.isBreaking && n.status === 'published');
  }, [news]);

  const verticalHighlights = useMemo(() => {
      const cats = ['Polícia', 'Agro', 'Política', 'Esporte'];
      return cats.map(cat => {
          return news.find(n => n.category === cat && n.status === 'published' && n.source === 'site');
      }).filter(Boolean) as NewsItem[];
  }, [news]);

  const handleCategorySelect = (id: string) => {
    if (id === 'jobs_view_trigger') {
      onJobsClick();
    } else {
      setSelectedCategory(id);
    }
  };

  const effectiveConfig = adConfig || {
      plans: [{ id: 'master', name: 'Master', prices: { daily: 0, weekly: 0, monthly: 0, quarterly: 0, semiannual: 0, yearly: 0 }, features: { placements: ['master_carousel'], allowedSocialNetworks: [], canCreateJobs: true, hasInternalPage: true, maxProducts: 0, socialVideoAd: true } }],
      active: true,
      promoText: ''
  };

  const displayOrder = ['Política', 'Agronegócio', 'Tecnologia', 'Economia', 'Mundo'];

  return (
    <div className="w-full">
      <CategoryMenu selectedCategory={selectedCategory} onSelectCategory={handleCategorySelect} onAdminClick={onAdminClick} user={user} />
      
      {/* ALERTA DE PLANTÃO NO TOPO DA HOME */}
      {breakingNewsItem && (
          <div onClick={() => onNewsClick(breakingNewsItem)} className="bg-red-600 text-white cursor-pointer overflow-hidden relative group">
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="max-w-[1500px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span className="text-[10px] font-[1000] uppercase tracking-widest italic">Plantão Urgente</span>
                  </div>
                  <p className="flex-1 text-xs md:text-sm font-black uppercase italic tracking-tight truncate">
                      {breakingNewsItem.title}
                  </p>
                  <span className="text-[9px] font-black uppercase bg-white text-red-600 px-3 py-1 rounded-full hidden sm:block">Acompanhar Agora</span>
                  <i className="fas fa-arrow-right text-xs"></i>
              </div>
          </div>
      )}

      <AdBanner advertisers={advertisers} adConfig={effectiveConfig} onAdvertiserClick={onAdvertiserClick} onPlanRequest={onPricingClick} />
      <FullWidthPromo />
      
      <div className="w-full px-4 md:px-12">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 mb-8 md:mb-12 mt-4 md:mt-16 animate-fadeIn">
          <h2 className="text-4xl md:text-7xl lg:text-8xl font-[1000] uppercase tracking-tighter text-black leading-none">NOTÍCIAS</h2>
          <div className="bg-red-600 px-6 md:px-10 py-2 md:py-4 skew-x-[-15deg] shadow-[0_10px_30px_rgba(220,38,38,0.3)] inline-block w-fit">
            <span className="text-white font-black text-2xl md:text-5xl lg:text-6xl italic skew-x-[15deg] tracking-tighter whitespace-nowrap block leading-none">DO MOMENTO</span>
          </div>
        </div>
        
        <section className="mb-12 md:mb-20 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 auto-rows-fr">
             {filteredNews.length > 0 ? (
                filteredNews.slice(0, 4).map((item) => (
                    <NewsCard key={item.id} news={item} featured onClick={onNewsClick} />
                ))
             ) : (
                <div className="col-span-full py-20 px-8 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center animate-fadeInUp">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl">
                        <i className="fas fa-satellite-dish text-4xl text-red-600 animate-pulse"></i>
                    </div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900 mb-2">Conexão Estabelecida</h3>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs max-w-md leading-relaxed">O banco de dados está online, mas ainda não há publicações cadastradas.</p>
                </div>
             )}
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
             <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-2">
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-black">Giro nas <span className="text-red-600">Editorias</span></h3>
                <i className="fas fa-layer-group text-gray-300"></i>
             </div>
             <div className="flex flex-col gap-4">
                {verticalHighlights.length > 0 ? verticalHighlights.map((item) => (
                   <div key={`vertical-${item.id}`} onClick={() => onNewsClick(item)} className="group bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-xl hover:border-red-100 transition-all cursor-pointer flex gap-4 items-center h-28">
                      <div className="w-24 h-full flex-shrink-0 rounded-xl overflow-hidden relative">
                         <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                         {item.mediaType === 'video' && <div className="absolute inset-0 flex items-center justify-center bg-black/20"><i className="fas fa-play text-white text-[10px]"></i></div>}
                      </div>
                      <div className="flex-1 flex flex-col justify-center h-full py-1">
                         <span className="text-[9px] font-black uppercase text-red-600 tracking-widest mb-1">{item.category}</span>
                         <h4 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-red-600 transition-colors">{item.title}</h4>
                         <span className="text-[8px] font-bold text-gray-400 uppercase mt-auto pt-1">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                   </div>
                )) : (
                    <div className="py-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest">Sem destaques verticais</p>
                    </div>
                )}
                <button onClick={() => handleCategorySelect('all')} className="w-full py-4 bg-gray-50 text-gray-400 font-bold uppercase text-[10px] tracking-widest rounded-2xl hover:bg-black hover:text-white transition-all mt-2">Ver Todo o Arquivo</button>
             </div>
          </div>
        </section>

        <section className="w-full mb-20 bg-gray-50 rounded-[3rem] p-6 md:p-12 border border-gray-100">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-2 h-12 bg-black"></div>
                <div>
                    <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">Giro <span className="text-red-600">Brasil & Mundo</span></h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Atualização contínua por editoria</p>
                </div>
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
