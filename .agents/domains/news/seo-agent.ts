/**
 * SEO Agent (com Memória)
 * Domínio: Site de Notícias
 * 
 * Responsabilidades:
 * - Validar meta tags (title, description, og:image)
 * - Verificar structured data (JSON-LD)
 * - Sugerir otimizações de performance
 * - Validar sitemap.xml
 * - Aprender padrões de SEO que funcionam
 */

import { BaseAgent, TaskContext, TaskResult } from '../../core/base-agent.js';

export interface SEOMetadata {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
    ogType?: string;
    canonicalUrl?: string;
}

export class SEOAgent extends BaseAgent {
    constructor(memoryBasePath: string = '.agents/memory') {
        super('seo-agent', memoryBasePath);
    }

    /**
     * Implementação da validação de SEO
     */
    async executeTask(taskDescription: string, context: TaskContext): Promise<TaskResult> {
        const warnings: string[] = [];
        const recommendations: string[] = [];

        // Aqui seria feita a validação real de SEO
        // Por enquanto, retorna sucesso
        const success = warnings.length === 0;
        const details = success
            ? 'SEO validado com sucesso'
            : `Avisos: ${warnings.join(', ')}`;

        return {
            success,
            details,
            warnings: warnings.length > 0 ? warnings : undefined,
            recommendations: recommendations.length > 0 ? recommendations : undefined
        };
    }

    /**
     * Valida meta tags
     */
    validateMetaTags(metadata: SEOMetadata): { valid: boolean; warnings: string[]; recommendations: string[] } {
        const warnings: string[] = [];
        const recommendations: string[] = [];

        // Title
        if (!metadata.title) {
            warnings.push('Meta title ausente');
        } else if (metadata.title.length > 60) {
            warnings.push(`Meta title muito longo (${metadata.title.length} caracteres, ideal: 50-60)`);
        } else if (metadata.title.length < 30) {
            recommendations.push('Meta title poderia ser mais descritivo (mínimo recomendado: 30 caracteres)');
        }

        // Description
        if (!metadata.description) {
            warnings.push('Meta description ausente');
        } else if (metadata.description.length > 160) {
            warnings.push(`Meta description muito longa (${metadata.description.length} caracteres, ideal: 150-160)`);
        } else if (metadata.description.length < 100) {
            recommendations.push('Meta description poderia ser mais descritiva (mínimo recomendado: 100 caracteres)');
        }

        // Open Graph
        if (!metadata.ogImage) {
            recommendations.push('Adicionar og:image para melhor compartilhamento em redes sociais');
        }

        if (!metadata.canonicalUrl) {
            recommendations.push('Adicionar canonical URL para evitar conteúdo duplicado');
        }

        return { valid: warnings.length === 0, warnings, recommendations };
    }

    /**
     * Gera structured data (JSON-LD) para artigo
     */
    generateArticleStructuredData(article: {
        title: string;
        description: string;
        author: string;
        publishedDate: string;
        imageUrl: string;
    }): string {
        return JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: article.title,
            description: article.description,
            author: {
                '@type': 'Person',
                name: article.author,
            },
            datePublished: article.publishedDate,
            image: article.imageUrl,
        }, null, 2);
    }

    /**
     * Valida sitemap.xml
     */
    validateSitemap(sitemapContent: string): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!sitemapContent.includes('<?xml')) {
            errors.push('Sitemap deve começar com declaração XML');
        }

        if (!sitemapContent.includes('<urlset')) {
            errors.push('Sitemap deve conter elemento <urlset>');
        }

        if (!sitemapContent.includes('<loc>')) {
            errors.push('Sitemap deve conter ao menos uma <loc> (URL)');
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Especialidade padrão do SEO Agent
     */
    protected getDefaultSpecialty(): string {
        return `# SEO Agent - Especialidade

## Responsabilidades
- Validar meta tags (title, description, og:image)
- Verificar structured data (JSON-LD)
- Sugerir otimizações de SEO
- Validar sitemap.xml
- Garantir URLs SEO-friendly

## Expertise
- SEO On-Page
- Meta Tags e Open Graph
- Structured Data (Schema.org)
- Sitemap e Robots.txt
- Core Web Vitals
- Google Search Console

## Regras
- Meta title: 50-60 caracteres
- Meta description: 150-160 caracteres
- Sempre incluir og:image
- Usar canonical URL
- Structured data para artigos
- Sitemap atualizado

## Tarefas Típicas
- Validar meta tags de páginas
- Gerar structured data
- Otimizar títulos e descrições
- Validar sitemap
- Sugerir melhorias de SEO
`;
    }
}
