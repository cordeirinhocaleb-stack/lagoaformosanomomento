
import React, { useState, useMemo, useEffect } from 'react';
import { NewsItem, Advertiser, ContentBlock } from '../types';
import Logo from '../components/common/Logo';
import EngagementRenderer from '../components/news/EngagementRenderer';
import GalleryRenderer from '../components/news/GalleryRenderer';

interface NewsDetailProps {
  news: NewsItem;
  onBack: () => void;
  advertisers?: Advertiser[];
  onAdvertiserClick?: (ad: Advertiser) => void;
}

const getWidthClass = (width: string) => {
    switch(width) {
        case '1/2': return 'w-full md:w-1/2 px-4 mb-8';
        case '1/3': return 'w-full md:w-1/3 px-4 mb-8';
        case '1/4': return 'w-full md:w-1/4 px-4 mb-8';
        default: return 'w-full mb-8';
    }
};

const FONT_MAP: Record<string, string> = {
    sans: 'Inter, sans-serif',
    serif: 'Merriweather, serif',
    mono: 'JetBrains Mono, monospace',
    display: 'Inter, sans-serif'
};

const SIZE_MAP: Record<string, string> = {
    xs: '12px', sm: '14px', md: '18px', lg: '24px', xl: '32px', '2xl': '48px', '3xl': '64px'
};

