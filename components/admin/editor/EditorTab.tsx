
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, NewsItem, ContentBlock, SystemSettings, SocialDistribution, BannerLayout, BannerTransition } from '../../../types';
import { dispatchSocialWebhook } from '../../../services/integrationService';
import Toast, { ToastType } from '../../common/Toast';

import EditorHeader from './layout/EditorHeader';
import EditorBanner from './layout/EditorBanner';
import EditorContent from './layout/EditorContent';
import EditorMobileDock from './layout/EditorMobileDock';
import EditorSidebar from './layout/EditorSidebar';
import InspectorSidebar from '../InspectorSidebar';
import SocialDistributionOverlay from '../SocialDistributionOverlay';

interface EditorTabProps {
    user: User;
    initialData: NewsItem | null;
    onSave: (news: NewsItem, isUpdate: boolean) => void;
    onCancel: () => void;
    accessToken: string | null;
    systemSettings?: SystemSettings;
    onSidebarToggle?: (isOpen: boolean) => void;
}

const EditorTab: React.FC<EditorTabProps> = ({ user, initialData, onSave, onCancel, accessToken, systemSettings, onSidebarToggle }) => {
    console.log('🟢 [EditorTab] COMPONENT LOADED - User:', user?.email);
    const isPublished = initialData?.status === 'published';

    // State
    const [title, setTitle] = useState(initialData?.title || '');
    const [lead, setLead] = useState(initialData?.lead || '');
    const [category, setCategory] = useState(initialData?.category || 'Cotidiano');
    const [slug, setSlug] = useState(initialData?.seo?.slug || '');
    const [bannerType, setBannerType] = useState<'image' | 'video'>(initialData?.bannerMediaType || 'image');
    const [bannerLayout, setBannerLayout] = useState<BannerLayout>(initialData?.bannerLayout || 'single');
    const [bannerTransition, setBannerTransition] = useState<BannerTransition>(initialData?.bannerTransition || 'fade');
    const [bannerDuration, setBannerDuration] = useState<number>(initialData?.bannerDuration || 4000);
    const [mainImageUrl, setMainImageUrl] = useState(initialData?.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200');
    const [bannerImages, setBannerImages] = useState<string[]>(initialData?.bannerImages || [initialData?.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200']);
    const [bannerVideoUrl, setBannerVideoUrl] = useState(initialData?.bannerVideoUrl || '');
    const [bannerVideoConfig, setBannerVideoConfig] = useState(initialData?.bannerVideoSettings || {
        muted: true,
        loop: true,
        autoplay: true,
        effects: { brightness: 100, contrast: 100, saturation: 100, blur: 0, sepia: 0, opacity: 100 }
    });
    const [videoStart, setVideoStart] = useState<number>(initialData?.videoStart || 0);
    const [videoEnd, setVideoEnd] = useState<number>(initialData?.videoEnd || 0);
    const [blocks, setBlocks] = useState<ContentBlock[]>(() => {
        if (initialData?.blocks && initialData.blocks.length > 0) { return initialData.blocks; }
        if (initialData?.content) { return [{ id: 'legacy_content', type: 'smart_block', content: initialData.content, settings: { width: 'full' } }]; }
        return [{ id: 'b1', type: 'paragraph', content: '', settings: { alignment: 'left', style: 'serif', thickness: '18', width: 'full' } }];
    });
    const [socialCaptions, setSocialCaptions] = useState<SocialDistribution[]>(initialData?.socialDistribution || []);

    // UI Layout State
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(window.innerWidth >= 1024);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(window.innerWidth >= 1024);
    const [showLibraryMobile, setShowLibraryMobile] = useState(false);
    const [showInspectorMobile, setShowInspectorMobile] = useState(false);
    const [showMobileFormatting, setShowMobileFormatting] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
    const [publishStatus, setPublishStatus] = useState<'idle' | 'uploading' | 'distributing' | 'success' | 'error' | 'report'>('idle');
    const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

    const lastScrollY = useRef(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Required Slots Calculation
    const requiredSlots = ({ single: 1, split: 2, mosaic: 3, grid: 4, slider: 5 } as any)[bannerLayout] || 1;

    // Effects
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) { setIsLeftSidebarOpen(false); setIsRightSidebarOpen(false); }
            else { setIsLeftSidebarOpen(true); setIsRightSidebarOpen(true); }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (bannerImages.length < requiredSlots) {
            const filler = bannerImages[0] || mainImageUrl;
            setBannerImages([...bannerImages, ...Array(requiredSlots - bannerImages.length).fill(filler)]);
        }
    }, [bannerLayout, requiredSlots, bannerImages, mainImageUrl]);

    useEffect(() => {
        if (onSidebarToggle) {
            const sidebarActive = isMobile ? (showLibraryMobile || (showInspectorMobile && selectedBlockId) || showMobileFormatting) : (isLeftSidebarOpen || isRightSidebarOpen);
            onSidebarToggle(!!sidebarActive);
        }
    }, [isLeftSidebarOpen, isRightSidebarOpen, showLibraryMobile, showInspectorMobile, showMobileFormatting, selectedBlockId, isMobile, onSidebarToggle]);

    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current) { return; }
        const currentScrollY = scrollContainerRef.current.scrollTop;
        if (currentScrollY > 50) {
            if (currentScrollY > lastScrollY.current) { if (isHeaderVisible) { setIsHeaderVisible(false); } }
            else { if (!isHeaderVisible) { setIsHeaderVisible(true); } }
        } else {
            setIsHeaderVisible(true);
        }
        lastScrollY.current = currentScrollY;
    }, [isHeaderVisible]);

    // Handlers
    const handleAddBlock = (type: ContentBlock['type'], content?: any, settings?: any) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newBlock: ContentBlock = {
            id, type, content: content !== undefined ? content : '',
            settings: { alignment: 'left', thickness: '1', width: 'full', variant: 'minimal', iconPosition: 'none', iconName: 'fa-star', color: '#e2e8f0', ...settings }
        };
        setBlocks(prev => [...prev, newBlock]);
        setSelectedBlockId(id);
        if (isMobile) { setShowLibraryMobile(false); }
        else { setIsRightSidebarOpen(true); }
    };

    const handleDeleteBlock = useCallback((id: string) => {
        setBlocks(prev => prev.filter(b => b.id !== id));
        setSelectedBlockId(null);
        if (isMobile) { setShowInspectorMobile(false); setShowMobileFormatting(false); }
    }, [isMobile]);

    const handleUpdateBlock = useCallback((updatedBlock: ContentBlock) => {
        setBlocks(prev => prev.map(b => b.id === updatedBlock.id ? updatedBlock : b));
    }, []);

    const handlePublish = async (isUpdate: boolean, forceSocial: boolean = false) => {
        if (!title || !lead) {
            setToast({ message: "Título e Resumo são obrigatórios.", type: 'warning' });
            return;
        }

        setPublishStatus(forceSocial ? 'distributing' : 'uploading');

        // Render HTML content for legacy support
        const simpleContent = blocks.map(b => {
            if (b.type === 'paragraph') { return `<p>${b.content}</p>`; }
            if (b.type === 'heading') { return `<h2>${b.content}</h2>`; }
            if (b.type === 'image') { return `<img src="${b.content}" alt="Imagem" style="width:100%;" />`; }
            if (b.type === 'quote') { return `<blockquote>${b.content}</blockquote>`; }
            if (b.type === 'list') { return b.content; }
            if (b.type === 'smart_block') { return b.content; }
            return '';
        }).join('');

        const newsData: NewsItem = {
            id: initialData?.id || '', // Let backend generate ID if empty
            title, lead, category, blocks, status: 'published',
            author: user.name, authorId: user.id, createdAt: initialData?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            imageUrl: bannerImages[0] || mainImageUrl,
            bannerMediaType: bannerType, bannerLayout, bannerTransition, bannerImages: bannerImages.slice(0, requiredSlots),
            bannerVideoUrl, bannerDuration, videoStart, videoEnd, bannerVideoSettings: bannerVideoConfig,
            isBannerAnimated: bannerImages.length > 1, imageCredits: 'Redação LFNM', mediaType: 'image', city: 'Lagoa Formosa', region: 'Região',
            isBreaking: false, isFeatured: false, featuredPriority: 0,
            seo: { slug: slug || title.toLowerCase().replace(/ /g, '-'), metaTitle: title, metaDescription: lead, focusKeyword: '' },
            source: 'site', socialDistribution: socialCaptions, content: simpleContent || lead,
            views: initialData?.views || 0
        };

        try {
            if ((!isUpdate || forceSocial) && systemSettings?.enableOmnichannel) {
                await dispatchSocialWebhook(newsData);
            }
            onSave(newsData, isUpdate);
            setPublishStatus('success');
        } catch (e) {
            console.error(e);
            setPublishStatus('error');
            setToast({ message: "Erro ao publicar. Verifique o console.", type: 'error' });
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f4f4f7] animate-fadeIn relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <SocialDistributionOverlay status={publishStatus} distributions={socialCaptions} onClose={() => setPublishStatus('idle')} />

            {/* OVERLAYS MOBILE */}
            {isMobile && (showLibraryMobile || (showInspectorMobile && selectedBlockId)) && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1900] animate-fadeIn"
                    onClick={() => { setShowLibraryMobile(false); setShowInspectorMobile(false); setSelectedBlockId(null); setShowMobileFormatting(false); }} />
            )}

            {/* SIDEBARS */}
            <aside className={`fixed inset-y-0 left-0 z-[2000] w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${showLibraryMobile ? 'translate-x-0' : '-translate-x-full'}`}>
                <EditorSidebar onAddBlock={handleAddBlock} isUploading={!!uploadingSlot} />
            </aside>
            <aside className={`hidden lg:flex flex-col bg-white border-r border-zinc-200 transition-all duration-300 relative z-20 shadow-[5px_0_15px_rgba(0,0,0,0.02)] ${isLeftSidebarOpen ? 'w-60' : 'w-0 overflow-hidden'}`}>
                <div className="flex-1 overflow-hidden w-60">
                    <EditorSidebar onAddBlock={handleAddBlock} isUploading={!!uploadingSlot} />
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col overflow-hidden relative" onClick={() => { if (isMobile) { setShowInspectorMobile(false); setSelectedBlockId(null); setShowMobileFormatting(false); } }}>

                {/* Desktop Toggles */}
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

                <EditorHeader
                    isPublished={isPublished}
                    publishStatus={publishStatus}
                    isHeaderVisible={isHeaderVisible}
                    onCancel={onCancel}
                    onPublish={handlePublish}
                    initialNewsId={initialData?.id}
                />

                {/* EDITOR CANVAS */}
                <div ref={scrollContainerRef} onScroll={handleScroll} className={`flex-1 overflow-y-auto p-4 md:p-10 lg:p-12 custom-scrollbar bg-[#f4f4f7] transition-all duration-300 ${showMobileFormatting ? 'pb-72' : 'pb-28'} md:pb-12`}>
                    <div className={`w-full max-w-[1000px] mx-auto bg-white rounded-[3rem] shadow-2xl border-2 ${isPublished ? 'border-green-500/30' : 'border-red-600/10'} min-h-full transition-all flex flex-col overflow-hidden relative group/canvas`}>
                        <div className="absolute top-4 right-6 z-40 opacity-20 group-hover/canvas:opacity-100 transition-opacity">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">Preview: Leitor</span>
                        </div>

                        <EditorBanner
                            user={user}
                            bannerType={bannerType} setBannerType={setBannerType}
                            bannerLayout={bannerLayout} setBannerLayout={setBannerLayout}
                            bannerTransition={bannerTransition} setBannerTransition={setBannerTransition}
                            bannerDuration={bannerDuration} setBannerDuration={setBannerDuration}
                            bannerImages={bannerImages} setBannerImages={setBannerImages}
                            mainImageUrl={mainImageUrl} setMainImageUrl={setMainImageUrl}
                            bannerVideoUrl={bannerVideoUrl} setBannerVideoUrl={setBannerVideoUrl}
                            bannerVideoConfig={bannerVideoConfig} setBannerVideoConfig={setBannerVideoConfig}
                            requiredSlots={requiredSlots}
                            setToast={(t) => setToast({ message: t.message, type: t.type as ToastType })}
                        />

                        <EditorContent
                            blocks={blocks}
                            selectedBlockId={selectedBlockId}
                            isMobile={isMobile}
                            category={category} setCategory={setCategory}
                            title={title} setTitle={setTitle}
                            lead={lead} setLead={setLead}
                            isPublished={isPublished}
                            uploadingSlot={uploadingSlot}
                            handleBlockSelect={(id) => { setSelectedBlockId(id); if (isMobile) { setShowLibraryMobile(false); setShowInspectorMobile(true); } else { setIsRightSidebarOpen(true); } }}
                            handleDeleteBlock={handleDeleteBlock}
                            handleUpdateBlock={handleUpdateBlock}
                            setShowInspectorMobile={setShowInspectorMobile}
                            setShowMobileFormatting={setShowMobileFormatting}
                            showMobileFormatting={showMobileFormatting}
                            onPublishPhone={() => handlePublish(isPublished)}
                            accessToken={accessToken}
                        />
                    </div>
                </div>
            </div>

            {/* MOBILE BOTTOM NAV */}
            {isMobile && (
                <EditorMobileDock
                    onCancel={onCancel}
                    onAddClick={() => { setShowLibraryMobile(!showLibraryMobile); setShowMobileFormatting(false); setShowInspectorMobile(false); }}
                    onPublish={() => handlePublish(isPublished)}
                    onInspectorToggle={() => { if (selectedBlockId) { setShowInspectorMobile(!showInspectorMobile); setShowMobileFormatting(false); } else { setToast({ message: "Selecione um bloco primeiro", type: 'info' }); } }}
                    onFormattingToggle={() => { setShowMobileFormatting(!showMobileFormatting); setShowInspectorMobile(false); setShowLibraryMobile(false); }}
                    isFormattingOpen={showMobileFormatting}
                    isInspectorOpen={showInspectorMobile}
                    isLibraryOpen={showLibraryMobile}
                    isTextBlockSelected={!!selectedBlockId && blocks.find(b => b.id === selectedBlockId && ['paragraph', 'heading', 'quote', 'list'].includes(b.type)) !== undefined}
                    selectedBlockId={selectedBlockId}
                />
            )}

            {/* INSPECTOR SIDEBAR */}
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
            <aside className={`hidden lg:flex flex-col bg-white border-l border-zinc-200 transition-all duration-300 relative z-20 shadow-[-5px_0_15px_rgba(0,0,0,0.02)] ${isRightSidebarOpen ? 'w-80 md:w-96' : 'w-0 overflow-hidden'}`}>
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
        </div>
    );
};

export default EditorTab;