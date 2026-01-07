
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { User, NewsItem, ContentBlock, SystemSettings, SocialDistribution, BannerLayout, BannerTransition } from '../../types';
import { dispatchSocialWebhook } from '../../services/integrationService';
import Toast, { ToastType } from '../common/Toast';

import EditorSidebar from './editor/EditorSidebar';
import InspectorSidebar from './InspectorSidebar';
import { processPendingUploads } from '../../services/storage/syncService';
import { storeLocalFile, getLocalFile } from '../../services/storage/localStorageService';
import { logUserAction } from '../../services/content/contentService';
// Custom Hooks
import { useNewsPublication } from './editor/hooks/useNewsPublication';

// Refactored Modules
import { EditorHeader } from './editor/EditorHeader';
import { EditorBanner } from './editor/banner/EditorBannerNew'; // NEW BANNER SYSTEM
import { EditorMeta } from './editor/EditorMeta';
import { EditorCanvas } from './editor/EditorCanvas';
import PublishSuccessModal from './editor/PublishSuccessModal';

interface EditorTabProps {
    user: User;
    initialData: NewsItem | null;
    onSave: (news: NewsItem, isUpdate: boolean) => void;
    onCreateNew?: () => void;
    onCancel: () => void;
    accessToken: string | null;
    systemSettings?: SystemSettings;
    onSidebarToggle?: (isOpen: boolean) => void;
}