const NewsDetail: React.FC<NewsDetailProps> = ({ news, onBack, advertisers = [], onAdvertiserClick }) => {
  const premiumSponsors = useMemo(() => {
    const now = new Date();
    return advertisers.filter(ad => ad.isActive && new Date(ad.endDate) >= now && (ad.plan === 'premium' || ad.plan === 'master')).sort(() => Math.random() - 0.5);
  }, [advertisers]);

  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  
  const bannerList = useMemo(() => {
    if (news.bannerMediaType === 'video') return [];
    if (news.isBannerAnimated && news.bannerImages && news.bannerImages.length > 0) return news.bannerImages;
    return [news.imageUrl];
  }, [news.bannerImages, news.imageUrl, news.isBannerAnimated, news.bannerMediaType]);

  useEffect(() => {
    if (news.bannerMediaType === 'image' && news.isBannerAnimated && bannerList.length > 1) {
      const timer = setInterval(() => {
        setActiveBannerIdx((prev) => (prev + 1) % bannerList.length);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [news.isBannerAnimated, bannerList, news.bannerMediaType]);

  const getYoutubeEmbed = (url: string) => {
      const id = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      return id ? `https://www.youtube.com/embed/${id[1]}?autoplay=1&mute=1&loop=1&playlist=${id[1]}&controls=0&modestbranding=1` : null;
  };

  const getBlockStyle = (settings: any): React.CSSProperties => {
    const getRadius = (r: string) => {
        switch(r) {
          case 'sm': return '0.25rem';
          case 'md': return '0.5rem';
          case 'lg': return '0.75rem';
          case 'xl': return '1.5rem';
          case '2xl': return '1.5rem';
          case '3xl': return '2rem';
          case 'full': return '9999px';
          default: return '0px';
        }
    };
    return {
        textAlign: settings?.alignment || 'left',
        color: settings?.textColor,
        backgroundColor: settings?.backgroundColor && settings?.backgroundColor !== 'transparent' ? settings.backgroundColor : undefined,
        padding: settings?.backgroundColor && settings?.backgroundColor !== 'transparent' ? '2rem' : settings?.padding,
        borderRadius: getRadius(settings?.borderRadius),
        fontFamily: FONT_MAP[settings?.fontFamily || 'sans'],
        fontSize: settings?.fontSize ? SIZE_MAP[settings?.fontSize] : undefined,
        borderStyle: settings?.borderStyle || 'none',
        borderWidth: settings?.borderWidth || '0px',
        borderColor: settings?.borderColor,
        height: '100%',
        transition: 'all 0.3s ease'
    };
  };

  const renderBlock = (block: ContentBlock) => {
    const blockStyle = getBlockStyle(block.settings);

    return (
        <div key={block.id} className={getWidthClass(block.settings.width)}>
            <div style={blockStyle}>
                {(() => {
                    switch (block.type) {
                        case 'heading':
                            return <h2 className="text-3xl md:text-5xl font-[1000] uppercase italic tracking-tighter leading-none">{block.content}</h2>;
                        case 'paragraph':
                            return <div className={`text-lg md:text-xl text-gray-700 leading-loose ${block.settings?.style === 'serif' ? 'font-serif' : 'font-sans font-medium'}`} dangerouslySetInnerHTML={{ __html: block.content }} />;
                        case 'image':
                            return (
                                <figure className="h-full">
                                    <img src={block.content} className="w-full h-full object-cover shadow-xl" alt="" style={{ borderRadius: blockStyle.borderRadius }} />
                                    {block.settings?.caption && <figcaption className="text-center text-[10px] font-bold text-gray-400 uppercase mt-4 tracking-widest">{block.settings.caption}</figcaption>}
                                </figure>
                            );
                        case 'gallery':
                            return <GalleryRenderer block={block} />;
                        case 'engagement':
                            return <EngagementRenderer block={block} newsId={news.id} />;
                        case 'quote':
                            return (
                                <blockquote className="border-l-[12px] border-red-600 bg-gray-50 p-12 h-full relative overflow-hidden">
                                    <i className="fas fa-quote-left text-red-100 text-8xl absolute top-4 left-4 opacity-50"></i>
                                    <p className="text-2xl md:text-3xl font-black italic text-gray-800 relative z-10">{block.content}</p>
                                </blockquote>
                            );
                        case 'smart_block':
                            return <div dangerouslySetInnerHTML={{ __html: block.content }} />;
                        case 'separator':
                            return <div className="py-12 flex items-center gap-6"><div className="h-0.5 flex-1 bg-gray-100"></div><Logo className="w-10 h-10 grayscale opacity-20"/><div className="h-0.5 flex-1 bg-gray-100"></div></div>;
                        case 'cta':
                            return (
                                <a href={block.content.url} target="_blank" rel="noopener noreferrer" className="block p-8 bg-zinc-900 text-white rounded-[2rem] text-center font-black uppercase text-sm tracking-[0.2em] shadow-2xl hover:bg-red-600 transition-all active:scale-95">
                                    {block.content.text} <i className="fas fa-external-link-alt ml-2 text-xs opacity-50"></i>
                                </a>
                            );
                        case 'related':
                            return (
                                <div className="p-10 border-l-[12px] border-red-600 bg-zinc-50 rounded-r-[2rem] group cursor-pointer hover:bg-zinc-100 transition-colors">
                                    <span className="text-[10px] font-black uppercase text-red-600 mb-2 block tracking-widest animate-pulse">VEJA TAMBÉM:</span>
                                    <h4 className="text-2xl font-[1000] text-zinc-900 uppercase italic tracking-tighter leading-tight group-hover:text-red-600 transition-colors">{block.content.title}</h4>
                                </div>
                            );
                        case 'table':
                            return (
                                <div className="overflow-x-auto rounded-3xl border border-zinc-100 shadow-lg">
                                    <table className="w-full border-collapse text-left">
                                        <tbody>
                                            {block.content.rows.map((row: string[], rIdx: number) => (
                                                <tr key={rIdx} className={rIdx === 0 ? 'bg-zinc-900 text-white' : 'border-b'}>
                                                    {row.map((cell, cIdx) => (
                                                        <td key={cIdx} className="p-5 text-sm font-bold uppercase tracking-tight">{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        default:
                            return null;
                    }
                })()}
            </div>
        </div>
    );
  };

  return (
    <div className="bg-white min-h-screen animate-fadeIn pb-24 font-sans overflow-x-hidden">
      <div className="relative w-full h-[50vh] md:h-[80vh] bg-black overflow-hidden">
        {news.bannerMediaType === 'video' && news.bannerVideoUrl ? (
            <div className="absolute inset-0 w-full h-full">
                <iframe src={getYoutubeEmbed(news.bannerVideoUrl) || ''} className="w-full h-full scale-110 pointer-events-none" allow="autoplay; encrypted-media; gyroscope; picture-in-picture" frameBorder="0" />
            </div>
        ) : (
            bannerList.map((url, idx) => (
                <img key={idx} src={url} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${idx === activeBannerIdx ? 'opacity-80' : 'opacity-0'}`} alt={news.title} />
            ))
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/40"></div>
        <button onClick={onBack} className="absolute top-8 left-8 bg-white/10 hover:bg-white text-white hover:text-black backdrop-blur-md w-12 h-12 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all z-[1100] border border-white/20"><i className="fas fa-arrow-left"></i></button>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-32 relative z-10">
        <div className="bg-white rounded-[3rem] p-8 md:p-20 shadow-2xl border border-gray-50">
            <header className="mb-16 text-center md:text-left">
                <span className="bg-red-600 text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.3em] shadow-xl inline-block mb-8">{news.category}</span>
                <h1 className="text-4xl md:text-7xl font-[1000] text-gray-900 tracking-tighter leading-[0.9] uppercase italic mb-8 serif">{news.title}</h1>
                <p className="text-xl md:text-3xl text-gray-500 font-medium italic leading-relaxed mb-12 border-l-8 border-red-600 pl-8 py-2">{news.lead}</p>
                <div className="flex flex-col md:flex-row items-center gap-8 py-8 border-y border-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full border-2 border-red-600 p-0.5 flex items-center justify-center overflow-hidden"><Logo className="scale-150" /></div>
                        <div className="text-left"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reportagem</p><p className="font-black text-gray-900 uppercase italic">Por {news.author}</p></div>
                    </div>
                    <div className="text-left flex-1"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Publicado em</p><p className="text-sm font-bold text-gray-700">{new Date(news.createdAt).toLocaleDateString('pt-BR', { dateStyle: 'full' })}</p></div>
                </div>
            </header>

            <article className="flex flex-wrap -mx-4">
                {news.blocks ? news.blocks.map(renderBlock) : <div className="w-full px-4 prose prose-xl max-w-none font-serif leading-loose text-gray-800" dangerouslySetInnerHTML={{ __html: news.content }} />}
            </article>

            {premiumSponsors.length > 0 && (
                <div className="mt-24 pt-16 border-t border-gray-100">
                    <h4 className="text-center text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 mb-10 flex items-center justify-center gap-4"><span className="h-px bg-gray-100 w-24"></span> PATROCÍNIO PREMIUM <span className="h-px bg-gray-100 w-24"></span></h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {premiumSponsors.map(sponsor => (
                            <div key={sponsor.id} onClick={() => onAdvertiserClick?.(sponsor)} className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-50 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-red-200 hover:shadow-2xl transition-all group">
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform overflow-hidden">{sponsor.logoUrl ? <img src={sponsor.logoUrl} className="w-full h-full object-cover" /> : <i className="fas fa-store text-gray-400"></i>}</div>
                                <span className="text-[10px] font-black uppercase text-gray-800 text-center leading-tight group-hover:text-red-600 transition-colors">{sponsor.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-20 pt-10 border-t border-gray-100 text-center">
                <button onClick={onBack} className="bg-black text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-2xl hover:shadow-red-600/30 flex items-center gap-4 mx-auto"><i className="fas fa-house-chimney"></i> Voltar ao Portal</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
