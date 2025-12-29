
import React, { useState, useRef, useEffect } from 'react';
import { User, NewsItem, PostStatus, SystemSettings } from '../../types';
import MediaUploader from '../media/MediaUploader';
import { dispatchSocialWebhook } from '../../services/integrationService';
import { uploadFileToDrive } from '../../services/driveService';
import Toast, { ToastType } from '../common/Toast';

const DEFAULT_CATEGORIES = ['Cotidiano', 'Polícia', 'Agro', 'Política', 'Esporte', 'Cultura', 'Saúde'];

const EMOJI_GROUPS = [
    { name: 'Faces', icons: ['😀', '😂', '😍', '🤔', '😎', '😡', '😱', '🤫', '😴', '🥳'] },
    { name: 'Ações', icons: ['👍', '👊', '✌️', '👌', '👏', '🙌', '🙏', '🤝', '💪', '✍️'] },
    { name: 'Mídia', icons: ['🚨', '🔴', '📢', '🗞️', '📰', '📷', '🎥', '🎤', '📍', '🔥'] },
    { name: 'Temas', icons: ['⚽', '🚜', '🌾', '🌱', '⚖️', '🗳️', '🇧🇷', '🚑', '🚔', '💰'] }
];

const SITE_COLORS = [
    { name: 'Preto', hex: '#000000', tailwind: 'bg-black' },
    { name: 'Vermelho', hex: '#DC2626', tailwind: 'bg-red-600' },
    { name: 'Azul', hex: '#2563EB', tailwind: 'bg-blue-600' },
    { name: 'Verde', hex: '#16A34A', tailwind: 'bg-green-600' }
];

const FONT_FAMILIES = [
    { name: 'Inter (Moderna)', value: "'Inter', sans-serif" },
    { name: 'Merriweather (Jornal)', value: "'Merriweather', serif" },
    { name: 'Montserrat (Título)', value: "'Montserrat', sans-serif" },
    { name: 'Mono', value: "monospace" }
];

const FONT_SIZES = [
    { label: 'P', value: '2' },
    { label: 'M', value: '3' },
    { label: 'G', value: '4' },
    { label: 'XG', value: '5' },
    { label: 'XXG', value: '6' }
];

interface EditorTabProps {
  user: User;
  initialData: NewsItem | null;
  onSave: (news: NewsItem, isUpdate: boolean) => void;
  onCancel: () => void;
  newsHistory: NewsItem[];
  driveConfig: { clientId: string; apiKey: string; appId: string };
  accessToken: string | null;
  tokenClient: any;
  setAccessToken: (token: string) => void;
  systemSettings?: SystemSettings; 
}

