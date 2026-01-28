
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { NewsItem, Advertiser, User, AdPricingConfig } from '@/types';
import { CATEGORY_IMAGES } from '../../services/geminiService';

// Componentes da Home (Modulares)
import CategoryMenu, { RegionFilterType } from '@/components/layout/CategoryMenu';
import BreakingNewsBar from '@/components/home/BreakingNewsBar';
import HeroSection from '@/components/home/HeroSection';
import MainNewsGrid from '@/components/home/MainNewsGrid';
import WorldNewsGrid from '@/components/home/WorldNewsGrid';
import LazyBlock from '@/components/common/LazyBlock';
import DailyBread from '@/components/news/DailyBread';
import PartnersStrip from '@/components/home/PartnersStrip';
import InstagramFeed from '@/components/home/InstagramFeed';
import DebugOverlay from '@/components/common/DebugOverlay';
// PromoPopup removido da importação e uso

interface HomeProps {
    news: NewsItem[];
    advertisers: Advertiser[];
    user: User | null;
    onNewsClick: (item: NewsItem) => void;
    onAdvertiserClick: (adOrId: Advertiser | string) => void;
    onAdvertiserView: (adId: string) => void;
    onAdminClick: () => void;
    onPricingClick: () => void;
    onJobsClick: () => void;
    externalCategories?: Record<string, any[]>;
    adConfig?: AdPricingConfig;

    // Props de Filtros vindas do App
    selectedCategory: string;
    onSelectCategory: (id: string) => void;
    selectedRegion: RegionFilterType;
    onSelectRegion: (region: RegionFilterType) => void;

    contractBanners?: any[];

    // Controle de Scroll vindo do App
    shouldScrollToGrid?: boolean;
    onScrollConsumed?: () => void;
}

