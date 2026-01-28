
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { User, NewsItem, SystemSettings, ContentBlock } from '../../types';
import Toast, { ToastType } from '../common/Toast';

import EditorSidebar from './editor/layout/EditorSidebar';
import InspectorSidebar from './editor/layout/InspectorSidebar';
import { storeLocalFile } from '../../services/storage/localStorageService';

// Custom Hooks
import { useEditorController } from './editor/hooks/useEditorController';

// Components
import { EditorHeader } from './editor/EditorHeader';
import { EditorBanner } from './editor/banner/EditorBannerNew';
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
    darkMode?: boolean;
    onEditorToolsChange?: (isOpen: boolean) => void;
}

const EditorTab: React.FC<EditorTabProps> = ({ user, initialData, onSave, onCreateNew, onCancel, accessToken, systemSettings, darkMode = false, onEditorToolsChange }) => {
    const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

    // Controller Hook
    const ctrl = useEditorController({ user, initialData, onSave, systemSettings, setToast });

    // Internal Navigation Guard
    const handleCancel = () => {
        if (ctrl.isDirty) {
            if (window.confirm("Você tem alterações não salvas. Tem certeza que deseja sair?")) {
                onCancel();
            }
        } else {
            onCancel();
        }
    };

    // UI State
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
    const [showLibraryMobile, setShowLibraryMobile] = useState(false);
    const [showInspectorMobile, setShowInspectorMobile] = useState(false);
    const [showMobileFormatting, setShowMobileFormatting] = useState(false);
    const [isMobile] = useState(window.innerWidth < 1024);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);

    const lastScrollY = useRef(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

    // DEBUG GOOGLE CONFIG
    useEffect(() => {
        console.log('📡 [GOOGLE AUTH DEBUG] EditorTab Client ID:', googleClientId ? `${googleClientId.substring(0, 10)}...` : 'Vazio/Inexistente'); // eslint-disable-line no-console
    }, [googleClientId]);

    // Notificar quando o sidebar de ferramentas abrir/fechar
    useEffect(() => {
        if (onEditorToolsChange && !isMobile) {
            onEditorToolsChange(isLeftSidebarOpen);
        }
    }, [isLeftSidebarOpen, onEditorToolsChange, isMobile]);

    // Scroll Handler
    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current) { return; }
        const currentScrollY = scrollContainerRef.current.scrollTop;
        if (currentScrollY > 50) {
            if (currentScrollY > lastScrollY.current) { if (isHeaderVisible) { setIsHeaderVisible(false); } }
            else { if (!isHeaderVisible) { setIsHeaderVisible(true); } }
        } else { setIsHeaderVisible(true); }
        lastScrollY.current = currentScrollY;
    }, [isHeaderVisible]);

    const handleAddBlockWrapper = (type: ContentBlock['type'], content?: unknown, settings?: any) => {
        ctrl.handleAddBlock(type, content, settings);
        if (isMobile) { setShowLibraryMobile(false); }
        else { setIsRightSidebarOpen(true); }
    };

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <div className={`flex flex-col h-full transition-colors ${darkMode ? 'bg-[#0F0F0F]' : 'bg-[#f4f4f7]'}`}>
                {/* MOBILE OVERLAYS */}
                {isMobile && (showLibraryMobile || (showInspectorMobile && ctrl.selectedBlockId)) && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1900] animate-fadeIn"
                        onClick={() => { setShowLibraryMobile(false); setShowInspectorMobile(false); ctrl.setSelectedBlockId(null); setShowMobileFormatting(false); }} />
                )}

                {/* MOBILE LIBRARY DRAWER */}
                <aside className={`fixed inset-y-0 left-0 z-[2000] w-72 shadow-2xl transition-transform duration-300 lg:hidden ${showLibraryMobile ? 'translate-x-0' : '-translate-x-full'} ${darkMode ? 'bg-black border-r border-white/5' : 'bg-white'}`}>
                    <EditorSidebar onAddBlock={handleAddBlockWrapper} isUploading={!!ctrl.uploadingSlot} darkMode={darkMode} />
                </aside>

                {/* MOBILE INSPECTOR DRAWER */}
                <aside className={`fixed inset-y-0 right-0 z-[2000] w-80 shadow-2xl transition-transform duration-300 lg:hidden ${showInspectorMobile ? 'translate-x-0' : 'translate-x-full'} ${darkMode ? 'bg-black border-l border-white/5' : 'bg-white'}`}>
                    <div className="flex-1 overflow-hidden h-full">
                        <InspectorSidebar
                            block={ctrl.blocks.find(b => b.id === ctrl.selectedBlockId) || null}
                            onUpdate={ctrl.handleUpdateBlock}
                            onDelete={(id) => { ctrl.handleDeleteBlock(id); setShowInspectorMobile(false); }}
                            onClose={() => setShowInspectorMobile(false)}
                            accessToken={accessToken}
                            newsMetadata={{
                                slug: ctrl.slug, setSlug: ctrl.setSlug,
                                category: ctrl.category, setCategory: ctrl.setCategory,
                                title: ctrl.title, lead: ctrl.lead,
                                socialCaptions: ctrl.socialCaptions, setSocialCaptions: ctrl.setSocialCaptions,
                                // New SEO Props
                                seoTitle: ctrl.seoTitle, setSeoTitle: ctrl.setSeoTitle,
                                seoDescription: ctrl.seoDescription, setSeoDescription: ctrl.setSeoDescription,
                                focusKeyword: ctrl.focusKeyword, setFocusKeyword: ctrl.setFocusKeyword,
                                canonicalUrl: ctrl.canonicalUrl, setCanonicalUrl: ctrl.setCanonicalUrl
                            }}
                            darkMode={darkMode}
                        />
                    </div>
                </aside>

                <div className="flex-1 flex overflow-hidden relative">
                    {/* DESKTOP LEFT SIDEBAR */}
                    <aside className={`hidden lg:flex flex-col border-r transition-all duration-300 relative z-20 ${isLeftSidebarOpen ? 'w-52 xl:w-60' : 'w-0 overflow-hidden'} ${darkMode ? 'bg-black border-white/5' : 'bg-white border-zinc-200'}`}>
                        <div className="flex-1 overflow-hidden w-52 xl:w-60">
                            <EditorSidebar onAddBlock={handleAddBlockWrapper} isUploading={!!ctrl.uploadingSlot} darkMode={darkMode} />
                        </div>
                    </aside>

                    {/* MAIN CONTENT */}
                    <div className="flex-1 flex flex-col overflow-hidden relative min-w-0" onClick={() => { if (isMobile) { setShowInspectorMobile(false); ctrl.setSelectedBlockId(null); setShowMobileFormatting(false); } }}>
                        {/* TOGGLES */}
                        <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 z-30">
                            <button onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} className="bg-black text-white rounded-r-xl p-2 shadow-lg hover:scale-110 transition-all">
                                <i className={`fas fa-chevron-${isLeftSidebarOpen ? 'left' : 'right'} text-xs`}></i>
                            </button>
                        </div>
                        <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 z-30">
                            <button onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} className="bg-black text-white rounded-l-xl p-2 shadow-lg hover:scale-110 transition-all">
                                <i className={`fas fa-chevron-${isRightSidebarOpen ? 'right' : 'left'} text-xs`}></i>
                            </button>
                        </div>

                        {/* HEADER */}
                        <div className={`shrink-0 border-b z-40 relative ${darkMode ? 'bg-black border-white/5' : 'bg-white border-zinc-200'}`}>
                            <EditorHeader
                                isPublished={ctrl.isPublished} isHeaderVisible={isHeaderVisible}
                                initialData={initialData} onCancel={handleCancel}
                                onPublish={ctrl.handlePublishLocal} onSaveDraft={ctrl.handleSaveLocal}
                            />
                        </div>

                        {/* CANVAS */}
                        <div ref={scrollContainerRef} onScroll={handleScroll} className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 xl:p-12 custom-scrollbar transition-all duration-300 ${showMobileFormatting ? 'pb-72' : 'pb-28'} md:pb-12 ${darkMode ? 'bg-[#0F0F0F]' : 'bg-[#f4f4f7]'}`}>
                            <div className={`w-full max-w-[700px] lg:max-w-[600px] xl:max-w-[900px] 2xl:max-w-[1000px] mx-auto rounded-[1.5rem] md:rounded-[3rem] shadow-2xl border-2 ${ctrl.isPublished ? 'border-green-500/30' : 'border-red-600/10'} min-h-full transition-all flex flex-col overflow-hidden relative bg-white`}>
                                <EditorBanner
                                    user={user}
                                    bannerImages={ctrl.bannerImages} setBannerImages={ctrl.setBannerImages}
                                    bannerImageLayout={ctrl.bannerImageLayout} setBannerImageLayout={ctrl.setBannerImageLayout}
                                    bannerMediaType={ctrl.bannerType} setBannerMediaType={ctrl.setBannerType}
                                    bannerVideoSource={ctrl.bannerVideoSource} setBannerVideoSource={ctrl.setBannerVideoSource}
                                    bannerVideoUrl={ctrl.bannerVideoUrl} setBannerVideoUrl={ctrl.setBannerVideoUrl}
                                    bannerYoutubeVideoId={ctrl.bannerYoutubeVideoId} setBannerYoutubeVideoId={ctrl.setBannerYoutubeVideoId}
                                    bannerYoutubeStatus={ctrl.bannerYoutubeStatus} setBannerYoutubeStatus={ctrl.setBannerYoutubeStatus}
                                    bannerYoutubeMetadata={ctrl.bannerYoutubeMetadata} setBannerYoutubeMetadata={ctrl.setBannerYoutubeMetadata}
                                    bannerSmartPlayback={ctrl.bannerSmartPlayback} setBannerSmartPlayback={ctrl.setBannerSmartPlayback}
                                    bannerEffects={Array.isArray(ctrl.bannerEffects) ? ctrl.bannerEffects : (ctrl.bannerEffects ? [ctrl.bannerEffects] : [])} setBannerEffects={ctrl.setBannerEffects}
                                    videoStart={ctrl.videoStart} setVideoStart={ctrl.setVideoStart}
                                    videoEnd={ctrl.videoEnd} setVideoEnd={ctrl.setVideoEnd}
                                    localPreviews={ctrl.localPreviews}
                                    onImageUpload={async (file) => {
                                        const localId = await storeLocalFile(file);
                                        ctrl.resolveMedia(`local_${localId}`); // update previews implicitly via effect
                                        return localId;
                                    }}
                                    onVideoUpload={async (file, source) => {
                                        const localId = await storeLocalFile(file);
                                        ctrl.setBannerVideoSource(source);
                                        return localId;
                                    }}
                                />

                                <div className="p-4 sm:p-8 md:p-16 lg:p-20" onClick={(e) => e.stopPropagation()}>
                                    <EditorMeta
                                        title={ctrl.title} setTitle={ctrl.setTitle}
                                        lead={ctrl.lead} setLead={ctrl.setLead}
                                        category={ctrl.category} setCategory={ctrl.setCategory}
                                        tags={ctrl.tags} setTags={ctrl.setTags}
                                    />
                                    <EditorCanvas
                                        user={user}
                                        blocks={ctrl.blocks} selectedBlockId={ctrl.selectedBlockId} isMobile={isMobile}
                                        uploadingSlot={ctrl.uploadingSlot} showMobileFormatting={showMobileFormatting}
                                        onBlockSelect={(id) => { ctrl.setSelectedBlockId(id); if (isMobile) { setShowLibraryMobile(false); } }}
                                        onDeleteBlock={ctrl.handleDeleteBlock} onUpdateBlock={ctrl.handleUpdateBlock}
                                        onShowInspectorMobile={() => { setShowInspectorMobile(true); setShowMobileFormatting(false); }}
                                        setShowMobileFormatting={setShowMobileFormatting} localFileHandler={storeLocalFile}
                                        accessToken={accessToken} onDuplicateBlock={ctrl.handleDuplicateBlock}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DESKTOP RIGHT SIDEBAR */}
                    <aside className={`hidden lg:flex flex-col transition-all duration-300 relative z-20 ${isRightSidebarOpen ? 'w-64 xl:w-72 2xl:w-80 border-l' : 'w-0 overflow-hidden border-none'} ${darkMode ? 'bg-black border-white/5' : 'bg-white border-zinc-200'}`}>
                        <div className="flex-1 overflow-hidden w-64 xl:w-72 2xl:w-80">
                            <InspectorSidebar
                                block={ctrl.blocks.find(b => b.id === ctrl.selectedBlockId) || null}
                                onUpdate={ctrl.handleUpdateBlock} onDelete={ctrl.handleDeleteBlock}
                                onClose={() => setIsRightSidebarOpen(false)} accessToken={accessToken}
                                newsMetadata={{
                                    slug: ctrl.slug, setSlug: ctrl.setSlug,
                                    category: ctrl.category, setCategory: ctrl.setCategory,
                                    title: ctrl.title, lead: ctrl.lead,
                                    socialCaptions: ctrl.socialCaptions, setSocialCaptions: ctrl.setSocialCaptions,
                                    // New SEO Props
                                    seoTitle: ctrl.seoTitle, setSeoTitle: ctrl.setSeoTitle,
                                    seoDescription: ctrl.seoDescription, setSeoDescription: ctrl.setSeoDescription,
                                    focusKeyword: ctrl.focusKeyword, setFocusKeyword: ctrl.setFocusKeyword,
                                    canonicalUrl: ctrl.canonicalUrl, setCanonicalUrl: ctrl.setCanonicalUrl,
                                    onRegenerateSEO: ctrl.handleRegenerateSEO
                                }}
                                darkMode={darkMode}
                            />
                        </div>
                    </aside>
                </div>

                {isMobile && (
                    <div className="fixed bottom-4 left-4 right-4 h-16 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] z-[1800] flex justify-between items-center px-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all animate-slideUp">
                        <div className="flex items-center gap-4">
                            <button onClick={handleCancel} className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white"><i className="fas fa-arrow-left"></i></button>
                            {ctrl.selectedBlockId && <button onClick={() => setShowMobileFormatting(!showMobileFormatting)} className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400"><i className="fas fa-font"></i></button>}
                        </div>
                        <div className="absolute left-1/2 -top-6 -translate-x-1/2">
                            <button onClick={() => { setShowLibraryMobile(true); setShowMobileFormatting(false); }} className="w-16 h-16 bg-red-600 rounded-full text-white shadow-[0_4px_20px_rgba(220,38,38,0.5)] flex items-center justify-center border-[6px] border-[#f4f4f7] hover:scale-110"><i className="fas fa-plus text-2xl"></i></button>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => ctrl.selectedBlockId && setShowInspectorMobile(true)} className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400"><i className="fas fa-sliders-h"></i></button>
                            <button onClick={() => ctrl.handlePublishLocal(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-green-500"><i className="fas fa-paper-plane"></i></button>
                        </div>
                    </div>
                )}

                <PublishSuccessModal
                    isOpen={ctrl.publishStatus !== 'idle'}
                    status={ctrl.publishStatus === 'idle' ? 'idle' :
                        (ctrl.publishStatus === 'uploading' || ctrl.publishStatus === 'distributing') ? 'uploading' :
                            ctrl.publishStatus === 'success' ? 'success' : 'error'}
                    progress={ctrl.uploadProgress}
                    progressMessage={ctrl.progressMessage}
                    onClose={ctrl.resetStatus}
                    onCreateNew={onCreateNew}
                    onViewNews={() => window.open(`/news/view?slug=${ctrl.slug || initialData?.seo?.slug || initialData?.id || ''}`, '_blank')}
                    isUpdate={!!initialData?.id}
                    mode={ctrl.publishMode}
                    authorName={user.name}
                    totalFiles={ctrl.totalFiles}
                    currentFileIndex={ctrl.currentFileIndex}
                />

                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </div>
        </GoogleOAuthProvider>
    );
};

export default EditorTab;