const EditorTab: React.FC<EditorTabProps> = ({ user, initialData, onSave, onCancel, accessToken, systemSettings }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [lead, setLead] = useState(initialData?.lead || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.category ? initialData.category.split(',').map(s => s.trim()) : [DEFAULT_CATEGORIES[0]]);
  const [mediaData, setMediaData] = useState({ url: initialData?.imageUrl || '', credits: initialData?.imageCredits || '', type: initialData?.mediaType || 'image' });
  const [galleryUrls, setGalleryUrls] = useState<string[]>(initialData?.galleryUrls || []);
  const [content, setContent] = useState(initialData?.content || '');
  const [isBreaking, setIsBreaking] = useState(initialData?.isBreaking || false);
  const [autoPostSocial, setAutoPostSocial] = useState(true);
  const [isCloudUploading, setIsCloudUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [errorFields, setErrorFields] = useState<string[]>([]);
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);
  
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, visible: boolean, isBottomSheet: boolean }>({ x: 0, y: 0, visible: false, isBottomSheet: false });

  const editorContentRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const touchTimerRef = useRef<any>(null);

  const isAdmin = user.role === 'Desenvolvedor' || user.role === 'Editor-Chefe';
  const omnichannelEnabled = systemSettings?.enableOmnichannel || false;

  useEffect(() => {
    if (editorContentRef.current) editorContentRef.current.innerHTML = content;
    const hideContextMenu = () => setContextMenu(prev => ({ ...prev, visible: false }));
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    
    window.addEventListener('click', hideContextMenu);
    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('click', hideContextMenu);
        window.removeEventListener('resize', handleResize);
        if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    };
  }, []);

  const showToast = (message: string, type: ToastType = 'info') => {
      setToast({ message, type });
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (editorContentRef.current?.contains(range.commonAncestorContainer)) {
            savedSelectionRef.current = range.cloneRange();
        }
    }
  };

  const execCmd = (command: string, value: string | undefined = undefined) => {
    if (editorContentRef.current) editorContentRef.current.focus();
    const sel = window.getSelection();
    if (savedSelectionRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
    const cmd = command === 'hiliteColor' && !document.queryCommandSupported('hiliteColor') ? 'backColor' : command;
    document.execCommand(cmd, false, value);
    if (editorContentRef.current) setContent(editorContentRef.current.innerHTML);
    saveSelection();
  };

  const handleDriveImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0 || !accessToken) {
          if (!accessToken) showToast("Conecte ao Google Drive primeiro.", "error");
          return;
      }
      setIsCloudUploading(true);
      try {
          const uploadPromises = Array.from(files).map((file: any) => uploadFileToDrive(file as File, accessToken));
          const urls = await Promise.all(uploadPromises);
          if (urls.length > 1) {
              let carouselHtml = `<div class="news-carousel-track" contenteditable="false">`;
              urls.forEach(url => { carouselHtml += `<img src="${url}" class="news-carousel-item" draggable="true" />`; });
              carouselHtml += `</div><p><br></p>`;
              execCmd('insertHTML', carouselHtml);
          } else {
              const imgHtml = `<img src="${urls[0]}" class="max-w-full rounded-2xl shadow-lg my-6" draggable="true" />`;
              execCmd('insertHTML', imgHtml);
          }
          setContextMenu(prev => ({ ...prev, visible: false }));
          showToast("Mídia inserida com sucesso!", "success");
      } catch (err) {
          showToast("Erro ao enviar para o Drive.", "error");
      } finally {
          setIsCloudUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
      }
  };

  const handleGalleryAdd = async (file: File | null) => {
      if (!file || !accessToken) return;
      setIsCloudUploading(true);
      try {
          const url = await uploadFileToDrive(file, accessToken);
          setGalleryUrls(prev => [...prev, url]);
          showToast("Imagem adicionada ao carrossel.", "success");
      } catch (err) {
          showToast("Erro ao adicionar imagem.", "error");
      } finally {
          setIsCloudUploading(false);
      }
  };

  const removeGalleryImage = (url: string) => {
      setGalleryUrls(prev => prev.filter(u => u !== url));
  };

  const toggleCategory = (cat: string) => {
      setSelectedCategories(prev => {
          if (prev.includes(cat)) return prev.filter(c => c !== cat);
          if (prev.length < 3) return [...prev, cat];
          showToast("Limite de 3 categorias atingido.", "warning");
          return prev;
      });
  };

  const handleMainMediaSelect = async (file: File | null) => {
      if (!file || !accessToken) return showToast("Conecte ao Drive primeiro!", "error");
      setIsCloudUploading(true);
      try {
          const driveUrl = await uploadFileToDrive(file, accessToken);
          setMediaData({ ...mediaData, url: driveUrl, type: file.type.startsWith('video/') ? 'video' : 'image' });
          setErrorFields(prev => prev.filter(f => f !== 'imageUrl'));
          showToast("Capa atualizada!", "success");
      } catch (err) {
          showToast("Erro no upload da capa.", "error");
      } finally {
          setIsCloudUploading(false);
      }
  };

  const openContextMenu = (x: number, y: number, forceFloat = false) => {
      saveSelection();
      const useBottomSheet = isMobile && !forceFloat;
      if (useBottomSheet) {
          setContextMenu({ x: 0, y: 0, visible: true, isBottomSheet: true });
      } else {
          const menuWidth = 320;
          const menuHeight = 500;
          const margin = 20;
          let finalX = x;
          let finalY = y;
          if (finalX + menuWidth > window.innerWidth - margin) finalX = window.innerWidth - menuWidth - margin;
          if (finalY + menuHeight > window.innerHeight - margin) finalY = window.innerHeight - menuHeight - margin;
          setContextMenu({ x: finalX, y: finalY, visible: true, isBottomSheet: false });
      }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      openContextMenu(e.clientX, e.clientY, true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      if (e.button === 2) {
          e.preventDefault();
          openContextMenu(e.clientX, e.clientY, true);
      }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
      if (!isMobile) return;
      const touch = e.touches[0];
      const { clientX, clientY } = touch;
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
      touchTimerRef.current = setTimeout(() => {
          openContextMenu(clientX, clientY, false);
      }, 600);
  };

  const handleTouchEnd = () => { if (touchTimerRef.current) clearTimeout(touchTimerRef.current); };

  const handleGenerateLead = () => {
    if (!content || content === '<p><br></p>') return showToast("Escreva a notícia primeiro!", "warning");
    const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    let autoLead = plainText;
    if (autoLead.length > 250) {
        autoLead = autoLead.substring(0, 247) + '...';
    }
    setLead(autoLead);
    showToast("Resumo gerado com sucesso!", "success");
  };

  const handleSaveClick = async (status: PostStatus) => {
    if (isCloudUploading) return showToast("Aguarde o upload terminar.", "warning");
    
    const missing = [];
    if (!title.trim()) missing.push('title');
    if (!mediaData.url) missing.push('imageUrl');
    
    if (missing.length > 0) {
        setErrorFields(missing);
        showToast("Preencha o Título e escolha uma Capa!", "error");
        return;
    }

    let finalStatus = (!isAdmin && status === 'published') ? 'in_review' : status;
    
    const newsData: NewsItem = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      status: finalStatus, title, lead, content, category: selectedCategories.join(', '),
      authorId: user.id, author: user.name,
      createdAt: initialData?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString(),
      imageUrl: mediaData.url, imageCredits: mediaData.credits, mediaType: mediaData.type as any,
      galleryUrls,
      city: 'Lagoa Formosa', region: 'Alto Paranaíba', isBreaking, isFeatured: initialData?.isFeatured || false, featuredPriority: 5,
      seo: { slug: title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''), metaTitle: title, metaDescription: lead, focusKeyword: selectedCategories[0] },
      source: 'site', views: initialData?.views || 0,
      socialDistribution: []
    };

    if (finalStatus === 'published' && autoPostSocial && omnichannelEnabled) {
        showToast("Disparando para as redes sociais...", "info");
        await dispatchSocialWebhook(newsData);
    }
    onSave(newsData, !!initialData);
  };

  const BreakingNewsToggle = () => (
    <div className={`p-5 md:p-6 rounded-[2rem] border transition-all duration-500 ${isBreaking ? 'bg-red-600 border-red-400 shadow-[0_0_20px_rgba(220,38,38,0.3)] animate-pulse' : 'bg-red-50/50 border-red-100 shadow-inner opacity-60'}`}>
        <label className="flex items-center justify-between cursor-pointer">
            <div className="flex flex-col">
                <span className={`text-[12px] font-black uppercase leading-none ${isBreaking ? 'text-white' : 'text-red-600'}`}>Plantão</span>
                <span className={`text-[8px] font-bold uppercase mt-1 italic ${isBreaking ? 'text-red-100' : 'text-red-400'}`}>Urgente</span>
            </div>
            <input type="checkbox" checked={isBreaking} onChange={e => setIsBreaking(e.target.checked)} className="sr-only peer" />
            <div className={`w-12 h-7 md:w-14 md:h-8 rounded-full relative transition-all shadow-inner border-2 ${isBreaking ? 'bg-white border-red-400' : 'bg-slate-200 border-transparent'}`}>
                <div className={`absolute top-[2px] left-[2px] rounded-full h-5 w-5 md:h-6 md:w-6 transition-all shadow-sm ${isBreaking ? 'bg-red-600 translate-x-5 md:translate-x-6' : 'bg-white'}`}></div>
            </div>
        </label>
    </div>
  );

  const MainCoverUpload = () => (
    <div className={`bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl border p-6 md:p-8 transition-all duration-300 ${errorFields.includes('imageUrl') ? 'border-red-500 bg-red-50 animate-bounce' : 'border-slate-100'}`}>
        <label className="text-[10px] font-black uppercase text-slate-400 mb-5 block tracking-widest">Capa Principal {errorFields.includes('imageUrl') && <span className="text-red-600 ml-2">Obrigatório</span>}</label>
        <MediaUploader onMediaSelect={(file) => handleMainMediaSelect(file)} />
    </div>
  );

  const CarouselGallery = () => (
    <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl border border-slate-100 p-6 md:p-8">
        <div className="flex justify-between items-center mb-5">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Carrossel de Imagens</label>
            <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">Galeria</span>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
            {galleryUrls.map((url, idx) => (
                <div key={idx} className="aspect-square rounded-xl overflow-hidden relative group border border-slate-100 shadow-sm">
                    <img src={url} className="w-full h-full object-cover" />
                    <button onClick={() => removeGalleryImage(url)} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><i className="fas fa-trash-alt text-xs"></i></button>
                </div>
            ))}
        </div>
        <MediaUploader onMediaSelect={(file) => handleGalleryAdd(file)} />
    </div>
  );

  const LeadArea = () => (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-6 md:p-8">
        <div className="flex justify-between items-center mb-5">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Resumo (Lead)</label>
            <button onClick={handleGenerateLead} className="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all border border-blue-100 flex items-center gap-1.5">
                <i className="fas fa-magic"></i> Gerar
            </button>
        </div>
        <textarea value={lead} onChange={e => setLead(e.target.value)} className="w-full h-24 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-medium outline-none focus:border-slate-900 resize-none shadow-inner font-sans" placeholder="O resumo para as redes sociais..." />
    </div>
  );

  return (
    <div className="w-full relative min-h-screen flex flex-col bg-slate-50/30" onContextMenu={(e) => e.preventDefault()}>
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <input type="file" ref={fileInputRef} onChange={handleDriveImageUpload} accept="image/*" multiple className="hidden" />

      <div className="sticky top-0 z-[200] bg-white border-b border-slate-200 shadow-xl px-3 py-3 md:px-8 flex flex-col md:flex-row justify-between items-center gap-3 transition-all">
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <button onClick={onCancel} className="bg-slate-100 hover:bg-red-600 hover:text-white text-slate-600 w-10 h-10 md:w-auto md:px-5 md:py-3 rounded-xl md:rounded-2xl text-[10px] font-black uppercase flex items-center justify-center md:gap-3 shadow-sm transition-all active:scale-95 shrink-0">
                <i className="fas fa-arrow-left"></i> <span className="hidden md:inline">Sair</span>
            </button>
            {isCloudUploading && (
                <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-xl animate-pulse border border-blue-100">
                    <i className="fas fa-cloud-upload-alt text-xs"></i>
                    <span className="text-[8px] font-black uppercase tracking-widest hidden xs:inline">Nuvem</span>
                </div>
            )}
            <div className="flex md:hidden items-center gap-2">
                <button onClick={() => handleSaveClick('draft')} disabled={isCloudUploading} className="w-10 h-10 bg-white border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-50">
                    <i className="fas fa-save"></i>
                </button>
                <button onClick={() => handleSaveClick('published')} disabled={isCloudUploading} className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 disabled:opacity-50">
                    <i className="fas fa-paper-plane text-[10px]"></i>
                </button>
            </div>
        </div>
        
        <div className="hidden md:flex items-center gap-3 w-full md:w-auto">
            <button onClick={() => handleSaveClick('draft')} disabled={isCloudUploading} className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-50 transition-all flex items-center gap-2">
                <i className="fas fa-save"></i> Salvar
            </button>
            <button onClick={() => handleSaveClick('published')} disabled={isCloudUploading} className="bg-black text-white px-10 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-red-600 shadow-xl flex items-center justify-center gap-3 transition-all group">
                {isAdmin ? 'Publicar' : 'Revisar'} <i className="fas fa-paper-plane text-[9px] group-hover:translate-x-1 transition-transform"></i>
            </button>
        </div>
      </div>

      <div className="flex-1 p-3 md:p-10">
          <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-6 md:gap-10 items-start">
            
            <div className="w-full lg:hidden space-y-6 animate-fadeIn mb-6">
                <BreakingNewsToggle />
                <MainCoverUpload />
            </div>

            <div className="w-full lg:flex-1 bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border border-white p-6 md:p-14 min-h-[80vh] relative overflow-visible">
                <input 
                    type="text" 
                    placeholder="Título da Notícia..." 
                    value={title} 
                    onChange={e => { setTitle(e.target.value); setErrorFields(prev => prev.filter(f => f !== 'title')); }} 
                    className={`w-full text-3xl md:text-7xl font-[1000] uppercase italic placeholder:text-slate-100 outline-none border-none bg-transparent mb-8 leading-[0.95] tracking-tighter transition-colors ${errorFields.includes('title') ? 'text-red-600 animate-pulse' : 'text-slate-900'}`} 
                />
                
                <div className="sticky top-24 md:top-28 z-[150] bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl md:rounded-[2rem] p-2 md:p-3 mb-8 shadow-2xl flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-hide">
                    <div className="flex items-center bg-slate-50 rounded-xl md:rounded-2xl p-1 shrink-0">
                        <button onMouseDown={e => e.preventDefault()} onClick={() => execCmd('bold')} className="w-10 h-10 md:w-12 md:h-12 font-black text-slate-700 hover:bg-white rounded-lg transition-all">B</button>
                        <button onMouseDown={e => e.preventDefault()} onClick={() => execCmd('italic')} className="w-10 h-10 md:w-12 md:h-12 italic text-slate-700 hover:bg-white rounded-lg transition-all">I</button>
                    </div>
                    <div className="flex items-center bg-slate-50 rounded-xl md:rounded-2xl p-1 shrink-0 px-2 gap-1 border border-slate-100">
                        <button onMouseDown={e => e.preventDefault()} onClick={() => fileInputRef.current?.click()} className="w-10 h-10 hover:bg-white rounded-lg text-blue-600 transition-colors"><i className="fas fa-images"></i></button>
                        <button onMouseDown={e => e.preventDefault()} onClick={() => execCmd('justifyCenter')} className="w-10 h-10 hover:bg-white rounded-lg text-slate-400"><i className="fas fa-align-center"></i></button>
                    </div>
                    {isMobile && <span className="text-[8px] font-black text-slate-300 uppercase px-2 shrink-0">Segure p/ ferramentas</span>}
                </div>

                <div className="relative w-full z-10 mb-10">
                    <div 
                        ref={editorContentRef} 
                        contentEditable 
                        onInput={() => setContent(editorContentRef.current?.innerHTML || '')}
                        onMouseUp={saveSelection}
                        onKeyUp={saveSelection}
                        onContextMenu={handleContextMenu}
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        className="outline-none prose prose-xl md:prose-2xl max-w-none text-slate-800 leading-relaxed min-h-[400px] selection:bg-red-100 font-sans" 
                    ></div>
                </div>

                <div className="w-full lg:hidden space-y-6 mb-10">
                    <CarouselGallery />
                    <LeadArea />
                </div>
            </div>

            <div className="w-full lg:w-[420px] space-y-6 shrink-0 lg:sticky lg:top-28">
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-6 md:p-8 space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Editorias</label>
                            <span className="text-[10px] font-black text-red-600">{selectedCategories.length}/3</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {DEFAULT_CATEGORIES.map(cat => (
                                <button key={cat} onClick={() => toggleCategory(cat)} className={`px-3 py-3 rounded-xl text-[9px] font-black uppercase border transition-all ${selectedCategories.includes(cat) ? 'bg-red-600 text-white border-red-600 shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'}`}>{cat}</button>
                            ))}
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <BreakingNewsToggle />
                    </div>
                </div>
                <div className="hidden lg:block space-y-6">
                    <MainCoverUpload />
                    <CarouselGallery />
                    <LeadArea />
                </div>
            </div>
          </div>
      </div>

      {contextMenu.visible && (
          <div 
            className={`fixed z-[10000] bg-white/95 backdrop-blur-3xl border border-slate-200 shadow-2xl animate-fadeInUp flex flex-col gap-4 overflow-hidden transition-all ${contextMenu.isBottomSheet ? 'bottom-0 left-0 right-0 rounded-t-[3rem] p-8 pb-12 max-h-[80vh] w-full' : 'rounded-[2rem] p-6 w-[320px] max-h-[90vh]'}`} 
            style={contextMenu.isBottomSheet ? {} : { top: contextMenu.y, left: contextMenu.x }}
            onClick={e => e.stopPropagation()}
          >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-black uppercase text-red-600 italic">Ferramentas</span>
                  <button onClick={() => setContextMenu(prev => ({...prev, visible: false}))} className="text-slate-400 hover:text-red-600"><i className="fas fa-times"></i></button>
              </div>
              
              <div className="flex flex-col gap-4 overflow-y-auto scrollbar-hide">
                  <button onClick={() => fileInputRef.current?.click()} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"><i className="fas fa-images"></i> Inserir Mídia</button>
                  <div className="space-y-2">
                      <span className="text-[8px] font-black uppercase text-slate-400">Estilo</span>
                      <select onChange={(e) => execCmd('fontName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase outline-none">
                          <option value="">Fonte...</option>
                          {FONT_FAMILIES.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                      </select>
                      <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-100">
                          {FONT_SIZES.map(s => <button key={s.value} onClick={() => execCmd('fontSize', s.value)} className="flex-1 py-2 text-[9px] font-black hover:bg-white rounded-lg transition-all">{s.label}</button>)}
                      </div>
                  </div>
                  <div className="space-y-2">
                      <span className="text-[8px] font-black uppercase text-slate-400">Destaque</span>
                      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          {SITE_COLORS.map(c => <button key={c.hex} onClick={() => execCmd('foreColor', c.hex)} className={`w-8 h-8 rounded-lg ${c.tailwind} border-2 border-white shadow-sm`} />)}
                          <button onClick={() => execCmd('hiliteColor', 'transparent')} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-300"><i className="fas fa-eraser"></i></button>
                      </div>
                  </div>
                  <div className="grid grid-cols-5 gap-1 p-2 bg-slate-50 rounded-xl max-h-[120px] overflow-y-auto scrollbar-hide">
                      {EMOJI_GROUPS[0].icons.map(emoji => <button key={emoji} onClick={() => execCmd('insertText', emoji)} className="w-8 h-8 hover:bg-white rounded flex items-center justify-center text-sm">{emoji}</button>)}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default EditorTab;
