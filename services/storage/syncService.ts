
import { NewsItem, ContentBlock, Advertiser, AdPricingConfig } from '../../types';
import { getLocalFile, removeLocalFile } from './localStorageService';
import { uploadToCloudinary } from '../cloudinaryService';
import { queueYouTubeUpload } from '../youtubeService';

export const processPendingUploads = async (newsData: NewsItem, onProgress?: (progress: number, status: string) => void): Promise<NewsItem> => {
    const updatedNews = { ...newsData };

    // Calculate total operations for progress tracking
    let totalOps = 0;
    let completedOps = 0;

    const countLocal = (str: string | undefined) => str && str.startsWith('local_') ? 1 : 0;

    // Count Banner Images
    if (updatedNews.bannerImages) {
        updatedNews.bannerImages.forEach(url => totalOps += countLocal(url));
    }
    // Count Content Blocks Images
    if (updatedNews.blocks) {
        updatedNews.blocks.forEach(block => {
            if (block.type === 'image') {totalOps += countLocal(block.content);}
            if (['paragraph', 'heading', 'quote', 'list'].includes(block.type)) {
                const matches = (block.content.match(/(?:src="|data-local-id=")(local_[^"]+)/g) || []);
                totalOps += matches.length;
            }
            if (block.type === 'gallery' && Array.isArray(block.settings?.images)) {
                block.settings.images.forEach((img: any) => totalOps += countLocal(typeof img === 'string' ? img : img.url));
            }
        });
    }
    // Count Banner Video
    totalOps += countLocal(updatedNews.bannerVideoUrl);

    const updateProgress = (msg: string) => {
        completedOps++;
        const percent = totalOps > 0 ? Math.round((completedOps / totalOps) * 100) : 100;
        if (onProgress) {onProgress(percent, msg);}
    };

    if (totalOps === 0 && onProgress) {
        onProgress(100, "Nenhum arquivo pendente.");
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
                const result = await uploadAndCleanup(url, getFolder('banners'));
                updateProgress(`Imagem do banner ${idx + 1} enviada`);
                return result;
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
                newBlock.content = await uploadAndCleanup(block.content, getFolder('content'));
                updateProgress("Imagem de conteúdo enviada");
            }

            // Text Blocks (HTML Content Parsing)
            if (['paragraph', 'heading', 'quote', 'list'].includes(block.type) && typeof block.content === 'string') {
                let content = newBlock.content;
                const localIdRegex = /(?:src="|data-local-id=")(local_[a-zA-Z0-9_]+)(?:")/g;
                const matches = [...content.matchAll(localIdRegex)];
                const uniqueLocalIds = [...new Set(matches.map(m => m[1]))];

                if (uniqueLocalIds.length > 0) {
                    const urlMap = new Map<string, string>();

                    await Promise.all(uniqueLocalIds.map(async (lid) => {
                        try {
                            const url = await uploadAndCleanup(lid, getFolder('inline'));
                            urlMap.set(lid, url);
                            updateProgress("Imagem inline enviada");
                        } catch (e) {
                            console.error(`Falha ao sync imagem de texto ${lid}`, e);
                        }
                    }));

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
            if (block.type === 'gallery' && Array.isArray(block.settings?.images)) {
                const newImages = await Promise.all(block.settings.images.map(async (img: any) => {
                    const url = typeof img === 'string' ? img : img.url;
                    if (url && url.startsWith('local_')) {
                        const newUrl = await uploadAndCleanup(url, getFolder('gallery'));
                        updateProgress("Imagem da galeria enviada");
                        return typeof img === 'string' ? newUrl : { ...img, url: newUrl };
                    }
                    return img;
                }));
                newBlock.settings = { ...newBlock.settings, images: newImages };
            }

            return newBlock;
        }));
        updatedNews.blocks = newBlocks;
    }

    // 3. Process Banner Video
    if (updatedNews.bannerVideoUrl && updatedNews.bannerVideoUrl.startsWith('local_')) {
        const localId = updatedNews.bannerVideoUrl;

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
                    updateProgress("Estou enviando o video para 'youtube'");
                }
            } catch (e) {
                console.error('❌ Failed to queue YouTube upload:', e);
            }
        } else {
            // Internal video (Cloudinary or Supabase Storage)
            console.log('🎥 Syncing video to Cloud storage:', localId);
            updatedNews.bannerVideoUrl = await uploadAndCleanup(localId, getFolder('videos'));
            updateProgress("Estou enviando o video para 'Hospedagem'");
        }
    }

    return updatedNews;
};

export const processAdvertiserUploads = async (advertiser: Advertiser): Promise<Advertiser> => {
    const updated = { ...advertiser };

    // 1. Logo
    if (updated.logoUrl && updated.logoUrl.startsWith('local_')) {
        updated.logoUrl = await uploadAndCleanup(updated.logoUrl, `lfnm_cms/advertisers/${updated.id}/branding`);
    }

    // 2. Banner
    if (updated.bannerUrl && updated.bannerUrl.startsWith('local_')) {
        updated.bannerUrl = await uploadAndCleanup(updated.bannerUrl, `lfnm_cms/advertisers/${updated.id}/branding`);
    }

    return updated;
};

export const processConfigUploads = async (config: AdPricingConfig): Promise<AdPricingConfig> => {
    const updated = { ...config };

    if (updated.promoBanners && updated.promoBanners.length > 0) {
        updated.promoBanners = await Promise.all(updated.promoBanners.map(async (banner) => {
            const newBanner = { ...banner };

            // Banner Images (Array)
            if (newBanner.images && newBanner.images.length > 0) {
                newBanner.images = await Promise.all(newBanner.images.map(async (imgUrl) => {
                    if (imgUrl.startsWith('local_')) {
                        return await uploadAndCleanup(imgUrl, 'lfnm_cms/banners');
                    }
                    return imgUrl;
                }));
            }

            // Single Image (Legacy or alternative)
            if (newBanner.image && newBanner.image.startsWith('local_')) {
                newBanner.image = await uploadAndCleanup(newBanner.image, 'lfnm_cms/banners');
            }

            // Video
            if (newBanner.videoUrl && newBanner.videoUrl.startsWith('local_')) {
                newBanner.videoUrl = await uploadAndCleanup(newBanner.videoUrl, 'lfnm_cms/banners/video');
            }

            return newBanner;
        }));
    }

    return updated;
};

const uploadAndCleanup = async (localId: string, context: string): Promise<string> => {
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
        const publicUrl = await uploadToCloudinary(file, context);

        console.log(`✅ Upload Cloudinary Sucesso (${localId}) -> ${publicUrl}`);

        await removeLocalFile(localId);

        return publicUrl;
    } catch (e) {
        console.error(`Falha ao fazer upload de ${localId}:`, e);
        throw new Error(`Falha no upload para Cloudinary (${localId}).`);
    }
};