const EditorTab: React.FC<EditorTabProps> = ({ user, initialData, onSave, onCreateNew, onCancel, accessToken, systemSettings, onSidebarToggle }) => {
    const isPublished = initialData?.status === 'published';

    const [title, setTitle] = useState(initialData?.title || '');
    const [lead, setLead] = useState(initialData?.lead || '');
    const [category, setCategory] = useState(initialData?.category || 'Cotidiano');
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const [slug, setSlug] = useState(initialData?.seo?.slug || '');

    const [bannerType, setBannerType] = useState<'image' | 'video'>(initialData?.bannerMediaType || 'image');

    // Banner Configs
    const [bannerLayout, setBannerLayout] = useState<BannerLayout>(initialData?.bannerLayout || 'single');
    const [bannerTransition, setBannerTransition] = useState<BannerTransition>(initialData?.bannerTransition || 'fade');
    const [bannerDuration, setBannerDuration] = useState<number>(initialData?.bannerDuration || 4000);

    const [mainImageUrl, setMainImageUrl] = useState(initialData?.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200');
    const [bannerImages, setBannerImages] = useState<string[]>(initialData?.bannerImages || [initialData?.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200']);

    const [bannerVideoUrl, setBannerVideoUrl] = useState(initialData?.bannerVideoUrl || '');
    const [videoStart, setVideoStart] = useState<number>(initialData?.videoStart || 0);
    const [videoEnd, setVideoEnd] = useState<number>(initialData?.videoEnd || 0);

    // NEW BANNER SYSTEM States (v1.173+)
    const [bannerImageLayout, setBannerImageLayout] = useState<'carousel' | 'grid' | 'fade' | 'split' | 'mosaic'>(initialData?.bannerImageLayout || 'carousel');
    const [bannerVideoSource, setBannerVideoSource] = useState<'internal' | 'youtube' | null>(initialData?.bannerVideoSource || null);
    const [bannerYoutubeVideoId, setBannerYoutubeVideoId] = useState(initialData?.bannerYoutubeVideoId || '');
    const [bannerYoutubeStatus, setBannerYoutubeStatus] = useState<'uploading' | 'processing' | 'ready' | 'failed'>(initialData?.bannerYoutubeStatus || 'uploading');
    const [bannerYoutubeMetadata, setBannerYoutubeMetadata] = useState<any>(initialData?.bannerYoutubeMetadata || {});
    const [bannerSmartPlayback, setBannerSmartPlayback] = useState(initialData?.bannerSmartPlayback || false);

    // Effects State
    const [bannerEffects, setBannerEffects] = useState<any>(() => {
        if (initialData?.bannerEffects) return initialData.bannerEffects;
        const legacyEffects = initialData?.bannerVideoSettings?.effects;
        if (legacyEffects) return legacyEffects;
        return [{ brightness: 1, contrast: 1, saturation: 1, blur: 0, sepia: 0, opacity: 1 }];
    });

    // Layout & UI State
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
    const [showLibraryMobile, setShowLibraryMobile] = useState(false);
    const [showInspectorMobile, setShowInspectorMobile] = useState(false);
    const [showMobileFormatting, setShowMobileFormatting] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);

    const [socialCaptions, setSocialCaptions] = useState<SocialDistribution[]>(initialData?.socialDistribution || []);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

    // Logic
    const lastScrollY = useRef(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [blocks, setBlocks] = useState<ContentBlock[]>(() => {
        if (initialData?.blocks && initialData.blocks.length > 0) return initialData.blocks;
        else if (initialData?.content) return [{ id: 'legacy_content', type: 'smart_block', content: initialData.content, settings: { width: 'full' } }];
        return [{ id: 'b1', type: 'paragraph', content: '', settings: { alignment: 'left', style: 'serif', thickness: '18', width: 'full' } }];
    });

    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [localPreviews, setLocalPreviews] = useState<Record<string, string>>({});
    const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

    // Publication Hook
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

    // ... (keep useEffect for local previews and scroll handler as they are UI specific) ...
    // Efeito para carregar previews de imagens e vídeos locais ao iniciar
    useEffect(() => {
        const loadLocalPreviews = async () => {
            const allMedia = [...bannerImages, mainImageUrl, bannerVideoUrl].filter(Boolean) as string[];
            const localIds = allMedia.filter(id => id.startsWith('local_') && !localPreviews[id]);
            if (localIds.length === 0) return;
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
            if (hasUpdates) setLocalPreviews(newPreviews);
        };
        loadLocalPreviews();
    }, [bannerImages, mainImageUrl, bannerVideoUrl, localPreviews]);

    const resolveMedia = useCallback((url: string | undefined): string => {
        if (!url) return '';
        if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('http')) return url;
        if (url.startsWith('local_')) return localPreviews[url] || '';
        return url;
    }, [localPreviews]);

    // Scroll Handler
    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current) return;
        const currentScrollY = scrollContainerRef.current.scrollTop;
        if (currentScrollY > 50) {
            if (currentScrollY > lastScrollY.current) { if (isHeaderVisible) setIsHeaderVisible(false); }
            else { if (!isHeaderVisible) setIsHeaderVisible(true); }
        } else { setIsHeaderVisible(true); }
        lastScrollY.current = currentScrollY;
    }, [isHeaderVisible]);

    // Block Handlers
    const handleAddBlock = (type: ContentBlock['type'], content?: any, settings?: any) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newBlock: ContentBlock = {
            id, type, content: content !== undefined ? content : '',
            settings: { alignment: 'left', thickness: '1', width: 'full', variant: 'minimal', iconPosition: 'none', iconName: 'fa-star', color: '#e2e8f0', ...settings }
        };
        setBlocks(prev => [...prev, newBlock]);
        setSelectedBlockId(id);
        if (isMobile) setShowLibraryMobile(false);
        else setIsRightSidebarOpen(true);
    };

    const handleDeleteBlock = useCallback((id: string) => {
        setBlocks(prev => prev.filter(b => b.id !== id));
        setSelectedBlockId(null);
        if (isMobile) { setShowInspectorMobile(false); setShowMobileFormatting(false); }
    }, [isMobile]);

    const handleUpdateBlock = useCallback((updatedBlock: ContentBlock) => {
        setBlocks(prev => prev.map(b => b.id === updatedBlock.id ? updatedBlock : b));
    }, []);

    const handleDuplicateBlock = useCallback((id: string) => {
        const blockToDuplicate = blocks.find(b => b.id === id);
        if (!blockToDuplicate) return;
        const newId = Math.random().toString(36).substr(2, 9);
        const duplicatedBlock: ContentBlock = { ...blockToDuplicate, id: newId };
        const index = blocks.findIndex(b => b.id === id);
        setBlocks(prev => [...prev.slice(0, index + 1), duplicatedBlock, ...prev.slice(index + 1)]);
        setToast({ message: "Bloco duplicado com sucesso", type: 'success' });
    }, [blocks]);

    const handleBannerUpload = useCallback((slot: number, url: string) => {
        const newImages = [...bannerImages];
        newImages[slot] = url;
        if (slot === 0) setMainImageUrl(url);
        setBannerImages(newImages);
    }, [bannerImages]);

    // --- CONSTRUCTION HELPERS ---
    const buildNewsItem = (status: 'draft' | 'published'): NewsItem => {
        // Simple Content Fallback
        const simpleContent = status === 'published' ? (blocks || []).map(b => {
            if (b.type === 'paragraph') return `<p>${b.content}</p>`;
            if (b.type === 'heading') return `<h2>${b.content}</h2>`;
            if (b.type === 'image') return `<img src="${b.content}" alt="Imagem" style="width:100%;" />`;
            if (b.type === 'quote') return `<blockquote>${b.content}</blockquote>`;
            if (b.type === 'list') return b.content;
            if (b.type === 'smart_block') return b.content;
            return '';
        }).join('') : '';

        return {
            id: initialData?.id || (status === 'published' ? self.crypto.randomUUID() : ''),
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
            seo: { slug: slug || title.toLowerCase().replace(/ /g, '-'), metaTitle: title, metaDescription: lead, focusKeyword: '' },
            socialDistribution: socialCaptions,
            // Banner Configs
            bannerLayout, bannerImageLayout, bannerTransition, bannerDuration,
            videoStart, videoEnd,
            bannerYoutubeMetadata,
            // New System Effects (Root Array), fallback to legacy if needed inside hook called
            bannerEffects,
            bannerVideoSettings: {
                muted: true, loop: true, autoplay: true,
                effects: Array.isArray(bannerEffects) ? bannerEffects[0] : bannerEffects
            },
            // Props fillers
            content: simpleContent || lead,
            isBreaking: initialData?.isBreaking || false,
            isFeatured: initialData?.isFeatured || false,
            featuredPriority: initialData?.featuredPriority || 0,
            imageCredits: initialData?.imageCredits || 'Redação LFNM',
            mediaType: initialData?.mediaType || 'image',
            region: initialData?.region || 'Região',
            city: initialData?.city || tags.find(t => ['Lagoa Formosa', 'Patos de Minas'].includes(t)) || 'Lagoa Formosa',
            // Banner V2 specifics
            bannerYoutubeVideoId, bannerYoutubeStatus,
            bannerSmartPlayback,
            isBannerAnimated: bannerImages.length > 1,
        };
    };

    const handleSave = async (forceSocial: boolean = false) => {
        if (!title.trim()) { setToast({ message: "O título é obrigatório.", type: 'error' }); return; }
        const newsData = buildNewsItem(isPublished ? 'published' : 'draft');

        try {
            const result = await saveDraft(newsData, !!initialData?.id, forceSocial);
            // Update local state with processed result
            setMainImageUrl(result.imageUrl);
            setBannerImages(result.bannerImages || []);
            setBlocks(result.blocks || []);
            setBannerVideoUrl(result.bannerVideoUrl || '');
        } catch (e) { } // Hook handles errors
    };

    const handlePublish = async (forceSocial: boolean = false) => {
        if (!title || !lead) { setToast({ message: "Título e Resumo são obrigatórios.", type: 'warning' }); return; }
        const newsData = buildNewsItem('published');

        try {
            const result = await publishNews(newsData, !!initialData?.id, forceSocial);
            // Update local state
            setBlocks(result.blocks || []);
            setBannerImages(result.bannerImages || []);
            if (result.imageUrl) setMainImageUrl(result.imageUrl);
        } catch (e) { }
    };

    const removeBannerImage = (index: number) => {
        if (bannerLayout === 'single' && bannerImages.length <= 1) {
            setToast({ message: "Mínimo 1 imagem necessária.", type: 'warning' });
            return;
        }
        const newImages = [...bannerImages];
        if (requiredSlots > 1) newImages[index] = 'https://placehold.co/800x600?text=Vazio';
        else newImages.splice(index, 1);
        setBannerImages(newImages);
        if (index === 0 && newImages[0]) setMainImageUrl(newImages[0]);
    };

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'missing-client-id';

    // Import dynamically to avoid SSR issues if used, though this is CRA/Vite SPA
    // We need to conditionally render Provider only if client ID exists to avoid early errors
    // But for better UX, we wrap it regardless and the Hook inside YouTubeUploader handles the error logic if ID is missing (already implemented)

    // However, to use the hook, the provider MUST be present.
    // If ID is missing, we pass an empty string or a dummy one, and the hook inside will fail gracefully or we block it there.
    // We already block it in YouTubeVideoUploader if ID is missing.

    // We need to import the provider first:
    // This replace block only handles the Return statement. 
    // I need to add the import at the top first in a separate block? 
    // No, I can try to simply use the import if it was added. 

    // Wait, I haven't added the import of GoogleOAuthProvider yet in this file. 
    // I should do that in a separate block first or include it if I can edit the whole file (too big).
    // I will use multi-replacement to add import AND wrap return.

    // This specific tool call is for the return wrap. I will assume I add the import in the same turn via MultiReplace or a separate call.
    // Actually, I'll switch strategy to use `multi_replace_file_content` to do both at once.
    // ABORTING THIS SINGLE REPLACEMENT to use MULTI-REPLACE below.
    return (
        status = { publishStatus === 'success' ? 'success' : publishStatus === 'error' ? 'error' : 'uploading'}
progress = { uploadProgress }
progressMessage = { progressMessage }
onClose = { resetStatus }
onViewNews = {() => {
    const url = window.location.origin + '/#/news/' + (slug || initialData?.id);
    window.open(url, '_blank');
}}
onCreateNew = { onCreateNew }
isUpdate = {!!initialData?.id}
mode = { publishMode }
authorName = { user.name }
    />


    {/* MOBILE DRAWERS OVERLAY */ }
{
    isMobile && (showLibraryMobile || (showInspectorMobile && selectedBlockId)) && (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1900] animate-fadeIn"
            onClick={() => { setShowLibraryMobile(false); setShowInspectorMobile(false); setSelectedBlockId(null); setShowMobileFormatting(false); }}
        />
    )
}