const Home: React.FC<HomeProps> = ({
    news, advertisers, user, onNewsClick, onAdvertiserClick, onAdvertiserView, onAdminClick, onPricingClick, onJobsClick, adConfig, externalCategories = {},
    selectedCategory, onSelectCategory, selectedRegion, onSelectRegion, shouldScrollToGrid, onScrollConsumed,
    contractBanners
}) => {
    const newsGridRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(18); // Default Desktop

    // --- LÓGICA DE PAGINAÇÃO RESPONSIVA ---
    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            if (w < 768) {
                setItemsPerPage(8); // Mobile
            } else if (w < 1280) {
                setItemsPerPage(12); // Tablet / Laptop Pequeno
            } else {
                setItemsPerPage(18); // Desktop Grande
            }
        };

        // Executa na montagem
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Reset de página ao mudar filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, selectedRegion]);

    // Efeito para rolar até as notícias quando solicitado
    useEffect(() => {
        if (shouldScrollToGrid && newsGridRef.current) {
            const timer = setTimeout(() => {
                newsGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                if (onScrollConsumed) { onScrollConsumed(); }
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [shouldScrollToGrid, onScrollConsumed]);

    // --- 1. UNIFICAÇÃO DE FONTES DE NOTÍCIAS ---
    const allMixedNews = useMemo(() => {
        const convertedExternalNews: NewsItem[] = [];
        const seenTitles = new Set<string>();

        // 1. Processar Notícias do Banco (news) primeiro
        const processedInternalNews = news.map(n => {
            const titleNormalized = n.title.trim().toLowerCase();
            seenTitles.add(titleNormalized);

            // Fallback de imagem para internos que sejam puxados e estejam sem imagem
            if (!n.imageUrl && ((n as any).image_url === null || !(n as any).image_url)) {
                return {
                    ...n,
                    imageUrl: CATEGORY_IMAGES[n.category] || CATEGORY_IMAGES['Geral']
                };
            }
            return n;
        });

        // 2. Processar Notícias Externas (puxadas agora)
        Object.entries(externalCategories || {}).forEach(([catKey, items]) => {
            if (Array.isArray(items)) {
                items.forEach((item: any, idx: number) => {
                    const titleNormalized = (item.title || '').trim().toLowerCase();
                    if (seenTitles.has(titleNormalized)) return; // Evita duplicação
                    seenTitles.add(titleNormalized);

                    let normalizedCategory = catKey;
                    if (catKey === 'Agronegócio' || catKey === 'Agro') { normalizedCategory = 'Agro'; }
                    if (catKey === 'Cultura' || catKey === 'Pop & Arte') { normalizedCategory = 'Cultura'; }
                    if (catKey === 'Cotidiano') { normalizedCategory = 'Cotidiano'; }

                    const titleStr = item.title || 'SemTitulo';
                    const safeTitle = titleStr.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '');

                    convertedExternalNews.push({
                        id: `ext_${catKey}_${idx}_${safeTitle}`,
                        title: item.title || 'Nova Notícia',
                        lead: item.title || 'Conteúdo externo',
                        category: normalizedCategory,
                        author: item.sourceName || 'Agência Externa',
                        authorId: 'rss_bot',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        status: 'published',
                        imageUrl: item.imageUrl || item.image_url || CATEGORY_IMAGES[catKey] || CATEGORY_IMAGES['Geral'],
                        bannerMediaType: 'image',
                        mediaType: 'image',
                        isBreaking: false,
                        isFeatured: false,
                        featuredPriority: 0,
                        source: 'rss_automation',
                        city: catKey === 'Mundo' ? 'Mundo' : 'Brasil',
                        region: catKey === 'Mundo' ? 'Global' : 'Brasil',
                        seo: {
                            slug: '',
                            metaTitle: item.title || '',
                            metaDescription: '',
                            focusKeyword: '',
                            canonicalUrl: item.sourceUrl
                        },
                        imageCredits: item.sourceName,
                        blocks: [],
                        content: '',
                        views: 0,
                        bannerImages: []
                    } as NewsItem);
                });
            }
        });

        return [...processedInternalNews, ...convertedExternalNews];
    }, [news, externalCategories]);

    // Filtragem de Anunciantes do Topo (Mantém ordem estável para evitar saltos no carrossel)
    const topAds = useMemo(() => {
        return advertisers
            .filter(ad => !ad.displayLocations || ad.displayLocations.includes('home_top'))
            .filter(ad => ad.isActive);
    }, [advertisers]);

    // --- 2. LÓGICA DE FILTRAGEM UNIFICADA ---
    const filteredNews = useMemo(() => {
        let list = allMixedNews;

        // VISIBILIDADE: Apenas Admins veem rascunhos. Público vê apenas 'published'.
        const isAdmin = user && user.role !== 'Leitor';
        if (!isAdmin) {
            list = list.filter(n => n.status === 'published');
        }

        if (selectedRegion === 'Lagoa Formosa e Região') {
            list = list.filter(n =>
                !n.city ||
                n.city === 'Lagoa Formosa' ||
                n.region === 'Lagoa Formosa' ||
                n.city === 'Patos de Minas' ||
                n.region === 'Região' ||
                n.region === 'Alto Paranaíba'
            );
        } else if (selectedRegion === 'Brasil') {
            list = list.filter(n =>
                n.region === 'Brasil' ||
                ['Política', 'Agro', 'Agronegócio', 'Economia', 'Esporte', 'Cotidiano', 'Cultura'].includes(n.category)
            );
        } else if (selectedRegion === 'Mundo') {
            list = list.filter(n =>
                n.region === 'Global' ||
                n.city === 'Mundo' ||
                ['Mundo', 'Tecnologia', 'Internacional'].includes(n.category)
            );
        }

        if (selectedCategory !== 'all') {
            list = list.filter(n => {
                if (selectedCategory === 'Agro' && (n.category === 'Agro' || n.category === 'Agronegócio')) { return true; }
                return n.category === selectedCategory;
            });
        }

        // Ordenação: Estritamente Cronológica (Mais Recente Primeiro)
        return [...list].sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

            // Se as datas forem idênticas (raro), usa prioridade como desempate
            if (dateB === dateA) {
                const priorityA = a.featuredPriority || 0;
                const priorityB = b.featuredPriority || 0;
                return priorityB - priorityA;
            }

            return dateB - dateA;
        });
    }, [allMixedNews, selectedCategory, selectedRegion, user]);

    // --- 3. LÓGICA DE PAGINAÇÃO E RECORTE ---
    const totalPages = Math.max(1, Math.ceil(filteredNews.length / itemsPerPage));

    // Efeito de segurança: Se o resize reduzir as páginas e o usuário estiver na pag 5 de 3, volta para a 3.
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [itemsPerPage, totalPages, currentPage]);

    const paginatedNews = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredNews.slice(start, end);
    }, [filteredNews, currentPage, itemsPerPage]);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) { return; }
        setCurrentPage(page);
        // Rola suavemente para o topo da lista de notícias
        if (newsGridRef.current) {
            // Pequeno offset para não colar no topo
            const y = newsGridRef.current.getBoundingClientRect().top + window.pageYOffset - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const handleSmartClick = (item: NewsItem) => {
        if (item.source === 'rss_automation' && item.seo?.canonicalUrl) {
            window.open(item.seo.canonicalUrl, '_blank');
        } else {
            onNewsClick(item);
        }
    };

    const breakingNewsItem = useMemo(() => {
        return news.find(n => n.isBreaking && n.status === 'published');
    }, [news]);

    const verticalHighlights = useMemo(() => {
        const cats = ['Polícia', 'Agro', 'Política', 'Esporte'];
        return cats.map(cat =>
            filteredNews.find(n => n.category === cat || (cat === 'Agro' && n.category === 'Agronegócio'))
        ).filter(Boolean) as NewsItem[];
    }, [filteredNews]);

    const handleCategoryClick = (id: string) => {
        if (id === 'jobs_view_trigger') {
            onJobsClick();
        } else {
            onSelectCategory(id);
        }
    };

    const handleRegionClick = (region: RegionFilterType) => {
        onSelectRegion(region);
    };

    // Normalização de categorias para o Grid "Giro Mundo"
    const normalizedExternalCategories = useMemo(() => {
        const normalized: Record<string, any[]> = {};
        Object.entries(externalCategories || {}).forEach(([cat, items]) => {
            let key = cat;
            if (cat === 'Agronegócio') key = 'Agro';
            if (cat === 'Pop & Arte' || cat === 'Cultura') key = 'Cultura';

            if (!normalized[key]) normalized[key] = [];
            normalized[key] = [...normalized[key], ...items];
        });
        return normalized;
    }, [externalCategories]);

    return (
        <div className="w-full">

            {/* 1. Barra de Plantão */}
            <BreakingNewsBar item={breakingNewsItem} onClick={handleSmartClick} />

            {/* Parceiros Comerciais (Design Master) */}
            <PartnersStrip
                advertisers={topAds}
                onAdvertiserClick={onAdvertiserClick}
                onAdvertiserView={onAdvertiserView}
                onPricingClick={onPricingClick}
            />

            {/* 2. Hero Section (Contém FullWidthPromo e título da seção) */}
            <HeroSection
                advertisers={advertisers}
                adConfig={adConfig}
                contractBanners={contractBanners}
                onAdvertiserClick={onAdvertiserClick}
                onAdvertiserView={onAdvertiserView}
                onPlanRequest={onPricingClick}
            />

            {/* 3. Menu de Categorias */}
            <div ref={newsGridRef} className="w-full relative z-10">
                <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8">
                    <CategoryMenu
                        selectedCategory={selectedCategory}
                        onSelectCategory={handleCategoryClick}
                        onAdminClick={onAdminClick}
                        user={user}
                        selectedRegion={selectedRegion}
                        onSelectRegion={handleRegionClick}
                    />
                </div>
            </div>

            {/* 4. Grid Principal */}
            <div className="w-full relative z-20 mt-6 md:mt-8 w-full max-w-[1920px] mx-auto px-4 md:px-8">
                <LazyBlock threshold={0.1} minHeight="800px">
                    <MainNewsGrid
                        news={paginatedNews} // Usa a lista paginada (8, 12 ou 18)
                        highlights={verticalHighlights}
                        onNewsClick={handleSmartClick}
                    />

                    {/* PAGINATION CONTROLS */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-12 mb-8 animate-fadeIn">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:border-black transition-all disabled:opacity-30 disabled:hover:border-gray-200 active:scale-95"
                            >
                                <i className="fas fa-chevron-left text-xs"></i>
                            </button>

                            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-1 max-w-[280px] md:max-w-none">
                                {Array.from({ length: totalPages }).map((_, i) => {
                                    const page = i + 1;
                                    const isActive = page === currentPage;
                                    // Lógica simples: mostra todos se poucos, ou janela deslizante
                                    // Para simplicidade visual neste design, mostramos todos com scroll horizontal no mobile
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`
                                          w-10 h-10 rounded-full text-[10px] font-black uppercase tracking-tight flex items-center justify-center transition-all shrink-0
                                          ${isActive
                                                    ? 'bg-black text-white shadow-lg scale-110'
                                                    : 'bg-white border border-gray-200 text-gray-500 hover:border-red-500 hover:text-red-500'
                                                }
                                      `}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:border-black transition-all disabled:opacity-30 disabled:hover:border-gray-200 active:scale-95"
                            >
                                <i className="fas fa-chevron-right text-xs"></i>
                            </button>
                        </div>
                    )}
                </LazyBlock>
            </div>

            {/* 5. Instagram Feed */}
            <InstagramFeed />

            {/* 6. Giro Rápido */}
            <LazyBlock threshold={0.1} minHeight="600px">
                <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8">
                    <WorldNewsGrid
                        externalCategories={normalizedExternalCategories}
                        selectedCategory={selectedCategory}
                    />
                </div>
            </LazyBlock>

            {/* 6. Pão Diário */}
            <div className="mt-8 md:mt-16 w-full max-w-[1920px] mx-auto px-4 md:px-8">
                <DailyBread />
            </div>

        </div>
    );
};

export default Home;
