
import React, { useState, useEffect } from 'react';
import { User, NewsItem, ContentBlock, SystemSettings, SocialDistribution } from '../../types';
import { uploadFileToDrive } from '../../services/driveService';
import { uploadVideoToYouTube } from '../../services/youtubeService';
import { dispatchSocialWebhook } from '../../services/integrationService';
import Toast, { ToastType } from '../common/Toast';

import EditorSidebar from './editor/EditorSidebar';
import InspectorSidebar from './InspectorSidebar';
import TextBlock from './editor/blocks/TextBlock';
import MediaBlock from './editor/blocks/MediaBlock';
import GalleryEditorBlock from './GalleryEditorBlock';
import EngagementEditorBlock from './EngagementEditorBlock';
import SocialDistributionOverlay from './SocialDistributionOverlay';
import Logo from '../common/Logo';

interface EditorTabProps {
  user: User;
  initialData: NewsItem | null;
  onSave: (news: NewsItem, isUpdate: boolean) => void;
  onCancel: () => void;
  accessToken: string | null;
  systemSettings?: SystemSettings;
}

const getWidthClass = (width: string) => {
    switch(width) {
        case '1/4': return 'w-full md:w-1/4';
        case '1/2': return 'w-full md:w-1/2';
        case '3/4': return 'w-full md:w-3/4';
        default: return 'w-full';
    }
};

