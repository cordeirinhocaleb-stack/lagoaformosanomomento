import { useState, useCallback, useEffect } from 'react';
import { User, NewsItem, SystemSettings } from '../../../../types';
import { processPendingUploads } from '../../../../services/storage/syncService';
import { logUserAction } from '../../../../services/content/contentService';
import { dispatchSocialWebhook } from '../../../../services/integrationService';
import { generateNewsUrl, generateCanonicalUrl } from '../../../../services/seo/urlGeneratorService';
import { analyzeSEO, optimizeSEO } from '../../../../services/seo/seoOptimizationService';

interface UseNewsPublicationProps {
    user: User;
    onSave: (news: NewsItem, isUpdate: boolean) => void;
    systemSettings?: SystemSettings;
    setToast: (toast: { message: string, type: 'success' | 'error' | 'warning' | 'info' } | null) => void;
}

export const useNewsPublication = ({ user, onSave, systemSettings, setToast }: UseNewsPublicationProps) => {
    const [publishStatus, setPublishStatus] = useState<'idle' | 'uploading' | 'distributing' | 'success' | 'error' | 'report'>('idle');
    const [publishMode, setPublishMode] = useState<'save' | 'publish'>('publish');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const [totalFiles, setTotalFiles] = useState(0);
    const [currentFileIndex, setCurrentFileIndex] = useState(0);

    const saveDraft = useCallback(async (newsData: NewsItem, isUpdate: boolean, forceSocial: boolean = false) => {
        setPublishStatus('uploading');
        setPublishMode('save');
        setUploadProgress(0);
        setTotalFiles(0);
        setCurrentFileIndex(0);
        setProgressMessage('Iniciando upload...');

        try {
            // Process Uploads
            const processedNews = await processPendingUploads(newsData, (progress, msg, currentFile, total) => {
                setUploadProgress(progress);
                setProgressMessage(msg);
                if (currentFile !== undefined) setCurrentFileIndex(currentFile);
                if (total !== undefined) setTotalFiles(total);
            });

            // Save Data
            onSave(processedNews, isUpdate);

            // Trigger Social Distribution (if requested or implicitly required)
            if (forceSocial || (!isUpdate && processedNews.status === 'published')) {
                setPublishStatus('distributing');
                // Note: Actual distribution logic might be separate, but we simulate flow here or call it if needed
            }

            setPublishStatus('success');

            // Log
            // Log
            await logUserAction(user.id, user.name, isUpdate ? 'UPDATE_DRAFT' : 'CREATE_DRAFT', processedNews.id || 'new', JSON.stringify({ title: processedNews.title }));

            return processedNews; // Return for local state updates if needed

        } catch (error: unknown) {
            console.error("Erro ao salvar:", error);
            const errorMsg = error instanceof Error ? error.message : String(error);
            if (errorMsg.includes('upload') || errorMsg.includes('Cloudinary') || errorMsg.includes('conexão')) {
                setProgressMessage("Algo aconteceu e não foi possível fazer upload, tente novamente.");
            } else {
                setProgressMessage("Falha no envio: " + (errorMsg || "Erro desconhecido"));
            }
            setPublishStatus('error');
            throw error;
        }
    }, [user, onSave]);

    const publishNews = useCallback(async (newsData: NewsItem, isUpdate: boolean, forceSocial: boolean = false) => {
        setPublishStatus('uploading');
        setPublishMode('publish');
        setUploadProgress(0);
        setTotalFiles(0);
        setCurrentFileIndex(0);
        setProgressMessage('Preparando publicação...');

        try {
            // Step 1: Process uploads (videos, images)
            setProgressMessage('Processando uploads de mídia...');
            const processedNews = await processPendingUploads(newsData, (progress, msg, currentFile, total) => {
                setUploadProgress(Math.min(progress * 0.7, 70)); // 0-70%
                setProgressMessage(msg);
                if (currentFile !== undefined) setCurrentFileIndex(currentFile);
                if (total !== undefined) setTotalFiles(total);
            });

            // Step 2: SEO Optimization
            setProgressMessage('Otimizando SEO para melhores buscas...');
            setUploadProgress(75);

            // Generate SEO-friendly URL if not exists
            if (!processedNews.slug) {
                const slug = generateNewsUrl(processedNews);
                const canonicalUrl = generateCanonicalUrl(slug);
                processedNews.slug = slug;
                processedNews.canonical_url = canonicalUrl;
            }

            // Analyze and optimize SEO
            const canonicalUrl = processedNews.canonical_url || generateCanonicalUrl(processedNews.slug || '');
            const seoAnalysis = analyzeSEO(processedNews, canonicalUrl);
            const seoMetadata = await optimizeSEO(processedNews, canonicalUrl);

            // Apply SEO metadata
            processedNews.seo_title = seoMetadata.title;
            processedNews.seo_description = seoMetadata.description;
            processedNews.seo_keywords = seoMetadata.keywords;
            processedNews.og_image = seoMetadata.ogTags.image;
            processedNews.structured_data = seoMetadata.structuredData;
            processedNews.seo_score = seoAnalysis.score;

            setProgressMessage(`SEO otimizado! Score: ${seoAnalysis.score}/100`);
            setUploadProgress(85);

            // Step 3: Social Distribution
            if ((!isUpdate || forceSocial) && systemSettings?.enableOmnichannel) {
                setProgressMessage("Distribuindo redes sociais...");
                setUploadProgress(90);
                await dispatchSocialWebhook(processedNews);
            }

            // Step 4: Save to database
            setProgressMessage('Salvando publicação...');
            setUploadProgress(95);
            onSave(processedNews, isUpdate);

            setUploadProgress(100);
            setPublishStatus('success');

            await logUserAction(user.id, user.name, isUpdate ? 'UPDATE_PUBLISH' : 'PUBLISH', processedNews.id || 'new', JSON.stringify({ title: processedNews.title }));

            return processedNews;

        } catch (e: unknown) {
            console.error("Erro na publicação:", e);
            const errorMsg = e instanceof Error ? e.message : String(e);
            if (errorMsg.includes('upload') || errorMsg.includes('Cloudinary') || errorMsg.includes('conexão')) {
                setProgressMessage("Algo aconteceu e não foi possível fazer upload, tente novamente.");
            } else {
                setProgressMessage("Falha: " + (errorMsg || "Erro desconhecido"));
            }
            setPublishStatus('error');
            throw e;
        }
    }, [user, onSave, systemSettings]);

    const resetStatus = useCallback(() => setPublishStatus('idle'), []);

    return {
        publishStatus,
        publishMode,
        uploadProgress,
        progressMessage,
        saveDraft,
        publishNews,
        resetStatus,
        totalFiles,
        currentFileIndex
    };
};
