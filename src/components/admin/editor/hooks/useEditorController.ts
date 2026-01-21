
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, NewsItem, ContentBlock, SystemSettings, SocialDistribution, BannerLayout, BannerTransition, YoutubeMetadata, BannerEffect } from '../../../../types';
import { storeLocalFile, getLocalFile } from '../../../../services/storage/localStorageService';
import { useNewsPublication } from './useNewsPublication';
import { ToastType } from '../../../common/Toast';

interface UseEditorControllerProps {
    user: User;
    initialData: NewsItem | null;
    onSave: (news: NewsItem, isUpdate: boolean) => void;
    systemSettings?: SystemSettings;
    setToast: (toast: { message: string, type: ToastType } | null) => void;
}

export const useEditorController = ({ user, initialData, onSave, systemSettings, setToast }: UseEditorControllerProps) => {
    const isPublished = initialData?.status === 'published';

    // Metadata State
    const [title, setTitle] = useState(initialData?.title || '');
    const [lead, setLead] = useState(initialData?.lead || '');
    const [category, setCategory] = useState(initialData?.category || 'Cotidiano');
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const [slug, setSlug] = useState(initialData?.seo?.slug || '');
    const [socialCaptions, setSocialCaptions] = useState<SocialDistribution[]>(initialData?.socialDistribution || []);

    // Banner Configuration
    const [bannerType, setBannerType] = useState<'image' | 'video'>(initialData?.bannerMediaType || 'image');
    const [bannerLayout, setBannerLayout] = useState<BannerLayout>(initialData?.bannerLayout || 'single');
    const [bannerTransition, setBannerTransition] = useState<BannerTransition>(initialData?.bannerTransition || 'fade');
    const [bannerDuration, setBannerDuration] = useState<number>(initialData?.bannerDuration || 4000);

    // Banner Media
    const [mainImageUrl, setMainImageUrl] = useState(initialData?.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200');
    const [bannerImages, setBannerImages] = useState<string[]>(initialData?.bannerImages || [initialData?.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200']);
    const [bannerVideoUrl, setBannerVideoUrl] = useState(initialData?.bannerVideoUrl || '');
    const [videoStart, setVideoStart] = useState<number>(initialData?.videoStart || 0);
    const [videoEnd, setVideoEnd] = useState<number>(initialData?.videoEnd || 0);

    // New Banner System (v1.173+)
    const [bannerImageLayout, setBannerImageLayout] = useState<'carousel' | 'grid' | 'fade' | 'split' | 'mosaic'>(initialData?.bannerImageLayout || 'carousel');
    const [bannerVideoSource, setBannerVideoSource] = useState<'internal' | 'youtube' | null>(initialData?.bannerVideoSource || null);
    const [bannerYoutubeVideoId, setBannerYoutubeVideoId] = useState(initialData?.bannerYoutubeVideoId || '');
    const [bannerYoutubeStatus, setBannerYoutubeStatus] = useState<'uploading' | 'processing' | 'ready' | 'failed'>(initialData?.bannerYoutubeStatus || 'uploading');
    const [bannerYoutubeMetadata, setBannerYoutubeMetadata] = useState<YoutubeMetadata>(initialData?.bannerYoutubeMetadata || {
        title: '', description: '', tags: [], privacy: 'public'
    });
    const [bannerSmartPlayback, setBannerSmartPlayback] = useState(initialData?.bannerSmartPlayback || false);

    // Effects
    const [bannerEffects, setBannerEffects] = useState<BannerEffect[] | BannerEffect>(() => {
        if (initialData?.bannerEffects) { return initialData.bannerEffects; }
        const legacyEffects = initialData?.bannerVideoSettings?.effects;
        if (legacyEffects) { return legacyEffects; }
        return [{ brightness: 1, contrast: 1, saturation: 1, blur: 0, sepia: 0, opacity: 1 }];
    });

    // Editor Content
    const [blocks, setBlocks] = useState<ContentBlock[]>(() => {
        if (initialData?.blocks && initialData.blocks.length > 0) { return initialData.blocks; }
        else if (initialData?.content) { return [{ id: 'legacy_content', type: 'smart_block', content: initialData.content, settings: { width: 'full' } }]; }
        return [{ id: 'b1', type: 'paragraph', content: '', settings: { alignment: 'left', style: 'serif', thickness: '18', width: 'full' } }];
    });
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [localPreviews, setLocalPreviews] = useState<Record<string, string>>({});
    const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const initialLoadRef = useRef(true);

    // Dirty State Tracker
    useEffect(() => {
        if (initialLoadRef.current) {
            initialLoadRef.current = false;
            return;
        }
        setIsDirty(true);
    }, [
        title, lead, category, tags, slug, socialCaptions,
        bannerType, bannerLayout, bannerTransition, bannerDuration,
        bannerImages, bannerVideoUrl, videoStart, videoEnd,
        bannerImageLayout, bannerVideoSource, bannerYoutubeVideoId, bannerSmartPlayback, bannerEffects,
        blocks
    ]);

    // Browser Navigation Guard
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // Publication Logic
    const {
        publishStatus, publishMode, uploadProgress, progressMessage,
        saveDraft, publishNews, resetStatus
    } = useNewsPublication({ user, onSave, systemSettings, setToast });

    const requiredSlots = useMemo(() => {
        switch (bannerImageLayout) {
            case 'split': return 2;
            case 'mosaic': return 3;
            case 'grid': return 4;
            case 'carousel': case 'fade': return 5;
            default: return 1;
        }
    }, [bannerImageLayout]);

    // Previews Loader
    useEffect(() => {
        const loadLocalPreviews = async () => {
            const allMedia = [...bannerImages, mainImageUrl, bannerVideoUrl].filter(Boolean) as string[];
            const localIds = allMedia.filter(id => id.startsWith('local_') && !localPreviews[id]);
            if (localIds.length === 0) { return; }
            const newPreviews = { ...localPreviews };
            let hasUpdates = false;
            await Promise.all(localIds.map(async (id) => {
                try {
                    const blob = await getLocalFile(id);
                    if (blob) {
                        newPreviews[id] = URL.createObjectURL(blob);
                        hasUpdates = true;
                    }
                } catch (e) {
                    console.error("Falha ao carregar preview local", id);
                }
            }));
            if (hasUpdates) { setLocalPreviews(newPreviews); }
        };
        loadLocalPreviews();
    }, [bannerImages, mainImageUrl, bannerVideoUrl, localPreviews]);

    const resolveMedia = useCallback((url: string | undefined): string => {
        if (!url) { return ''; }
        if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('http')) { return url; }
        if (url.startsWith('local_')) { return localPreviews[url] || ''; }
        return url;
    }, [localPreviews]);

    // Block Handlers
    const handleAddBlock = (type: ContentBlock['type'], content?: unknown, settings?: Record<string, unknown>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newBlock: ContentBlock = {
            id, type, content: content !== undefined ? content : '',
            settings: { alignment: 'left', thickness: '1', width: 'full', variant: 'minimal', iconPosition: 'none', iconName: 'fa-star', color: '#e2e8f0', ...settings }
        };
        setBlocks(prev => [...prev, newBlock]);
        setSelectedBlockId(id);
        return id;
    };

    const handleDeleteBlock = useCallback((id: string) => {
        setBlocks(prev => prev.filter(b => b.id !== id));
        setSelectedBlockId(null);
    }, []);

    const handleUpdateBlock = useCallback((updatedBlock: ContentBlock) => {
        setBlocks(prev => prev.map(b => b.id === updatedBlock.id ? updatedBlock : b));
    }, []);

    const handleDuplicateBlock = useCallback((id: string) => {
        const blockToDuplicate = blocks.find(b => b.id === id);
        if (!blockToDuplicate) { return; }
        const newId = Math.random().toString(36).substr(2, 9);
        const duplicatedBlock: ContentBlock = { ...blockToDuplicate, id: newId };
        const index = blocks.findIndex(b => b.id === id);
        setBlocks(prev => [...prev.slice(0, index + 1), duplicatedBlock, ...prev.slice(index + 1)]);
        setToast({ message: "Bloco duplicado com sucesso", type: 'success' });
    }, [blocks, setToast]);

    // Data Building
    const buildNewsItem = (status: 'draft' | 'published'): NewsItem => {
        const simpleContent = status === 'published' ? (blocks || []).map(b => {
            if (b.type === 'paragraph') { return `<p>${b.content}</p>`; }
            if (b.type === 'heading') { return `<h2>${b.content}</h2>`; }
            if (b.type === 'image') { return `<img src="${b.content}" alt="Imagem" style="width:100%;" />`; }
            if (b.type === 'quote') { return `<blockquote>${b.content}</blockquote>`; }
            if (b.type === 'list') { return b.content; }
            if (b.type === 'smart_block') { return b.content; }
            return '';
        }).join('') : '';

        return {
            id: initialData?.id || uuidv4(),
            title, lead, category, tags,
            imageUrl: bannerImages[0] || mainImageUrl,
            bannerImages,
            bannerMediaType: bannerType,
            bannerVideoUrl,
            blocks,
            status: status,
            authorId: user.id || '',
            author: user.name || '',
            views: initialData?.views || 0,
            createdAt: initialData?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            seo: {
                slug: (slug || title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, '-'))
                    + '-' + new Date().toLocaleDateString('pt-BR').replace(/\//g, '-'),
                metaTitle: title,
                metaDescription: lead,
                focusKeyword: ''
            },
            socialDistribution: socialCaptions,
            bannerLayout, bannerImageLayout, bannerTransition, bannerDuration,
            videoStart: videoStart ? Math.round(videoStart) : 0,
            videoEnd: videoEnd ? Math.round(videoEnd) : 0,
            bannerYoutubeMetadata,
            bannerEffects: Array.isArray(bannerEffects) ? bannerEffects : (bannerEffects ? [bannerEffects] as BannerEffect[] : undefined),
            bannerVideoSettings: {
                muted: true, loop: true, autoplay: true,
                effects: Array.isArray(bannerEffects) ? bannerEffects[0] : bannerEffects
            },
            content: simpleContent || lead,
            isBreaking: initialData?.isBreaking || false,
            isFeatured: initialData?.isFeatured || false,
            featuredPriority: initialData?.featuredPriority || 0,
            imageCredits: initialData?.imageCredits || 'Redação LFNM',
            mediaType: bannerType,
            region: initialData?.region || 'Região',
            city: initialData?.city || tags.find(t => ['Lagoa Formosa', 'Patos de Minas'].includes(t)) || 'Lagoa Formosa',
            bannerYoutubeVideoId, bannerYoutubeStatus,
            bannerSmartPlayback,
            isBannerAnimated: bannerImages.length > 1,
        };
    };

    const handleSaveLocal = async () => {
        if (!title.trim()) { setToast({ message: "O título é obrigatório.", type: 'error' }); return; }
        const newsData = buildNewsItem(isPublished ? 'published' : 'draft');
        try {
            const result = await saveDraft(newsData, !!initialData?.id, false);
            setMainImageUrl(result.imageUrl);
            setBannerImages(result.bannerImages || []);
            setBlocks(result.blocks || []);
            setBannerVideoUrl(result.bannerVideoUrl || '');
            setIsDirty(false); // Reset dirty state
            setToast({ message: "Rascunho salvo com sucesso!", type: 'success' });
        } catch (e: unknown) {
            console.error('Error saving draft:', e);
            const message = e instanceof Error ? e.message : String(e);
            setToast({ message: `Erro ao salvar rascunho: ${message}`, type: 'error' });
        }
    };

    const handlePublishLocal = async (isUpdate: boolean = false, forceSocial: boolean = false) => {
        if (!title || !lead) { setToast({ message: "Título e Resumo são obrigatórios.", type: 'warning' }); return; }
        const newsData = buildNewsItem('published');
        try {
            const isActuallyUpdate = isUpdate || !!initialData?.id;
            const result = await publishNews(newsData, isActuallyUpdate, forceSocial);
            setBlocks(result.blocks || []);
            setBannerImages(result.bannerImages || []);
            if (result.imageUrl) { setMainImageUrl(result.imageUrl); }
            setIsDirty(false); // Reset dirty state
            setToast({ message: isActuallyUpdate ? "Edição salva com sucesso!" : "Notícia publicada com sucesso!", type: 'success' });
        } catch (e: unknown) {
            console.error('Error publishing:', e);
            const message = e instanceof Error ? e.message : String(e);
            setToast({ message: `Erro ao publicar: ${message}`, type: 'error' });
        }
    };

    return {
        // State
        title, setTitle,
        lead, setLead,
        category, setCategory,
        tags, setTags,
        slug, setSlug,
        socialCaptions, setSocialCaptions,

        bannerType, setBannerType,
        bannerLayout, setBannerLayout,
        bannerTransition, setBannerTransition,
        bannerDuration, setBannerDuration,

        mainImageUrl, setMainImageUrl,
        bannerImages, setBannerImages,
        bannerVideoUrl, setBannerVideoUrl,
        videoStart, setVideoStart,
        videoEnd, setVideoEnd,

        bannerImageLayout, setBannerImageLayout,
        bannerVideoSource, setBannerVideoSource,
        bannerYoutubeVideoId, setBannerYoutubeVideoId,
        bannerYoutubeStatus, setBannerYoutubeStatus,
        bannerYoutubeMetadata, setBannerYoutubeMetadata,
        bannerSmartPlayback, setBannerSmartPlayback,
        bannerEffects, setBannerEffects,

        blocks, setBlocks,
        selectedBlockId, setSelectedBlockId,
        localPreviews,
        uploadingSlot, setUploadingSlot,
        isDirty, setIsDirty,

        // Handlers
        resolveMedia,
        handleAddBlock,
        handleDeleteBlock,
        handleUpdateBlock,
        handleDuplicateBlock,
        handleSaveLocal,
        handlePublishLocal,

        // Publication State (EXPOSED NOW)
        publishStatus,
        publishMode,
        uploadProgress,
        progressMessage,
        resetStatus,

        // Computed
        isPublished,
        requiredSlots
    };
};