{/* MOBILE LEFT DRAWER (LIBRARY) */ }
<aside className={`fixed inset-y-0 left-0 z-[2000] w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${showLibraryMobile ? 'translate-x-0' : '-translate-x-full'}`}>
    <EditorSidebar onAddBlock={handleAddBlock} isUploading={!!uploadingSlot} />
</aside>

{/* DESKTOP LEFT SIDEBAR (COLLAPSIBLE) */ }
<aside className={`hidden lg:flex flex-col bg-white border-r border-zinc-200 transition-all duration-300 relative z-20 shadow-[5px_0_15px_rgba(0,0,0,0.02)] ${isLeftSidebarOpen ? 'w-60' : 'w-0 overflow-hidden'}`}>
    <div className="flex-1 overflow-hidden w-60">
        <EditorSidebar onAddBlock={handleAddBlock} isUploading={!!uploadingSlot} />
    </div>
</aside>

{/* MAIN CONTENT AREA */ }
<div className="flex-1 flex flex-col overflow-hidden relative" onClick={() => { if (isMobile) { setShowInspectorMobile(false); setSelectedBlockId(null); setShowMobileFormatting(false); } }}>

    {/* DESKTOP TOGGLE BUTTONS */}
    <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 z-30">
        <button onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} className="bg-black text-white rounded-r-xl p-2 shadow-lg hover:scale-110 transition-all" title="Ferramentas">
            <i className={`fas fa-chevron-${isLeftSidebarOpen ? 'left' : 'right'} text-xs`}></i>
        </button>
    </div>
    <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 z-30">
        <button onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} className="bg-black text-white rounded-l-xl p-2 shadow-lg hover:scale-110 transition-all" title="Propriedades">
            <i className={`fas fa-chevron-${isRightSidebarOpen ? 'right' : 'left'} text-xs`}></i>
        </button>
    </div>

    {/* HEADER */}
    <EditorHeader
        isPublished={isPublished}
        isHeaderVisible={isHeaderVisible}
        initialData={initialData}
        onCancel={onCancel}
        onPublish={() => handlePublish(false)}
        onSaveDraft={() => handleSave(false)}
    />

    {/* SCROLLABLE EDITOR CANVAS */}
    <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto p-4 md:p-10 lg:p-12 custom-scrollbar bg-[#f4f4f7] transition-all duration-300 ${showMobileFormatting ? 'pb-72' : 'pb-28'} md:pb-12`}
    >
        <div className={`w-full max-w-[1000px] mx-auto bg-white rounded-[3rem] shadow-2xl border-2 ${isPublished ? 'border-green-500/30' : 'border-red-600/10'} min-h-full transition-all flex flex-col overflow-hidden relative group/canvas`}>

            {/* Visual Guide Label */}
            <div className="absolute top-4 right-6 z-40 opacity-20 group-hover/canvas:opacity-100 transition-opacity">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">Preview: Leitor</span>
            </div>

            {/* BANNER SECTION - NEW SYSTEM */}
            <EditorBanner
                user={user}

                // Multi-Image State
                bannerImages={bannerImages}
                setBannerImages={setBannerImages}
                bannerImageLayout={bannerImageLayout}
                setBannerImageLayout={setBannerImageLayout}

                // Video State
                bannerMediaType={bannerType}
                setBannerMediaType={setBannerType}
                bannerVideoSource={bannerVideoSource}
                setBannerVideoSource={setBannerVideoSource}
                bannerVideoUrl={bannerVideoUrl}
                setBannerVideoUrl={setBannerVideoUrl}

                // YouTube State
                bannerYoutubeVideoId={bannerYoutubeVideoId}
                setBannerYoutubeVideoId={setBannerYoutubeVideoId}
                bannerYoutubeStatus={bannerYoutubeStatus}
                setBannerYoutubeStatus={setBannerYoutubeStatus}
                bannerYoutubeMetadata={bannerYoutubeMetadata}
                setBannerYoutubeMetadata={setBannerYoutubeMetadata}

                // Smart Playback
                bannerSmartPlayback={bannerSmartPlayback}
                setBannerSmartPlayback={setBannerSmartPlayback}

                // Effects
                bannerEffects={bannerEffects}
                setBannerEffects={setBannerEffects}

                // Local Previews
                localPreviews={localPreviews}

                // Callbacks for transactional upload
                onImageUpload={async (file) => {
                    console.log('📸 Storing image locally:', file.name);
                    const localId = await storeLocalFile(file);

                    // Set preview immediately
                    const blobUrl = URL.createObjectURL(file);
                    setLocalPreviews(prev => ({ ...prev, [localId]: blobUrl }));

                    return localId;
                }}
                onVideoUpload={async (file, source) => {
                    console.log('🎥 Storing video locally:', file.name, 'Source:', source);
                    const localId = await storeLocalFile(file);

                    // Set preview immediately
                    const blobUrl = URL.createObjectURL(file);
                    setLocalPreviews(prev => ({ ...prev, [localId]: blobUrl }));

                    setBannerVideoSource(source);
                    return localId;
                }}
            />

            <div className="p-6 md:p-16 lg:p-20" onClick={(e) => e.stopPropagation()}>
                {/* METADATA (Title, Lead, Tags) */}
                <EditorMeta
                    title={title} setTitle={setTitle}
                    lead={lead} setLead={setLead}
                    category={category} setCategory={setCategory}
                    tags={tags} setTags={setTags}
                />

                {/* BLOCKS CANVAS */}
                <EditorCanvas
                    blocks={blocks}
                    selectedBlockId={selectedBlockId}
                    isMobile={isMobile}
                    uploadingSlot={uploadingSlot}
                    showMobileFormatting={showMobileFormatting}
                    onBlockSelect={(id) => {
                        setSelectedBlockId(id);
                        if (isMobile) { setShowLibraryMobile(false); }
                    }}
                    onDeleteBlock={handleDeleteBlock}
                    onUpdateBlock={handleUpdateBlock}
                    onShowInspectorMobile={() => { setShowInspectorMobile(true); setShowMobileFormatting(false); }}
                    setShowMobileFormatting={setShowMobileFormatting}
                    localFileHandler={storeLocalFile}
                    accessToken={accessToken}
                    onDuplicateBlock={handleDuplicateBlock}
                />

                {/* BOTÃO PUBLICAR MOBILE */}
                <div className="md:hidden mt-12 pb-8 border-t border-zinc-100 pt-8">
                    <button
                        onClick={() => handlePublish(false)}
                        className="w-full bg-red-600 text-white py-4 rounded-full font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <i className="fas fa-paper-plane"></i> {isPublished ? 'Atualizar Matéria' : 'Publicar Reportagem'}
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

{/* MOBILE BOTTOM NAV */ }
{
    isMobile && (
        <div className="fixed bottom-4 left-4 right-4 h-16 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] z-[1800] flex justify-between items-center px-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all animate-slideUp">
            <div className="flex items-center gap-4">
                <button onClick={onCancel} className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors" title="Voltar">
                    <i className="fas fa-arrow-left"></i>
                </button>
                {selectedBlockId && blocks.find(b => b.id === selectedBlockId && ['paragraph', 'heading', 'quote', 'list'].includes(b.type)) && (
                    <button onClick={() => { setShowMobileFormatting(!showMobileFormatting); setShowInspectorMobile(false); setShowLibraryMobile(false); }} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showMobileFormatting ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
                        <i className="fas fa-font"></i>
                    </button>
                )}
            </div>
            <div className={`absolute left-1/2 -top-6 -translate-x-1/2 transition-all duration-300 ${showMobileFormatting ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                <button onClick={() => { setShowLibraryMobile(true); setShowMobileFormatting(false); }} className="w-16 h-16 bg-red-600 rounded-full text-white shadow-[0_4px_20px_rgba(220,38,38,0.5)] flex items-center justify-center border-[6px] border-[#f4f4f7] hover:scale-110 active:scale-95 transition-all">
                    <i className="fas fa-plus text-2xl"></i>
                </button>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => { if (selectedBlockId) { setShowInspectorMobile(true); setShowMobileFormatting(false); } else setToast({ message: "Selecione um bloco primeiro", type: 'info' }); }} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${selectedBlockId && !showMobileFormatting && !showLibraryMobile ? 'text-blue-400 bg-blue-500/20' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
                    <i className="fas fa-sliders-h"></i>
                </button>
                <button onClick={() => handlePublish(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-green-500 hover:text-white hover:bg-green-600/20 transition-all" title="Publicar">
                    <i className="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    )
}

{/* MOBILE RIGHT DRAWER (INSPECTOR) */ }
<aside className={`fixed inset-y-0 right-0 z-[2000] w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${showInspectorMobile ? 'translate-x-0' : 'translate-x-full'}`}>
    <InspectorSidebar
        block={blocks.find(b => b.id === selectedBlockId) || null}
        onUpdate={handleUpdateBlock}
        onDelete={handleDeleteBlock}
        onClose={() => setShowInspectorMobile(false)}
        accessToken={accessToken}
        newsMetadata={{ slug, setSlug, category, setCategory, title, lead, socialCaptions, setSocialCaptions }}
    />
</aside>

{/* DESKTOP RIGHT SIDEBAR (COLLAPSIBLE) */ }
<aside className={`hidden lg:flex flex-col bg-white transition-all duration-300 relative z-20 shadow-[-5px_0_15px_rgba(0,0,0,0.02)] ${isRightSidebarOpen ? 'w-80 md:w-96 border-l border-zinc-200' : 'w-0 overflow-hidden border-none'}`}>
    <div className="flex-1 overflow-hidden w-80 md:w-96">
        <InspectorSidebar
            block={blocks.find(b => b.id === selectedBlockId) || null}
            onUpdate={handleUpdateBlock}
            onDelete={handleDeleteBlock}
            onClose={() => setIsRightSidebarOpen(false)}
            accessToken={accessToken}
            newsMetadata={{ slug, setSlug, category, setCategory, title, lead, socialCaptions, setSocialCaptions }}
        />
    </div>
</aside>
        </div >
    );
};
export default EditorTab;
