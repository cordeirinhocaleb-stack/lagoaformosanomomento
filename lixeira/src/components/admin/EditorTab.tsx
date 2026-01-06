import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, NewsItem, ContentBlock, SystemSettings, SocialDistribution, BannerLayout, BannerTransition } from '../../types';
import { uploadFileToDrive } from '../../services/driveService';
import { dispatchSocialWebhook } from '../../services/integrationService';
import Toast, { ToastType } from '../common/Toast';

import EditorSidebar from './editor/EditorSidebar';
import InspectorSidebar from './InspectorSidebar';
import TextBlock from './editor/blocks/TextBlock';
import MediaBlock from './editor/blocks/MediaBlock';
import SeparatorBlock from './editor/blocks/SeparatorBlock';
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
  onSidebarToggle?: (isOpen: boolean) => void;
}

const getWidthClass = (width: string) => {
    switch(width) {
        case '1/4': return 'w-full md:w-1/4';
        case '1/3': return 'w-full md:w-1/3';
        case '1/2': return 'w-full md:w-1/2';
        case '2/3': return 'w-full md:w-2/3';
        case '3/4': return 'w-full md:w-3/4';
        default: return 'w-full';
    }
};

const TEMPLATES = [
    { id: 'single', label: 'Capa Única', icon: 'fa-square' },
    { id: 'split', label: 'Dividido', icon: 'fa-columns' },
    { id: 'mosaic', label: 'Mosaico', icon: 'fa-table-columns' },
    { id: 'grid', label: 'Grade 4', icon: 'fa-border-all' }
];

const TRANSITIONS = [
    { id: 'fade', label: 'Suave', icon: 'fa-cloud' },
    { id: 'slide', label: 'Slide', icon: 'fa-film' },
    { id: 'zoom', label: 'Zoom', icon: 'fa-magnifying-glass-plus' },
    { id: 'none', label: 'Fixo', icon: 'fa-ban' }
];

