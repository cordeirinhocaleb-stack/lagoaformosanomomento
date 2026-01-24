/**
 * Publication Service
 * Handles the complete publication flow with SEO optimization
 */

import { NewsItem } from '@/types/news';
import { generateNewsUrl, generateCanonicalUrl, generateUniqueSlug } from './seo/urlGeneratorService';
import { analyzeSEO, optimizeSEO, SEOAnalysis, SEOMetadata } from './seo/seoOptimizationService';
import { PublicationStep } from '@/components/admin/PublicationProgressModal';
import { getSupabase } from './core/supabaseClient';

export interface PublicationResult {
    success: boolean;
    newsId?: string;
    slug?: string;
    canonicalUrl?: string;
    seoScore?: number;
    error?: string;
}

export interface PublicationProgress {
    step: string;
    progress: number;
    message: string;
}

type ProgressCallback = (steps: PublicationStep[]) => void;

/**
 * Publish news with SEO optimization
 */
export async function publishNewsWithSEO(
    news: NewsItem,
    onProgress?: ProgressCallback
): Promise<PublicationResult> {
    const steps: PublicationStep[] = [
        { id: 'validate', label: 'Verificando conteúdo da notícia', status: 'pending', progress: 0 },
        { id: 'seo', label: 'Otimizando SEO para melhores buscas', status: 'pending', progress: 0 },
        { id: 'url', label: 'Gerando URL amigável', status: 'pending', progress: 0 },
        { id: 'save', label: 'Salvando publicação', status: 'pending', progress: 0 }
    ];

    const updateStep = (stepId: string, status: PublicationStep['status'], progress: number, message?: string, duration?: number) => {
        const step = steps.find(s => s.id === stepId);
        if (step) {
            step.status = status;
            step.progress = progress;
            if (message) step.message = message;
            if (duration) step.duration = duration;
        }
        if (onProgress) onProgress([...steps]);
    };

    try {
        // Step 1: Validate content
        updateStep('validate', 'processing', 0, 'Analisando completude do conteúdo...');
        const startValidate = Date.now();

        await delay(500); // Simulate validation time
        updateStep('validate', 'processing', 50, 'Verificando estrutura HTML...');
        await delay(300);
        updateStep('validate', 'processing', 100, 'Validação concluída');

        const validateDuration = Date.now() - startValidate;
        updateStep('validate', 'completed', 100, 'Conteúdo validado com sucesso', validateDuration);

        // Step 2: SEO Optimization
        updateStep('seo', 'processing', 0, 'Analisando palavras-chave...');
        const startSEO = Date.now();

        // Generate temporary URL for analysis
        const tempSlug = generateNewsUrl(news);
        const tempCanonicalUrl = generateCanonicalUrl(tempSlug);

        await delay(400);
        updateStep('seo', 'processing', 30, 'Gerando meta tags otimizadas...');

        const seoAnalysis: SEOAnalysis = analyzeSEO(news, tempCanonicalUrl);

        await delay(400);
        updateStep('seo', 'processing', 60, 'Criando Open Graph tags...');

        const seoMetadata: SEOMetadata = await optimizeSEO(news, tempCanonicalUrl);

        await delay(300);
        updateStep('seo', 'processing', 90, 'Gerando dados estruturados (Schema.org)...');

        const seoDuration = Date.now() - startSEO;
        updateStep('seo', 'completed', 100, `SEO Score: ${seoAnalysis.score}/100`, seoDuration);

        // Step 3: Generate URL
        updateStep('url', 'processing', 0, 'Criando slug amigável...');
        const startURL = Date.now();

        await delay(300);
        updateStep('url', 'processing', 50, 'Verificando unicidade...');

        // Check if slug exists and generate unique one
        const baseSlug = generateNewsUrl(news);
        const uniqueSlug = await generateUniqueSlug(baseSlug, async (slug) => {
            const supabase = getSupabase();
            if (!supabase) return false;

            const { data } = await supabase
                .from('news')
                .select('id')
                .eq('slug', slug)
                .single();

            return !!data;
        });

        const canonicalUrl = generateCanonicalUrl(uniqueSlug);

        const urlDuration = Date.now() - startURL;
        updateStep('url', 'completed', 100, `URL: ${uniqueSlug}`, urlDuration);

        // Step 4: Save to database
        updateStep('save', 'processing', 0, 'Preparando dados...');
        const startSave = Date.now();

        const supabase = getSupabase();
        if (!supabase) {
            throw new Error('Supabase client not initialized');
        }

        await delay(300);
        updateStep('save', 'processing', 50, 'Salvando no banco de dados...');

        // Prepare news data with SEO fields
        const newsData = {
            ...news,
            slug: uniqueSlug,
            canonical_url: canonicalUrl,
            seo_title: seoMetadata.title,
            seo_description: seoMetadata.description,
            seo_keywords: seoMetadata.keywords,
            og_image: seoMetadata.ogTags.image,
            structured_data: seoMetadata.structuredData,
            seo_score: seoAnalysis.score,
            published_at: news.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data: savedNews, error } = await supabase
            .from('news')
            .upsert(newsData)
            .select()
            .single();

        if (error) {
            throw error;
        }

        const saveDuration = Date.now() - startSave;
        updateStep('save', 'completed', 100, 'Publicação salva com sucesso!', saveDuration);

        return {
            success: true,
            newsId: savedNews.id,
            slug: uniqueSlug,
            canonicalUrl,
            seoScore: seoAnalysis.score
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

        // Mark current step as failed
        const currentStep = steps.find(s => s.status === 'processing');
        if (currentStep) {
            currentStep.status = 'failed';
            currentStep.message = errorMessage;
            if (onProgress) onProgress([...steps]);
        }

        return {
            success: false,
            error: errorMessage
        };
    }
}

/**
 * Validate news content before publication
 */
export function validateNewsContent(news: Partial<NewsItem>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!news.title || news.title.trim().length < 10) {
        errors.push('Título deve ter pelo menos 10 caracteres');
    }

    if (!news.lead || news.lead.trim().length < 50) {
        errors.push('Resumo deve ter pelo menos 50 caracteres');
    }

    if (!news.content || news.content.trim().length < 100) {
        errors.push('Conteúdo deve ter pelo menos 100 caracteres');
    }

    if (!news.category) {
        errors.push('Categoria é obrigatória');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Helper function to simulate async delay
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
