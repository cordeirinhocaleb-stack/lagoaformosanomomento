
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { User, NewsItem, SystemSettings } from '../../types';
import Toast, { ToastType } from '../common/Toast';

import EditorSidebar from './editor/EditorSidebar';
import InspectorSidebar from './InspectorSidebar';
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
}

const EditorTab: React.FC<EditorTabProps> = ({ user, initialData, onSave, onCreateNew, onCancel, accessToken, systemSettings, darkMode = false }) => {
    const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

    // Controller Hook
    const ctrl = useEditorController({ user, initialData, onSave, systemSettings, setToast });

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
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

    // DEBUG GOOGLE CONFIG
    useEffect(() => {
        console.log('📡 [GOOGLE AUTH DEBUG] EditorTab Client ID:', googleClientId ? `${googleClientId.substring(0, 10)}...` : 'Vazio/Inexistente');
    }, [googleClientId]);

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

    const handleAddBlockWrapper = (type: any, content?: any, settings?: any) => {
        const id = ctrl.handleAddBlock(type, content, settings);
        if (isMobile) setShowLibraryMobile(false);
        else setIsRightSidebarOpen(true);
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

                <div className="flex-1 flex overflow-hidden relative">
                    {/* DESKTOP LEFT SIDEBAR */}
                    <aside className={`hidden lg:flex flex-col border-r transition-all duration-300 relative z-20 ${isLeftSidebarOpen ? 'w-60' : 'w-0 overflow-hidden'} ${darkMode ? 'bg-black border-white/5' : 'bg-white border-zinc-200'}`}>
                        <div className="flex-1 overflow-hidden w-60">
                            <EditorSidebar onAddBlock={handleAddBlockWrapper} isUploading={!!ctrl.uploadingSlot} darkMode={darkMode} />
                        </div>
                    </aside>

                    {/* MAIN CONTENT */}
                    <div className="flex-1 flex flex-col overflow-hidden relative" onClick={() => { if (isMobile) { setShowInspectorMobile(false); ctrl.setSelectedBlockId(null); setShowMobileFormatting(false); } }}>
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
                                initialData={initialData} onCancel={onCancel}
                                onPublish={ctrl.handlePublishLocal} onSaveDraft={ctrl.handleSaveLocal}
                            />
                        </div>

                        {/* CANVAS */}
                        <div ref={scrollContainerRef} onScroll={handleScroll} className={`flex-1 overflow-y-auto p-4 md:p-10 lg:p-12 custom-scrollbar transition-all duration-300 ${showMobileFormatting ? 'pb-72' : 'pb-28'} md:pb-12 ${darkMode ? 'bg-[#0F0F0F]' : 'bg-[#f4f4f7]'}`}>
                            <div className={`w-full max-w-[1000px] mx-auto rounded-[3rem] shadow-2xl border-2 ${ctrl.isPublished ? 'border-green-500/30' : 'border-red-600/10'} min-h-full transition-all flex flex-col overflow-hidden relative bg-white`}>
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
                                    bannerEffects={ctrl.bannerEffects} setBannerEffects={ctrl.setBannerEffects}
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

                                <div className="p-6 md:p-16 lg:p-20" onClick={(e) => e.stopPropagation()}>
                                    <EditorMeta
                                        title={ctrl.title} setTitle={ctrl.setTitle}
                                        lead={ctrl.lead} setLead={ctrl.setLead}
                                        category={ctrl.category} setCategory={ctrl.setCategory}
                                        tags={ctrl.tags} setTags={ctrl.setTags}
                                    />
                                    <EditorCanvas
                                        blocks={ctrl.blocks} selectedBlockId={ctrl.selectedBlockId} isMobile={isMobile}
                                        uploadingSlot={ctrl.uploadingSlot} showMobileFormatting={showMobileFormatting}
                                        onBlockSelect={(id) => { ctrl.setSelectedBlockId(id); if (isMobile) setShowLibraryMobile(false); }}
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
                    <aside className={`hidden lg:flex flex-col transition-all duration-300 relative z-20 ${isRightSidebarOpen ? 'w-80 md:w-96 border-l' : 'w-0 overflow-hidden border-none'} ${darkMode ? 'bg-black border-white/5' : 'bg-white border-zinc-200'}`}>
                        <div className="flex-1 overflow-hidden w-80 md:w-96">
                            <InspectorSidebar
                                block={ctrl.blocks.find(b => b.id === ctrl.selectedBlockId) || null}
                                onUpdate={ctrl.handleUpdateBlock} onDelete={ctrl.handleDeleteBlock}
                                onClose={() => setIsRightSidebarOpen(false)} accessToken={accessToken}
                                newsMetadata={{ slug: ctrl.slug, setSlug: ctrl.setSlug, category: ctrl.category, setCategory: ctrl.setCategory, title: ctrl.title, lead: ctrl.lead, socialCaptions: ctrl.socialCaptions, setSocialCaptions: ctrl.setSocialCaptions }}
                                darkMode={darkMode}
                            />
                        </div>
                    </aside>
                </div>

                {isMobile && (
                    <div className="fixed bottom-4 left-4 right-4 h-16 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] z-[1800] flex justify-between items-center px-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all animate-slideUp">
                        <div className="flex items-center gap-4">
                            <button onClick={onCancel} className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white"><i className="fas fa-arrow-left"></i></button>
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
                    onViewNews={() => window.open(`/#/news/${initialData?.id || ctrl.slug || ''}`, '_blank')}
                    isUpdate={!!initialData?.id}
                    mode={ctrl.publishMode}
                    authorName={user.name}
                />

                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </div>
        </GoogleOAuthProvider>
    );
};

export default EditorTab;
