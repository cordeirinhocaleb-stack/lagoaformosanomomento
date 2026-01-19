import { useMemo } from 'react';
import { NewsItem, User } from '@/types';
import { RegionFilterType } from '@/components/layout/CategoryMenu';

interface UseHomeNewsParams {
    news: NewsItem[];
    externalCategories: Record<string, any[]>;
    user: User | null;
    selectedRegion: RegionFilterType;
    selectedCategory: string;
}

export const useHomeNews = ({
    news,
    externalCategories,
    user,
    selectedRegion,
    selectedCategory
}: UseHomeNewsParams) => {

    const allMixedNews = useMemo(() => {
        const convertedExternalNews: NewsItem[] = [];

        Object.entries(externalCategories).forEach(([catKey, items]) => {
            if (Array.isArray(items)) {
                items.forEach((item: any, idx: number) => {
                    let normalizedCategory = catKey;
                    if (catKey === 'Agronegócio') { normalizedCategory = 'Agro'; }
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
                        imageUrl: item.imageUrl || item.image_url,
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

        return [...news, ...convertedExternalNews];
    }, [news, externalCategories]);

    const filteredNews = useMemo(() => {
        let list = allMixedNews;

        const isAdmin = user && user.role !== 'Leitor';
        if (!isAdmin) {
            list = list.filter(n => n.status === 'published');
        }

        if (selectedRegion === 'Lagoa Formosa') {
            list = list.filter(n =>
                (!n.city || n.city === 'Lagoa Formosa' || n.region === 'Lagoa Formosa')
            );
        } else if (selectedRegion === 'Patos e Região') {
            list = list.filter(n => n.city === 'Patos de Minas' || n.region === 'Região' || n.region === 'Alto Paranaíba');
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

        return [...list].sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

            if (dateB === dateA) {
                const priorityA = a.featuredPriority || 0;
                const priorityB = b.featuredPriority || 0;
                return priorityB - priorityA;
            }

            return dateB - dateA;
        });
    }, [allMixedNews, selectedCategory, selectedRegion, user]);

    return {
        filteredNews,
        allMixedNews
    };
};
