/**
 * SEO Optimization Service
 * Analyzes content and generates optimized SEO metadata
 */

import { NewsItem } from '@/types/news';

export interface SEOIssue {
    severity: 'error' | 'warning' | 'info';
    field: string;
    message: string;
    suggestion?: string;
}

export interface OpenGraphTags {
    title: string;
    description: string;
    image: string;
    url: string;
    type: 'article';
    siteName: string;
    locale: string;
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
}

export interface TwitterCardTags {
    card: 'summary_large_image' | 'summary';
    title: string;
    description: string;
    image: string;
    site?: string;
    creator?: string;
}

export interface NewsArticleSchema {
    '@context': 'https://schema.org';
    '@type': 'NewsArticle';
    headline: string;
    image: string[];
    datePublished: string;
    dateModified: string;
    author: {
        '@type': 'Person';
        name: string;
    };
    publisher: {
        '@type': 'Organization';
        name: string;
        logo: {
            '@type': 'ImageObject';
            url: string;
        };
    };
    description: string;
    articleBody: string;
    articleSection?: string;
    keywords?: string;
}

export interface SEOMetadata {
    title: string;
    description: string;
    keywords: string[];
    ogTags: OpenGraphTags;
    twitterTags: TwitterCardTags;
    structuredData: NewsArticleSchema;
    canonicalUrl: string;
}

export interface SEOAnalysis {
    score: number; // 0-100
    issues: SEOIssue[];
    suggestions: string[];
    optimizedMetadata: SEOMetadata;
}

/**
 * Analyze content for SEO issues
 */
export function analyzeSEO(news: NewsItem, canonicalUrl: string): SEOAnalysis {
    const issues: SEOIssue[] = [];
    const suggestions: string[] = [];

    // Title validation
    if (!news.title || news.title.length < 10) {
        issues.push({
            severity: 'error',
            field: 'title',
            message: 'Título muito curto',
            suggestion: 'Use pelo menos 10 caracteres no título'
        });
    } else if (news.title.length > 60) {
        issues.push({
            severity: 'warning',
            field: 'title',
            message: 'Título muito longo para SEO',
            suggestion: 'Mantenha o título entre 50-60 caracteres para melhor exibição nos resultados de busca'
        });
    }

    // Lead (summary) validation
    if (!news.lead || news.lead.length < 50) {
        issues.push({
            severity: 'error',
            field: 'lead',
            message: 'Resumo muito curto',
            suggestion: 'Use pelo menos 50 caracteres no resumo'
        });
    } else if (news.lead.length > 160) {
        issues.push({
            severity: 'warning',
            field: 'lead',
            message: 'Resumo muito longo',
            suggestion: 'Mantenha o resumo entre 150-160 caracteres para melhor exibição'
        });
    }

    // Image validation
    if (!news.imageUrl) {
        issues.push({
            severity: 'warning',
            field: 'imageUrl',
            message: 'Imagem de destaque não definida',
            suggestion: 'Adicione uma imagem de destaque para melhor compartilhamento em redes sociais'
        });
    }

    // Content validation
    const contentLength = news.content?.length || 0;
    if (contentLength < 300) {
        issues.push({
            severity: 'warning',
            field: 'content',
            message: 'Conteúdo muito curto',
            suggestion: 'Artigos com pelo menos 300 palavras tendem a ter melhor ranking'
        });
    }

    // Category validation
    if (!news.category) {
        issues.push({
            severity: 'info',
            field: 'category',
            message: 'Categoria não definida',
            suggestion: 'Defina uma categoria para melhor organização'
        });
    }

    // Generate suggestions
    if (issues.length === 0) {
        suggestions.push('✓ Conteúdo bem otimizado para SEO!');
    }

    if (!news.tags || news.tags.length === 0) {
        suggestions.push('Adicione tags relevantes para melhorar a descoberta do conteúdo');
    }

    // Calculate SEO score
    const score = calculateSEOScore(news, issues);

    // Generate optimized metadata
    const optimizedMetadata = generateSEOMetadata(news, canonicalUrl);

    return {
        score,
        issues,
        suggestions,
        optimizedMetadata
    };
}