const EditorTab: React.FC<EditorTabProps> = ({ user, initialData, onSave, onCancel, accessToken, systemSettings, onSidebarToggle }) => {
  const isPublished = initialData?.status === 'published';

  const [title, setTitle] = useState(initialData?.title || '');
  const [lead, setLead] = useState(initialData?.lead || '');
  const [category, setCategory] = useState(initialData?.category || 'Cotidiano');
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

  // Layout State
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  
  const [showLibraryMobile, setShowLibraryMobile] = useState(false); 
  const [showInspectorMobile, setShowInspectorMobile] = useState(false);
  const [showMobileFormatting, setShowMobileFormatting] = useState(false); 

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  
  const lastScrollY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [socialCaptions, setSocialCaptions] = useState<SocialDistribution[]>(initialData?.socialDistribution || []);
  
  // Lógica de fallback para blocks: Se não existirem blocos (post antigo), cria um bloco de texto com o conteúdo HTML legado
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => {
      if (initialData?.blocks && initialData.blocks.length > 0) {
          return initialData.blocks;
      } else if (initialData?.content) {
          // Converte conteúdo legado em um bloco de parágrafo
          return [{ 
              id: 'legacy_content', 
              type: 'smart_block', // Usa smart_block para renderizar HTML puro
              content: initialData.content, 
              settings: { width: 'full' } 
          }];
      }
      return [{ id: 'b1', type: 'paragraph', content: '', settings: { alignment: 'left', style: 'serif', thickness: '18', width: 'full' } }];
  });

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'uploading' | 'distributing' | 'success' | 'error' | 'report'>('idle');
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);

  // Sincroniza o estado da sidebar com o pai para ocultar o menu superior (Focus Mode)
  useEffect(() => {
    if (onSidebarToggle) {
        const sidebarActive = isMobile 
            ? (showLibraryMobile || (showInspectorMobile && selectedBlockId) || showMobileFormatting) 
            : (isLeftSidebarOpen || isRightSidebarOpen);
        onSidebarToggle(!!sidebarActive);
    }
  }, [isLeftSidebarOpen, isRightSidebarOpen, showLibraryMobile, showInspectorMobile, showMobileFormatting, selectedBlockId, isMobile, onSidebarToggle]);

  // Calcula quantos slots são necessários baseado no layout
  const requiredSlots = {
      single: 1,
      split: 2,
      mosaic: 3,
      grid: 4
  }[bannerLayout];

  // Garante que o array de imagens tenha o tamanho correto ao mudar o layout
  useEffect(() => {
      if (bannerImages.length < requiredSlots) {
          const filler = bannerImages[0] || mainImageUrl;
          const newArr = [...bannerImages, ...Array(requiredSlots - bannerImages.length).fill(filler)];
          setBannerImages(newArr);
      }
  }, [bannerLayout, requiredSlots, bannerImages, mainImageUrl]);

  useEffect(() => {
    const handleResize = () => {
        const mobile = window.innerWidth < 1024;
        setIsMobile(mobile);
        if (mobile) {
            setIsLeftSidebarOpen(false);
            setIsRightSidebarOpen(false);
        } else {
            setIsLeftSidebarOpen(true);
            setIsRightSidebarOpen(true);
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const currentScrollY = scrollContainerRef.current.scrollTop;
    if (currentScrollY > 50) {
        if (currentScrollY > lastScrollY.current) {
            if (isHeaderVisible) setIsHeaderVisible(false);
        } else {
            if (!isHeaderVisible) setIsHeaderVisible(true);
        }
    } else {
        setIsHeaderVisible(true);
    }
    lastScrollY.current = currentScrollY;
  }, [isHeaderVisible]);

  const handleAddBlock = (type: ContentBlock['type'], content?: any, settings?: any) => {
    const id = Math.random().toString(36).substr(2,9);
    const newBlock: ContentBlock = { 
        id, type, content: content !== undefined ? content : '', 
        settings: { alignment: 'left', thickness: '1', width: 'full', variant: 'minimal', iconPosition: 'none', iconName: 'fa-star', color: '#e2e8f0', ...settings } 
    };
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(id);
    
    if (isMobile) {
        setShowLibraryMobile(false);
    } else {
        setIsRightSidebarOpen(true);
    }
  };

  const handleBlockSelect = (id: string) => {
    setSelectedBlockId(id);
    
    if (isMobile) {
        setShowLibraryMobile(false);
    } else {
        setIsRightSidebarOpen(true);
    }
  };

  const handleDeleteBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    setSelectedBlockId(null);
    if(isMobile) {
        setShowInspectorMobile(false);
        setShowMobileFormatting(false);
    }
  }, [isMobile]);

  const handleUpdateBlock = useCallback((updatedBlock: ContentBlock) => {
    setBlocks(prev => prev.map(b => b.id === updatedBlock.id ? updatedBlock : b));
  }, []);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;
    setUploadingSlot(slotIndex);
    try {
        const url = await uploadFileToDrive(file, accessToken);
        const newImages = [...bannerImages];
        newImages[slotIndex] = url;
        if (slotIndex === 0) setMainImageUrl(url);
        setBannerImages(newImages);
        setToast({ message: `Imagem ${slotIndex + 1} sincronizada.`, type: 'success' });
    } catch (e) { 
        setToast({ message: "Erro no upload.", type: 'error' }); 
    } finally { 
        setUploadingSlot(null); 
    }
  };

  const removeBannerImage = (index: number) => {
      if (bannerLayout === 'single' && bannerImages.length <= 1) {
          setToast({ message: "Mínimo 1 imagem necessária.", type: 'warning' });
          return;
      }
      const newImages = [...bannerImages];
      if (requiredSlots > 1) {
          newImages[index] = 'https://placehold.co/800x600?text=Vazio'; 
      } else {
          newImages.splice(index, 1);
      }
      setBannerImages(newImages);
      if (index === 0 && newImages[0]) setMainImageUrl(newImages[0]);
  };

  const handlePublish = async (isUpdate: boolean, forceSocial: boolean = false) => {
    if (!title || !lead) {
      setToast({ message: "Título e Resumo são obrigatórios.", type: 'warning' });
      return;
    }
    
    setPublishStatus(forceSocial ? 'distributing' : 'uploading');
    
    // Fallback HTML generation para legacy support
    const simpleContent = blocks.map(b => {
        if(b.type === 'paragraph') return `<p>${b.content}</p>`;
        if(b.type === 'heading') return `<h2>${b.content}</h2>`;
        if(b.type === 'image') return `<img src="${b.content}" alt="Imagem" style="width:100%;" />`;
        if(b.type === 'quote') return `<blockquote>${b.content}</blockquote>`;
        if(b.type === 'list') return b.content; 
        if(b.type === 'smart_block') return b.content;
        return '';
    }).join('');

    const newsData: NewsItem = {
      id: initialData?.id || Math.random().toString(36).substr(2,9),
      title, lead, category, blocks, status: 'published',
      author: user.name, authorId: user.id, createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(), 
      imageUrl: bannerImages[0] || mainImageUrl, 
      bannerMediaType: bannerType,
      bannerLayout,
      bannerTransition,
      bannerImages: bannerImages.slice(0, requiredSlots), 
      bannerVideoUrl: bannerVideoUrl,
      bannerDuration,
      videoStart,
      videoEnd,
      isBannerAnimated: bannerImages.length > 1,
      imageCredits: 'Redação LFNM', mediaType: 'image', city: 'Lagoa Formosa', region: 'Região',
      isBreaking: false, isFeatured: false, featuredPriority: 0,
      seo: { slug: slug || title.toLowerCase().replace(/ /g, '-'), metaTitle: title, metaDescription: lead, focusKeyword: '' },
      source: 'site', socialDistribution: socialCaptions, content: simpleContent || lead
    };

    try {
        if ((!isUpdate || forceSocial) && systemSettings?.enableOmnichannel) {
            await dispatchSocialWebhook(newsData);
        }
        
        onSave(newsData, isUpdate);
        setPublishStatus('success');
    } catch (e) { setPublishStatus('error'); }
  };

  const getBlockTypeLabel = (type: string) => {
      switch(type) {
          case 'paragraph': return 'TEXTO';
          case 'heading': return 'TÍTULO';
          case 'image': return 'IMAGEM';
          case 'video': return 'VÍDEO';
          case 'gallery': return 'GALERIA';
          case 'quote': return 'CITAÇÃO';
          case 'separator': return 'DIVISOR';
          case 'engagement': return 'INTERATIVO';
          case 'smart_block': return 'WIDGET';
          default: return 'BLOCO';
      }
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);
  const isTextBlockSelected = selectedBlock && ['paragraph', 'heading', 'quote', 'list'].includes(selectedBlock.type);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f4f4f7] animate-fadeIn relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <SocialDistributionOverlay status={publishStatus} distributions={socialCaptions} onClose={() => setPublishStatus('idle')} />
      
      {/* MOBILE DRAWERS OVERLAY */}
      {isMobile && (showLibraryMobile || (showInspectorMobile && selectedBlockId)) && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1900] animate-fadeIn" 
            onClick={() => { setShowLibraryMobile(false); setShowInspectorMobile(false); setSelectedBlockId(null); setShowMobileFormatting(false); }}
          />
      )}

      {/* MOBILE LEFT DRAWER (LIBRARY) */}
      <aside className={`
        fixed inset-y-0 left-0 z-[2000] w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden
        ${showLibraryMobile ? 'translate-x-0' : '-translate-x-full'}
      `}>
          <EditorSidebar onAddBlock={handleAddBlock} isUploading={!!uploadingSlot} />
      </aside>

      {/* DESKTOP LEFT SIDEBAR (COLLAPSIBLE) */}
      <aside className={`
        hidden lg:flex flex-col bg-white border-r border-zinc-200 transition-all duration-300 relative z-20 shadow-[5px_0_15px_rgba(0,0,0,0.02)]
        ${isLeftSidebarOpen ? 'w-60' : 'w-0 overflow-hidden'}
      `}>
          <div className="flex-1 overflow-hidden w-60">
             <EditorSidebar onAddBlock={handleAddBlock} isUploading={!!uploadingSlot} />
          </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden relative" onClick={() => { if(isMobile) { setShowInspectorMobile(false); setSelectedBlockId(null); setShowMobileFormatting(false); } }}>
        
        {/* DESKTOP TOGGLE BUTTONS */}
        <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 z-30">
            <button 
                onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                className="bg-black text-white rounded-r-xl p-2 shadow-lg hover:scale-110 transition-all"
                title="Ferramentas"
            >
                <i className={`fas fa-chevron-${isLeftSidebarOpen ? 'left' : 'right'} text-xs`}></i>
            </button>
        </div>
        <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 z-30">
            <button 
                onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                className="bg-black text-white rounded-l-xl p-2 shadow-lg hover:scale-110 transition-all"
                title="Propriedades"
            >
                <i className={`fas fa-chevron-${isRightSidebarOpen ? 'right' : 'left'} text-xs`}></i>
            </button>
        </div>

        {/* HEADER CUSTOMIZADO - ESTILO SITE (PRETO) */}
        <header className={`hidden md:flex bg-black border-b-4 ${isPublished ? 'border-green-500' : 'border-red-600'} px-6 py-3 items-center justify-between sticky top-0 z-[1500] flex-none shadow-2xl transition-all duration-500 ${isHeaderVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onCancel()}>
                    <div className="w-10 h-10 flex-none group-hover:animate-almost-fall"><Logo /></div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase text-white leading-none tracking-tighter">
                            {isPublished ? 'GERENCIADOR DE PUBLICAÇÃO' : 'ESTÚDIO DE CRIAÇÃO'}
                        </span>
                        <span className={`text-[7px] font-bold ${isPublished ? 'text-green-500' : 'text-red-600'} uppercase tracking-widest mt-1`}>
                            {isPublished ? 'MATÉRIA NO AR • ONLINE' : 'REDE WELIX DUARTE'}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <button onClick={onCancel} className="px-5 py-2 rounded-full text-[9px] font-black uppercase text-white/50 border border-white/10 hover:text-white hover:border-white transition-all">
                    Cancelar
                </button>
                
                {isPublished ? (
                    <>
                        <button 
                            onClick={() => window.open(`/#/news/${initialData?.id}`, '_blank')}
                            className="bg-white/10 text-white px-5 py-2.5 rounded-full font-black uppercase text-[9px] tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2"
                        >
                            <i className="fas fa-external-link-alt"></i> Ver no Site
                        </button>
                        
                        <button 
                            onClick={() => {
                                if(confirm("⚠️ ATENÇÃO: Isso enviará a notícia novamente para todas as redes sociais configuradas (Instagram, Facebook, etc). Deseja continuar?")) {
                                    handlePublish(true, true);
                                }
                            }}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-black uppercase text-[9px] tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.5)]"
                        >
                            <i className="fas fa-share-nodes"></i> Republicar
                        </button>

                        <button 
                            onClick={() => handlePublish(true, false)}
                            className="bg-green-600 text-white px-6 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:bg-white hover:text-green-600 transition-all flex items-center gap-2 group"
                        >
                            <i className="fas fa-save group-hover:rotate-12 transition-transform"></i> Salvar Edição
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={() => handlePublish(false, false)} 
                        className="bg-red-600 text-white px-8 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:bg-white hover:text-red-600 transition-all flex items-center gap-2 group transform hover:scale-105"
                    >
                        <span>PUBLICAR AGORA</span>
                        <i className="fas fa-paper-plane group-hover:rotate-45 transition-transform"></i>
                    </button>
                )}
            </div>
        </header>

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

                <section className="w-full relative bg-zinc-900 group">
                    {/* Visualização Dinâmica do Layout */}
                    <div className="h-64 md:h-[320px] overflow-hidden relative">
                        {bannerType === 'image' ? (
                            <div className="w-full h-full">
                                {bannerLayout === 'single' && (
                                    <img src={bannerImages[0] || mainImageUrl} className="w-full h-full object-cover opacity-60" alt="Capa" />
                                )}
                                {bannerLayout === 'split' && (
                                    <div className="w-full h-full grid grid-cols-2">
                                        {[0, 1].map(i => <div key={i} className="border-r border-white/10 overflow-hidden"><img src={bannerImages[i] || mainImageUrl} className="w-full h-full object-cover" /></div>)}
                                    </div>
                                )}
                                {bannerLayout === 'mosaic' && (
                                    <div className="w-full h-full grid grid-cols-3 grid-rows-2">
                                        <div className="col-span-2 row-span-2 border-r border-white/10 overflow-hidden"><img src={bannerImages[0] || mainImageUrl} className="w-full h-full object-cover" /></div>
                                        <div className="border-b border-white/10 overflow-hidden"><img src={bannerImages[1] || mainImageUrl} className="w-full h-full object-cover" /></div>
                                        <div className="overflow-hidden"><img src={bannerImages[2] || mainImageUrl} className="w-full h-full object-cover" /></div>
                                    </div>
                                )}
                                {bannerLayout === 'grid' && (
                                    <div className="w-full h-full grid grid-cols-2 grid-rows-2">
                                        {[0, 1, 2, 3].map(i => <div key={i} className="border-r border-b border-white/10 overflow-hidden"><img src={bannerImages[i] || mainImageUrl} className="w-full h-full object-cover" /></div>)}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-black/40">
                                <i className="fab fa-youtube text-7xl text-red-600 opacity-40"></i>
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-10">
                                    <input 
                                        type="text" 
                                        value={bannerVideoUrl} 
                                        onChange={e => setBannerVideoUrl(e.target.value)}
                                        placeholder="Cole o Link do YouTube..."
                                        className="w-full max-w-md bg-white/10 border-2 border-white/20 rounded-2xl px-6 py-4 text-white text-center font-bold outline-none focus:border-red-500 transition-all"
                                    />
                                    <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em] mt-4">Video Cover</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* BARRA DE FERRAMENTAS FLUTUANTE (TOP) */}
                    <div className="absolute top-6 left-6 right-6 z-30 flex justify-between items-start pointer-events-none">
                        <div className="flex flex-col gap-2 pointer-events-auto">
                            {/* Toggle Media Type */}
                            <div className="bg-black/80 backdrop-blur-md rounded-full p-1 flex gap-1 border border-white/10 w-fit shadow-lg">
                                <button onClick={() => setBannerType('image')} className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${bannerType === 'image' ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`} title="Imagem"><i className="fas fa-image text-xs"></i></button>
                                <button onClick={() => setBannerType('video')} className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${bannerType === 'video' ? 'bg-red-600 text-white' : 'text-white/50 hover:text-white'}`} title="Vídeo"><i className="fab fa-youtube text-xs"></i></button>
                            </div>

                            {/* Template Selector (Only for Image) */}
                            {bannerType === 'image' && (
                                <div className="bg-black/80 backdrop-blur-md rounded-xl p-1 flex gap-1 border border-white/10 w-fit animate-fadeIn shadow-lg">
                                    {TEMPLATES.map(t => (
                                        <button 
                                            key={t.id} 
                                            onClick={() => setBannerLayout(t.id as BannerLayout)} 
                                            className={`p-2 rounded-lg transition-all ${bannerLayout === t.id ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}
                                            title={t.label}
                                        >
                                            <i className={`fas ${t.icon}`}></i>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Configs (Transition / Time) */}
                        {bannerType === 'image' && (
                            <div className="flex flex-col gap-2 items-end pointer-events-auto">
                                <div className="bg-black/80 backdrop-blur-md rounded-xl p-1 flex gap-1 border border-white/10 w-fit shadow-lg">
                                    {TRANSITIONS.map(t => (
                                        <button 
                                            key={t.id} 
                                            onClick={() => setBannerTransition(t.id as BannerTransition)} 
                                            className={`p-2 rounded-lg transition-all ${bannerTransition === t.id ? 'bg-blue-600 text-white' : 'text-white/50 hover:text-white'}`}
                                            title={t.label}
                                        >
                                            <i className={`fas ${t.icon}`}></i>
                                        </button>
                                    ))}
                                </div>
                                
                                {bannerTransition !== 'none' && (
                                    <div className="bg-black/80 backdrop-blur-md rounded-xl p-2 flex items-center gap-2 border border-white/10 shadow-lg">
                                        <span className="text-white text-[8px] font-black uppercase pl-1">Tempo</span>
                                        <input 
                                            type="number" 
                                            value={bannerDuration} 
                                            onChange={(e) => setBannerDuration(Number(e.target.value))}
                                            className="w-14 bg-white/10 text-white text-[10px] font-bold text-center rounded-lg py-1 outline-none border border-white/10"
                                            step={500} min={1000}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* UPLOAD SLOTS GRID */}
                    {bannerType === 'image' && (
                        <div className="absolute bottom-6 left-6 right-6 z-20 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {Array.from({ length: requiredSlots }).map((_, slot) => (
                                <div key={slot} className="relative group/slot aspect-video w-32 shrink-0 rounded-2xl overflow-hidden border-2 border-white/20 bg-black/40 backdrop-blur-md transition-all hover:border-red-500 hover:w-40 shadow-xl">
                                    {bannerImages[slot] ? (
                                        <>
                                            <img src={bannerImages[slot]} className="w-full h-full object-cover" alt={`Slot ${slot}`} />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/slot:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <label className="cursor-pointer text-white hover:text-blue-400 bg-black/50 p-2 rounded-full"><i className="fas fa-sync-alt"></i><input type="file" accept="image/*" className="hidden" onChange={e => handleBannerUpload(e, slot)} disabled={!!uploadingSlot} /></label>
                                                <button onClick={() => removeBannerImage(slot)} className="text-white hover:text-red-500 bg-black/50 p-2 rounded-full"><i className="fas fa-trash"></i></button>
                                            </div>
                                            <span className="absolute top-1 left-2 text-[8px] font-black text-white drop-shadow-md">CAM {slot + 1}</span>
                                        </>
                                    ) : (
                                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-white/30 hover:text-white transition-colors">
                                            {uploadingSlot === slot ? <i className="fas fa-circle-notch fa-spin"></i> : <><i className="fas fa-plus text-lg"></i><span className="text-[7px] font-black uppercase mt-1">Adicionar</span></>}
                                            <input type="file" accept="image/*" className="hidden" onChange={e => handleBannerUpload(e, slot)} disabled={!!uploadingSlot} />
                                        </label>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <div className="p-6 md:p-16 lg:p-20" onClick={(e) => e.stopPropagation()}>
                    {/* CATEGORIA E METADADOS */}
                    <div className="mb-8 flex items-center gap-4">
                        <select 
                            value={category} 
                            onChange={e => setCategory(e.target.value)}
                            className="bg-red-600 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-xl outline-none hover:bg-red-700 transition-colors cursor-pointer appearance-none text-center"
                        >
                            {['Cotidiano', 'Polícia', 'Política', 'Esporte', 'Agro', 'Cultura', 'Saúde', 'Regional'].map(c => (
                                <option key={c} value={c} className="text-black bg-white">{c}</option>
                            ))}
                        </select>
                        <div className="h-px bg-zinc-200 flex-1"></div>
                        <span className="text-[9px] font-black uppercase text-zinc-300 tracking-widest">{new Date().toLocaleDateString()}</span>
                    </div>

                    {/* MANCHETE (INPUT ESTILIZADO IGUAL HOME) */}
                    <textarea 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        placeholder="DIGITE A MANCHETE AQUI..." 
                        rows={2}
                        className="w-full text-3xl md:text-6xl font-[1000] uppercase italic tracking-tighter text-zinc-900 bg-transparent border-none outline-none focus:ring-0 mb-8 md:mb-10 resize-none leading-[0.9] placeholder:text-zinc-200" 
                    />
                    
                    {/* LEAD (RESUMO) */}
                    <textarea 
                        value={lead} 
                        onChange={e => setLead(e.target.value)} 
                        placeholder="Resumo da reportagem (Lead)..." 
                        className="w-full text-lg md:text-2xl font-medium text-zinc-500 bg-white border-l-[6px] border-red-600 pl-6 py-2 outline-none min-h-[100px] resize-none mb-10 md:mb-14 font-serif italic placeholder:text-zinc-200 placeholder:not-italic" 
                    />
                    
                    {/* BLOCOS DE CONTEÚDO */}
                    <div className="flex flex-wrap -mx-2 md:-mx-3">
                        {blocks.map(block => (
                            <div 
                                key={block.id} 
                                className={`
                                    transition-all duration-300
                                    ${getWidthClass(block.settings.width)}
                                    ${block.settings.minHeight || ''} 
                                    ${block.settings.paddingY ? block.settings.paddingY.replace('py-', 'py-') : 'p-3'}
                                `}
                            >
                                <div 
                                    onClick={(e) => { e.stopPropagation(); handleBlockSelect(block.id); }} 
                                    className={`relative group/block rounded-[2rem] transition-all duration-300 h-full border-2 ${selectedBlockId === block.id ? 'shadow-2xl ring-2 ring-red-100 bg-white z-10 scale-[1.01] border-red-600' : 'bg-white border-transparent hover:border-zinc-100'}`}
                                >
                                    {selectedBlockId === block.id && (
                                        <>
                                            <span className="absolute -top-3 left-6 bg-red-600 text-white text-[8px] font-black uppercase px-3 py-1 rounded-full tracking-widest z-20 shadow-md">
                                                {getBlockTypeLabel(block.type)}
                                            </span>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteBlock(block.id); }} className="absolute -top-3 -right-2 z-[200] w-8 h-8 bg-black text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-600 transition-all active:scale-90"><i className="fas fa-trash-alt text-[10px]"></i></button>
                                        </>
                                    )}

                                    {/* Mobile: Mostrar botão de ajustes */}
                                    {selectedBlockId === block.id && isMobile && (
                                        <button onClick={(e) => { e.stopPropagation(); setShowInspectorMobile(true); setShowMobileFormatting(false); }} className="absolute -bottom-3 right-6 z-[200] bg-blue-600 text-white px-4 py-1.5 rounded-full shadow-lg flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-90" title="Ajustes">
                                            <i className="fas fa-sliders-h text-[10px]"></i> <span className="text-[9px] font-black uppercase">Ajustar</span>
                                        </button>
                                    )}

                                    {(() => {
                                        switch(block.type) {
                                            case 'paragraph': case 'heading': case 'quote': case 'list':
                                                return (
                                                    <TextBlock 
                                                        block={block} 
                                                        isSelected={selectedBlockId === block.id} 
                                                        onSelect={() => handleBlockSelect(block.id)} 
                                                        onUpdate={c => handleUpdateBlock({...block, content: c})} 
                                                        isMobileFormattingOpen={selectedBlockId === block.id && showMobileFormatting}
                                                        onToggleMobileFormatting={setShowMobileFormatting}
                                                    />
                                                );
                                            case 'image': case 'video':
                                                return <MediaBlock block={block} isSelected={selectedBlockId === block.id} isUploading={!!uploadingSlot} onSelect={() => handleBlockSelect(block.id)} />;
                                            case 'separator':
                                                return <SeparatorBlock block={block} isSelected={selectedBlockId === block.id} onSelect={() => handleBlockSelect(block.id)} />;
                                            case 'gallery':
                                                return <GalleryEditorBlock block={block} accessToken={accessToken} onUpdate={handleUpdateBlock} />;
                                            case 'engagement':
                                                return <EngagementEditorBlock block={block} onUpdate={handleUpdateBlock} />;
                                            case 'smart_block':
                                                return <div className="p-4" dangerouslySetInnerHTML={{ __html: block.content }} />;
                                            default: return null;
                                        }
                                    })()}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* BOTÃO PUBLICAR MOBILE */}
                    <div className="md:hidden mt-12 pb-8 border-t border-zinc-100 pt-8">
                        <button 
                            onClick={() => handlePublish(isPublished)}
                            className="w-full bg-red-600 text-white py-4 rounded-full font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <i className="fas fa-paper-plane"></i> {isPublished ? 'Atualizar Matéria' : 'Publicar Reportagem'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV - DOCK FLUTUANTE MODERNO */}
      {isMobile && (
          <div className="fixed bottom-4 left-4 right-4 h-16 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] z-[1800] flex justify-between items-center px-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all animate-slideUp">
              {/* Left Group */}
              <div className="flex items-center gap-4">
                  <button 
                    onClick={onCancel}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Voltar"
                  >
                      <i className="fas fa-arrow-left"></i>
                  </button>
                  
                  {isTextBlockSelected && (
                      <button 
                        onClick={() => { setShowMobileFormatting(!showMobileFormatting); setShowInspectorMobile(false); setShowLibraryMobile(false); }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showMobileFormatting ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                      >
                          <i className="fas fa-font"></i>
                      </button>
                  )}
              </div>

              {/* Center Action - Floating - HIDES when formatting is open to prevent overlap */}
              <div className={`absolute left-1/2 -top-6 -translate-x-1/2 transition-all duration-300 ${showMobileFormatting ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                  <button 
                    onClick={() => { setShowLibraryMobile(true); setShowMobileFormatting(false); }}
                    className="w-16 h-16 bg-red-600 rounded-full text-white shadow-[0_4px_20px_rgba(220,38,38,0.5)] flex items-center justify-center border-[6px] border-[#f4f4f7] hover:scale-110 active:scale-95 transition-all"
                  >
                      <i className="fas fa-plus text-2xl"></i>
                  </button>
              </div>

              {/* Right Group */}
              <div className="flex items-center gap-4">
                  <button 
                    onClick={() => { if(selectedBlockId) { setShowInspectorMobile(true); setShowMobileFormatting(false); } else setToast({message: "Selecione um bloco primeiro", type: 'info'}); }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${selectedBlockId && !showMobileFormatting && !showLibraryMobile ? 'text-blue-400 bg-blue-500/20' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                  >
                      <i className="fas fa-sliders-h"></i>
                  </button>
                  
                  <button 
                    onClick={() => handlePublish(isPublished)}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-green-500 hover:text-white hover:bg-green-600/20 transition-all"
                    title="Publicar"
                  >
                      <i className="fas fa-paper-plane"></i>
                  </button>
              </div>
          </div>
      )}

      {/* MOBILE RIGHT DRAWER (INSPECTOR) */}
      <aside className={`
        fixed inset-y-0 right-0 z-[2000] w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden
        ${showInspectorMobile ? 'translate-x-0' : 'translate-x-full'}
      `}>
          <InspectorSidebar 
            block={blocks.find(b => b.id === selectedBlockId) || null} 
            onUpdate={handleUpdateBlock}
            onDelete={handleDeleteBlock}
            onClose={() => setShowInspectorMobile(false)}
            accessToken={accessToken}
            newsMetadata={{ slug, setSlug, category, setCategory, title, lead, socialCaptions, setSocialCaptions }}
          />
      </aside>

      {/* DESKTOP RIGHT SIDEBAR (COLLAPSIBLE) */}
      <aside className={`
        hidden lg:flex flex-col bg-white border-l border-zinc-200 transition-all duration-300 relative z-20 shadow-[-5px_0_15px_rgba(0,0,0,0.02)]
        ${isRightSidebarOpen ? 'w-80 md:w-96' : 'w-0 overflow-hidden'}
      `}>
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