import { useState, useCallback, useEffect } from 'react';
import { User, NewsItem, SystemSettings } from '../../../../types';
import { processPendingUploads } from '../../../../services/storage/syncService';
import { logUserAction } from '../../../../services/content/contentService';
import { dispatchSocialWebhook } from '../../../../services/integrationService';

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

    const saveDraft = useCallback(async (newsData: NewsItem, isUpdate: boolean, forceSocial: boolean = false) => {
        setPublishStatus('uploading');
        setPublishMode('save');
        setUploadProgress(0);
        setProgressMessage('Iniciando upload...');

        try {
            // Process Uploads
            const processedNews = await processPendingUploads(newsData, (progress, msg) => {
                setUploadProgress(progress);
                setProgressMessage(msg);
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
        setProgressMessage('Preparando publicação...');

        try {
            const processedNews = await processPendingUploads(newsData, (progress, msg) => {
                setUploadProgress(progress);
                setProgressMessage(msg);
            });

            // Social Distribution
            if ((!isUpdate || forceSocial) && systemSettings?.enableOmnichannel) {
                setProgressMessage("Distribuindo redes sociais...");
                await dispatchSocialWebhook(processedNews);
            }

            onSave(processedNews, isUpdate);
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
        resetStatus
    };
};