const EditorTab: React.FC<EditorTabProps> = ({ user, initialData, onSave, onCancel, accessToken, systemSettings }) => {
  // Estados Básicos
  const [title, setTitle] = useState(initialData?.title || '');
  const [lead, setLead] = useState(initialData?.lead || '');
  const [category, setCategory] = useState(initialData?.category || 'Cotidiano');
  const [slug, setSlug] = useState(initialData?.seo?.slug || '');
  
  // Estados do Banner Studio
  const [bannerType, setBannerType] = useState<'image' | 'video'>(initialData?.bannerMediaType || 'image');
  const [mainImageUrl, setMainImageUrl] = useState(initialData?.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200');
  const [bannerImages, setBannerImages] = useState<string[]>(initialData?.bannerImages || []);
  const [bannerVideoUrl, setBannerVideoUrl] = useState(initialData?.bannerVideoUrl || '');
  const [isAnimated, setIsAnimated] = useState(initialData?.isBannerAnimated || false);

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const isMobile = screenWidth < 768;
  const isDesktopPro = screenWidth >= 1440;

  const [showLibrary, setShowLibrary] = useState(!isMobile);
  const [showInspector, setShowInspector] = useState(isDesktopPro);

  const [socialCaptions, setSocialCaptions] = useState<SocialDistribution[]>(initialData?.socialDistribution || []);
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialData?.blocks || [
    { id: 'b1', type: 'paragraph', content: '', settings: { alignment: 'left', style: 'serif', thickness: '18', width: 'full' } }
  ]);

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'uploading' | 'distributing' | 'success' | 'error'>('idle');
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);

  useEffect(() => {
    const handleResize = () => {
        setScreenWidth(window.innerWidth);
        if (window.innerWidth < 768) setShowLibrary(false);
        if (window.innerWidth < 1440) setShowInspector(false);
        else { setShowLibrary(true); setShowInspector(true); }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAddBlock = (type: ContentBlock['type'], content?: any, settings?: any) => {
    const id = Math.random().toString(36).substr(2,9);
    const newBlock: ContentBlock = { 
        id, type, content: content !== undefined ? content : '', 
        settings: { alignment: 'left', thickness: '18', width: 'full', ...settings } 
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(id);
    if (isMobile) setShowLibrary(false);
    if (!showInspector) setShowInspector(true);
  };

  const handleCloudUpload = async (file: File, type: 'image' | 'video') => {
    if (!accessToken) {
        setToast({ message: "Faça login com sua conta Google primeiro.", type: 'warning' });
        return;
    }
    
    setIsUploading(true);
    try {
        if (type === 'image') {
            const url = await uploadFileToDrive(file, accessToken);
            handleAddBlock('image', url, { alignment: 'center', width: 'full', borderRadius: 'xl' });
            setToast({ message: "Imagem salva no Google Drive.", type: 'success' });
        } else {
            const url = await uploadVideoToYouTube(file, accessToken);
            handleAddBlock('video', url, { alignment: 'center', width: 'full', style: 'clean' });
            setToast({ message: "Vídeo sincronizado com YouTube.", type: 'success' });
        }
    } catch (e: any) {
        setToast({ message: e.message || "Erro no upload.", type: 'error' });
    } finally {
        setIsUploading(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>, slotIdx?: number) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;
    
    setIsUploading(true);
    try {
        const url = await uploadFileToDrive(file, accessToken);
        if (slotIdx !== undefined) {
            const newImages = [...bannerImages];
            newImages[slotIdx] = url;
            setBannerImages(newImages);
        } else {
            setMainImageUrl(url);
        }
        setToast({ message: "Capa salva no Google Drive.", type: 'success' });
    } catch (e) {
        setToast({ message: "Erro ao subir capa.", type: 'error' });
    } finally { setIsUploading(false); }
  };

  const handlePublish = async () => {
    if (!title || !lead) {
      setToast({ message: "Título e Resumo são obrigatórios.", type: 'warning' });
      return;
    }
    setPublishStatus('uploading');
    
    const newsData: NewsItem = {
      id: initialData?.id || Math.random().toString(36).substr(2,9),
      title, lead, category, blocks, status: 'published',
      author: user.name, authorId: user.id, createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(), 
      imageUrl: mainImageUrl, 
      bannerMediaType: bannerType,
      bannerImages: isAnimated ? bannerImages : [],
      bannerVideoUrl: bannerVideoUrl,
      isBannerAnimated: isAnimated,
      imageCredits: 'Redação LFNM', mediaType: 'image', city: 'Lagoa Formosa', region: 'Região',
      isBreaking: false, isFeatured: false, featuredPriority: 0,
      seo: { slug: slug || title.toLowerCase().replace(/ /g, '-'), metaTitle: title, metaDescription: lead, focusKeyword: '' },
      source: 'site', socialDistribution: socialCaptions, content: ''
    };

    try {
        if (systemSettings?.enableOmnichannel) await dispatchSocialWebhook(newsData);
        onSave(newsData, !!initialData);
        setPublishStatus('success');
    } catch (e) { setPublishStatus('error'); }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-zinc-100 animate-fadeIn">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <SocialDistributionOverlay status={publishStatus} distributions={socialCaptions} onClose={() => setPublishStatus('idle')} />
      
      {/* SIDEBAR DA BIBLIOTECA */}
      <div className={`${(isMobile) ? 'fixed inset-y-0 left-0 z-[2000] transform transition-transform duration-500 ' + (showLibrary ? 'translate-x-0' : '-translate-x-full') : 'w-80 border-r border-zinc-200 relative'} bg-white shadow-2xl flex flex-col h-full`}>
          <EditorSidebar 
            onAddBlock={handleAddBlock} 
            onCloudUpload={handleCloudUpload}
            isUploading={isUploading} 
          />
          {isMobile && <button onClick={() => setShowLibrary(false)} className="absolute top-6 -right-14 w-12 h-12 bg-black text-white rounded-r-2xl flex items-center justify-center shadow-2xl"><i className="fas fa-times"></i></button>}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative z-[50]" onClick={() => setSelectedBlockId(null)}>
        <header className="bg-white/95 backdrop-blur-md border-b border-zinc-200 px-6 py-4 flex items-center justify-between sticky top-0 z-[1500] flex-none shadow-sm">
            <div className="flex items-center gap-5 cursor-pointer group" onClick={() => onCancel()}>
                <div className="w-10 h-10 flex-none group-hover:scale-110 transition-transform"><Logo /></div>
                <div className="hidden sm:flex flex-col">
                    <span className="text-[11px] font-black uppercase text-zinc-900 leading-none">BIBLIOTECA LFNM</span>
                    <span className="text-[7px] font-bold text-red-600 uppercase tracking-widest mt-1">SISTEMA INTEGRADO OPERACIONAL</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={(e) => { e.stopPropagation(); onCancel(); }} className="px-6 rounded-2xl text-[10px] font-black uppercase text-zinc-400 hover:bg-zinc-100 transition-all">Sair</button>
                <button onClick={(e) => { e.stopPropagation(); handlePublish(); }} className="bg-red-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-[11px] shadow-xl shadow-red-600/20 hover:bg-black transition-all flex items-center gap-3">
                    <i className="fas fa-paper-plane text-lg"></i> Publicar
                </button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-16 custom-scrollbar bg-zinc-100">
            <div className="w-full max-w-[1100px] mx-auto bg-white rounded-[3rem] shadow-2xl border border-zinc-100 min-h-full transition-all flex flex-col overflow-hidden">
                
                {/* BANNER STUDIO */}
                <section className="w-full relative bg-zinc-900 group">
                    <div className="h-80 md:h-[450px] overflow-hidden">
                        {bannerType === 'image' ? (
                            <img src={mainImageUrl} className="w-full h-full object-cover opacity-60 transition-opacity" alt="Capa" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-black">
                                <i className="fab fa-youtube text-6xl text-red-600 opacity-50"></i>
                                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm flex items-center justify-center">
                                    <input 
                                        type="text" value={bannerVideoUrl} 
                                        onChange={e => setBannerVideoUrl(e.target.value)} 
                                        placeholder="Link do YouTube..." 
                                        className="w-1/2 bg-black/50 border-2 border-white/20 rounded-xl p-4 text-white text-xs font-bold text-center outline-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
                    <div className="absolute bottom-10 left-10 right-10 flex flex-col gap-6 z-20">
                        <div className="flex bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10 self-start">
                            <button onClick={() => setBannerType('image')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase ${bannerType === 'image' ? 'bg-white text-black' : 'text-zinc-400'}`}>Imagem Drive</button>
                            <button onClick={() => setBannerType('video')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase ${bannerType === 'video' ? 'bg-white text-black' : 'text-zinc-400'}`}>Vídeo YouTube</button>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="cursor-pointer bg-red-600 hover:bg-black text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center gap-2">
                                <i className="fas fa-camera"></i> {isUploading ? 'Cloud Sync...' : 'Trocar Capa'}
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleBannerUpload(e)} disabled={isUploading} />
                            </label>
                            {bannerType === 'image' && (
                                <button onClick={() => setIsAnimated(!isAnimated)} className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all border ${isAnimated ? 'bg-blue-600 text-white border-blue-600' : 'bg-black/50 text-zinc-300 border-white/20'}`}>
                                    <i className={`fas ${isAnimated ? 'fa-sync fa-spin' : 'fa-play'}`}></i> Slideshow: {isAnimated ? 'Ativo' : 'Inativo'}
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                <div className="p-8 md:p-20">
                    <input 
                        type="text" value={title} onChange={e => setTitle(e.target.value)} 
                        placeholder="Escreva a Manchete Principal..." 
                        className="w-full text-3xl md:text-5xl lg:text-6xl font-[1000] uppercase italic tracking-tighter text-zinc-900 bg-transparent border-none outline-none focus:ring-0 mb-12" 
                    />
                    <textarea 
                        value={lead} onChange={e => setLead(e.target.value)} 
                        placeholder="Resumo editorial impactante..." 
                        className="w-full text-lg md:text-xl font-medium text-zinc-500 bg-zinc-50/30 border-l-8 border-red-600 rounded-r-3xl p-8 outline-none min-h-[140px] resize-none mb-14" 
                    />
                    <div className="flex flex-wrap -mx-3">
                        {blocks.map(block => (
                            <div key={block.id} className={`p-3 transition-all ${getWidthClass(block.settings.width)}`}>
                                <div onClick={(e) => { e.stopPropagation(); setSelectedBlockId(block.id); }} className={`relative group/block rounded-3xl transition-all duration-500 ${selectedBlockId === block.id ? 'ring-4 ring-blue-500/30 bg-blue-50/10' : 'hover:bg-zinc-50/50'}`}>
                                    {(() => {
                                        switch(block.type) {
                                            case 'paragraph': case 'heading': case 'quote': case 'list':
                                                return <TextBlock block={block} isSelected={selectedBlockId === block.id} onSelect={() => setSelectedBlockId(block.id)} onUpdate={c => setBlocks(blocks.map(b => b.id === block.id ? {...b, content: c} : b))} />;
                                            case 'image': case 'video':
                                                return <MediaBlock block={block} isSelected={selectedBlockId === block.id} isUploading={isUploading} onSelect={() => setSelectedBlockId(block.id)} />;
                                            case 'gallery':
                                                return <GalleryEditorBlock block={block} accessToken={accessToken} onUpdate={u => setBlocks(blocks.map(b => b.id === u.id ? u : b))} />;
                                            case 'engagement':
                                                return <EngagementEditorBlock block={block} onUpdate={u => setBlocks(blocks.map(b => b.id === u.id ? u : b))} />;
                                            case 'smart_block':
                                                return <div className="p-4" dangerouslySetInnerHTML={{ __html: block.content }} />;
                                            case 'separator':
                                                return <div className="py-12 flex items-center gap-4"><div className="h-px flex-1 bg-zinc-200"></div><Logo className="w-6 h-6 opacity-10"/><div className="h-px flex-1 bg-zinc-200"></div></div>;
                                            default: return null;
                                        }
                                    })()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {showInspector && (
          <div className="w-96 border-l border-zinc-200 bg-white flex flex-col animate-slideInRight">
              <InspectorSidebar 
                block={blocks.find(b => b.id === selectedBlockId) || null} 
                onUpdate={u => setBlocks(blocks.map(b => b.id === u.id ? u : b))}
                onClose={() => setShowInspector(false)}
                newsMetadata={{ slug, setSlug, category, setCategory, title, lead, socialCaptions, setSocialCaptions }}
              />
          </div>
      )}
    </div>
  );
};

export default EditorTab;
