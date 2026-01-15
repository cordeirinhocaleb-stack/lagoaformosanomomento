
import { useState } from 'react';
import { NewsItem, ContentBlock, SystemSettings, SocialDistribution, User } from '../../../../types';
import { dispatchSocialWebhook } from '../../../../services/integrationService';
import { queueYouTubeUpload } from '../../../../services/youtubeService';
import { uploadFileToDrive } from '../../../../services/driveService';

export type PublishStatus = 'idle' | 'uploading' | 'distributing' | 'success' | 'error';

interface UsePublishingWorkflowProps {
    accessToken: string | null;
    systemSettings?: SystemSettings;
    user: User;
}

export const usePublishingWorkflow = ({ accessToken, systemSettings, user }: UsePublishingWorkflowProps) => {
    const [status, setStatus] = useState<PublishStatus>('idle');

    const publishNews = async (
        draft: NewsItem,
        bannerFile: File | null,
        pendingFiles: Record<string, File>,
        onSaveCallback: (news: NewsItem) => void
    ) => {
        setStatus('uploading');

        try {
            const finalBlocks = [...draft.blocks || []];
            let bannerUrl = draft.imageUrl;

            // 1. Process Banner Media (Video vs Image)
            if (draft.bannerMediaType === 'video' && draft.bannerVideoSource === 'youtube' && bannerFile) {
                // FLUXO YOUTUBE BANNER: Enfileira e salva job ID
                try {
                    if (draft.bannerYoutubeMetadata && draft.bannerYoutubeMetadata.title) {
                        const { jobId } = await queueYouTubeUpload(bannerFile, {
                            ...draft.bannerYoutubeMetadata,
                            title: draft.bannerYoutubeMetadata.title, // Explicit string
                            madeForKids: !!draft.bannerYoutubeMetadata.madeForKids
                        }, draft.id);
                        console.log(`YouTube Banner Upload Queued: Job ${jobId}`);
                    }
                    // Poderíamos atualizar bannerVideoUrl aqui com um placeholder, mas o preview local já deve estar lá
                } catch (ytError) {
                    console.error("Falha ao enfileirar Banner YouTube:", ytError);
                }
            } else if (bannerFile && accessToken) {
                // FLUXO DRIVE (Imagem)
                bannerUrl = await uploadFileToDrive(bannerFile, accessToken);
            }

            // 2. Processar Blocos de Mídia (Iteração)
            for (let i = 0; i < finalBlocks.length; i++) {
                const block = finalBlocks[i];
                const file = pendingFiles[block.id];

                if (block.type === 'video' && block.videoSource === 'youtube' && file) {
                    if (block.youtubeMeta) {
                        // Cast madeForKids to boolean for block metadata
                        try {
                            if (block.youtubeMeta.title) {
                                const { jobId } = await queueYouTubeUpload(file, {
                                    ...block.youtubeMeta,
                                    title: block.youtubeMeta.title, // Explicit string
                                    madeForKids: !!block.youtubeMeta.madeForKids
                                }, draft.id);
                                console.log(`YouTube Block Upload Queued: Job ${jobId}`);
                            }
                        } catch (ytError) {
                            console.error("Falha ao enfileirar Bloco YouTube:", ytError);
                        }
                    }
                }
            }

            // 3. Montar Objeto Final
            const finalNews: NewsItem = {
                ...draft,
                imageUrl: bannerUrl,
                updatedAt: new Date().toISOString(),
                blocks: finalBlocks
            };

            // 4. Disparo Social (Se ativado)
            if (systemSettings?.enableOmnichannel) {
                setStatus('distributing');
                await dispatchSocialWebhook(finalNews);
            }

            // 5. Salvar no Banco
            onSaveCallback(finalNews);
            setStatus('success');

        } catch (error) {
            console.error("Erro na publicação:", error);
            setStatus('error');
        }
    };

    return {
        publishStatus: status,
        publishNews,
        setPublishStatus: setStatus
    };
};