/**
 * Calculate SEO score (0-100)
 */
function calculateSEOScore(news: NewsItem, issues: SEOIssue[]): number {
    let score = 100;

    // Deduct points for issues
    issues.forEach(issue => {
        if (issue.severity === 'error') score -= 20;
        else if (issue.severity === 'warning') score -= 10;
        else if (issue.severity === 'info') score -= 5;
    });

    // Bonus points for good practices
    if (news.title && news.title.length >= 50 && news.title.length <= 60) score += 5;
    if (news.lead && news.lead.length >= 150 && news.lead.length <= 160) score += 5;
    if (news.imageUrl) score += 5;
    if (news.tags && news.tags.length >= 3) score += 5;
    if (news.content && news.content.length >= 500) score += 5;

    return Math.max(0, Math.min(100, score));
}

/**
 * Generate optimized SEO metadata
 */
export function generateSEOMetadata(news: NewsItem, canonicalUrl: string): SEOMetadata {
    const siteName = 'Lagoa Formosa No Momento';
    const baseUrl = 'https://lagoaformosanomomento.com.br';
    const logoUrl = `${baseUrl}/logo.png`;

    // Optimize title (max 60 chars)
    const seoTitle = news.title.length > 60
        ? `${news.title.substring(0, 57)}...`
        : news.title;

    // Optimize description (max 160 chars)
    const seoDescription = news.lead && news.lead.length > 160
        ? `${news.lead.substring(0, 157)}...`
        : (news.lead || news.title);

    // Extract keywords
    const keywords = extractKeywords(news);

    // Open Graph tags
    const ogTags: OpenGraphTags = {
        title: seoTitle,
        description: seoDescription,
        image: news.imageUrl || `${baseUrl}/default-og-image.jpg`,
        url: canonicalUrl,
        type: 'article',
        siteName,
        locale: 'pt_BR',
        publishedTime: news.createdAt,
        modifiedTime: news.updatedAt,
        author: news.author,
        section: news.category,
        tags: news.tags
    };

    // Twitter Card tags
    const twitterTags: TwitterCardTags = {
        card: 'summary_large_image',
        title: seoTitle,
        description: seoDescription,
        image: news.imageUrl || `${baseUrl}/default-twitter-image.jpg`,
        site: '@lfnm',
        creator: '@lfnm'
    };

    // Structured data (Schema.org NewsArticle)
    const structuredData: NewsArticleSchema = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: seoTitle,
        image: news.imageUrl ? [news.imageUrl] : [],
        datePublished: news.createdAt || new Date().toISOString(),
        dateModified: news.updatedAt || news.createdAt || new Date().toISOString(),
        author: {
            '@type': 'Person',
            name: news.author || 'Redação LFNM'
        },
        publisher: {
            '@type': 'Organization',
            name: siteName,
            logo: {
                '@type': 'ImageObject',
                url: logoUrl
            }
        },
        description: seoDescription,
        articleBody: stripHtml(news.content || ''),
        articleSection: news.category,
        keywords: keywords.join(', ')
    };

    return {
        title: seoTitle,
        description: seoDescription,
        keywords,
        ogTags,
        twitterTags,
        structuredData,
        canonicalUrl
    };
}

/**
 * Extract keywords from news content
 */
function extractKeywords(news: NewsItem): string[] {
    const keywords: string[] = [];

    // Add tags
    if (news.tags) {
        keywords.push(...news.tags);
    }

    // Add city
    if (news.city) {
        keywords.push(news.city.toLowerCase());
    }

    // Add category
    if (news.category) {
        keywords.push(news.category.toLowerCase());
    }

    // Add common keywords
    keywords.push('lagoa formosa', 'noticias', 'lfnm');

    // Remove duplicates and limit to 10
    return [...new Set(keywords)].slice(0, 10);
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Optimize content for SEO
 */
export async function optimizeSEO(news: NewsItem, canonicalUrl: string): Promise<SEOMetadata> {
    return generateSEOMetadata(news, canonicalUrl);
}
