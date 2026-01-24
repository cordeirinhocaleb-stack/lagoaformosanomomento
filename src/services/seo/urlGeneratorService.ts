/**
 * URL Generator Service
 * Generates SEO-friendly URLs in the format: [title]-[date]-[city]-[filter]
 */

import { NewsItem } from '@/types/news';

/**
 * Slugify text - converts to lowercase, removes accents and special characters
 */
export function slugify(text: string): string {
    if (!text) return '';

    return text
        .toLowerCase()
        .normalize('NFD') // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
        .substring(0, 100); // Limit length
}

/**
 * Format date for URL (YYYY-MM-DD)
 */
export function formatDateForUrl(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Generate SEO-friendly URL for news article
 * Format: [title]-[date]-[city]-[filter]
 * Example: prefeitura-anuncia-obras-2026-01-21-lagoa-formosa-politica
 */
export function generateNewsUrl(news: Partial<NewsItem>): string {
    const titleSlug = slugify(news.title || 'noticia');
    // NewsItem uses createdAt/updatedAt, not publishedAt
    const dateSlug = formatDateForUrl(news.createdAt || new Date());
    const citySlug = slugify(news.city || 'lagoa-formosa');
    // NewsItem uses category, not filter
    const filterSlug = slugify(news.category || 'geral');

    return `${titleSlug}-${dateSlug}-${citySlug}-${filterSlug}`;
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(slug: string, baseUrl: string = 'https://lagoaformosanomomento.com.br'): string {
    return `${baseUrl}/noticias/${slug}`;
}

/**
 * Extract slug from URL
 */
export function extractSlugFromUrl(url: string): string | null {
    const match = url.match(/\/noticias\/([^/?#]+)/);
    return match ? match[1] : null;
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
    // Should only contain lowercase letters, numbers, and hyphens
    return /^[a-z0-9-]+$/.test(slug);
}

/**
 * Generate unique slug by appending number if needed
 */
export async function generateUniqueSlug(
    baseSlug: string,
    checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (await checkExists(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
}
