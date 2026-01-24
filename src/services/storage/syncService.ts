
import { NewsItem, ContentBlock, Advertiser, AdPricingConfig, PromoBanner, PromoPopupItemConfig } from '../../types';
import { getLocalFile, removeLocalFile } from './localStorageService';
import { uploadToCloudinary } from '../cloudinaryService';
import { queueYouTubeUpload } from '../youtubeService';

const IMG_CONFIG = { cloudName: 'dqrxppg5b', uploadPreset: 'noticias_preset' };
const VIDEO_CONFIG = { cloudName: 'dlleqjxd7', uploadPreset: 'upload_videos_lagoaformosanomomento' };

export const processPendingUploads = async (newsData: NewsItem, onProgress?: (progress: number, message: string, currentFile?: number, totalFiles?: number) => void): Promise<NewsItem> => {
    const startTime = Date.now();
    const updatedNews = { ...newsData };

    // Calculate total operations for progress tracking
    let totalFiles = 0;
    let uploadedFiles = 0;

    const countLocal = (str: string | undefined) => str && str.startsWith('local_') ? 1 : 0;

    // Count Banner Images
    if (updatedNews.bannerImages) {
        updatedNews.bannerImages.forEach(url => totalFiles += countLocal(url));
    }
    // Count Content Blocks Images
    if (updatedNews.blocks) {
        updatedNews.blocks.forEach(block => {
            if (block.type === 'image') { totalFiles += countLocal(block.content); }
            if (['paragraph', 'heading', 'quote', 'list'].includes(block.type)) {
                const matches = (block.content.match(/(?:src="|data-local-id=")(local_[^"]+)/g) || []);
                totalFiles += matches.length;
            }
            if (block.type === 'gallery' && Array.isArray(block.settings?.images)) {
                block.settings.images.forEach((img: any) => totalFiles += countLocal(typeof img === 'string' ? img : img.url));
            }
            // Count Video Blocks
            if (block.type === 'video' && typeof block.content === 'string' && block.content.startsWith('local_')) {
                totalFiles += 1;
            }
        });
    }
    // Count Banner Video
    totalFiles += countLocal(updatedNews.bannerVideoUrl);

    const reportProgress = (msg: string) => {
        const percent = totalFiles > 0 ? Math.round((uploadedFiles / totalFiles) * 100) : 100;
        if (onProgress) { onProgress(percent, msg, uploadedFiles, totalFiles); }
    };

    if (totalFiles === 0 && onProgress) {
        onProgress(100, "Nenhum arquivo pendente.", 0, 0);
    }

    // Helper to generate folder path: User/Context/YYYY-MM-DD
    const getFolder = (subContext: string) => {
        const author = newsData.author || 'Anônimo';
        const safeAuthor = author.replace(/[^a-zA-Z0-9À-ÿ ]/g, "").trim().replace(/\s+/g, "_"); // Keep accents but no special chars
        const date = new Date().toISOString().split('T')[0];
        return `${safeAuthor}/${subContext}/${date}`;
    };

    // 1. Process Banner Images
    if (updatedNews.bannerImages && updatedNews.bannerImages.length > 0) {
        const newBannerImages = await Promise.all(updatedNews.bannerImages.map(async (url, idx) => {
            if (typeof url === 'string' && url.startsWith('local_')) {
                uploadedFiles++;
                reportProgress(`Enviando banner ${uploadedFiles}/${totalFiles}...`);
                return await uploadAndCleanup(url, getFolder('banners'), IMG_CONFIG);
            }
            return url;
        }));
        updatedNews.bannerImages = newBannerImages;

        // Update main image URL if it was local
        if (updatedNews.imageUrl && updatedNews.imageUrl.startsWith('local_')) {
            updatedNews.imageUrl = newBannerImages[0] || updatedNews.imageUrl;
        }
    }

    // 2. Process Content Blocks
    if (updatedNews.blocks && updatedNews.blocks.length > 0) {
        const newBlocks = await Promise.all(updatedNews.blocks.map(async (block) => {
            const newBlock = { ...block };

            // Image Blocks
            if (block.type === 'image' && typeof block.content === 'string' && block.content.startsWith('local_')) {
                uploadedFiles++;
                reportProgress(`Enviando imagem de conteúdo ${uploadedFiles}/${totalFiles}...`);
                newBlock.content = await uploadAndCleanup(block.content, getFolder('content'), IMG_CONFIG);
            }

            // Text Blocks (HTML Content Parsing)
            if (['paragraph', 'heading', 'quote', 'list'].includes(block.type) && typeof block.content === 'string') {
                let content = newBlock.content;
                const localIdRegex = /(?:src="|data-local-id=")(local_[a-zA-Z0-9_]+)(?:")/g;
                const matches = [...content.matchAll(localIdRegex)];
                const uniqueLocalIds = [...new Set(matches.map(m => m[1]))];

                if (uniqueLocalIds.length > 0) {
                    const urlMap = new Map<string, string>();

                    // Process sequentially inside blocks to update progress accurately one by one (optional, but safer for tracking)
                    for (const lid of uniqueLocalIds) {
                        try {
                            uploadedFiles++;
                            reportProgress(`Enviando imagem inline ${uploadedFiles}/${totalFiles}...`);
                            const url = await uploadAndCleanup(lid, getFolder('inline'), IMG_CONFIG);
                            urlMap.set(lid, url);
                        } catch (e) {
                            console.error(`Falha ao sync imagem de texto ${lid}`, e);
                        }
                    }

                    urlMap.forEach((cloudUrl, localId) => {
                        content = content.replaceAll(`src="blob:${localId}"`, `src="${cloudUrl}"`);
                        const regex = new RegExp(`<img[^>]*data-local-id="${localId}"[^>]*>`, 'g');
                        content = content.replace(regex, (match: string) => {
                            return match.replace(/src="[^"]*"/, `src="${cloudUrl}"`)
                                .replace(`data-local-id="${localId}"`, '');
                        });
                    });

                    newBlock.content = content;
                }
            }

            // Gallery Blocks
            if (block.type === 'gallery') {
                // Check both locations (content.images is used by Editor, settings.images by legacy/sync)
                const images = block.content?.images || block.settings?.images;

                if (Array.isArray(images)) {
                    const newImages = await Promise.all(images.map(async (img: any) => {
                        const url = typeof img === 'string' ? img : img.url;
                        if (url && url.startsWith('local_')) {
                            uploadedFiles++;
                            reportProgress(`Enviando galeria ${uploadedFiles}/${totalFiles}...`);
                            const newUrl = await uploadAndCleanup(url, getFolder('gallery'), IMG_CONFIG);
                            return typeof img === 'string' ? newUrl : { ...img, url: newUrl };
                        }
                        return img;
                    }));

                    // Update the correct location
                    if (block.content?.images) {
                        newBlock.content = { ...newBlock.content, images: newImages };
                    } else {
                        newBlock.settings = { ...newBlock.settings, images: newImages };
                    }
                }
            }

            // Video Blocks - NEW IMPLEMENTATION
            if (block.type === 'video' && typeof block.content === 'string') {
                const isLocal = block.content.startsWith('local_');
                const isPublicYouTube = block.content.includes('youtube.com') || block.content.includes('youtu.be');

                // Case A: YouTube Upload (Only if local OR explicitly requiring re-process)
                const youtubeMeta = block.youtubeMeta || block.settings?.youtubeMeta;

                if (block.videoSource === 'youtube' && youtubeMeta && !isPublicYouTube) {
                    try {
                        const localId = isLocal ? block.content : null;
                        const blob = localId ? await getLocalFile(localId) : null;

                        if (blob) {
                            uploadedFiles++;
                            reportProgress(`Enviando vídeo para YouTube ${uploadedFiles}/${totalFiles}...`);

                            const file = new File([blob], `yt_block_${Date.now()}.mp4`, { type: blob.type });
                            const result = await queueYouTubeUpload(file, youtubeMeta as any, updatedNews.id);

                            // Update block content to a temporary placeholder
                            newBlock.content = `https://www.youtube.com/embed/pending_${result.jobId}`;
                            newBlock.settings = { ...newBlock.settings, youtubeJobId: result.jobId, uploadStatus: 'uploading' };

                            await removeLocalFile(localId!);
                        }
                    } catch (e) {
                        console.error('Falha no upload para YouTube (Bloco):', e);
                        throw new Error("Falha no upload do vídeo para o YouTube. Tente novamente.");
                    }
                }
                // Case B: Cloudinary / Internal Upload (Only if local)
                else if (isLocal) {
                    try {
                        uploadedFiles++;
                        reportProgress(`Enviando vídeo de conteúdo ${uploadedFiles}/${totalFiles}...`);
                        const cloudUrl = await uploadAndCleanup(block.content, getFolder('videos'), VIDEO_CONFIG);
                        newBlock.content = cloudUrl;
                    } catch (e) {
                        console.error('Falha no upload de vídeo interno (Bloco):', e);
                    }
                }
            }

            return newBlock;
        }));
        updatedNews.blocks = newBlocks;
    }

    // 3. Process Banner Video
    if (updatedNews.bannerVideoUrl && updatedNews.bannerVideoUrl.startsWith('local_')) {
        const localId = updatedNews.bannerVideoUrl;
        uploadedFiles++;
        reportProgress(`Enviando vídeo de capa ${uploadedFiles}/${totalFiles}...`);

        if (updatedNews.bannerVideoSource === 'youtube' && updatedNews.bannerYoutubeMetadata) {
            console.log('📺 Syncing video to YouTube:', localId);
            try {
                const blob = await getLocalFile(localId);
                if (blob) {
                    const file = new File([blob], `yt_upload_${Date.now()}.mp4`, { type: blob.type });
                    const result = await queueYouTubeUpload(file, updatedNews.bannerYoutubeMetadata as any, updatedNews.id);
                    updatedNews.bannerYoutubeVideoId = result.jobId; // Store job ID
                    updatedNews.bannerYoutubeStatus = 'uploading';

                    // Cleanup local file after queueing
                    await removeLocalFile(localId);

                    // Set a placeholder URL (embed URL will be updated by webhook/backend later)
                    updatedNews.bannerVideoUrl = `https://www.youtube.com/embed/pending_${result.jobId}`;
                }
            } catch (e) {
                console.error('❌ Failed to queue YouTube upload:', e);
            }
        } else {
            // Internal video (Cloudinary or Supabase Storage)
            try {
                const cloudUrl = await uploadAndCleanup(localId, getFolder('videos'), VIDEO_CONFIG);
                updatedNews.bannerVideoUrl = cloudUrl;
            } catch (err) {
                console.error('❌ Failed to upload video:', err);
                throw err;
            }
        }

        // Final check: if we expected a video URL but have none/local, throw error
        if (!updatedNews.bannerVideoUrl || updatedNews.bannerVideoUrl.startsWith('local_')) {
            throw new Error("Falha Crítica: URL do vídeo não foi gerada corretamente. Tente novamente.");
        }
    }

    // UX: Ensure minimum duration of 5 seconds
    const elapsed = Date.now() - startTime;
    const MIN_DURATION = 2000; // Reduced to 2s to feel faster

    if (elapsed < MIN_DURATION) {
        if (onProgress) onProgress(99, "Finalizando processamento...", totalFiles, totalFiles);
        await new Promise(resolve => setTimeout(resolve, MIN_DURATION - elapsed));
    }

    if (onProgress) onProgress(100, "Concluído!", totalFiles, totalFiles);

    return updatedNews;
};

export const processAdvertiserUploads = async (advertiser: Advertiser): Promise<Advertiser> => {
    const updated = { ...advertiser };

    // 1. Logo (Individual and Multiple)
    if (updated.logoUrls && updated.logoUrls.length > 0) {
        updated.logoUrls = await Promise.all(updated.logoUrls.map(async (url) => {
            if (url && url.startsWith('local_')) {
                return await uploadAndCleanup(url, `lfnm_cms/advertisers/${updated.id}/branding`);
            }
            return url;
        }));

        // Backward compatibility: logoUrl always points to the first image
        if (updated.logoUrls[0]) {
            updated.logoUrl = updated.logoUrls[0];
        }
    } else if (updated.logoUrl && updated.logoUrl.startsWith('local_')) {
        updated.logoUrl = await uploadAndCleanup(updated.logoUrl, `lfnm_cms/advertisers/${updated.id}/branding`);
    }

    // 2. Video
    if (updated.videoUrl && updated.videoUrl.startsWith('local_')) {
        updated.videoUrl = await uploadAndCleanup(updated.videoUrl, `lfnm_cms/advertisers/${updated.id}/branding`, VIDEO_CONFIG);
    }

    // 3. Banner (Legacy)
    if (updated.bannerUrl && updated.bannerUrl.startsWith('local_')) {
        updated.bannerUrl = await uploadAndCleanup(updated.bannerUrl, `lfnm_cms/advertisers/${updated.id}/branding`);
    }

    // 3. Products
    if (updated.internalPage?.products) {
        updated.internalPage.products = await Promise.all(updated.internalPage.products.map(async (prod) => {
            if (prod.imageUrl && prod.imageUrl.startsWith('local_')) {
                return {
                    ...prod,
                    imageUrl: await uploadAndCleanup(prod.imageUrl, `lfnm_cms/advertisers/${updated.id}/products`)
                };
            }
            return prod;
        }));
    }

    // 4. Coupons (Future proofing if coupons have images)
    // 5. Banners
    if (updated.promoBanners && updated.promoBanners.length > 0) {
        updated.promoBanners = await Promise.all(updated.promoBanners.map(async (banner: PromoBanner) => {
            const newBanner = { ...banner };
            if (newBanner.images && newBanner.images.length > 0) {
                newBanner.images = await Promise.all(newBanner.images.map(async (imgUrl: string) => {
                    if (imgUrl.startsWith('local_')) {
                        return await uploadAndCleanup(imgUrl, `lfnm_cms/advertisers/${updated.id}/banners`);
                    }
                    return imgUrl;
                }));
            }
            if (newBanner.videoUrl && newBanner.videoUrl.startsWith('local_')) {
                newBanner.videoUrl = await uploadAndCleanup(newBanner.videoUrl, `lfnm_cms/advertisers/${updated.id}/banners/video`);
            }
            return newBanner;
        }));
    }

    // 6. Popup
    if (updated.popupSet?.items && updated.popupSet.items.length > 0) {
        const updatedItems = await Promise.all(updated.popupSet.items.map(async (item: PromoPopupItemConfig) => {
            const newItem = { ...item };
            if (newItem.media?.images && newItem.media.images.length > 0) {
                newItem.media.images = await Promise.all(newItem.media.images.map(async (imgUrl: string) => {
                    if (imgUrl.startsWith('local_')) {
                        return await uploadAndCleanup(imgUrl, `lfnm_cms/advertisers/${updated.id}/popups`);
                    }
                    return imgUrl;
                }));
            }
            if (newItem.media?.videoUrl && newItem.media.videoUrl.startsWith('local_')) {
                newItem.media.videoUrl = await uploadAndCleanup(newItem.media.videoUrl, `lfnm_cms/advertisers/${updated.id}/popups/video`);
            }
            return newItem;
        }));
        updated.popupSet = { ...updated.popupSet, items: updatedItems };
    }

    return updated;
};

export const processConfigUploads = async (config: AdPricingConfig): Promise<AdPricingConfig> => {
    return { ...config };
};

const uploadAndCleanup = async (localId: string, context: string, configOverride?: { cloudName: string; uploadPreset: string }): Promise<string> => {
    try {
        const blob = await getLocalFile(localId);
        if (!blob) {
            console.warn(`Arquivo local não encontrado: ${localId}`);
            if (localId.startsWith('youtube_job_')) {
                return localId;
            }
            return localId;
        }

        const ext = blob.type.split('/')[1] || 'jpg';
        const filename = `${localId}.${ext}`;
        const file = new File([blob], filename, { type: blob.type });

        // Use Cloudinary Service
        const publicUrl = await uploadToCloudinary(file, context, 'auto_sync', configOverride);

        console.log(`✅ Upload Cloudinary Sucesso (${localId}) -> ${publicUrl}`);

        await removeLocalFile(localId);

        return publicUrl;
    } catch (e: any) {
        console.error(`Falha ao fazer upload de ${localId}:`, e);

        // Tratamento específico para erro de redimensionamento (comum em ICOs ou arquivos corrompidos)
        if (e.message && e.message.includes("Can't resize")) {
            throw new Error(`O arquivo enviado não é compatível com o sistema de otimização (possível .ICO ou arquivo corrompido). Tente usar JPG ou PNG.`);
        }

        throw new Error(`Falha no upload para Cloudinary (${localId}): ${e.message || 'Erro desconhecido'}`);
    }
};
